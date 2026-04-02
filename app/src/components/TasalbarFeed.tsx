"use client";

import { useState, useCallback } from "react";
import { Ticket, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PRICE_PER_TASALBAR, MIN_TASALBAR } from "@/lib/constants/packages";
import BankTransferModal from "@/components/shared/BankTransferModal";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  desc: string;
  time: string;
}

interface Purchase {
  id: string;
  tasalbar_amount: number;
  tugrug_amount: number;
  status: string;
  created_at: string;
}

interface TasalbarFeedProps {
  balance: number;
  transactions: Transaction[];
  purchases: Purchase[];
  isLoggedIn: boolean;
  paymentId: number | null;
}

interface SelectedPurchase {
  id: string;
  name: string;
  amount: number;
  priceMNT: number;
}

export default function TasalbarFeed({ balance, transactions, purchases, isLoggedIn, paymentId }: TasalbarFeedProps) {
  const router = useRouter();
  const [selectedPurchase, setSelectedPurchase] = useState<SelectedPurchase | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCustomBuy = useCallback(() => {
    const num = parseInt(customAmount);
    if (!num || num < MIN_TASALBAR) return;
    const price = num * PRICE_PER_TASALBAR;
    setSelectedPurchase({
      id: `custom-${num}`,
      name: `${num} тасалбар`,
      amount: num,
      priceMNT: price,
    });
    setError(null);
  }, [customAmount]);

  if (!isLoggedIn) {
    return (
      <MobileShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-8">
          <Ticket size={48} className="text-yellow-400 mb-4" />
          <p className="text-sm text-white/50 text-center mb-4">
            Тасалбар худалдаж авахын тулд нэвтэрнэ үү
          </p>
          <Link
            href="/auth/login"
            className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl"
          >
            Нэвтрэх
          </Link>
        </div>
      </MobileShell>
    );
  }

  const customNum = parseInt(customAmount) || 0;
  const customPrice = customNum * PRICE_PER_TASALBAR;

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
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-white/30">{(balance * PRICE_PER_TASALBAR).toLocaleString()}₮</p>
              {paymentId && (
                <p className="text-xs text-white/30">ID: <span className="text-white/50 font-mono">{paymentId}</span></p>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Custom amount input */}
          <div className="px-4 mt-6">
            <h2 className="font-bold text-base mb-3">Тасалбар худалдаж авах</h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40 mb-2">Хэдэн тасалбар авах вэ? <span className="text-white/25">(доод хэмжээ {MIN_TASALBAR})</span></p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={`${MIN_TASALBAR}-с дээш`}
                    min={MIN_TASALBAR}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-base font-bold outline-none focus:border-yellow-500/50 placeholder:text-white/20"
                  />
                </div>
                <button
                  onClick={handleCustomBuy}
                  disabled={customNum < MIN_TASALBAR}
                  className="bg-yellow-500 text-black font-bold text-sm px-5 py-3 rounded-xl disabled:opacity-30 shrink-0"
                >
                  Авах
                </button>
              </div>
              {customNum > 0 && customNum < MIN_TASALBAR && (
                <p className="text-xs text-red-400/70 mt-2">
                  Доод хэмжээ {MIN_TASALBAR} тасалбар ({(MIN_TASALBAR * PRICE_PER_TASALBAR).toLocaleString()}₮)
                </p>
              )}
              {customNum >= MIN_TASALBAR && (
                <p className="text-xs text-white/40 mt-2">
                  = <span className="text-yellow-400 font-bold">{customPrice.toLocaleString()}₮</span>
                  <span className="text-white/20 ml-1">(1 тасалбар = {PRICE_PER_TASALBAR}₮)</span>
                </p>
              )}
            </div>
          </div>

          {/* Pending purchases */}
          {purchases.length > 0 && (
            <div className="px-4 mt-6">
              <h2 className="font-bold text-base mb-3">Миний хүсэлтүүд</h2>
              <div className="space-y-2">
                {purchases.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    {p.status === "pending" && <Clock size={16} className="text-yellow-400 shrink-0" />}
                    {p.status === "approved" && <CheckCircle size={16} className="text-green-400 shrink-0" />}
                    {p.status === "rejected" && <XCircle size={16} className="text-red-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{p.tasalbar_amount} тасалбар • {p.tugrug_amount.toLocaleString()}₮</p>
                      <p className="text-[10px] text-white/30">
                        {p.status === "pending" ? "Хүлээгдэж байна" : p.status === "approved" ? "Төлөгдсөн" : "Татгалзсан"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction history */}
          <div className="px-4 mt-6 pb-4">
            <h2 className="font-bold text-base mb-3">Гүйлгээний түүх</h2>
            {transactions.length > 0 ? (
              <div className="space-y-1">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "buy" || tx.type === "earn" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      {tx.type === "buy" || tx.type === "earn" ? (
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
                      tx.type === "buy" || tx.type === "earn" ? "text-green-400" : "text-red-400"
                    }`}>
                      {tx.type === "buy" || tx.type === "earn" ? "+" : ""}{tx.amount}
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

      {/* Bank Transfer Payment Modal */}
      {selectedPurchase && (
        <BankTransferModal
          purchase={selectedPurchase}
          paymentId={paymentId}
          onClose={() => setSelectedPurchase(null)}
          onSuccess={() => { setSelectedPurchase(null); router.refresh(); }}
        />
      )}
    </MobileShell>
  );
}
