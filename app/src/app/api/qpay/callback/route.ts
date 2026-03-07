import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPackageById } from "@/lib/qpay";

// QPay callback — төлбөр амжилттай болсон үед QPay дуудна
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const packageId = searchParams.get("packageId");
    const invoiceNo = searchParams.get("invoiceNo");

    if (!userId || !packageId || !invoiceNo) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const pkg = getPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    // Давхардсан эсэхийг шалгах
    const { data: existing } = await supabase
      .from("tasalbar_transactions")
      .select("id")
      .eq("payment_ref", invoiceNo)
      .eq("type", "buy")
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const totalAmount = pkg.amount + ("bonus" in pkg ? (pkg.bonus ?? 0) : 0);

    // Pending → buy болгох
    await supabase
      .from("tasalbar_transactions")
      .update({
        type: "buy",
        amount: totalAmount,
        description: `${pkg.name} багц худалдаж авсан (${pkg.amount}${"bonus" in pkg ? ` + ${pkg.bonus} бонус` : ""})`,
      })
      .eq("payment_ref", invoiceNo)
      .eq("user_id", userId);

    // Balance нэмэх
    await supabase.rpc("increment_balance", {
      user_id: userId,
      amount: totalAmount,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Callback error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
