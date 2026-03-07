"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket, ArrowDownLeft, ArrowUpRight, X, Loader2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";

const packages = [
  { id: "pkg-20", name: "Турших", amount: 20, price: "1,000₮", priceMNT: 1000, popular: false },
  { id: "pkg-65", name: "Жижиг", amount: 65, price: "2,500₮", priceMNT: 2500, popular: false, bonus: 5 },
  { id: "pkg-135", name: "Дунд", amount: 135, price: "5,000₮", priceMNT: 5000, popular: true, bonus: 10 },
  { id: "pkg-290", name: "Том", amount: 290, price: "10,000₮", priceMNT: 10000, popular: false, bonus: 20 },
  { id: "pkg-600", name: "Супер", amount: 600, price: "18,000₮", priceMNT: 18000, popular: false, bonus: 50 },
];

interface Transaction {
  id: string;
  type: string;
  amount: number;
  desc: string;
  time: string;
}

interface TasalbarFeedProps {
  balance: number;
  transactions: Transaction[];
  isLoggedIn: boolean;
}

interface InvoiceData {
  invoiceId: string;
  qrImage: string;
  qPayShortUrl: string;
  mock?: boolean;
  message?: string;
  package: { name: string; amount: number; price: number };
}

export default function TasalbarFeed({ balance, transactions, isLoggedIn }: TasalbarFeedProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = useCallback(async (packageId: string) => {
    setLoading(packageId);
    setError(null);
    try {
      const res = await fetch("/api/qpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvoice(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(null);
    }
  }, []);

  // Poll for payment status
  useEffect(() => {
    if (!invoice || invoice.mock) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/qpay/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: invoice.invoiceId }),
        });
        const data = await res.json();
        if (data.paid) {
          setInvoice(null);
          window.location.reload();
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [invoice]);

  if (!isLoggedIn) {
    return (
      <MobileShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-8">
          <Ticket size={48} className="text-yellow-400 mb-4" />
          <p className="text-sm text-white/50 text-center mb-4">
            Тасалбар худалдаж авахын тулд нэвтэрнэ үү
          </p>
          <Link
            href="/login"
            className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl"
          >
            Нэвтрэх
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="px-4 pt-4 pb-2">
            <h1 className="text-xl font-bold">Миний тасалбар</h1>
          </div>

          {/* Balance card */}
          <div className="mx-4 mt-2 p-5 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Ticket size={20} className="text-yellow-400" />
              <span className="text-sm text-white/50">Үлдэгдэл</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-yellow-400">{balance}</span>
              <span className="text-lg text-white/40">тасалбар</span>
            </div>
            <p className="text-sm text-white/30 mt-1">{(balance * 50).toLocaleString()}₮</p>
          </div>

          {error && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Packages */}
          <div className="px-4 mt-6">
            <h2 className="font-bold text-base mb-3">Тасалбар худалдаж авах</h2>
            <div className="space-y-2.5">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading !== null}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    pkg.popular
                      ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/40 ring-1 ring-yellow-500/20"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  } ${loading !== null ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pkg.popular ? "bg-yellow-500/30" : "bg-white/10"
                    }`}>
                      {loading === pkg.id ? (
                        <Loader2 size={18} className="text-yellow-400 animate-spin" />
                      ) : (
                        <Ticket size={18} className={pkg.popular ? "text-yellow-400" : "text-white/50"} />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{pkg.name}</span>
                        {pkg.popular && (
                          <span className="text-[9px] font-bold bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                            ХАМГИЙН АШИГТАЙ
                          </span>
                        )}
                        {pkg.bonus && !pkg.popular && (
                          <span className="text-[9px] font-bold bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full">
                            +{pkg.bonus} бонус
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">{pkg.amount} тасалбар</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${pkg.popular ? "text-yellow-400" : "text-white"}`}>
                    {pkg.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction history */}
          <div className="px-4 mt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">Гүйлгээний түүх</h2>
            </div>
            {transactions.length > 0 ? (
              <div className="space-y-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "buy" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      {tx.type === "buy" ? (
                        <ArrowDownLeft size={16} className="text-green-400" />
                      ) : (
                        <ArrowUpRight size={16} className="text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{tx.desc}</p>
                      <p className="text-[11px] text-white/30">{tx.time}</p>
                    </div>
                    <span className={`font-semibold text-sm ${
                      tx.type === "buy" ? "text-green-400" : "text-red-400"
                    }`}>
                      {tx.type === "buy" ? "+" : "-"}{Math.abs(tx.amount)} 🎬
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-white/30">Гүйлгээ байхгүй</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QPay Payment Modal */}
      {invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setInvoice(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <Ticket size={32} className="text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg">{invoice.package.name} багц</h3>
              <p className="text-sm text-white/40 mt-1">
                {invoice.package.amount} тасалбар • {invoice.package.price.toLocaleString()}₮
              </p>
            </div>

            {invoice.mock ? (
              <div className="mt-5 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-400 text-center">
                  {invoice.message}
                </p>
                <p className="text-[10px] text-white/30 text-center mt-2">
                  QPay гэрээ хийсний дараа бодит QR код харагдана
                </p>
              </div>
            ) : (
              <>
                {/* QR Code */}
                {invoice.qrImage && (
                  <div className="mt-5 flex justify-center">
                    <img
                      src={`data:image/png;base64,${invoice.qrImage}`}
                      alt="QPay QR"
                      className="w-48 h-48 rounded-xl"
                    />
                  </div>
                )}

                <p className="text-xs text-white/40 text-center mt-3">
                  QPay аппаар QR кодыг уншуулна уу
                </p>

                {invoice.qPayShortUrl && (
                  <a
                    href={invoice.qPayShortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-500 text-white font-semibold text-sm py-3 rounded-xl mt-3"
                  >
                    QPay аппаар нээх
                  </a>
                )}

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Loader2 size={14} className="text-white/30 animate-spin" />
                  <p className="text-[11px] text-white/30">Төлбөр хүлээж байна...</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </MobileShell>
  );
}
