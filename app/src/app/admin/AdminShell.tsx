"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Film, Banknote, Users, UserCheck, Ticket } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Самбар" },
  { href: "/admin/episodes", icon: Film, label: "Модераци" },
  { href: "/admin/purchases", icon: Ticket, label: "Тасалбар" },
  { href: "/admin/withdrawals", icon: Banknote, label: "Татах хүсэлт" },
  { href: "/admin/creators", icon: UserCheck, label: "Бүтээгчид" },
  { href: "/admin/users", icon: Users, label: "Хэрэглэгчид" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-black text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="font-black text-lg">
            MN<span className="text-purple-400">REELS</span>
            <span className="text-xs text-white/30 ml-2 font-normal">Admin</span>
          </Link>
          <Link href="/" className="text-xs text-white/40 hover:text-white/60">
            Сайт руу →
          </Link>
        </div>
        {/* Tab nav — scrollable on mobile */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 flex gap-1 overflow-x-auto hide-scrollbar pb-2">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
