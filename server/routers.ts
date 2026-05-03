import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { trackEvent, getAnalytics, createReservation, getReservations, getReservationById, updateReservationStatus, listCorretores, createCorretor, updateCorretor, deleteCorretor } from "./db";
import { z } from "zod";
import { generateReservationDocx } from "./reservationDoc";
import { TRPCError } from "@trpc/server";
import { sendReservationEmail, buildReservationEmailHtml } from "./emailService";
import { saveFileToDrive, getDriveFolderLink } from "./driveService";
import { notifyOwner } from "./_core/notification";
import { appendReservationToSheet } from "./sheetsService";
import type { Reservation } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /**
   * Rastreamento de eventos do dashboard.
   */
  analytics: router({
    track: publicProcedure
      .input(z.object({
        type: z.enum([
          "unit_view",
          "compare_add",
          "whatsapp_click",
          "copy_click",
          "compare_view",
          "simulator_use",
        ]),
        unitCota: z.string().optional(),
        unitTipologia: z.string().optional(),
        unitAndar: z.string().optional(),
        currency: z.string().optional(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await trackEvent(input);
        return { ok: true };
      }),

    summary: protectedProcedure
      .input(z.object({
        days: z.number().min(1).max(90).default(30),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso restrito ao gestor.");
        }
        return getAnalytics(input.days);
      }),
  }),

  /**
   * Cotação de moeda em tempo real (open.er-api.com — gratuito, sem chave)
   */
  currency: router({
    rates: publicProcedure
      .input(z.object({ base: z.string().default("BRL") }))
      .query(async ({ input }) => {
        try {
          const res = await fetch(`https://open.er-api.com/v6/latest/${input.base}`);
          if (!res.ok) throw new Error("API indisponível");
          const data = await res.json() as { rates: Record<string, number>; time_last_update_utc: string };
          return {
            base: input.base,
            rates: data.rates,
            updatedAt: data.time_last_update_utc,
          };
        } catch (err) {
          console.error("[Currency] Erro ao buscar cotação:", err);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível buscar a cotação. Tente novamente." });
        }
      }),
  }),

  /**
   * Corretores cadastrados — Regency Square Smart Stay.
   */
  corretor: router({
    /** Lista todos os corretores ativos (público — para o select do formulário) */
    list: publicProcedure
      .query(async () => listCorretores()),

    /** Cria um novo corretor — apenas admin */
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(2),
        telefone: z.string().min(8),
        imobiliaria: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito." });
        return createCorretor(input);
      }),

    /** Atualiza dados de um corretor — apenas admin */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(2).optional(),
        telefone: z.string().min(8).optional(),
        imobiliaria: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        ativo: z.enum(["sim", "nao"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito." });
        const { id, ...data } = input;
        return updateCorretor(id, data);
      }),

    /** Remove um corretor — apenas admin */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito." });
        return deleteCorretor(input.id);
      }),
  }),

  /**
   * Fichas de reserva — Regency Square Smart Stay.
   */
  reservation: router({
    /**
     * Cria uma nova ficha de reserva.
     * Salva o Word no Google Drive (Imobiliária/Corretor) e envia notificação Manus.
     */
    create: publicProcedure
      .input(z.object({
        unitCota: z.string().min(1),
        unitTipologia: z.string().optional(),
        unitAndar: z.string().optional(),
        unitValorTotal: z.string().optional(),
        unitEntrada: z.string().optional(),
        unitMensais42: z.string().optional(),
        unitSemestrais6: z.string().optional(),
        unitAreaTotal: z.string().optional(),
        unitValorM2: z.string().optional(),
        nomeCompleto: z.string().min(2),
        dataNascimento: z.string().optional(),
        nacionalidade: z.string().optional(),
        naturalidade: z.string().optional(),
        endereco: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cep: z.string().optional(),
        cidade: z.string().optional(),
        telefoneCelular: z.string().optional(),
        telefoneResidencial: z.string().optional(),
        email: z.string().email(),
        cpfRnm: z.string().optional(),
        orgaoExpeditor: z.string().optional(),
        dataExpedicao: z.string().optional(),
        profissao: z.string().optional(),
        estadoCivil: z.string().optional(),
        regimeComunhao: z.string().optional(),
        imobiliaria: z.string().min(1, "Imobiliária é obrigatória"),
        responsavelVenda: z.string().optional(),
        nomeCorretor: z.string().min(2, "Nome do corretor é obrigatório"),
        telefoneCorretor: z.string().min(8, "Telefone do corretor é obrigatório"),
        fluxoMoeda: z.string().optional(),
        fluxoAdaptacao: z.string().optional(),
        // Valores convertidos (preenchidos pelo frontend quando moeda != BRL)
        fluxoValorTotal: z.string().optional(),
        fluxoEntrada: z.string().optional(),
        fluxoSinal: z.string().optional(),
        fluxoRestante: z.string().optional(),
        fluxoMensais42: z.string().optional(),
        fluxoSemestrais6: z.string().optional(),
        fluxoCotacao: z.string().optional(),
        informacoesExtras: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Normaliza campos opcionais: undefined -> null para evitar erro de INSERT no MySQL
        const reservationData = {
          ...input,
          fluxoMoeda: input.fluxoMoeda ?? null,
          fluxoAdaptacao: input.fluxoAdaptacao ?? null,
          fluxoValorTotal: input.fluxoValorTotal ?? null,
          fluxoEntrada: input.fluxoEntrada ?? null,
          fluxoSinal: input.fluxoSinal ?? null,
          fluxoRestante: input.fluxoRestante ?? null,
          fluxoMensais42: input.fluxoMensais42 ?? null,
          fluxoSemestrais6: input.fluxoSemestrais6 ?? null,
          fluxoCotacao: input.fluxoCotacao ?? null,
          informacoesExtras: input.informacoesExtras ?? null,
        };
        const savedReservation = await createReservation(reservationData);
        const reservation = savedReservation ?? ({
          id: 0,
          ...reservationData,
          status: "reservado",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Reservation);

        if (!savedReservation) {
          console.warn("[Reservation] Banco indisponível; gerando ficha e salvando no Drive sem registro local.");
        }

        if (reservation) {
          const nomeCliente = reservation.nomeCompleto.split(" ")[0];
          const filename = `ficha-reserva-${reservation.unitCota}-${nomeCliente}.docx`;

          try {
            const docBuffer = await generateReservationDocx(reservation);

            // 1. Salvar Word no Google Drive (Imobiliária / Corretor+Telefone / Cota-Investidor)
            const driveResult = await saveFileToDrive({
              imobiliaria: reservation.imobiliaria ?? "Sem Imobiliária",
              nomeCorretor: reservation.nomeCorretor,
              telefoneCorretor: reservation.telefoneCorretor,
              unitCota: reservation.unitCota,
              nomeInvestidor: reservation.nomeCompleto,
              filename,
              buffer: docBuffer,
            });

            // 2. Gerar link da pasta do corretor no Drive
            let driveLink: string | null = null;
            if (driveResult.ok) {
              driveLink = await getDriveFolderLink({
                imobiliaria: reservation.imobiliaria ?? "Sem Imobiliária",
                nomeCorretor: reservation.nomeCorretor,
                telefoneCorretor: reservation.telefoneCorretor,
              });
            }

            // 3. Enviar e-mail com link do Drive clicável
            const emailRecipients = [
              process.env.EMAIL_NOTIFY_1,
              process.env.EMAIL_NOTIFY_2,
            ].filter(Boolean) as string[];

            if (emailRecipients.length > 0) {
              const emailHtml = buildReservationEmailHtml({
                nomeCliente: reservation.nomeCompleto,
                nomeCorretor: reservation.nomeCorretor,
                telefoneCorretor: reservation.telefoneCorretor,
                unitCota: reservation.unitCota,
                unitTipologia: reservation.unitTipologia ?? undefined,
                unitAndar: reservation.unitAndar ?? undefined,
                unitValorTotal: reservation.unitValorTotal ?? undefined,
                createdAt: reservation.createdAt ?? new Date(),
                driveLink,
              });
              await sendReservationEmail({
                to: emailRecipients,
                subject: `Nova Reserva — Unidade ${reservation.unitCota} | ${reservation.nomeCompleto}`,
                html: emailHtml,
                attachments: [{ filename, content: docBuffer, contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }],
              });
            }

            // 4. Notificar o gestor via Manus
            const driveInfo = driveLink
              ? `\n\nPasta no Drive: ${driveLink}`
              : driveResult.ok
              ? `\n\nSalvo em: ${driveResult.path}`
              : "\n\n⚠️ Falha ao salvar no Drive.";

            try {
              await notifyOwner({
                title: `Nova Ficha de Reserva — Unidade ${reservation.unitCota}`,
                content: `Cliente: ${reservation.nomeCompleto}\nCorretor: ${reservation.nomeCorretor} (${reservation.telefoneCorretor})\nImobiliária: ${reservation.imobiliaria ?? "—"}\nUnidade: ${reservation.unitCota} | ${reservation.unitTipologia ?? ""} | ${reservation.unitAndar ?? ""}${driveInfo}`,
              });
            } catch (err) {
              console.warn("[Reservation] Notificação interna indisponível:", String(err).substring(0, 200));
            }

            // 5. Adicionar linha na planilha Google Sheets de controle
            const dataReserva = new Date(reservation.createdAt ?? Date.now());
            const dataFormatada = dataReserva.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
            const fluxoLabel =
              reservation.fluxoMoeda === "NAO_DEFINIDO" ? "Não definido" :
              reservation.fluxoAdaptacao ? "Personalizado" : "Padrão";
            await appendReservationToSheet({
              data: dataFormatada,
              cota: reservation.unitCota,
              tipologia: reservation.unitTipologia ?? "",
              andar: reservation.unitAndar ?? "",
              valorTotal: reservation.unitValorTotal != null
                ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(reservation.unitValorTotal))
                : "",
              nomeInvestidor: reservation.nomeCompleto,
              telefone: reservation.telefoneCelular ?? "",
              email: reservation.email,
              nomeCorretor: reservation.nomeCorretor,
              imobiliaria: reservation.imobiliaria ?? "Autônomo(a)",
              fluxo: fluxoLabel,
              moeda: reservation.fluxoMoeda && reservation.fluxoMoeda !== "NAO_DEFINIDO" ? reservation.fluxoMoeda : "BRL",
              status: "Reservado",
              linkDrive: driveLink ?? "",
            });

          } catch (err) {
            console.error("[Reservation] Erro no pós-processamento:", err);
            // Não bloqueia o fluxo — a reserva já foi salva no banco
          }
        }

        return { ok: true, id: savedReservation?.id ?? null };
      }),

    /** Gera o documento Word (.docx) de uma reserva específica — retorna base64 */
    generateDoc: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const reservation = await getReservationById(input.id);
        if (!reservation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reserva não encontrada." });
        }
        const buffer = await generateReservationDocx(reservation);
        return {
          base64: buffer.toString("base64"),
          filename: `ficha-reserva-${reservation.unitCota}-${reservation.nomeCompleto.split(" ")[0]}.docx`,
        };
      }),

    /**
     * Faz upload de anexos (documentos do cliente) para o Google Drive
     * na pasta da imobiliária/corretor correspondente.
     * Recebe os arquivos como base64.
     */
    uploadAttachment: publicProcedure
      .input(z.object({
        imobiliaria: z.string().min(1),
        nomeCorretor: z.string().min(1),
        telefoneCorretor: z.string().min(1),
        unitCota: z.string().min(1),
        nomeInvestidor: z.string().min(1),
        filename: z.string().min(1),
        base64: z.string().min(1),
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const result = await saveFileToDrive({
          imobiliaria: input.imobiliaria,
          nomeCorretor: input.nomeCorretor,
          telefoneCorretor: input.telefoneCorretor,
          unitCota: input.unitCota,
          nomeInvestidor: input.nomeInvestidor,
          filename: input.filename,
          buffer,
        });
        return { ok: result.ok, path: result.path };
      }),

    /** Lista todas as reservas — apenas admin */
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao gestor." });
        }
        return getReservations(input?.limit ?? 50);
      }),

    /** Atualiza o status de uma reserva — apenas admin */
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["reservado", "assinado", "vendido"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao gestor." });
        }
        const updated = await updateReservationStatus(input.id, input.status);
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Reserva não encontrada." });
        return { ok: true, reservation: updated };
      }),
  }),
});

export type AppRouter = typeof appRouter;
