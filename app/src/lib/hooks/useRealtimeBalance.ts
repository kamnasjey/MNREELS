"use client";

import { useState, useCallback } from "react";
import { useRealtime } from "./useRealtime";

/**
 * Tracks user's tasalbar balance in real-time.
 * Updates instantly when admin approves a purchase or when tasalbar is spent/earned.
 */
export function useRealtimeBalance(userId: string | null, initialBalance: number) {
  const [balance, setBalance] = useState(initialBalance);

  const handleChange = useCallback(() => {
    // On any transaction change, re-fetch balance from profile
    // This is simpler and more reliable than trying to calculate delta
    if (!userId) return;
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase
        .from("profiles")
        .select("tasalbar_balance")
        .eq("id", userId)
        .single()
        .then(({ data }) => {
          if (data) setBalance(data.tasalbar_balance);
        });
    });
  }, [userId]);

  // Listen to transaction changes for this user
  useRealtime({
    table: "tasalbar_transactions",
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onChange: handleChange,
    enabled: !!userId,
  });

  // Also listen to purchase approvals
  useRealtime({
    table: "tasalbar_purchases",
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onUpdate: handleChange,
    enabled: !!userId,
  });

  return balance;
}
