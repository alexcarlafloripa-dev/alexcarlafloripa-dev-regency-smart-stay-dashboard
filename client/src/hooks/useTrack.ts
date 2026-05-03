import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useRef } from "react";

type EventType =
  | "unit_view"
  | "compare_add"
  | "whatsapp_click"
  | "copy_click"
  | "compare_view"
  | "simulator_use";

interface TrackPayload {
  type: EventType;
  unitCota?: string;
  unitTipologia?: string;
  unitAndar?: string;
  currency?: string;
}

/** Gera ou recupera um sessionId anônimo persistido no sessionStorage. */
function getSessionId(): string {
  const key = "mss_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

/**
 * Hook para rastreamento silencioso de eventos do dashboard.
 * Não bloqueia a UI — dispara fire-and-forget.
 */
export function useTrack() {
  const mutation = trpc.analytics.track.useMutation();
  const sessionId = useRef(getSessionId());

  const track = useCallback(
    (payload: TrackPayload) => {
      mutation.mutate({
        ...payload,
        sessionId: sessionId.current,
      });
    },
    [mutation]
  );

  return { track };
}
