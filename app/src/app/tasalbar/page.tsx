"use client";

import { useState } from "react";
import { Ticket, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import MobileShell from "@/components/MobileShell";

const packages = [
  { id: 1, name: "Турших", amount: 20, price: "1,000₮", popular: false },
  { id: 2, name: "Жижиг", amount: 65, price: "2,500₮", popular: false, bonus: 5 },
  { id: 3, name: "Дунд", amount: 135, price: "5,000₮", popular: true, bonus: 10 },
  { id: 4, name: "Том", amount: 290, price: "10,000₮", popular: false, bonus: 20 },
  { id: 5, name: "Супер", amount: 600, price: "18,000₮", popular: false, bonus: 50 },
];

const transactions = [
  { id: 1, type: "spend", amount: 2, desc: '"Хар шөнө" Анги 5', time: "2 цагийн өмнө" },
  { id: 2, type: "spend", amount: 2, desc: '"Хар шөнө" Анги 4', time: "3 цагийн өмнө" },
  { id: 3, type: "buy", amount: 135, desc: "Дунд багц худалдаж авлаа", time: "Өчигдөр" },
  { id: 4, type: "spend", amount: 2, desc: '"Цагаан мөрөөдөл" Анги 2', time: "2 өдрийн өмнө" },
  { id: 5, type: "spend", amount: 2, desc: '"Харанхуй зам" Анги 1', time: "3 өдрийн өмнө" },
];

export default function TasalbarPage() {
  const [balance] = useState(135);

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

          {/* Packages */}
          <div className="px-4 mt-6">
            <h2 className="font-bold text-base mb-3">Тасалбар худалдаж авах</h2>
            <div className="space-y-2.5">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    pkg.popular
                      ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/40 ring-1 ring-yellow-500/20"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pkg.popular ? "bg-yellow-500/30" : "bg-white/10"
                    }`}>
                      <Ticket size={18} className={pkg.popular ? "text-yellow-400" : "text-white/50"} />
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
              <button className="text-xs text-white/40 flex items-center gap-0.5">
                Бүгдийг <ChevronRight size={14} />
              </button>
            </div>
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
                    {tx.type === "buy" ? "+" : "-"}{tx.amount} 🎬
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
