import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getQPayClient, getPackageById, isQPayConfigured } from "@/lib/qpay";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    const { packageId } = await req.json();
    const pkg = getPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Багц олдсонгүй" }, { status: 400 });
    }

    // QPay тохируулаагүй бол mock response буцаана
    if (!isQPayConfigured()) {
      return NextResponse.json({
        invoiceId: `mock-${Date.now()}`,
        qrImage: "",
        qPayShortUrl: "",
        mock: true,
        message: "QPay тохируулаагүй байна. Sandbox горимд ажиллаж байна.",
        package: { name: pkg.name, amount: pkg.amount, price: pkg.priceMNT },
      });
    }

    const client = getQPayClient();
    const senderInvoiceNo = `MNREELS-${user.id.slice(0, 8)}-${Date.now()}`;

    const invoice = await client.createSimpleInvoice({
      invoiceCode: process.env.QPAY_INVOICE_CODE!,
      senderInvoiceNo,
      invoiceReceiverCode: "terminal",
      invoiceDescription: `MNREELS ${pkg.name} багц - ${pkg.amount} тасалбар`,
      amount: pkg.priceMNT,
      callbackUrl: `${process.env.QPAY_CALLBACK_URL}?userId=${user.id}&packageId=${pkg.id}&invoiceNo=${senderInvoiceNo}`,
    });

    // Pending transaction бүртгэх
    await supabase.from("tasalbar_transactions").insert({
      user_id: user.id,
      amount: pkg.amount,
      type: "pending",
      description: `${pkg.name} багц - QPay төлбөр хүлээж байна`,
      payment_method: "qpay",
      payment_ref: senderInvoiceNo,
    });

    return NextResponse.json({
      invoiceId: invoice.invoiceId,
      qrImage: invoice.qrImage,
      qPayShortUrl: invoice.qPayShortUrl,
      package: { name: pkg.name, amount: pkg.amount, price: pkg.priceMNT },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Алдаа гарлаа";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
