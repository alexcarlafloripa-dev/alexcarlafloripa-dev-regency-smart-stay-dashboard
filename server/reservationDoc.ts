/**
 * Geração do documento Word (.docx) da Ficha de Reserva — Regency Square Smart Stay
 *
 * Formato: texto corrido (sem tabela de campos cadastrais)
 *   - Cada campo é exibido como "RÓTULO: valor" em uma linha separada
 *   - Evita completamente o problema de texto vertical causado por tabelas
 *   - Compatível com Word, Google Docs e LibreOffice sem necessidade de ajuste
 *
 * Fluxo de pagamento:
 *   - Usa valores convertidos (fluxoValorTotal, fluxoEntrada, etc.) quando moeda != BRL
 *   - Tabela de fluxo mantida pois é de 3 colunas e raramente causa problemas
 *   - Adaptação personalizada do cliente exibida se preenchida
 *
 * Assinatura:
 *   - Apenas o investidor assina (gestor não assina)
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ShadingType,
  VerticalAlign, convertInchesToTwip, HeightRule,
} from "docx";
import type { Reservation } from "../drizzle/schema";

// ── Constantes de cor ─────────────────────────────────────────────────────────
const REGENCY_BROWN  = "C8762B";
const HEADER_BG     = "C8762B";
const FLOW_HEADER   = "2C1810";
const FLOW_ALT      = "FFF8F0";
const DARK_TEXT     = "1A1410";
const MUTED_TEXT    = "666666";

// ── Bordas ────────────────────────────────────────────────────────────────────
const BORDER_CELL = { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" };
const BORDER_NONE = { style: BorderStyle.NONE,   size: 0, color: "FFFFFF" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function val(v: string | null | undefined): string {
  return v && v.trim() ? v.trim() : "";
}

function fmt(n: string | null | undefined): string {
  if (!n) return "—";
  const num = parseFloat(n);
  if (isNaN(num)) return n;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function spacer(before = 120, after = 120): Paragraph {
  return new Paragraph({ text: "", spacing: { before, after } });
}

// ── Título de seção ───────────────────────────────────────────────────────────
function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text, bold: true, color: "FFFFFF", size: 22, font: "Calibri", allCaps: true }),
    ],
    shading: { type: ShadingType.SOLID, color: HEADER_BG },
    spacing: { before: 320, after: 0 },
    indent: { left: 120, right: 120 },
  });
}

/**
 * Linha de campo em texto corrido:
 *   RÓTULO:   valor
 * Sem tabela — garante texto sempre horizontal em qualquer programa.
 */
function fieldLine(label: string, value: string | null | undefined): Paragraph {
  const filled = !!(value && value.trim());
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}:   `,
        bold: true,
        size: 19,
        color: MUTED_TEXT,
        font: "Calibri",
      }),
      new TextRun({
        text: filled ? val(value) : "_______________________________________________",
        size: 19,
        font: "Calibri",
        color: filled ? DARK_TEXT : "CCCCCC",
      }),
    ],
    spacing: { before: 80, after: 80 },
    indent: { left: 120 },
  });
}

// ── Linha de cabeçalho da tabela de fluxo ────────────────────────────────────
function flowHeaderRow(cols: string[]): TableRow {
  const pct = Math.floor(100 / cols.length);
  return new TableRow({
    tableHeader: true,
    height: { value: 480, rule: HeightRule.ATLEAST },
    children: cols.map(text => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
      })],
      width: { size: pct, type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.SOLID, color: FLOW_HEADER },
      borders: {
        top: BORDER_CELL, bottom: BORDER_CELL,
        left: BORDER_CELL, right: BORDER_CELL,
      },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
    })),
  });
}

// ── Linha de dados da tabela de fluxo ────────────────────────────────────────
function flowDataRow(cells: string[], highlight = false): TableRow {
  const pct = Math.floor(100 / cells.length);
  return new TableRow({
    height: { value: 400, rule: HeightRule.ATLEAST },
    children: cells.map((text, i) => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({
          text,
          bold: i === 0,
          size: 18,
          font: "Calibri",
          color: highlight ? REGENCY_BROWN : DARK_TEXT,
        })],
        alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
      })],
      width: { size: pct, type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.SOLID, color: highlight ? FLOW_ALT : "FFFFFF" },
      borders: {
        top: BORDER_CELL, bottom: BORDER_CELL,
        left: BORDER_CELL, right: BORDER_CELL,
      },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
    })),
  });
}

// ── Função principal ──────────────────────────────────────────────────────────
export async function generateReservationDocx(res: Reservation): Promise<Buffer> {

  // Decide se usa valores convertidos ou BRL
  const incluirFluxo = !!(res.fluxoMoeda && res.fluxoMoeda !== "NAO_DEFINIDO");
  const usaConvertido = !!(res.fluxoMoeda && res.fluxoMoeda !== "BRL" && res.fluxoMoeda !== "NAO_DEFINIDO" && res.fluxoValorTotal);

  const moedaLabel = res.fluxoMoeda && res.fluxoMoeda !== "BRL"
    ? ` (Moeda: ${res.fluxoMoeda})`
    : "";

  // Valores do fluxo — usa convertidos se disponíveis, senão BRL
  const vValorTotal    = usaConvertido ? (res.fluxoValorTotal ?? "—") : fmt(res.unitValorTotal);
  const vEntrada       = usaConvertido ? (res.fluxoEntrada    ?? "—") : fmt(res.unitEntrada);
  const vSinal         = usaConvertido ? (res.fluxoSinal      ?? "—") : "R$ 30.000,00";
  const vRestante      = usaConvertido ? (res.fluxoRestante   ?? "—") : (() => {
    if (!res.unitEntrada) return "—";
    const n = parseFloat(res.unitEntrada);
    return isNaN(n) || n <= 30000 ? "—" : (n - 30000).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  })();
  const vMensais42     = usaConvertido ? (res.fluxoMensais42  ?? "—") : fmt(res.unitMensais42);
  const vSemestrais6   = usaConvertido ? (res.fluxoSemestrais6 ?? "—") : fmt(res.unitSemestrais6);
  const vCotacao       = res.fluxoCotacao ?? "";

  // Valores originais em BRL (para exibir ao lado dos convertidos)
  const brlValorTotal   = fmt(res.unitValorTotal);
  const brlEntrada      = fmt(res.unitEntrada);
  const brlSinal        = "R$ 30.000,00";
  const brlRestante     = (() => {
    if (!res.unitEntrada) return "—";
    const n = parseFloat(res.unitEntrada);
    return isNaN(n) || n <= 30000 ? "—" : (n - 30000).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  })();
  const brlMensais42    = fmt(res.unitMensais42);
  const brlSemestrais6  = fmt(res.unitSemestrais6);

  const areaTotal = res.unitAreaTotal ? `${parseFloat(res.unitAreaTotal).toFixed(2)} m²` : "—";
  const valorM2   = fmt(res.unitValorM2);

  const temAdaptacao = !!(res.fluxoAdaptacao && res.fluxoAdaptacao.trim());

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left:   convertInchesToTwip(1.2),
            right:  convertInchesToTwip(1.2),
          },
        },
      },
      children: [

        // ─── CABEÇALHO ──────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({
            text: "FICHA DE RESERVA REGENCY SQUARE SMART STAY",
            bold: true, size: 36, color: REGENCY_BROWN, font: "Calibri",
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: "Canasvieiras — Florianópolis, SC",
            size: 20, color: "888888", font: "Calibri", italics: true,
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // ─── SIGA AS ETAPAS ─────────────────────────────────────────────────
        sectionTitle("SIGA AS ETAPAS PARA A RESERVA"),
        spacer(80, 0),

        new Paragraph({
          children: [
            new TextRun({ text: "1.  Preenchimento:  ", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri" }),
            new TextRun({ text: "Insira os dados abaixo para a emissão dos contratos futuros (Investimento, Social e Quotistas).", size: 20, font: "Calibri" }),
          ],
          spacing: { before: 80, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "2.  Envio:  ", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri" }),
            new TextRun({ text: "Encaminhe a ficha para Alex Sandro (Gestor Comercial):", size: 20, font: "Calibri" }),
          ],
          spacing: { before: 80, after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "     WhatsApp: (48) 98874-9258", size: 20, font: "Calibri", color: MUTED_TEXT })],
          spacing: { before: 0, after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "     E-mail: calabrianegociosimobiliarios@gmail.com", size: 20, font: "Calibri", color: MUTED_TEXT })],
          spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "3.  Confirmação:  ", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri" }),
            new TextRun({ text: "Após o envio, você receberá o link para a assinatura eletrônica que oficializa sua reserva.", size: 20, font: "Calibri" }),
          ],
          spacing: { before: 80, after: 120 },
        }),

        spacer(80, 80),

        // ─── COMO FUNCIONA A RESERVA ─────────────────────────────────────────
        sectionTitle("COMO FUNCIONA A RESERVA"),
        spacer(80, 0),

        new Paragraph({
          children: [
            new TextRun({ text: "Etapa 1 — Reserva:  ", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri" }),
            new TextRun({ text: "Assinatura do contrato e pagamento do sinal de reserva de R$ 30.000,00.", size: 20, font: "Calibri" }),
          ],
          spacing: { before: 80, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Etapa 2 — Fechamento do grupo:  ", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri" }),
            new TextRun({ text: "Formalização do contrato e pagamento do restante da entrada.", size: 20, font: "Calibri" }),
          ],
          spacing: { before: 80, after: 120 },
        }),

        spacer(80, 80),

        // ─── INFORMAÇÕES CADASTRAIS ──────────────────────────────────────────
        sectionTitle("INFORMAÇÕES CADASTRAIS"),
        spacer(80, 0),

        // Destaque da unidade
        new Paragraph({
          children: [
            new TextRun({ text: "UNIDADE(S):  ", bold: true, size: 22, color: REGENCY_BROWN, font: "Calibri" }),
            new TextRun({
              text: res.unitCota
                ? `${res.unitCota}  —  ${res.unitTipologia || ""}  —  ${res.unitAndar || ""}`
                : "_______________",
              size: 22, font: "Calibri", bold: true,
              color: res.unitCota ? DARK_TEXT : "BBBBBB",
            }),
          ],
          spacing: { before: 120, after: 160 },
          shading: { type: ShadingType.SOLID, color: FLOW_ALT },
          indent: { left: 120, right: 120 },
        }),

        // ── Campos em texto corrido ─────────────────────────────────────────
        // Cada campo: RÓTULO:   valor (ou linha tracejada se vazio)
        // Sem tabela — sem risco de texto vertical

        // Dados do Corretor
        new Paragraph({
          children: [new TextRun({ text: "Dados do Corretor", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri", underline: {} })],
          spacing: { before: 160, after: 80 },
          indent: { left: 120 },
        }),
        fieldLine("Imobiliária",            res.imobiliaria),
        fieldLine("Corretor",               res.nomeCorretor),
        fieldLine("Telefone do Corretor",   res.telefoneCorretor),
        fieldLine("Responsável pela Venda", res.responsavelVenda),

        spacer(80, 0),

        // Dados do Cliente
        new Paragraph({
          children: [new TextRun({ text: "Dados do Cliente", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri", underline: {} })],
          spacing: { before: 160, after: 80 },
          indent: { left: 120 },
        }),
        fieldLine("Nome Completo",          res.nomeCompleto),
        fieldLine("E-mail",                 res.email),
        fieldLine("Telefone Celular",       res.telefoneCelular),
        fieldLine("Telefone Residencial",   res.telefoneResidencial),

        spacer(80, 0),

        // Dados Pessoais
        new Paragraph({
          children: [new TextRun({ text: "Dados Pessoais", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri", underline: {} })],
          spacing: { before: 160, after: 80 },
          indent: { left: 120 },
        }),
        fieldLine("Data de Nascimento",     res.dataNascimento),
        fieldLine("Profissão",              res.profissao),
        fieldLine("Estado Civil",           res.estadoCivil),
        fieldLine("Regime de Comunhão",     res.regimeComunhao),
        fieldLine("CPF / RNM",              res.cpfRnm),
        fieldLine("Órgão Expeditor / UF",   res.orgaoExpeditor),
        fieldLine("Data de Expedição",      res.dataExpedicao),
        fieldLine("Documento de Identidade", null),

        spacer(80, 0),

        // Dados Internacionais (se preenchidos)
        ...(res.nacionalidade || res.naturalidade ? [
          new Paragraph({
            children: [new TextRun({ text: "Dados Internacionais", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri", underline: {} })],
            spacing: { before: 160, after: 80 },
            indent: { left: 120 },
          }),
          fieldLine("Nacionalidade",          res.nacionalidade),
          fieldLine("Naturalidade",           res.naturalidade),
          spacer(80, 0),
        ] : []),

        // Endereço
        new Paragraph({
          children: [new TextRun({ text: "Endereço", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri", underline: {} })],
          spacing: { before: 160, after: 80 },
          indent: { left: 120 },
        }),
        fieldLine("Endereço",               res.endereco),
        fieldLine("Complemento",            res.complemento),
        fieldLine("Bairro",                 res.bairro),
        fieldLine("CEP",                    res.cep),
         fieldLine("Cidade / País",          res.cidade),

        // ─── INFORMAÇÕES EXTRAS (só incluir se preenchido) ───
        ...(res.informacoesExtras ? [
          new Paragraph({
            children: [new TextRun({ text: "Informações Adicionais", bold: true, size: 20, color: REGENCY_BROWN, font: "Calibri", underline: {} })],
            spacing: { before: 160, after: 80 },
            indent: { left: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: res.informacoesExtras, size: 20, font: "Calibri", color: "333333" })],
            spacing: { before: 40, after: 40 },
            indent: { left: 120 },
          }),
        ] : []),

        spacer(240, 80),
        // ─── FLUXO DE PAGAMENTOO (só incluir se não for NAO_DEFINIDO) ───────────────────────────────────────
        ...(incluirFluxo ? [
          sectionTitle(`FLUXO DE PAGAMENTO SUGERIDO${moedaLabel}`),
          spacer(80, 0),

          new Paragraph({
            children: usaConvertido ? [
              new TextRun({
                text: `Valores de referência convertidos para ${res.fluxoMoeda} — Cotação utilizada: ${vCotacao} (data da reserva).`,
                size: 18, color: MUTED_TEXT, font: "Calibri", italics: true,
              }),
            ] : [
              new TextRun({
                text: "Abaixo o fluxo padrão para a unidade reservada (valores em Reais — BRL).",
                size: 18, color: MUTED_TEXT, font: "Calibri", italics: true,
              }),
            ],
            spacing: { before: 80, after: usaConvertido ? 40 : 120 },
          }),

          // Aviso importante: pagamento sempre em BRL
          ...(usaConvertido ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "⚠️ Atenção: todos os pagamentos são realizados em Reais (BRL). ",
                  bold: true, size: 17, color: "C0392B", font: "Calibri",
                }),
                new TextRun({
                  text: "Os valores em moeda estrangeira são apenas uma referência para facilitar o entendimento do investidor.",
                  size: 17, color: MUTED_TEXT, font: "Calibri", italics: true,
                }),
              ],
              spacing: { before: 0, after: 120 },
            }),
          ] : []),

          // Fluxo de pagamento em texto corrido
          ...[
            ["Valor total da unidade", vValorTotal, brlValorTotal, `Área: ${areaTotal} · R$/m²: ${valorM2}`],
            ["Entrada (~28%)",         vEntrada,    brlEntrada,    "Paga em etapas conforme abaixo"],
            ["Sinal — Assinatura do contrato", vSinal, brlSinal, "R$ 30.000,00 na assinatura"],
            ["Restante da entrada",    vRestante,   brlRestante,   "Pago no fechamento do grupo"],
            ["42 parcelas mensais",    vMensais42,  brlMensais42,  "Corrigidas pelo CUB/SC"],
            ["6 reforços semestrais",  vSemestrais6, brlSemestrais6, "Corrigidos pelo CUB/SC"],
          ].map(([item, valor, brl, obs]) => new Paragraph({
            children: usaConvertido ? [
              // Quando moeda estrangeira: mostra valor convertido + valor BRL original
              new TextRun({ text: `${item}:   `, bold: true, size: 19, color: REGENCY_BROWN, font: "Calibri" }),
              new TextRun({ text: valor as string, bold: true, size: 19, color: DARK_TEXT, font: "Calibri" }),
              new TextRun({ text: `   (${brl} em BRL)`, size: 17, color: "888888", font: "Calibri" }),
              new TextRun({ text: `   —   ${obs}`, size: 16, color: MUTED_TEXT, font: "Calibri", italics: true }),
            ] : [
              // Quando BRL: exibe normalmente
              new TextRun({ text: `${item}:   `, bold: true, size: 19, color: REGENCY_BROWN, font: "Calibri" }),
              new TextRun({ text: valor as string, bold: true, size: 19, color: DARK_TEXT, font: "Calibri" }),
              new TextRun({ text: `   —   ${obs}`, size: 17, color: MUTED_TEXT, font: "Calibri", italics: true }),
            ],
            spacing: { before: 80, after: 80 },
            indent: { left: 120 },
          })),

          spacer(120, 40),

          // ── Adaptação personalizada do cliente ───────────────────────────────────────
          new Paragraph({
            children: [new TextRun({
              text: temAdaptacao
                ? "Proposta personalizada / Adaptação de fluxo do investidor:"
                : "Proposta personalizada / Observações do investidor:",
              bold: true, size: 18, color: REGENCY_BROWN, font: "Calibri",
            })],
            spacing: { before: 80, after: 40 },
          }),

          // Adaptação em texto corrido (sem tabela)
          new Paragraph({
            children: temAdaptacao
              ? [new TextRun({ text: val(res.fluxoAdaptacao), size: 18, font: "Calibri", color: DARK_TEXT })]
              : [new TextRun({ text: "_______________________________________________", size: 18, font: "Calibri", color: "CCCCCC" })],
            spacing: { before: 40, after: 80 },
            indent: { left: 120 },
          }),

          spacer(240, 80),
        ] : []),

        // ─── ASSINATURA (somente investidor) ────────────────────────────────
        sectionTitle("ASSINATURA"),
        spacer(60, 0),
        new Paragraph({
          children: [new TextRun({
            text: "Esta reserva será oficializada por meio de assinatura eletrônica digital. Após o envio desta ficha, você receberá o link para assinatura.",
            size: 18, color: MUTED_TEXT, font: "Calibri", italics: true,
          })],
          spacing: { before: 80, after: 600 },
        }),

        // Linha de assinatura — somente o investidor
        new Paragraph({
          children: [new TextRun({ text: "_".repeat(52), size: 20, font: "Calibri" })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: val(res.nomeCompleto) || "Investidor(a)", bold: true, size: 18, font: "Calibri" })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: "Investidor(a)", size: 16, color: "888888", font: "Calibri" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),

        spacer(240, 80),

        // ─── RODAPÉ ─────────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({
            text: `Ficha gerada em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} · Regency Square Smart Stay — Canasvieiras, Florianópolis, SC`,
            size: 16, color: "AAAAAA", font: "Calibri",
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: "O Regency Square Smart Stay é estruturado como Sociedade de Propósito Específico (SPE). O investidor adquire cotas do empreendimento, com retorno via operação hoteleira. Valores sujeitos à atualização pelo CUB/SC.",
            size: 14, color: "BBBBBB", font: "Calibri", italics: true,
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 60 },
        }),

      ],
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
