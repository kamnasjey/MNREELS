"use client";

import { useState } from "react";
import { approvePurchase, rejectPurchase } from "@/lib/actions/admin";
import { Loader2, Ticket, CheckCircle, XCircle, Clock } from "lucide-react";

interface Purchase {
  id: string;
  payment_id: number;
  package_id: string;
  tasalbar_amount: number;
  tugrug_amount: number;
  transfer_description: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  profiles: {
    display_name: string | null;
    username: string;
    payment_id: number;
  } | null;
}

export default function PurchasesClient({ purchases }: { purchases: Purchase[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const handleApprove = async (id: string) => {
    if (!confirm("Энэ хүсэлтийг зөвшөөрч тасалбар олгох уу?")) return;
    setLoadingId(id);
    try {
      await approvePurchase(id);
      setStatusMap((prev) => ({ ...prev, [id]: "approved" }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа");
    }
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Энэ хүсэлтийг татгалзах уу?")) return;
    setLoadingId(id);
    try {
      await rejectPurchase(id);
      setStatusMap((prev) => ({ ...prev, [id]: "rejected" }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа");
    }
    setLoadingId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("mn-MN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const pending = purchases.filter((p) => (statusMap[p.id] ?? p.status) === "pending");
  const processed = purchases.filter((p) => (statusMap[p.id] ?? p.status) !== "pending");

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 sm:mb-6">Тасалбар худалдан авалт</h1>

      {/* Pending */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white/60 mb-3">
          Хүлээгдэж буй ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-white/30">
            <Ticket size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Хүлээгдэж буй хүсэлт байхгүй</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((p) => {
              const profile = p.profiles;
              return (
                <div key={p.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-yellow-400 shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {profile?.display_name || profile?.username || "—"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-white/50">
                        <p>ID: <span className="text-white/80 font-mono">{p.payment_id}</span></p>
                        <p>Тасалбар: <span className="text-yellow-400 font-bold">{p.tasalbar_amount}</span></p>
                        <p>Дүн: <span className="text-white/80">{p.tugrug_amount.toLocaleString()}₮</span></p>
                        <p>Гүйлгээний утга: <span className="text-purple-300 font-mono">{p.transfer_description}</span></p>
                      </div>
                      <p className="text-[10px] text-white/30 mt-1">{formatDate(p.created_at)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={loadingId === p.id}
                        className="flex items-center gap-1 text-[11px] text-green-300 bg-green-500/10 px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {loadingId === p.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        Зөвшөөрөх
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        disabled={loadingId === p.id}
                        className="flex items-center gap-1 text-[11px] text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        <XCircle size={12} />
                        Татгалзах
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processed */}
      {processed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/60 mb-3">
            Шийдвэрлэсэн ({processed.length})
          </h2>
          <div className="space-y-2">
            {processed.map((p) => {
              const status = statusMap[p.id] ?? p.status;
              const profile = p.profiles;
              return (
                <div key={p.id} className="bg-white/5 rounded-xl p-3 sm:p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    {status === "approved" ? (
                      <CheckCircle size={16} className="text-green-400 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {profile?.display_name || profile?.username || "—"} • ID: {p.payment_id}
                      </p>
                      <p className="text-[11px] text-white/40">
                        {p.tasalbar_amount} тасалбар • {p.tugrug_amount.toLocaleString()}₮ •{" "}
                        {status === "approved" ? "Зөвшөөрсөн" : "Татгалзсан"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
