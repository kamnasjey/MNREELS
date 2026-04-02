"use client";

import { useState, useMemo } from "react";
import { Bell, Play, Plus, Star, ChevronRight } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";

interface SeriesItem {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  episodes: number;
  category: string;
  rating: number;
  views: string;
  gradient: string;
  freeEpisodes: number;
  coverUrl?: string;
  createdAt?: string;
}

interface ContinueWatchingItem {
  episodeId: string;
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  progress: number;
  gradient: string;
  coverUrl?: string;
}

interface HomeFeedProps {
  seriesList: SeriesItem[];
  trendingList: SeriesItem[];
  newList: SeriesItem[];
  categories: string[];
  continueWatching?: ContinueWatchingItem[];
}

// Group by category
const categoryEmojis: Record<string, string> = {
  "Уран сайхан": "🎭",
  "Хайр дурлал": "💕",
  "Аймшиг": "👻",
  "Инээдэм": "😂",
  "Адал явдал": "⚡",
  "Гэмт хэрэг": "🔍",
  "Түүхэн": "📜",
};

export default function HomeFeed({ seriesList, trendingList, newList, categories, continueWatching }: HomeFeedProps) {
  const [bannerIndex, setBannerIndex] = useState(0);

  // Pick top 3 for banner (highest rated)
  const bannerSeries = useMemo(
    () => [...seriesList].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [seriesList]
  );

  if (bannerSeries.length === 0) {
    return (
      <MobileShell>
        <div className="h-dvh flex items-center justify-center">
          <p className="text-white/50 text-sm">Контент олдсонгүй</p>
        </div>
      </MobileShell>
    );
  }

  const current = bannerSeries[bannerIndex] ?? bannerSeries[0];

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h1 className="text-xl font-black tracking-tight">MNREELS</h1>
            <button className="relative">
              <Bell size={22} className="text-white" />
            </button>
          </div>
        </div>

        {/* Featured Banner */}
        <div className="px-4 mt-1">
          <Link href={`/series/${current.id}`}>
            <div className={`relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br ${current.gradient}`}>
              {current.coverUrl && (
                <img
                  src={current.coverUrl}
                  alt={current.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
                    {current.category}
                  </span>
                  {current.rating > 0 && (
                    <span className="text-[10px] text-white/60 flex items-center gap-0.5">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      {current.rating}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black">{current.title}</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {current.creator} {current.episodes > 0 ? `• ${current.episodes} анги` : ""}
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
          {bannerSeries.length > 1 && (
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
          )}
        </div>

        {/* Continue Watching */}
        {continueWatching && continueWatching.length > 0 && (
          <Section title="Үзэж байгаа" icon="▶️">
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {continueWatching.map((item) => (
                <Link
                  key={item.episodeId}
                  href={`/watch/${item.episodeId}`}
                  className="flex-shrink-0 w-36"
                >
                  <div className={`aspect-video rounded-xl bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
                    {item.coverUrl && (
                      <img src={item.coverUrl} alt={item.seriesTitle} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[10px] font-bold leading-tight">{item.seriesTitle}</p>
                      <p className="text-[8px] text-white/50 mt-0.5">Анги {item.episodeNumber}</p>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(item.progress, 100)}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Trending */}
        <Section title="Trending" icon="🔥" showMore>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
            {trendingList.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </Section>

        {/* Шинэ нэмэгдсэн */}
        <Section title="Шинэ нэмэгдсэн" icon="🆕" showMore>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
            {newList.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </Section>

        {/* Categories */}
        {categories.filter(c => c !== "Бүгд").slice(0, 3).map((cat) => {
          const catSeries = seriesList.filter(s => s.category === cat);
          if (catSeries.length === 0) return null;
          return (
            <Section key={cat} title={cat} icon={categoryEmojis[cat] ?? "🎬"} showMore>
              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {catSeries.map((series) => (
                  <SeriesCard key={series.id} series={series} />
                ))}
                {catSeries.length < 3 &&
                  seriesList
                    .filter(s => s.category !== cat)
                    .slice(0, 3 - catSeries.length)
                    .map((series) => (
                      <SeriesCard key={`fill-${series.id}`} series={series} />
                    ))}
              </div>
            </Section>
          );
        })}

        {/* Үнэгүй контент */}
        {seriesList.filter(s => s.freeEpisodes >= 3).length > 0 && (
          <Section title="Үнэгүй эхлэх" icon="🆓" showMore>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {seriesList
                .filter(s => s.freeEpisodes >= 3)
                .map((series) => (
                  <SeriesCard key={series.id} series={series} badge="ҮНЭГҮЙ" />
                ))}
            </div>
          </Section>
        )}

        <div className="h-4" />
      </div>
    </MobileShell>
  );
}

function Section({
  title,
  icon,
  showMore,
  children,
}: {
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

function SeriesCard({ series, badge }: { series: SeriesItem; badge?: string }) {
  return (
    <Link href={`/series/${series.id}`} className="flex-shrink-0 w-28">
      <div
        className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${series.gradient} relative overflow-hidden`}
      >
        {series.coverUrl && (
          <img
            src={series.coverUrl}
            alt={series.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-[10px] font-bold leading-tight">{series.title}</p>
          {series.episodes > 0 && (
            <p className="text-[9px] text-white/50 mt-0.5">{series.episodes} анги</p>
          )}
        </div>
        {badge ? (
          <div className="absolute top-1.5 left-1.5 bg-green-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </div>
        ) : series.createdAt && (Date.now() - new Date(series.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) ? (
          <div className="absolute top-1.5 left-1.5 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            ШИНЭ
          </div>
        ) : null}
        {series.rating > 0 && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
            <Star size={8} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[8px]">{series.rating}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
