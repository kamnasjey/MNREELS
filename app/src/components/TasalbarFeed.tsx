"use client";

import { useState, useCallback } from "react";
import { Ticket, ArrowDownLeft, ArrowUpRight, X, Loader2, Copy, Check, Clock, CheckCircle, XCircle } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";
import { createManualPurchase } from "@/lib/actions/tasalbar";

// Bank details
const BANK_NAME = "Хаан банк";
const BANK_ACCOUNT = "5013221055";
const BANK_ACCOUNT_NAME = "Зоригт Ариунжаргал";
const BANK_IBAN = "85000500";

// 1 тасалбар = 50₮
const PRICE_PER_TASALBAR = 50;
const MIN_TASALBAR = 100;

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
  const [selectedPurchase, setSelectedPurchase] = useState<SelectedPurchase | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    setSuccess(false);
  }, [customAmount]);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleSubmitPurchase = useCallback(async () => {
    if (!selectedPurchase) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createManualPurchase(selectedPurchase.id, selectedPurchase.amount, selectedPurchase.priceMNT);
      if (!result.success) {
        setError(result.error || "Алдаа гарлаа");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, [selectedPurchase]);

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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl w-full max-w-sm sm:mx-6 relative max-h-[90dvh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 z-10 p-4 pb-0 flex items-center justify-between">
              <h3 className="font-bold text-lg">Төлбөр төлөх</h3>
              <button
                onClick={() => { setSelectedPurchase(null); setSuccess(false); }}
                className="text-white/40 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {success ? (
                <div className="text-center py-6">
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                  <h4 className="font-bold text-lg">Хүсэлт илгээгдлээ!</h4>
                  <p className="text-sm text-white/50 mt-2">
                    Банкны шилжүүлэг хийсний дараа админ баталгаажуулахад таны тасалбар орно.
                  </p>
                  <button
                    onClick={() => { setSelectedPurchase(null); setSuccess(false); window.location.reload(); }}
                    className="mt-4 bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl"
                  >
                    Ойлголоо
                  </button>
                </div>
              ) : (
                <>
                  {/* Purchase summary */}
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{selectedPurchase.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {selectedPurchase.amount} тасалбар
                        </p>
                      </div>
                      <span className="font-black text-lg text-yellow-400">{selectedPurchase.priceMNT.toLocaleString()}₮</span>
                    </div>
                  </div>

                  {/* Bank details */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Дансны мэдээлэл</p>

                    <div className="p-3 rounded-xl bg-white/5 space-y-2.5">
                      <div>
                        <p className="text-[10px] text-white/30">Банк</p>
                        <p className="text-sm font-medium">{BANK_NAME}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-white/30">Дансны дугаар</p>
                          <p className="text-sm font-mono font-medium">{BANK_ACCOUNT}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(BANK_ACCOUNT, "account")}
                          className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                        >
                          {copiedField === "account" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-white/30">Дансны нэр</p>
                          <p className="text-sm font-medium">{BANK_ACCOUNT_NAME}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(BANK_ACCOUNT_NAME, "name")}
                          className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                        >
                          {copiedField === "name" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>

                      {BANK_IBAN && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-white/30">IBAN</p>
                            <p className="text-sm font-mono font-medium">{BANK_IBAN}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(BANK_IBAN, "iban")}
                            className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                          >
                            {copiedField === "iban" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Transfer description */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-[10px] text-white/30 mb-1">Гүйлгээний утга (заавал бичнэ!)</p>
                      <div className="flex items-center justify-between">
                        <p className="text-base font-mono font-bold text-purple-300">
                          {paymentId} {selectedPurchase.amount}
                        </p>
                        <button
                          onClick={() => handleCopy(`${paymentId} ${selectedPurchase.amount}`, "desc")}
                          className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                        >
                          {copiedField === "desc" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">
                        Таны ID: {paymentId} • Тасалбар: {selectedPurchase.amount}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-[10px] text-white/30 mb-1">Шилжүүлэх дүн</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">{selectedPurchase.priceMNT.toLocaleString()}₮</p>
                        <button
                          onClick={() => handleCopy(String(selectedPurchase.priceMNT), "amount")}
                          className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5"
                        >
                          {copiedField === "amount" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmitPurchase}
                    disabled={loading}
                    className="w-full mt-4 bg-yellow-500 text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Ticket size={16} />
                        Шилжүүлэг хийсэн, хүсэлт илгээх
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-white/30 text-center mt-2">
                    Шилжүүлэг хийсний дараа дарна уу. Админ шалгаад тасалбар олгоно.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
