import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { desc, gte, sql } from "drizzle-orm";
import { events, InsertEvent } from "../drizzle/schema";

/** Registra um evento de interação do corretor. */
export async function trackEvent(data: Omit<InsertEvent, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(events).values(data);
  } catch (err) {
    console.error("[trackEvent] Failed:", err);
  }
}

/** Retorna dados agregados para o painel do gestor. */
export async function getAnalytics(days: number) {
  const db = await getDb();
  if (!db) return null;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total de eventos por tipo
  const byType = await db
    .select({ type: events.type, count: sql<number>`count(*)` })
    .from(events)
    .where(gte(events.createdAt, since))
    .groupBy(events.type);

  // Top unidades mais visualizadas
  const topUnits = await db
    .select({
      cota: events.unitCota,
      tipologia: events.unitTipologia,
      andar: events.unitAndar,
      count: sql<number>`count(*)`,
    })
    .from(events)
    .where(gte(events.createdAt, since))
    .groupBy(events.unitCota, events.unitTipologia, events.unitAndar)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Distribuição de moedas (para ver origem dos leads)
  const byCurrency = await db
    .select({ currency: events.currency, count: sql<number>`count(*)` })
    .from(events)
    .where(gte(events.createdAt, since))
    .groupBy(events.currency);

  // Eventos por dia (últimos N dias)
  const byDay = await db
    .select({
      day: sql<string>`DATE(createdAt)`,
      count: sql<number>`count(*)`,
    })
    .from(events)
    .where(gte(events.createdAt, since))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  // Total de sessões únicas
  const sessions = await db
    .select({ count: sql<number>`count(distinct sessionId)` })
    .from(events)
    .where(gte(events.createdAt, since));

  // Top unidades com clique em WhatsApp
  const topWhatsapp = await db
    .select({
      cota: events.unitCota,
      tipologia: events.unitTipologia,
      count: sql<number>`count(*)`,
    })
    .from(events)
    .where(gte(events.createdAt, since))
    .groupBy(events.unitCota, events.unitTipologia)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  return {
    byType,
    topUnits,
    byCurrency,
    byDay,
    totalSessions: sessions[0]?.count ?? 0,
    topWhatsapp,
    days,
  };
}

import { reservations, InsertReservation } from "../drizzle/schema";

/** Cria uma nova ficha de reserva. */
export async function createReservation(data: Omit<InsertReservation, "id" | "createdAt" | "updatedAt" | "status">) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create reservation: database not available");
    return null;
  }
  try {
    const [insertResult] = await db.insert(reservations).values({ ...data, status: "reservado" });
    const insertId = (insertResult as any).insertId;
    if (insertId) {
      const result = await db.select().from(reservations).where(eq(reservations.id, insertId)).limit(1);
      return result[0] ?? null;
    }
    // Fallback: busca o mais recente
    const result = await db
      .select()
      .from(reservations)
      .orderBy(desc(reservations.createdAt))
      .limit(1);
    return result[0] ?? null;
  } catch (err) {
    console.error("[createReservation] Failed:", err);
    throw err;
  }
}

/** Retorna uma reserva pelo ID. */
export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return result[0] ?? null;
}

/** Lista as reservas mais recentes. */
export async function getReservations(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).orderBy(desc(reservations.createdAt)).limit(limit);
}

/** Atualiza o status de uma reserva. */
export async function updateReservationStatus(id: number, status: "reservado" | "assinado" | "vendido") {
  const db = await getDb();
  if (!db) return null;
  await db.update(reservations).set({ status, updatedAt: new Date() }).where(eq(reservations.id, id));
  const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return result[0] ?? null;
}

import { corretores, InsertCorretor, Corretor } from "../drizzle/schema";

/** Gera o próximo código de corretor, ex: "CAL-001", "CAL-002" */
async function gerarCodigoCorretor(): Promise<string> {
  const db = await getDb();
  if (!db) return "CAL-001";
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(corretores);
  const total = Number(result[0]?.count ?? 0);
  return `CAL-${String(total + 1).padStart(3, "0")}`;
}

/** Lista todos os corretores ativos, ordenados por nome. */
export async function listCorretores(): Promise<Corretor[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(corretores)
    .orderBy(corretores.nome);
}

/** Cria um novo corretor com código único automático. */
export async function createCorretor(
  data: Omit<InsertCorretor, "id" | "codigo" | "createdAt" | "updatedAt" | "ativo">
): Promise<Corretor | null> {
  const db = await getDb();
  if (!db) return null;
  const codigo = await gerarCodigoCorretor();
  try {
    const [result] = await db.insert(corretores).values({ ...data, codigo, ativo: "sim" });
    const insertId = (result as any).insertId;
    if (insertId) {
      const rows = await db.select().from(corretores).where(eq(corretores.id, insertId)).limit(1);
      return rows[0] ?? null;
    }
    return null;
  } catch (err) {
    console.error("[createCorretor] Failed:", err);
    throw err;
  }
}

/** Atualiza dados de um corretor. */
export async function updateCorretor(
  id: number,
  data: Partial<Pick<InsertCorretor, "nome" | "telefone" | "imobiliaria" | "email" | "ativo">>
): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  await db.update(corretores).set(data).where(eq(corretores.id, id));
  return { ok: true };
}

/** Remove um corretor pelo ID. */
export async function deleteCorretor(id: number): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  await db.delete(corretores).where(eq(corretores.id, id));
  return { ok: true };
}
