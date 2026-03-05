import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// QPay integration for tasalbar purchases
// Docs: https://developer.qpay.mn

interface QPayTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface QPayInvoiceResponse {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  urls: { name: string; description: string; logo: string; link: string }[];
}

// Get QPay access token
async function getQPayToken(): Promise<string> {
  const res = await fetch("https://merchant.qpay.mn/v2/auth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
      ).toString("base64")}`,
    },
  });

  const data: QPayTokenResponse = await res.json();
  return data.access_token;
}

// Create QPay invoice
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packageAmount, packagePrice } = await request.json();

  // Validate packages
  const packages: Record<number, number> = {
    20: 1000,    // 20 тасалбар = 1,000₮
    55: 2500,    // 55 тасалбар = 2,500₮ (10% bonus)
    120: 5000,   // 120 тасалбар = 5,000₮ (20% bonus)
    250: 10000,  // 250 тасалбар = 10,000₮ (25% bonus)
    500: 18000,  // 500 тасалбар = 18,000₮ (40% bonus)
  };

  if (!packages[packageAmount] || packages[packageAmount] !== packagePrice) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  try {
    const token = await getQPayToken();

    const invoiceRes = await fetch("https://merchant.qpay.mn/v2/invoice", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_code: process.env.QPAY_INVOICE_CODE,
        sender_invoice_no: `MNREELS-${user.id.slice(0, 8)}-${Date.now()}`,
        invoice_receiver_code: user.id.slice(0, 8),
        invoice_description: `MNREELS ${packageAmount} тасалбар`,
        amount: packagePrice,
        callback_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/qpay-callback?user_id=${user.id}&amount=${packageAmount}`,
      }),
    });

    const invoice: QPayInvoiceResponse = await invoiceRes.json();

    return NextResponse.json({
      invoiceId: invoice.invoice_id,
      qrImage: invoice.qr_image,
      qrText: invoice.qr_text,
      deeplinks: invoice.urls, // Bank app deeplinks
    });
  } catch (error) {
    return NextResponse.json(
      { error: "QPay алдаа гарлаа" },
      { status: 500 }
    );
  }
}

// QPay payment callback (verify + credit)
export async function PUT(request: NextRequest) {
  const { invoiceId, userId, amount } = await request.json();

  try {
    const token = await getQPayToken();

    // Verify payment
    const checkRes = await fetch(`https://merchant.qpay.mn/v2/payment/check`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        object_type: "INVOICE",
        object_id: invoiceId,
      }),
    });

    const checkData = await checkRes.json();

    if (checkData.count > 0 && checkData.rows[0].payment_status === "PAID") {
      // Payment confirmed — credit tasalbar
      const supabase = await createServerSupabase();

      await supabase.rpc("increment_balance", {
        user_id: userId,
        amount: amount,
      });

      await supabase.from("tasalbar_transactions").insert({
        user_id: userId,
        amount: amount,
        type: "buy",
        description: `${amount} тасалбар худалдаж авсан`,
        payment_method: "qpay",
        payment_ref: invoiceId,
      });

      return NextResponse.json({ success: true, paid: true });
    }

    return NextResponse.json({ success: true, paid: false });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
