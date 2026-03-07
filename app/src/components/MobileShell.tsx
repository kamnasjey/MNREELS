"use client";

import BottomNav from "./BottomNav";

export default function MobileShell({ children, hideNav }: { children: React.ReactNode; hideNav?: boolean }) {
  return (
    <div className="max-w-lg mx-auto h-dvh relative overflow-hidden bg-black">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
