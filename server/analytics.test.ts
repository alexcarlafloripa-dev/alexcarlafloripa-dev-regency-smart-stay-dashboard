import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(role: "admin" | "user" | null = null): TrpcContext {
  const user = role
    ? {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("analytics.track", () => {
  it("aceita evento unit_view sem autenticação", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    // Sem banco de dados no ambiente de teste, a mutação deve retornar ok sem lançar erro
    // (trackEvent faz early return se db não estiver disponível)
    const result = await caller.analytics.track({
      type: "unit_view",
      unitCota: "301",
      unitTipologia: "STUDIO",
      unitAndar: "3º Andar",
      currency: "BRL",
      sessionId: "test-session",
    });
    expect(result).toEqual({ ok: true });
  });

  it("aceita evento whatsapp_click", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.analytics.track({
      type: "whatsapp_click",
      unitCota: "401",
      currency: "USD",
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("analytics.summary", () => {
  it("bloqueia acesso para usuário não autenticado", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.analytics.summary({ days: 30 })
    ).rejects.toThrow();
  });

  it("bloqueia acesso para usuário comum (role=user)", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.analytics.summary({ days: 30 })
    ).rejects.toThrow("Acesso restrito ao gestor.");
  });

  it("permite acesso para admin", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    // Sem banco de dados no ambiente de teste, retorna null
    const result = await caller.analytics.summary({ days: 30 });
    expect(result === null || typeof result === "object").toBe(true);
  });
});
