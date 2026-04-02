"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Loader2, Clock, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle } from "lucide-react";
import { PRICE_PER_TASALBAR, MIN_TASALBAR } from "@/lib/constants/packages";
import BankTransferModal from "@/components/shared/BankTransferModal";
import type { TasalbarData } from "./types";

interface TasalbarTabProps {
  tasalbar: TasalbarData;
}

export default function TasalbarTab({ tasalbar }: TasalbarTabProps) {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<{ id: string; name: string; amount: number; priceMNT: number } | null>(null);

  const handleCustomBuy = useCallback(() => {
    const num = parseInt(customAmount);
    if (!num || num < MIN_TASALBAR) return;
    setSelectedPurchase({ id: `custom-${num}`, name: `${num} тасалбар`, amount: num, priceMNT: num * PRICE_PER_TASALBAR });
  }, [customAmount]);

  const customNum = parseInt(customAmount) || 0;
  const customPrice = customNum * PRICE_PER_TASALBAR;

  return (
    <div className="px-4 mt-3">
      {/* Balance card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border border-yellow-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Ticket size={18} className="text-yellow-400" />
          <span className="text-xs text-white/50">Үлдэгдэл</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-yellow-400">{tasalbar.balance}</span>
          <span className="text-sm text-white/40">тасалбар</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-white/30">{(tasalbar.balance * PRICE_PER_TASALBAR).toLocaleString()}₮</p>
          {tasalbar.paymentId && <p className="text-[10px] text-white/30">ID: <span className="text-white/50 font-mono">{tasalbar.paymentId}</span></p>}
        </div>
      </div>

      {/* Buy tasalbar */}
      <div className="mt-4">
        <h3 className="font-bold text-sm mb-2">Тасалбар худалдаж авах</h3>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] text-white/40 mb-2">Хэдэн тасалбар авах вэ? <span className="text-white/25">(доод хэмжээ {MIN_TASALBAR})</span></p>
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={`${MIN_TASALBAR}-с дээш`}
              min={MIN_TASALBAR}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-yellow-500/50 placeholder:text-white/20"
            />
            <button onClick={handleCustomBuy} disabled={customNum < MIN_TASALBAR} className="bg-yellow-500 text-black font-bold text-xs px-4 py-2.5 rounded-xl disabled:opacity-30 shrink-0">
              Авах
            </button>
          </div>
          {customNum > 0 && customNum < MIN_TASALBAR && (
            <p className="text-[10px] text-red-400/70 mt-2">Доод хэмжээ {MIN_TASALBAR} тасалбар</p>
          )}
          {customNum >= MIN_TASALBAR && (
            <p className="text-[10px] text-white/40 mt-2">= <span className="text-yellow-400 font-bold">{customPrice.toLocaleString()}₮</span> <span className="text-white/20">(1 тасалбар = {PRICE_PER_TASALBAR}₮)</span></p>
          )}
        </div>
      </div>

      {/* Pending purchases */}
      {tasalbar.purchases.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-sm mb-2">Миний хүсэлтүүд</h3>
          <div className="space-y-1.5">
            {tasalbar.purchases.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                {p.status === "pending" && <Clock size={14} className="text-yellow-400 shrink-0" />}
                {p.status === "approved" && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                {p.status === "rejected" && <XCircle size={14} className="text-red-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs">{p.tasalbar_amount} тасалбар • {p.tugrug_amount.toLocaleString()}₮</p>
                  <p className="text-[9px] text-white/30">{p.status === "pending" ? "Хүлээгдэж байна" : p.status === "approved" ? "Төлөгдсөн" : "Татгалзсан"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="mt-4 pb-4">
        <h3 className="font-bold text-sm mb-2">Гүйлгээний түүх</h3>
        {tasalbar.transactions.length > 0 ? (
          <div className="space-y-1">
            {tasalbar.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${tx.type === "buy" || tx.type === "earn" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                  {tx.type === "buy" || tx.type === "earn" ? <ArrowDownLeft size={14} className="text-green-400" /> : <ArrowUpRight size={14} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{tx.desc}</p>
                  <p className="text-[10px] text-white/30">{tx.time}</p>
                </div>
                <span className={`font-semibold text-xs ${tx.type === "buy" || tx.type === "earn" ? "text-green-400" : "text-red-400"}`}>
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

      {/* Bank Transfer Payment Modal */}
      {selectedPurchase && (
        <BankTransferModal
          purchase={selectedPurchase}
          paymentId={tasalbar.paymentId}
          onClose={() => setSelectedPurchase(null)}
          onSuccess={() => { setSelectedPurchase(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
