"use client";

import { Smartphone, Film, Users, CreditCard, ArrowRight, Star, Play } from "lucide-react";
import { mockSeries } from "@/lib/mock-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">MNREELS</h1>
          <div className="flex items-center gap-6">
            <a href="#about" className="text-sm text-white/60 hover:text-white transition-colors">Тухай</a>
            <a href="#creator" className="text-sm text-white/60 hover:text-white transition-colors">Бүтээгч</a>
            <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex items-center gap-16">
        <div className="flex-1">
          <div className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
            🇲🇳 Монголын анхны
          </div>
          <h2 className="text-5xl font-black leading-tight mb-4">
            Богино хэмжээний<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
              кино платформ
            </span>
          </h2>
          <p className="text-lg text-white/50 mb-8 max-w-md">
            Шилдэг бүтээгчдийн богино кино, цуврал бүтээлийг swipe хийж үзээрэй.
            Утсаараа хаанаас ч, хэзээ ч.
          </p>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mb-3">
                <div className="text-black text-center">
                  <div className="w-24 h-24 bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:8px_8px] rounded" />
                </div>
              </div>
              <p className="text-xs text-white/40">QR scan хийж нээнэ</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Smartphone size={20} className="text-white/60" />
                <span className="text-sm text-white/60">Утсаараа нээгээрэй</span>
              </div>
              <p className="text-2xl font-bold text-white/80">mnreels.mn</p>
            </div>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="flex-shrink-0">
          <div className="w-[280px] h-[560px] bg-gradient-to-b from-purple-900 via-indigo-900 to-black rounded-[3rem] border-4 border-white/10 p-3 relative overflow-hidden shadow-2xl shadow-purple-500/20">
            <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative bg-black">
              {/* Status bar */}
              <div className="flex justify-between px-6 pt-3 text-[10px] text-white/60 relative z-10">
                <span>9:41</span>
                <div className="w-20 h-5 bg-black rounded-full" />
                <span>100%</span>
              </div>
              {/* Mock content */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 via-indigo-900/60 to-black flex flex-col justify-end p-5">
                <div className="flex items-center justify-between mb-16">
                  <span className="text-sm font-bold">MNREELS</span>
                  <div className="flex gap-3 text-[10px] text-white/50">
                    <span className="text-white border-b border-white pb-0.5">Танд</span>
                    <span>Дагсан</span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="font-bold text-sm">@ББатболд</p>
                  <p className="text-xs text-white/70">Хар шөнө • Анги 1</p>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-white/15 rounded-full px-2 py-0.5">Уран сайхан</span>
                    <span className="text-[9px] bg-green-500/30 text-green-300 rounded-full px-2 py-0.5">ҮНЭГҮЙ</span>
                  </div>
                </div>
                {/* Mock bottom nav */}
                <div className="flex justify-around py-2 border-t border-white/10 text-[8px] text-white/40">
                  <span className="text-white">Нүүр</span>
                  <span>Хайх</span>
                  <span>🎬</span>
                  <span>Профайл</span>
                </div>
              </div>
              {/* Side buttons mock */}
              <div className="absolute right-3 bottom-32 flex flex-col gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-[10px]">❤️</span></div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-[10px]">💬</span></div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-[10px]">↗️</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-12 flex justify-center gap-20">
          <div className="text-center">
            <Film size={28} className="text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-black">500+</p>
            <p className="text-sm text-white/40">Кино</p>
          </div>
          <div className="text-center">
            <Users size={28} className="text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-black">100+</p>
            <p className="text-sm text-white/40">Бүтээгч</p>
          </div>
          <div className="text-center">
            <Play size={28} className="text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-black">50K+</p>
            <p className="text-sm text-white/40">Үзэлт</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-black text-center mb-12">Яаж ажилладаг вэ?</h3>
        <div className="grid grid-cols-3 gap-8">
          {[
            { step: "1", icon: Smartphone, title: "Утсаараа нэвтрэх", desc: "Утасны дугаараар бүртгүүлж, OTP кодоор нэвтэрнэ" },
            { step: "2", icon: CreditCard, title: "Тасалбар авах", desc: "50₮-аас эхлэн тасалбар худалдаж авна. QPay, SocialPay" },
            { step: "3", icon: Play, title: "Кино үзэх", desc: "Swipe хийж дуртай киногоо олж, тасалбараар нээж үзнэ" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <item.icon size={24} className="text-yellow-400" />
              </div>
              <div className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mb-3 mx-auto">
                {item.step}
              </div>
              <h4 className="font-bold mb-2">{item.title}</h4>
              <p className="text-sm text-white/40">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Creators */}
      <section id="creator" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h3 className="text-3xl font-black text-center mb-4">Бүтээгч болох</h3>
          <p className="text-center text-white/40 mb-12 max-w-md mx-auto">
            Та богино кино бүтээдэг үү? MNREELS дээр бүтээлээ оруулж орлого олоорой!
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: "85%", label: "Орлого шууд танд" },
              { value: "∞", label: "Хязгааргүй upload" },
              { value: "24/7", label: "Бодит цагийн статистик" },
            ].map((item) => (
              <div key={item.label} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-black text-yellow-400 mb-1">{item.value}</p>
                <p className="text-xs text-white/40">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold px-8 py-3 rounded-full text-sm hover:brightness-110 transition-all inline-flex items-center gap-2">
              Бүтээгч болох <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Trending preview */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold text-center mb-2">🔥 Trending кино</h3>
          <p className="text-center text-white/40 text-sm mb-8">Утсаараа үзэх боломжтой</p>
          <div className="flex justify-center gap-4">
            {mockSeries.slice(0, 5).map((series) => (
              <div key={series.id} className={`w-36 h-52 rounded-xl bg-gradient-to-br ${series.gradient} flex flex-col justify-end p-3 relative overflow-hidden group cursor-pointer`}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Smartphone size={24} className="text-white/0 group-hover:text-white/80 transition-colors" />
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/40 rounded-full px-1.5 py-0.5">
                  <Star size={10} className="text-yellow-400" fill="currentColor" />
                  <span className="text-[10px]">{series.rating}</span>
                </div>
                <p className="font-bold text-xs relative z-10">{series.title}</p>
                <p className="text-[10px] text-white/50 relative z-10">{series.episodes} анги • {series.views}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black">MNREELS</span>
            <span className="text-sm text-white/30">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Нууцлал</a>
            <a href="#" className="hover:text-white/60 transition-colors">Үйлчилгээний нөхцөл</a>
            <a href="#" className="hover:text-white/60 transition-colors">Холбоо барих</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
