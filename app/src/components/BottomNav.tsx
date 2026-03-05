"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Ticket, User } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Нүүр" },
  { href: "/search", icon: Search, label: "Хайх" },
  { href: "/tasalbar", icon: Ticket, label: "Тасалбар" },
  { href: "/profile", icon: User, label: "Профайл" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                isActive ? "text-white" : "text-white/40"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
