import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de eventos de rastreamento do dashboard.
 * Registra cada interação relevante do corretor: visualizações, comparações, cliques em WhatsApp.
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  /** Tipo do evento */
  type: mysqlEnum("type", [
    "unit_view",       // abriu o modal de uma unidade
    "compare_add",     // adicionou ao comparador
    "whatsapp_click",  // clicou em Enviar por WhatsApp
    "copy_click",      // clicou em Copiar mensagem
    "compare_view",    // abriu o painel comparativo
    "simulator_use",   // usou o simulador de fluxo
  ]).notNull(),
  /** Identificador da unidade (cota), ex: "301", "DUPLEX 01" */
  unitCota: varchar("unitCota", { length: 32 }),
  /** Tipologia da unidade, ex: "STUDIO", "2 DORM" */
  unitTipologia: varchar("unitTipologia", { length: 32 }),
  /** Andar da unidade, ex: "3º Andar" */
  unitAndar: varchar("unitAndar", { length: 32 }),
  /** Moeda selecionada no momento do evento, ex: "BRL", "USD" */
  currency: varchar("currency", { length: 8 }),
  /** Sessão anônima do corretor (gerada no frontend, persiste na sessão do browser) */
  sessionId: varchar("sessionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Tabela de fichas de reserva.
 * Preenchida pelo corretor no dashboard e enviada ao gestor.
 */
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),

  // Unidade reservada
  unitCota: varchar("unitCota", { length: 32 }).notNull(),
  unitTipologia: varchar("unitTipologia", { length: 32 }),
  unitAndar: varchar("unitAndar", { length: 32 }),
  unitValorTotal: varchar("unitValorTotal", { length: 32 }),
  unitEntrada: varchar("unitEntrada", { length: 32 }),
  unitMensais42: varchar("unitMensais42", { length: 32 }),
  unitSemestrais6: varchar("unitSemestrais6", { length: 32 }),
  unitAreaTotal: varchar("unitAreaTotal", { length: 32 }),
  unitValorM2: varchar("unitValorM2", { length: 32 }),

  // Dados do cliente
  nomeCompleto: varchar("nomeCompleto", { length: 256 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 16 }),
  nacionalidade: varchar("nacionalidade", { length: 64 }),
  naturalidade: varchar("naturalidade", { length: 64 }),
  endereco: varchar("endereco", { length: 256 }),
  complemento: varchar("complemento", { length: 128 }),
  bairro: varchar("bairro", { length: 128 }),
  cep: varchar("cep", { length: 16 }),
  cidade: varchar("cidade", { length: 128 }),
  telefoneCelular: varchar("telefoneCelular", { length: 32 }),
  telefoneResidencial: varchar("telefoneResidencial", { length: 32 }),
  email: varchar("email", { length: 320 }).notNull(),
  cpfRnm: varchar("cpfRnm", { length: 32 }),
  orgaoExpeditor: varchar("orgaoExpeditor", { length: 64 }),
  dataExpedicao: varchar("dataExpedicao", { length: 16 }),
  profissao: varchar("profissao", { length: 128 }),
  estadoCivil: varchar("estadoCivil", { length: 64 }),
  regimeComunhao: varchar("regimeComunhao", { length: 64 }),

  // Dados do corretor (obrigatórios)
  nomeCorretor: varchar("nomeCorretor", { length: 128 }).notNull(),
  telefoneCorretor: varchar("telefoneCorretor", { length: 32 }).notNull(),
  imobiliaria: varchar("imobiliaria", { length: 128 }),
  responsavelVenda: varchar("responsavelVenda", { length: 128 }),

  // Fluxo de pagamento
  fluxoMoeda: varchar("fluxoMoeda", { length: 20 }),         // ex: "BRL", "USD", "ARS", "CLP", "NAO_DEFINIDO"
  fluxoAdaptacao: text("fluxoAdaptacao"),                    // proposta personalizada do cliente
  // Valores convertidos para a moeda selecionada (preenchidos pelo frontend)
  fluxoValorTotal: varchar("fluxoValorTotal", { length: 64 }),
  fluxoEntrada: varchar("fluxoEntrada", { length: 64 }),
  fluxoSinal: varchar("fluxoSinal", { length: 64 }),
  fluxoRestante: varchar("fluxoRestante", { length: 64 }),
  fluxoMensais42: varchar("fluxoMensais42", { length: 64 }),
  fluxoSemestrais6: varchar("fluxoSemestrais6", { length: 64 }),
  fluxoCotacao: varchar("fluxoCotacao", { length: 64 }),     // ex: "1 BRL = 0.1944 USD"

  // Informações extras do cliente (país de origem, observações, etc.)
  informacoesExtras: text("informacoesExtras"),

  // Status
  status: mysqlEnum("status", ["reservado", "assinado", "vendido"]).default("reservado").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

/**
 * Tabela de corretores cadastrados.
 * Usado para identificar unicamente cada corretor no Drive e no sistema.
 */
export const corretores = mysqlTable("corretores", {
  id: int("id").autoincrement().primaryKey(),
  /** Código único legível, ex: "CAL-001" */
  codigo: varchar("codigo", { length: 16 }).notNull().unique(),
  nome: varchar("nome", { length: 128 }).notNull(),
  telefone: varchar("telefone", { length: 32 }).notNull(),
  imobiliaria: varchar("imobiliaria", { length: 128 }),
  email: varchar("email", { length: 320 }),
  ativo: mysqlEnum("ativo", ["sim", "nao"]).default("sim").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Corretor = typeof corretores.$inferSelect;
export type InsertCorretor = typeof corretores.$inferInsert;
