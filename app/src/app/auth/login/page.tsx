"use client";

import { useState } from "react";
import { Loader2, Play, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateActiveSession } from "@/lib/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [inputType, setInputType] = useState<"email" | "phone">("email");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const kicked = searchParams.get("kicked");

  const supabase = createClient();

  // Convert phone to email format for Supabase
  const getAuthEmail = () => {
    if (inputType === "phone") {
      const digits = emailOrPhone.replace(/\D/g, "");
      return `phone_${digits}@mnreels.local`;
    }
    return emailOrPhone.trim();
  };

  const getDisplayName = () => {
    if (inputType === "phone") {
      return emailOrPhone.replace(/\D/g, "");
    }
    return emailOrPhone.split("@")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authEmail = getAuthEmail();

      if (tab === "register") {
        if (password.length < 6) {
          setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Нууц үг таарахгүй байна");
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              display_name: getDisplayName(),
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            setError("Энэ хаяг аль хэдийн бүртгэлтэй байна");
          } else {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }

        // Update active session
        if (data.session) {
          await updateActiveSession(data.session.access_token.slice(-16));
        }

        router.push("/");
        router.refresh();
      } else {
        // Login
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: authEmail,
            password,
          });

        if (signInError) {
          if (signInError.message.includes("Invalid login")) {
            setError("Имэйл/утас эсвэл нууц үг буруу байна");
          } else {
            setError(signInError.message);
          }
          setLoading(false);
          return;
        }

        // Update active session
        if (data.session) {
          await updateActiveSession(data.session.access_token.slice(-16));
        }

        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center px-6 relative overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-red-600/30 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[50%] rounded-full bg-purple-600/25 blur-[100px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[30%] rounded-full bg-pink-500/20 blur-[80px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Logo */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-purple-600 rounded-3xl blur-xl opacity-50 scale-125" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 shadow-2xl shadow-purple-500/30">
          <Play size={40} className="text-white fill-white ml-1" />
        </div>
      </div>

      <h1 className="text-4xl font-black tracking-tight mb-1">MNREELS</h1>
      <p className="text-sm text-white/50 mb-6">Богино контент платформ</p>

      {/* Kicked notice */}
      {kicked && (
        <div className="w-full max-w-sm mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
          <p className="text-xs text-orange-400">
            Өөр төхөөрөмж дээр нэвтэрсэн тул гарлаа
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="w-full max-w-sm flex bg-white/5 rounded-xl p-1 mb-4">
        <button
          onClick={() => {
            setTab("login");
            setError("");
          }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "login"
              ? "bg-white/10 text-white"
              : "text-white/40"
          }`}
        >
          Нэвтрэх
        </button>
        <button
          onClick={() => {
            setTab("register");
            setError("");
          }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "register"
              ? "bg-white/10 text-white"
              : "text-white/40"
          }`}
        >
          Бүртгүүлэх
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        {/* Input type toggle */}
        <div className="flex bg-white/5 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => {
              setInputType("email");
              setEmailOrPhone("");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
              inputType === "email"
                ? "bg-white/10 text-white"
                : "text-white/30"
            }`}
          >
            <Mail size={12} /> Имэйл
          </button>
          <button
            type="button"
            onClick={() => {
              setInputType("phone");
              setEmailOrPhone("");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
              inputType === "phone"
                ? "bg-white/10 text-white"
                : "text-white/30"
            }`}
          >
            <Phone size={12} /> Утас
          </button>
        </div>

        {/* Email / Phone input */}
        <input
          type={inputType === "email" ? "email" : "tel"}
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          placeholder={
            inputType === "email" ? "И-мэйл хаяг" : "Утасны дугаар"
          }
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Нууц үг"
            required
            minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/20 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Confirm password (register only) */}
        {tab === "register" && (
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Нууц үг давтах"
            required
            minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
          />
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 text-center py-1">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-500 to-purple-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-purple-500/20"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin mx-auto" />
          ) : tab === "login" ? (
            "Нэвтрэх"
          ) : (
            "Бүртгүүлэх"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="w-full max-w-sm flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] text-white/30">ЭСВЭЛ</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google Sign In */}
      <button
        onClick={signInWithGoogle}
        disabled={googleLoading}
        className="w-full max-w-sm flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/10"
      >
        {googleLoading ? (
          <Loader2 size={18} className="animate-spin" />
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

      <p className="text-[10px] text-white/20 mt-6 text-center max-w-sm">
        Нэвтрэснээр та <span className="underline">үйлчилгээний нөхцөл</span>-ийг зөвшөөрсөнд тооцно
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh w-full flex items-center justify-center bg-black">
          <Loader2 className="animate-spin text-white/30" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
