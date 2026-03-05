"use client";

import { useState, useRef } from "react";
import { Bell, Play, Plus, Star, ChevronRight } from "lucide-react";
import DeviceGate from "@/components/DeviceGate";
import MobileShell from "@/components/MobileShell";
import { mockSeries, categories } from "@/lib/mock-data";
import Link from "next/link";

const featured = mockSeries[2]; // Харанхуй зам — highest rated

function HomeFeed() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerSeries = [mockSeries[2], mockSeries[0], mockSeries[4]];

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h1 className="text-xl font-black tracking-tight">MNREELS</h1>
            <button className="relative">
              <Bell size={22} className="text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Featured Banner */}
        <div className="px-4 mt-1">
          <Link href={`/series/${bannerSeries[bannerIndex].id}`}>
            <div className={`relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br ${bannerSeries[bannerIndex].gradient}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
                    {bannerSeries[bannerIndex].category}
                  </span>
                  <span className="text-[10px] text-white/60 flex items-center gap-0.5">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    {bannerSeries[bannerIndex].rating}
                  </span>
                </div>
                <h2 className="text-2xl font-black">{bannerSeries[bannerIndex].title}</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {bannerSeries[bannerIndex].creator} • {bannerSeries[bannerIndex].episodes} анги
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-1.5 bg-white text-black font-semibold text-xs px-4 py-2 rounded-lg">
                    <Play size={14} className="fill-black" />
                    Үзэх
                  </button>
                  <button className="flex items-center gap-1.5 bg-white/15 text-white font-medium text-xs px-4 py-2 rounded-lg">
                    <Plus size={14} />
                    Дагах
                  </button>
                </div>
              </div>
            </div>
          </Link>
          {/* Banner dots */}
          <div className="flex justify-center gap-1.5 mt-2.5">
            {bannerSeries.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIndex(i)}
                className={`rounded-full transition-all ${
                  i === bannerIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Үзэж байгаа — Continue Watching */}
        <Section title="Үзэж байгаа" icon="🕐">
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
            {mockSeries.slice(0, 3).map((series, i) => (
              <Link key={series.id} href={`/series/${series.id}`} className="flex-shrink-0 w-28">
                <div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${series.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-[10px] font-bold leading-tight">{series.title}</p>
                    <p className="text-[9px] text-white/50 mt-0.5">Анги {[3, 7, 1][i]}/{series.episodes}</p>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${([3, 7, 1][i] / series.episodes) * 100}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Trending */}
        <Section title="Trending" icon="🔥" showMore>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
            {mockSeries.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </Section>

        {/* Шинэ нэмэгдсэн */}
        <Section title="Шинэ нэмэгдсэн" icon="🆕" showMore>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
            {[...mockSeries].reverse().map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </Section>

        {/* Categories */}
        {categories.filter(c => c !== "Бүгд").slice(0, 3).map((cat) => {
          const catSeries = mockSeries.filter(s => s.category === cat);
          if (catSeries.length === 0) return null;
          const emoji = cat === "Уран сайхан" ? "🎭" : cat === "Хайр дурлал" ? "💕" : cat === "Аймшиг" ? "👻" : cat === "Инээдэм" ? "😂" : cat === "Адал явдал" ? "⚡" : "🎬";
          return (
            <Section key={cat} title={cat} icon={emoji} showMore>
              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {catSeries.map((series) => (
                  <SeriesCard key={series.id} series={series} />
                ))}
                {/* Fill with others if too few */}
                {catSeries.length < 3 && mockSeries.filter(s => s.category !== cat).slice(0, 3 - catSeries.length).map((series) => (
                  <SeriesCard key={`fill-${series.id}`} series={series} />
                ))}
              </div>
            </Section>
          );
        })}

        {/* Үнэгүй кино */}
        <Section title="Үнэгүй эхлэх" icon="🆓" showMore>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
            {mockSeries.filter(s => s.freeEpisodes >= 3).map((series) => (
              <SeriesCard key={series.id} series={series} badge="ҮНЭГҮЙ" />
            ))}
          </div>
        </Section>

        <div className="h-4" />
      </div>
    </MobileShell>
  );
}

function Section({ title, icon, showMore, children }: {
  title: string;
  icon: string;
  showMore?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-4 mb-2.5">
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          <span>{icon}</span> {title}
        </h3>
        {showMore && (
          <button className="text-[11px] text-white/30 flex items-center gap-0.5">
            Бүгд <ChevronRight size={12} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function SeriesCard({ series, badge }: { series: typeof mockSeries[0]; badge?: string }) {
  return (
    <Link href={`/series/${series.id}`} className="flex-shrink-0 w-28">
      <div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${series.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-[10px] font-bold leading-tight">{series.title}</p>
          <p className="text-[9px] text-white/50 mt-0.5">{series.episodes} анги</p>
        </div>
        {badge && (
          <div className="absolute top-1.5 left-1.5 bg-green-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
          <Star size={8} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[8px]">{series.rating}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <DeviceGate>
      <HomeFeed />
    </DeviceGate>
  );
}
