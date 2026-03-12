"use client";

import { useState } from "react";
import { setAdmin } from "@/lib/actions/admin";
import { Loader2, Users, Shield, ShieldOff } from "lucide-react";

interface User {
  id: string;
  username: string;
  display_name: string | null;
  is_creator: boolean;
  creator_verified: boolean;
  is_admin: boolean;
  tasalbar_balance: number;
  created_at: string;
  phone: string | null;
  bank_name: string | null;
}

export default function UsersManagementClient({ users }: { users: User[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [adminMap, setAdminMap] = useState<Record<string, boolean>>({});

  const handleToggleAdmin = async (id: string, isAdmin: boolean) => {
    if (isAdmin && !confirm("Энэ хэрэглэгчийг админ болгох уу?")) return;
    setLoadingId(id);
    try {
      await setAdmin(id, isAdmin);
      setAdminMap((prev) => ({ ...prev, [id]: isAdmin }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа");
    }
    setLoadingId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("mn-MN", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 sm:mb-6">Хэрэглэгчид ({users.length})</h1>

      {users.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Users size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Хэрэглэгч байхгүй</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const isAdmin = adminMap[u.id] ?? u.is_admin;
            return (
              <div key={u.id} className="bg-white/5 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-white/80 truncate">
                        {u.display_name ?? "-"}
                      </p>
                      {isAdmin && <Shield size={12} className="text-yellow-400 shrink-0" />}
                      {isAdmin ? (
                        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-[10px] shrink-0">Админ</span>
                      ) : u.is_creator ? (
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-[10px] shrink-0">Бүтээгч</span>
                      ) : (
                        <span className="bg-white/10 text-white/40 px-2 py-0.5 rounded-full text-[10px] shrink-0">Үзэгч</span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      @{u.username} • {formatDate(u.created_at)} • {u.tasalbar_balance} тасалбар
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isAdmin ? (
                      <button
                        onClick={() => handleToggleAdmin(u.id, false)}
                        disabled={loadingId === u.id}
                        className="flex items-center gap-1 text-[11px] text-red-300 hover:text-red-200 disabled:opacity-50 bg-red-500/10 px-3 py-1.5 rounded-lg"
                      >
                        {loadingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                        Хасах
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleAdmin(u.id, true)}
                        disabled={loadingId === u.id}
                        className="flex items-center gap-1 text-[11px] text-yellow-300 hover:text-yellow-200 disabled:opacity-50 bg-yellow-500/10 px-3 py-1.5 rounded-lg"
                      >
                        {loadingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                        Админ
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
