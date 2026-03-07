import { NextRequest, NextResponse } from "next/server";
import { getQPayClient, isQPayConfigured } from "@/lib/qpay";
import { createServerSupabase } from "@/lib/supabase/server";

// Төлбөрийн статус шалгах (client polling)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    const { invoiceId } = await req.json();
    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId шаардлагатай" }, { status: 400 });
    }

    if (!isQPayConfigured()) {
      return NextResponse.json({ paid: false, mock: true });
    }

    const client = getQPayClient();
    const result = await client.checkPayment({
      objectType: "INVOICE",
      objectId: invoiceId,
      offset: { pageNumber: 1, pageLimit: 10 },
    });

    const paid = result.count > 0;

    return NextResponse.json({
      paid,
      paidAmount: result.paidAmount ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Алдаа";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
