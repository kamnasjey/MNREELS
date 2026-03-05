"use client";

import BottomNav from "./BottomNav";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto h-dvh relative overflow-hidden bg-black">
      {children}
      <BottomNav />
    </div>
  );
}
