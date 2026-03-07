"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Play, Plus, Star, Ticket, Check } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";
import { followCreator, unfollowCreator } from "@/lib/actions/series";

interface EpisodeItem {
  id: string;
  number: number;
  title: string;
  duration: string;
  isFree: boolean;
  views: string;
}

interface SeriesData {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  creatorAvatar: string;
  category: string;
  rating: number;
  views: string;
  gradient: string;
  episodes: number;
  freeEpisodes: number;
  coverUrl?: string;
  description?: string;
}

interface SeriesDetailProps {
  series: SeriesData;
  episodes: EpisodeItem[];
  initialFollowing?: boolean;
}

export default function SeriesDetail({ series, episodes, initialFollowing = false }: SeriesDetailProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    const newState = !isFollowing;
    setIsFollowing(newState);
    startTransition(async () => {
      try {
        if (newState) {
          await followCreator(series.creatorId);
        } else {
          await unfollowCreator(series.creatorId);
        }
      } catch {
        setIsFollowing(!newState); // revert on error
      }
    });
  };

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        {/* Hero */}
        <div className={`relative aspect-[16/10] bg-gradient-to-br ${series.gradient}`}>
          {series.coverUrl && (
            <img src={series.coverUrl} alt={series.title} className="absolute inset-0 w-full h-full object-cover" />
          )}
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
              {series.rating > 0 && (
                <span className="text-[10px] text-white/60 flex items-center gap-0.5">
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  {series.rating}
                </span>
              )}
              <span className="text-[10px] text-white/40">{series.views} үзэлт</span>
            </div>
            <h1 className="text-2xl font-black">{series.title}</h1>
          </div>
        </div>

        {/* Creator + Actions */}
        <div className="px-4 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-xs font-bold">
                {series.creatorAvatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{series.creator}</p>
                <p className="text-[10px] text-white/40">{series.episodes} анги</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFollow}
                disabled={isPending}
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
          {episodes.length > 0 && (
            <Link
              href={`/watch/${episodes[0].id}`}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm py-3 rounded-xl mt-4"
            >
              <Play size={16} className="fill-black" />
              Анги 1-ээс эхлэх
            </Link>
          )}

          {/* Info */}
          {series.description && (
            <div className="mt-4 bg-white/5 rounded-xl p-3.5">
              <p className="text-xs text-white/50 leading-relaxed">{series.description}</p>
            </div>
          )}

          <div className="mt-3 bg-white/5 rounded-xl p-3.5">
            <p className="text-xs text-white/50 leading-relaxed">
              Эхний {series.freeEpisodes} анги үнэгүй. Дараагийн анги бүр 2 тасалбар.
            </p>
          </div>
        </div>

        {/* Episode list */}
        <div className="mt-5 px-4">
          <h3 className="font-bold text-sm mb-3">Ангиуд ({episodes.length})</h3>
          <div className="space-y-2">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/watch/${ep.id}`}
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
                    {ep.views !== "0" && (
                      <span className="text-[10px] text-white/30">{ep.views} үзэлт</span>
                    )}
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
              </Link>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </MobileShell>
  );
}
