"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <MobileShell hideNav>
      <div className="h-dvh w-full flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-red-600/30 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[50%] rounded-full bg-purple-600/25 blur-[100px] animate-pulse [animation-delay:1s]" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[30%] rounded-full bg-pink-500/20 blur-[80px] animate-pulse [animation-delay:2s]" />
        </div>

        {/* Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-purple-600 rounded-3xl blur-xl opacity-50 scale-125" />
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 shadow-2xl shadow-purple-500/30">
            <Play size={48} className="text-white fill-white ml-1.5" />
          </div>
        </div>

        <h1 className="text-5xl font-black tracking-tight mb-1">MNREELS</h1>
        <p className="text-base text-white/50 mb-16">Богино контент платформ</p>

        {/* Google Sign In */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-semibold text-sm transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/10"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google-ээр нэвтрэх
            </>
          )}
        </button>
      </div>
    </MobileShell>
  );
}
