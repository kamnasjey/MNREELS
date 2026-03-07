"use client";

import { useState, useEffect } from "react";
import { Loader2, Play, Sparkles, TrendingUp } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const supabase = createClient();

  const slides = [
    {
      icon: <Play size={28} className="text-red-400" />,
      title: "Богино контент үз",
      desc: "Бүтээгчдийн шилдэг контентийг нэг дороос",
    },
    {
      icon: <Sparkles size={28} className="text-purple-400" />,
      title: "Бүтээгч бол",
      desc: "Өөрийн контентоо оруулж орлого ол",
    },
    {
      icon: <TrendingUp size={28} className="text-emerald-400" />,
      title: "Орлого олох",
      desc: "Тасалбарын 80% бүтээгчид очно",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
      <div className="h-dvh w-full flex flex-col px-6 overflow-hidden">
        {/* Top spacer */}
        <div className="flex-1 min-h-0" />

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 mb-4">
            <Play size={32} className="text-white fill-white ml-1" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">MNREELS</h1>
          <p className="text-sm text-white/40 mt-1">Богино контент платформ</p>
        </div>

        {/* Feature carousel */}
        <div className="relative h-24 mb-8 overflow-hidden">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                i === activeSlide
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {slide.icon}
                <span className="font-bold text-base">{slide.title}</span>
              </div>
              <p className="text-sm text-white/50">{slide.desc}</p>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-lg font-bold">80%</p>
            <p className="text-[10px] text-white/30">Бүтээгчид</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="text-lg font-bold">HD</p>
            <p className="text-[10px] text-white/30">Чанартай</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="text-lg font-bold">24/7</p>
            <p className="text-[10px] text-white/30">Хүртээмжтэй</p>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
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

        {/* Bottom spacer */}
        <div className="flex-1 min-h-0" />
        <div className="pb-8" />
      </div>
    </MobileShell>
  );
}
