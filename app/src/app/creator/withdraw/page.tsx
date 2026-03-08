"use client";

import { useState } from "react";
import { ArrowLeft, Ticket, Building2, Loader2, CheckCircle2 } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";
import { requestWithdrawal } from "@/lib/actions/creator";

const PACKAGES = [
  { amount: 100, tugrug: 5000 },
  { amount: 500, tugrug: 25000 },
  { amount: 1000, tugrug: 50000 },
  { amount: 5000, tugrug: 250000 },
];

export default function WithdrawPage() {
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
            {/* Exchange rate info */}
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Ticket size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Ханш</span>
              </div>
              <p className="text-2xl font-black text-purple-400">1 тасалбар = 50₮</p>
            </div>

            {/* Amount selection */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-3">Тасалбар сонгох</p>
              <div className="grid grid-cols-2 gap-3">
                {PACKAGES.map((pkg) => (
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

            {/* Bank info */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-white/40" />
                <span className="text-sm text-white/50">Банкны данс</span>
              </div>
              <p className="text-xs text-white/30">
                Бүртгэлд оруулсан банкны данс руу шилжүүлнэ. Өөрчлөхийг хүсвэл профайлаас засна уу.
              </p>
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            {/* Submit */}
            <button
              onClick={handleWithdraw}
              disabled={selectedAmount < 100 || loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                selectedAmount >= 100 && !loading
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
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
