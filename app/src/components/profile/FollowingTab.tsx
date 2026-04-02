"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CreatorItem, SeriesItem } from "./types";

interface FollowingTabProps {
  creators: CreatorItem[];
  series: SeriesItem[];
}

export default function FollowingTab({ creators, series }: FollowingTabProps) {
  return (
    <div className="px-4 mt-3 space-y-2">
      {creators.length > 0 ? (
        <>
          {creators.map((creator) => (
            <Link key={creator.id} href={`/creator-profile/${creator.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${creator.gradient} flex items-center justify-center text-sm font-bold`}>{creator.avatar}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{creator.name}</p>
                <p className="text-[11px] text-white/40">{creator.seriesCount} цуврал</p>
              </div>
              <ChevronRight size={16} className="text-white/20" />
            </Link>
          ))}
          {series.length > 0 && (
            <>
              <p className="text-xs text-white/30 mt-4 mb-2 font-medium">Цуврал</p>
              {series.map((s) => (
                <Link key={s.id} href={`/series/${s.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className={`w-11 h-14 rounded-lg bg-gradient-to-br ${s.gradient} relative overflow-hidden`}>
                    {s.coverUrl && <img src={s.coverUrl} alt={s.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-[11px] text-white/40">{s.episodes} анги • {s.creator}</p>
                  </div>
                </Link>
              ))}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm text-white/30">Хэнийг ч дагаагүй</p>
        </div>
      )}
    </div>
  );
}
