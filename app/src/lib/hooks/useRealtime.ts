"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "episodes" | "purchases" | "tasalbar_transactions" | "tasalbar_purchases" | "profiles";
type EventType = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions {
  table: TableName;
  event?: EventType;
  filter?: string; // e.g., "user_id=eq.abc123"
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  enabled?: boolean;
}

/**
 * Subscribe to Supabase Realtime changes on a table.
 * Auto-unsubscribes on unmount.
 *
 * Usage:
 * useRealtime({
 *   table: "tasalbar_transactions",
 *   filter: `user_id=eq.${userId}`,
 *   onInsert: (payload) => { refreshBalance(); },
 * });
 */
export function useRealtime({
  table,
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions) {
  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channelName = `realtime-${table}-${filter ?? "all"}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          onChange?.(payload);
          if (payload.eventType === "INSERT") onInsert?.(payload);
          if (payload.eventType === "UPDATE") onUpdate?.(payload);
          if (payload.eventType === "DELETE") onDelete?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, enabled]);
}
