"use client";

import { useState } from "react";
import { ArrowLeft, Ticket, Building2, Loader2, CheckCircle2, Clock, Check, X } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";
import { requestWithdrawal } from "@/lib/actions/creator";

const PACKAGES = [
  { amount: 100, tugrug: 5000 },
  { amount: 500, tugrug: 25000 },
  { amount: 1000, tugrug: 50000 },
  { amount: 5000, tugrug: 250000 },
];

interface Withdrawal {
  id: string;
  tasalbar_amount: number;
  tugrug_amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
}

const STATUS_INFO: Record<string, { text: string; icon: typeof Clock; color: string }> = {
  pending: { text: "Хүлээж буй", icon: Clock, color: "text-orange-400" },
  processing: { text: "Шилжүүлж буй", icon: Loader2, color: "text-blue-400" },
  completed: { text: "Дууссан", icon: Check, color: "text-green-400" },
  rejected: { text: "Буцаагдсан", icon: X, color: "text-red-400" },
};

export default function WithdrawClient({
  balance,
  bankName,
  bankAccount,
  withdrawals,
}: {
  balance: number;
  bankName: string;
  bankAccount: string;
  withdrawals: Withdrawal[];
}) {
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedAmount = amount || (customAmount ? parseInt(customAmount) : 0);

  const handleWithdraw = async () => {
    if (selectedAmount < 100) {
      setError("Хамгийн бага 100 тасалбар");
      return;
    }
    if (selectedAmount > balance) {
      setError("Үлдэгдэл хүрэхгүй");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestWithdrawal(selectedAmount);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <CreatorShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-6">
          <CheckCircle2 size={64} className="text-green-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Хүсэлт илгээгдлээ!</h2>
          <p className="text-sm text-white/50 text-center mb-2">
            {selectedAmount.toLocaleString()} тасалбар = {(selectedAmount * 50).toLocaleString()}₮
          </p>
          <p className="text-xs text-white/30 text-center mb-8">
            1-3 ажлын өдөрт таны банкны данс руу шилжүүлнэ
          </p>
          <Link
            href="/creator"
            className="bg-white text-black font-semibold text-sm px-6 py-3 rounded-xl"
          >
            Самбар руу буцах
          </Link>
        </div>
      </CreatorShell>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("mn-MN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <CreatorShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Link href="/creator" className="text-white/60">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-base">Мөнгө татах</h1>
            <div className="w-5" />
          </div>

          <div className="px-4 mt-4 space-y-5">
            {/* Balance */}
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-xl p-4 border border-purple-500/20">
              <p className="text-xs text-white/40 mb-1">Миний үлдэгдэл</p>
              <div className="flex items-baseline gap-2">
                <Ticket size={18} className="text-purple-400" />
                <span className="text-3xl font-black text-purple-400">{balance.toLocaleString()}</span>
                <span className="text-sm text-white/30">тасалбар</span>
              </div>
              <p className="text-sm text-white/30 mt-1">{(balance * 50).toLocaleString()}₮</p>
            </div>

            {/* Exchange rate */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-2">
              <Ticket size={14} className="text-purple-400" />
              <span className="text-xs text-white/40">Ханш: <span className="font-bold text-white/70">1 тасалбар = 50₮</span></span>
            </div>

            {/* Amount selection */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-3">Тасалбар сонгох</p>
              <div className="grid grid-cols-2 gap-3">
                {PACKAGES.filter(p => p.amount <= balance || balance === 0).map((pkg) => (
                  <button
                    key={pkg.amount}
                    onClick={() => { setAmount(pkg.amount); setCustomAmount(""); }}
                    className={`p-4 rounded-xl text-center transition-all ${
                      amount === pkg.amount
                        ? "bg-purple-500/30 border-2 border-purple-500"
                        : "bg-white/5 border-2 border-transparent"
                    }`}
                  >
                    <p className="text-lg font-bold">{pkg.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-white/40">{pkg.tugrug.toLocaleString()}₮</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Бусад дүн</p>
              <input
                type="number"
                placeholder="100-аас дээш"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30"
              />
              {selectedAmount > 0 && (
                <p className="text-xs text-white/40 mt-1.5">
                  = {(selectedAmount * 50).toLocaleString()}₮ таны данс руу
                </p>
              )}
            </div>

            {/* Bank info - real data */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-white/40" />
                <span className="text-sm text-white/50">Банкны данс</span>
              </div>
              {bankName && bankAccount ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{bankName}</p>
                  <p className="text-sm text-white/60">{bankAccount}</p>
                </div>
              ) : (
                <p className="text-xs text-red-400">
                  Банкны мэдээлэл бүрэн биш. Профайлаас оруулна уу.
                </p>
              )}
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            {/* Submit */}
            <button
              onClick={handleWithdraw}
              disabled={selectedAmount < 100 || loading || !bankName || !bankAccount}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                selectedAmount >= 100 && !loading && bankName && bankAccount
                  ? "bg-purple-500 text-white hover:bg-purple-600"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                `${selectedAmount > 0 ? (selectedAmount * 50).toLocaleString() + "₮" : ""} Татах`
              )}
            </button>

            {/* Withdrawal history */}
            {withdrawals.length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold text-white/60 mb-3">Татсан түүх</h3>
                <div className="space-y-2">
                  {withdrawals.map((w) => {
                    const info = STATUS_INFO[w.status] ?? STATUS_INFO.pending;
                    const Icon = info.icon;
                    return (
                      <div key={w.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <Icon size={14} className={info.color} />
                          <div>
                            <p className="text-sm font-medium">
                              {w.tasalbar_amount.toLocaleString()} тасалбар
                            </p>
                            <p className="text-[10px] text-white/30">{formatDate(w.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-300">
                            {w.tugrug_amount.toLocaleString()}₮
                          </p>
                          <p className={`text-[10px] ${info.color}`}>{info.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
