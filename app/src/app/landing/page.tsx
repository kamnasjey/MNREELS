"use client";

import { Smartphone, Film, Play, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

const APP_URL = "https://mnreels.online";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
              <Film size={16} className="text-black" />
            </div>
            <h1 className="text-xl font-black tracking-tight">MNREELS</h1>
          </div>
          <div className="flex items-center gap-8">
            <a href="#about" className="text-sm text-white/50 hover:text-white transition-colors">Тухай</a>
            <a href="#creator" className="text-sm text-white/50 hover:text-white transition-colors">Бүтээгч</a>
            <a href="#faq" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 flex items-center gap-20 relative z-10">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Монголын анхны богино контент платформ
            </div>

            <h2 className="text-6xl font-black leading-[1.1] mb-6 tracking-tight">
              Контент үзэх<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-red-500">
                шинэ арга
              </span>
            </h2>

            <p className="text-lg text-white/40 mb-10 leading-relaxed max-w-md">
              Бүтээгчдийн шилдэг богино контент, цуврал бүтээлийг
              утсаараа swipe хийж үзээрэй.
            </p>

            {/* QR Code Card */}
            <div className="flex items-center gap-6">
              <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(APP_URL)}`}
                  alt="QR Code"
                  width={140}
                  height={140}
                  className="rounded-lg"
                />
              </div>
              <div>
                <p className="text-sm text-white/40 mb-2">Утсаараа QR уншуулна уу</p>
                <p className="text-2xl font-black text-white mb-1">mnreels.online</p>
                <p className="text-xs text-white/30">iOS & Android — Бүх утсанд</p>
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex-shrink-0 relative">
            {/* Glow behind phone */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent rounded-full blur-[80px] scale-150" />

            <div className="relative w-[300px] h-[620px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3.5rem] border border-white/10 p-2.5 shadow-2xl">
              <div className="w-full h-full rounded-[2.8rem] overflow-hidden relative bg-black">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20" />

                {/* Status bar */}
                <div className="flex justify-between px-8 pt-3 text-[10px] text-white/60 relative z-10">
                  <span className="font-medium">9:41</span>
                  <span className="font-medium">100%</span>
                </div>

                {/* Screen content - movie playing */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 via-indigo-900/70 to-black" />

                  {/* Video overlay content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 pb-16">
                    {/* Top tabs */}
                    <div className="absolute top-12 left-0 right-0 flex justify-center gap-6 text-[11px]">
                      <span className="text-white font-semibold border-b-2 border-white pb-1">Танд</span>
                      <span className="text-white/40">Дагсан</span>
                    </div>

                    {/* Side actions */}
                    <div className="absolute right-4 bottom-24 flex flex-col gap-5 items-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                          <span className="text-sm">💬</span>
                        </div>
                        <span className="text-[9px] text-white/50">89</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                          <span className="text-sm">↗️</span>
                        </div>
                        <span className="text-[9px] text-white/50">Share</span>
                      </div>
                    </div>

                    {/* Content info */}
                    <div className="space-y-2 pr-14">
                      <p className="font-bold text-sm">@ББатболд</p>
                      <p className="text-xs text-white/70">Хар шөнө • Анги 1</p>
                      <div className="flex gap-2">
                        <span className="text-[9px] bg-white/15 backdrop-blur rounded-full px-2.5 py-0.5">Уран сайхан</span>
                        <span className="text-[9px] bg-green-500/30 text-green-300 rounded-full px-2.5 py-0.5">ҮНЭГҮЙ</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom nav */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 flex justify-around py-3 px-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-5 h-5 rounded bg-white/80" />
                      <span className="text-[8px] text-white font-medium">Нүүр</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-5 h-5 rounded bg-white/20" />
                      <span className="text-[8px] text-white/40">Хайх</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-5 h-5 rounded bg-white/20" />
                      <span className="text-[8px] text-white/40">Дагсан</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-5 h-5 rounded bg-white/20" />
                      <span className="text-[8px] text-white/40">Профайл</span>
                    </div>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-sm text-yellow-400 font-medium mb-3">Хэрхэн ажилладаг</p>
          <h3 className="text-4xl font-black">3 энгийн алхам</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: Smartphone,
              title: "Утсаараа нэвтрэх",
              desc: "Google эсвэл утасны дугаараар бүртгүүлж нэвтэрнэ",
              gradient: "from-blue-500/10 to-blue-500/5",
            },
            {
              step: "02",
              icon: Zap,
              title: "Тасалбар авах",
              desc: "Банкны шилжүүлгээр тасалбар худалдаж аваад дуртай контентоо нээнэ",
              gradient: "from-yellow-500/10 to-yellow-500/5",
            },
            {
              step: "03",
              icon: Play,
              title: "Swipe & Watch",
              desc: "TikTok шиг swipe хийж шилдэг богино контентийг үзнэ",
              gradient: "from-red-500/10 to-red-500/5",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`relative p-8 rounded-3xl bg-gradient-to-b ${item.gradient} border border-white/5 hover:border-white/10 transition-all group`}
            >
              <span className="text-5xl font-black text-white/5 absolute top-6 right-8 group-hover:text-white/10 transition-colors">
                {item.step}
              </span>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                <item.icon size={22} className="text-white/70" />
              </div>
              <h4 className="font-bold text-lg mb-2">{item.title}</h4>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Creators */}
      <section id="creator" className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-center gap-16">
            <div className="flex-1">
              <p className="text-sm text-purple-400 font-medium mb-3">Бүтээгчдэд</p>
              <h3 className="text-4xl font-black mb-4">Бүтээлээрээ<br />орлого олоорой</h3>
              <p className="text-white/40 mb-8 max-w-md leading-relaxed">
                MNREELS дээр өөрийн бүтээсэн болон орчуулсан контентоо оруулж
                шууд орлого олох боломжтой.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: TrendingUp, text: "Орлогын 80% шууд танд", color: "text-green-400" },
                  { icon: Shield, text: "Контентын эрх бүрэн таных", color: "text-blue-400" },
                  { icon: Zap, text: "Бодит цагийн аналитик", color: "text-yellow-400" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <item.icon size={16} className={item.color} />
                    </div>
                    <span className="text-sm text-white/70">{item.text}</span>
                  </div>
                ))}
              </div>
              <a
                href="/auth/login"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-8 py-3 rounded-full text-sm hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                Бүтээгч нэвтрэх <ArrowRight size={16} />
              </a>
            </div>

            {/* Creator stats cards */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-4">
              {[
                { value: "80%", label: "Орлого", bg: "from-green-500/20 to-green-500/5" },
                { value: "∞", label: "Upload", bg: "from-blue-500/20 to-blue-500/5" },
                { value: "24/7", label: "Статистик", bg: "from-yellow-500/20 to-yellow-500/5" },
                { value: "0₮", label: "Бүртгэл", bg: "from-purple-500/20 to-purple-500/5" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`w-40 h-32 rounded-2xl bg-gradient-to-b ${item.bg} border border-white/5 flex flex-col items-center justify-center`}
                >
                  <p className="text-2xl font-black mb-1">{item.value}</p>
                  <p className="text-xs text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Download section */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="relative rounded-3xl bg-gradient-to-r from-yellow-500/10 via-red-500/10 to-purple-500/10 border border-white/5 p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.05),transparent_70%)]" />
            <div className="relative z-10">
              <h3 className="text-4xl font-black mb-4">Одоо эхлээрэй</h3>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                QR код уншуулж утсаараа нээгээд шилдэг контентуудыг үзээрэй
              </p>
              <div className="flex justify-center items-center gap-8">
                <div className="bg-white p-4 rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(APP_URL)}`}
                    alt="QR Code"
                    width={160}
                    height={160}
                    className="rounded-lg"
                  />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-black mb-2">mnreels.online</p>
                  <p className="text-sm text-white/40 mb-4">Утсаараа QR уншуулна уу</p>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Smartphone size={14} />
                    <span>iOS & Android бүх утсанд ажиллана</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
              <Film size={12} className="text-black" />
            </div>
            <span className="font-black text-sm">MNREELS</span>
            <span className="text-xs text-white/20">© 2026</span>
          </div>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="/terms" className="hover:text-white/60 transition-colors">Нууцлал</a>
            <a href="/terms" className="hover:text-white/60 transition-colors">Үйлчилгээний нөхцөл</a>
            <a href="#" className="hover:text-white/60 transition-colors">Холбоо барих</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
