import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WithdrawClient from "./WithdrawClient";

export default async function WithdrawPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [profileResult, withdrawalsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("tasalbar_balance, bank_name, bank_account, display_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("withdrawals")
      .select("id, tasalbar_amount, tugrug_amount, status, created_at, processed_at")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileResult.data;
  if (!profile) redirect("/creator");

  return (
    <WithdrawClient
      balance={profile.tasalbar_balance ?? 0}
      bankName={profile.bank_name ?? ""}
      bankAccount={profile.bank_account ?? ""}
      withdrawals={withdrawalsResult.data ?? []}
    />
  );
}
