"use client";

import { useState } from "react";
import { verifyCreator } from "@/lib/actions/admin";
import { Loader2, UserCheck, ShieldCheck, ShieldX } from "lucide-react";

interface Creator {
  id: string;
  username: string;
  display_name: string | null;
  phone: string | null;
  bank_name: string | null;
  bank_account: string | null;
  creator_verified: boolean;
  tasalbar_balance: number;
  created_at: string;
}

export default function CreatorsManagementClient({ creators }: { creators: Creator[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  const handleVerify = async (id: string, verified: boolean) => {
    setLoadingId(id);
    try {
      await verifyCreator(id, verified);
      setVerifiedMap((prev) => ({ ...prev, [id]: verified }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа");
    }
    setLoadingId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("mn-MN", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Бүтээгчид ({creators.length})</h1>

      {creators.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <UserCheck size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Бүтээгч байхгүй</p>
        </div>
      ) : (
        <div className="space-y-3">
          {creators.map((c) => {
            const isVerified = verifiedMap[c.id] ?? c.creator_verified;
            return (
              <div key={c.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{c.display_name ?? c.username}</p>
                      {isVerified && (
                        <ShieldCheck size={14} className="text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-white/40">@{c.username}</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <p className="text-white/30">Утас: <span className="text-white/50">{c.phone ?? "-"}</span></p>
                      <p className="text-white/30">Банк: <span className="text-white/50">{c.bank_name ?? "-"}</span></p>
                      <p className="text-white/30">Данс: <span className="text-white/50">{c.bank_account ?? "-"}</span></p>
                      <p className="text-white/30">Баланс: <span className="text-purple-300 font-medium">{c.tasalbar_balance}</span></p>
                      <p className="text-white/30">Бүртгүүлсэн: <span className="text-white/50">{formatDate(c.created_at)}</span></p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isVerified ? (
                      <button
                        onClick={() => handleVerify(c.id, false)}
                        disabled={loadingId === c.id}
                        className="flex items-center gap-1 bg-red-500/15 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50"
                      >
                        {loadingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldX size={12} />}
                        Цуцлах
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(c.id, true)}
                        disabled={loadingId === c.id}
                        className="flex items-center gap-1 bg-green-500/15 text-green-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50"
                      >
                        {loadingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                        Баталгаажуулах
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
