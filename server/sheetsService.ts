/**
 * sheetsService.ts — Alimenta a planilha Google Sheets de controle de reservas
 *
 * Planilha: "Reservas — Regency Square Smart Stay"
 * ID: 13WAvAA5g6PGw3bNjw4AKL_eaKlBARHHgfpY_ssStHl4
 *
 * Colunas:
 *   A: Data | B: Cota | C: Tipologia | D: Andar | E: Valor Total (R$)
 *   F: Nome do Investidor | G: Telefone | H: E-mail | I: Corretor
 *   J: Imobiliária | K: Fluxo | L: Moeda | M: Status | N: Link Drive
 *
 * Usa o Google Apps Script Web App (mesma URL do driveService) para
 * escrever na planilha — sem token OAuth, sem expiração, funciona em produção.
 */

// Mesma URL do driveService — o Apps Script v4 suporta uploadFile + appendSheet + updateSheetStatus
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzsh8f5_IfqOseytCHjzP-U3WOfDVzdKCMMWmETeQhoq_UGjBDKVRu1kr8HgBwDLJw/exec";

/**
 * Chama o Apps Script com redirect manual (o script retorna 302 antes do JSON).
 */
async function callAppsScript(payload: object): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  const jsonText = await res.text();

  if (!res.ok) {
    throw new Error(`Apps Script HTTP ${res.status}: ${jsonText.substring(0, 300)}`);
  }

  try {
    return JSON.parse(jsonText);
  } catch {
    throw new Error(`Apps Script resposta inválida: ${jsonText.substring(0, 200)}`);
  }
}

/**
 * Adiciona uma linha na planilha de controle de reservas.
 * Chamado automaticamente após cada nova reserva ser criada.
 */
export async function appendReservationToSheet(params: {
  data: string;           // Data da reserva (DD/MM/YYYY)
  cota: string;           // Número da cota
  tipologia: string;      // STUDIO, DUPLEX, LOJA, etc.
  andar: string;          // Andar
  valorTotal: string;     // Valor total em R$
  nomeInvestidor: string;
  telefone: string;
  email: string;
  nomeCorretor: string;
  imobiliaria: string;
  fluxo: string;          // "Padrão" | "Personalizado" | "Não definido"
  moeda: string;          // BRL, USD, etc.
  status: string;         // "Reservado"
  linkDrive: string;      // Link da pasta no Drive
}): Promise<void> {
  try {
    // Prefixar telefone com apóstrofo para evitar #ERROR! no Google Sheets
    // (o Sheets interpreta "+55..." como fórmula se não tiver o apóstrofo)
    const safeTelefone = params.telefone.startsWith('+') ? `'${params.telefone}` : params.telefone;

    const row = [
      params.data,
      params.cota,
      params.tipologia,
      params.andar,
      params.valorTotal,
      params.nomeInvestidor,
      safeTelefone,
      params.email,
      params.nomeCorretor,
      params.imobiliaria,
      params.fluxo,
      params.moeda,
      params.status,
      params.linkDrive,
    ];

    const result = await callAppsScript({ action: "appendSheet", row });

    if (!result.success) {
      throw new Error(result.error || "Resposta inesperada do Apps Script");
    }

    console.log("[SheetsService] ✅ Linha adicionada para cota", params.cota);
  } catch (err) {
    // Não bloqueia o fluxo principal se a planilha falhar
    console.error("[SheetsService] ❌ Erro ao adicionar linha:", err);
  }
}

/**
 * Atualiza o status de uma reserva na planilha.
 * Busca pela cota (coluna B) para encontrar a linha correta.
 */
export async function updateReservationStatusInSheet(params: {
  cota: string;
  nomeInvestidor: string;
  novoStatus: string;
}): Promise<void> {
  try {
    const result = await callAppsScript({
      action: "updateSheetStatus",
      cota: params.cota,
      novoStatus: params.novoStatus,
    });

    if (!result.success) {
      throw new Error(result.error || "Resposta inesperada do Apps Script");
    }

    console.log("[SheetsService] ✅ Status atualizado para", params.novoStatus, "na cota", params.cota);
  } catch (err) {
    console.error("[SheetsService] ❌ Erro ao atualizar status:", err);
  }
}
