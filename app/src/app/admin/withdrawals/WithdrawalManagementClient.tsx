"use client";

import { useState } from "react";
import { processWithdrawal } from "@/lib/actions/admin";
import { Loader2, Banknote, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Withdrawal {
  id: string;
  tasalbar_amount: number;
  tugrug_amount: number;
  bank_name: string;
  bank_account: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  profiles: { display_name: string; phone: string | null } | null;
}

const STATUS_LABEL: Record<string, { text: string; style: string; icon: typeof Clock }> = {
  pending: { text: "Хүлээж буй", style: "bg-orange-500/20 text-orange-300", icon: Clock },
  processing: { text: "Шилжүүлж буй", style: "bg-blue-500/20 text-blue-300", icon: Loader2 },
  completed: { text: "Дууссан", style: "bg-green-500/20 text-green-300", icon: CheckCircle2 },
  rejected: { text: "Буцаагдсан", style: "bg-red-500/20 text-red-300", icon: XCircle },
};

export default function WithdrawalManagementClient({ withdrawals }: { withdrawals: Withdrawal[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const handleAction = async (id: string, action: "processing" | "completed" | "rejected") => {
    if (action === "rejected" && !confirm("Энэ хүсэлтийг буцаах уу? Тасалбар буцаагдна.")) return;
    setLoadingId(id);
    try {
      await processWithdrawal(id, action);
      setStatusMap((prev) => ({ ...prev, [id]: action }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа");
    }
    setLoadingId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("mn-MN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Татах хүсэлтүүд</h1>

      {withdrawals.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Banknote size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Хүсэлт байхгүй</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => {
            const currentStatus = statusMap[w.id] ?? w.status;
            const statusInfo = STATUS_LABEL[currentStatus] ?? STATUS_LABEL.pending;

            return (
              <div key={w.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusInfo.style}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">
                      {w.profiles?.display_name ?? "?"}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-white/50">
                        <span className="text-white/30">Дүн:</span>{" "}
                        <span className="font-bold text-purple-300">{w.tasalbar_amount.toLocaleString()} тасалбар</span>
                        {" "}= <span className="font-bold text-green-300">{w.tugrug_amount.toLocaleString()}₮</span>
                      </p>
                      <p className="text-xs text-white/40">
                        <span className="text-white/30">Банк:</span> {w.bank_name} • {w.bank_account}
                      </p>
                      {w.profiles?.phone && (
                        <p className="text-xs text-white/40">
                          <span className="text-white/30">Утас:</span> {w.profiles.phone}
                        </p>
                      )}
                      <p className="text-[11px] text-white/30">
                        Огноо: {formatDate(w.created_at)}
                        {w.processed_at && ` • Шийдсэн: ${formatDate(w.processed_at)}`}
                      </p>
                    </div>
                  </div>

                  {currentStatus === "pending" && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(w.id, "processing")}
                        disabled={loadingId === w.id}
                        className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                      >
                        {loadingId === w.id ? <Loader2 size={12} className="animate-spin" /> : "Шилжүүлж эхлэх"}
                      </button>
                      <button
                        onClick={() => handleAction(w.id, "completed")}
                        disabled={loadingId === w.id}
                        className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        Дууссан
                      </button>
                      <button
                        onClick={() => handleAction(w.id, "rejected")}
                        disabled={loadingId === w.id}
                        className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        Буцаах
                      </button>
                    </div>
                  )}

                  {currentStatus === "processing" && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(w.id, "completed")}
                        disabled={loadingId === w.id}
                        className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        {loadingId === w.id ? <Loader2 size={12} className="animate-spin" /> : "Дууссан гэж тэмдэглэх"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
