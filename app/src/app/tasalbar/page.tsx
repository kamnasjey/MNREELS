import { createServerSupabase } from "@/lib/supabase/server";
import TasalbarFeed from "@/components/TasalbarFeed";
import { redirect } from "next/navigation";

export default async function TasalbarPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/tasalbar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tasalbar_balance, payment_id")
    .eq("id", user.id)
    .single();

  const balance = profile?.tasalbar_balance ?? 0;
  const paymentId = profile?.payment_id ?? null;

  const [txResult, purchaseResult] = await Promise.all([
    supabase
      .from("tasalbar_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("tasalbar_purchases")
      .select("id, tasalbar_amount, tugrug_amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const transactions = (txResult.data ?? []).map((tx: Record<string, unknown>) => ({
    id: String(tx.id),
    type: String(tx.type ?? "spend"),
    amount: Number(tx.amount ?? 0),
    desc: String(tx.description ?? ""),
    time: formatTimeAgo(String(tx.created_at ?? "")),
  }));

  const purchases = (purchaseResult.data ?? []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    tasalbar_amount: Number(p.tasalbar_amount ?? 0),
    tugrug_amount: Number(p.tugrug_amount ?? 0),
    status: String(p.status ?? "pending"),
    created_at: String(p.created_at ?? ""),
  }));

  return (
    <TasalbarFeed
      balance={balance}
      transactions={transactions}
      purchases={purchases}
      isLoggedIn={true}
      paymentId={paymentId}
    />
  );
}

function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Саяхан";
  if (diffHours < 24) return `${diffHours} цагийн өмнө`;
  if (diffDays === 1) return "Өчигдөр";
  return `${diffDays} өдрийн өмнө`;
}
