"use client";

import Link from "next/link";
import { Eye, Ticket, Film, ChevronRight, LogOut, Shield } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import type { UserProfile } from "./types";

interface ProfileMenuProps {
  user: UserProfile;
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
  return (
    <>
      {/* Creator stats */}
      {user.isCreator && user.creatorStats && (
        <div className="px-4 mt-4">
          <Link href="/creator" className="block bg-gradient-to-br from-purple-500/15 to-indigo-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-xs text-white/40 mb-2">Бүтээгчийн самбар</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center"><Ticket size={14} className="text-purple-400 mx-auto mb-1" /><p className="text-sm font-bold">{user.creatorStats.totalEarnings.toLocaleString()}</p><p className="text-[9px] text-white/40">Орлого</p></div>
              <div className="text-center"><Eye size={14} className="text-blue-400 mx-auto mb-1" /><p className="text-sm font-bold">{user.creatorStats.totalViews.toLocaleString()}</p><p className="text-[9px] text-white/40">Үзэлт</p></div>
              <div className="text-center"><Film size={14} className="text-green-400 mx-auto mb-1" /><p className="text-sm font-bold">{user.creatorStats.seriesCount}</p><p className="text-[9px] text-white/40">Цуврал</p></div>
            </div>
            <p className="text-[11px] text-purple-300 text-center mt-2">Самбар руу очих →</p>
          </Link>
        </div>
      )}

      {/* Menu items */}
      <div className="px-4 mt-6 space-y-1 pb-4">
        {user.isCreator ? (
          <Link href="/creator" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div><p className="text-sm font-medium text-left">Бүтээгчийн самбар</p><p className="text-[11px] text-white/30">Контент удирдах, орлого</p></div>
            <ChevronRight size={18} className="text-white/20" />
          </Link>
        ) : (
          <Link href="/creator/register" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div><p className="text-sm font-medium text-left">Бүтээгч болох</p><p className="text-[11px] text-white/30">Кино оруулж орлого олох</p></div>
            <ChevronRight size={18} className="text-white/20" />
          </Link>
        )}
        {user.isAdmin && (
          <Link href="/admin" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-yellow-400" />
              <div><p className="text-sm font-medium text-left">Админ самбар</p><p className="text-[11px] text-white/30">Модераци, хэрэглэгчид</p></div>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </Link>
        )}
        <button
          onClick={async () => {
            const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
            await supabase.auth.signOut();
            window.location.href = "/auth/login";
          }}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors mt-2"
        >
          <LogOut size={18} className="text-red-400" />
          <span className="text-sm text-red-400">Гарах</span>
        </button>
      </div>
    </>
  );
}
