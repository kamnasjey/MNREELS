"use client";

import { useState } from "react";
import { ArrowLeft, Play, Plus, Star, Lock, Ticket, Check } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { mockSeries, mockVideos } from "@/lib/mock-data";
import Link from "next/link";
import { useParams } from "next/navigation";

// Generate mock episodes for any series
function generateEpisodes(series: typeof mockSeries[0]) {
  return Array.from({ length: Math.min(series.episodes, 15) }, (_, i) => ({
    id: `${series.id}-ep-${i + 1}`,
    number: i + 1,
    title: ["Эхлэл", "Нууц", "Мөрдлөг", "Учрал", "Хүлээлт", "Тэмцэл", "Нөхөрлөл", "Эргэлт", "Итгэл", "Зоригт", "Харанхуй", "Гэрэл", "Хайр", "Тулаан", "Төгсгөл"][i],
    duration: `${3 + Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    isFree: i < series.freeEpisodes,
    views: `${Math.floor(Math.random() * 50 + 5)}K`,
  }));
}

export default function SeriesDetailPage() {
  const params = useParams();
  const series = mockSeries.find((s) => s.id === params.id) || mockSeries[0];
  const episodes = generateEpisodes(series);
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        {/* Hero */}
        <div className={`relative aspect-[16/10] bg-gradient-to-br ${series.gradient}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute top-0 left-0 right-0 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center px-4 pt-3">
              <Link href="/" className="text-white/70">
                <ArrowLeft size={22} />
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
                {series.category}
              </span>
              <span className="text-[10px] text-white/60 flex items-center gap-0.5">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                {series.rating}
              </span>
              <span className="text-[10px] text-white/40">{series.views} үзэлт</span>
            </div>
            <h1 className="text-2xl font-black">{series.title}</h1>
          </div>
        </div>

        {/* Creator + Actions */}
        <div className="px-4 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-xs font-bold`}>
                {series.creatorAvatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{series.creator}</p>
                <p className="text-[10px] text-white/40">{series.episodes} анги</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-1 text-xs font-semibold px-3.5 py-2 rounded-full transition-all ${
                  isFollowing
                    ? "bg-white/10 text-white/60"
                    : "bg-white text-black"
                }`}
              >
                {isFollowing ? <Check size={12} /> : <Plus size={12} />}
                {isFollowing ? "Дагсан" : "Дагах"}
              </button>
            </div>
          </div>

          {/* Play first episode button */}
          <button className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm py-3 rounded-xl mt-4">
            <Play size={16} className="fill-black" />
            Анги 1-ээс эхлэх
          </button>

          {/* Info */}
          <div className="mt-4 bg-white/5 rounded-xl p-3.5">
            <p className="text-xs text-white/50 leading-relaxed">
              Эхний {series.freeEpisodes} анги үнэгүй. Дараагийн анги бүр 2 тасалбар.
            </p>
          </div>
        </div>

        {/* Episode list */}
        <div className="mt-5 px-4">
          <h3 className="font-bold text-sm mb-3">Ангиуд ({series.episodes})</h3>
          <div className="space-y-2">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {/* Episode number */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  ep.isFree ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"
                }`}>
                  {ep.number}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{ep.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30">{ep.duration}</span>
                    <span className="text-[10px] text-white/30">{ep.views} үзэлт</span>
                  </div>
                </div>

                {/* Free / Paid badge */}
                {ep.isFree ? (
                  <span className="text-[10px] font-semibold text-green-400 bg-green-500/15 px-2 py-1 rounded-full">
                    ҮНЭГҮЙ
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-white/30 flex items-center gap-0.5">
                    <Ticket size={10} />2
                  </span>
                )}

                {/* Play icon */}
                <Play size={14} className="text-white/20 fill-white/20 flex-shrink-0" />
              </div>
            ))}
          </div>

          {series.episodes > 15 && (
            <button className="w-full text-center text-xs text-white/30 mt-3 py-2">
              Бүх {series.episodes} анги харах →
            </button>
          )}
        </div>

        <div className="h-4" />
      </div>
    </MobileShell>
  );
}
