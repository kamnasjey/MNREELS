import { createServerSupabase } from "@/lib/supabase/server";
import TasalbarFeed from "@/components/TasalbarFeed";

export default async function TasalbarPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <TasalbarFeed balance={0} transactions={[]} isLoggedIn={false} />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tasalbar_balance")
    .eq("id", user.id)
    .single();

  const balance = profile?.tasalbar_balance ?? 0;

  const { data: txData } = await supabase
    .from("tasalbar_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const transactions = (txData ?? []).map((tx: Record<string, unknown>) => ({
    id: String(tx.id),
    type: String(tx.type ?? "spend"),
    amount: Number(tx.amount ?? 0),
    desc: String(tx.description ?? ""),
    time: formatTimeAgo(String(tx.created_at ?? "")),
  }));

  return (
    <TasalbarFeed
      balance={balance}
      transactions={transactions}
      isLoggedIn={true}
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
