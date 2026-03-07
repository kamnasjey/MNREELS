"use client";

import { useState } from "react";
import { ArrowLeft, User, Phone, Building2, CheckCircle2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";

export default function CreatorRegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = name && phone.length >= 8 && bank && accountNumber.length >= 8 && agreed;

  if (submitted) {
    return (
      <MobileShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-5">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold mb-2">Амжилттай бүртгэгдлээ!</h1>
          <p className="text-sm text-white/40 text-center mb-8">
            Та одоо контент оруулж орлого олох боломжтой боллоо
          </p>
          <Link
            href="/creator"
            className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm text-center"
          >
            Бүтээгчийн самбар руу очих →
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Link href="/profile" className="text-white/60">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-base">Бүтээгч болох</h1>
            <div className="w-5" />
          </div>

          {/* Info banner */}
          <div className="mx-4 mt-3 p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20 border border-purple-500/20">
            <p className="text-sm font-medium text-purple-300 mb-1">Орлого олох боломж</p>
            <p className="text-xs text-white/50 leading-relaxed">
              Контент оруулж үзэгчдээс тасалбар цуглуулна.
              Орлогын 85% танд, 15% платформд.
            </p>
          </div>

          <div className="px-4 mt-5 space-y-4">
            {/* Full name */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Бүтэн нэр</p>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  placeholder="Овог нэр"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Утасны дугаар</p>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="tel"
                  placeholder="9911 2233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Bank selection */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Банк</p>
              <div className="flex flex-wrap gap-2">
                {["Хаан банк", "Голомт", "ХХБ", "Төрийн банк"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBank(b)}
                    className={`text-xs font-medium px-3.5 py-2 rounded-full transition-all ${
                      bank === b
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Account number */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Дансны дугаар</p>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  placeholder="1234 5678 9012"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Agreement */}
            <div
              onClick={() => setAgreed(!agreed)}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/5 cursor-pointer"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                agreed ? "bg-white border-white" : "border-white/20"
              }`}>
                {agreed && <CheckCircle2 size={14} className="text-black" />}
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Би MNREELS-ийн бүтээгчийн нөхцлийг зөвшөөрч байна.
                Орлогын 85/15 хуваарилалт, 2 цагийн модерацитай.
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={() => isValid && setSubmitted(true)}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                isValid
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Бүтээгч болох
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
