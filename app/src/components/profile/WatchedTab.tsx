"use client";

import Link from "next/link";
import type { SeriesItem } from "./types";

interface WatchedTabProps {
  series: SeriesItem[];
}

export default function WatchedTab({ series }: WatchedTabProps) {
  return (
    <div className="grid grid-cols-3 gap-0.5 mt-0.5">
      {series.length > 0 ? series.map((s) => (
        <Link key={s.id} href={`/series/${s.id}`}>
          <div className={`aspect-[3/4] bg-gradient-to-br ${s.gradient} relative`}>
            {s.coverUrl && <img src={s.coverUrl} alt={s.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="font-bold text-[10px] leading-tight">{s.title}</p>
              <p className="text-[9px] text-white/50">{s.episodes} анги</p>
            </div>
            {s.watchedEpisodes !== undefined && (
              <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-full px-1.5 py-0.5">
                <span className="text-[8px] text-white/70">{s.watchedEpisodes}/{s.episodes}</span>
              </div>
            )}
          </div>
        </Link>
      )) : (
        <div className="col-span-3 text-center py-12">
          <p className="text-3xl mb-2">🎬</p>
          <p className="text-sm text-white/30">Одоогоор юу ч үзээгүй</p>
        </div>
      )}
    </div>
  );
}
