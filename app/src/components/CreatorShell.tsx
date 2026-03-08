"use client";

export default function CreatorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg md:max-w-3xl mx-auto min-h-dvh relative bg-black">
      {children}
    </div>
  );
}
