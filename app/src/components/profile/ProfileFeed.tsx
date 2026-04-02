"use client";

import { useState } from "react";
import { Eye, Users, Ticket, Play, Package, Clock } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";
import ProfileHeader from "./ProfileHeader";
import WatchedTab from "./WatchedTab";
import FollowingTab from "./FollowingTab";
import TasalbarTab from "./TasalbarTab";
import ProfileMenu from "./ProfileMenu";
import type { ProfileFeedProps } from "./types";

const tabs = ["Үзсэн", "Дагсан", "Тасалбар"];

export default function ProfileFeed({
  user,
  watchedSeries,
  followedCreators,
  followedSeries,
  continueWatching,
  bundlePurchases,
  tasalbar,
  isLoggedIn,
}: ProfileFeedProps) {
  const [activeTab, setActiveTab] = useState("Үзсэн");

  if (!isLoggedIn) {
    return (
      <MobileShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-8">
          <p className="text-4xl mb-4">👤</p>
          <p className="text-sm text-white/50 text-center mb-4">Профайл харахын тулд нэвтэрнэ үү</p>
          <Link href="/auth/login" className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl">Нэвтрэх</Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          <ProfileHeader user={user} />

          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-1.5 px-4 mb-2">
                <Play size={12} className="text-red-400" />
                <p className="text-xs font-semibold text-white/60">Үргэлжлүүлэх</p>
              </div>
              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {continueWatching.map((item) => (
                  <Link key={item.episodeId} href={`/watch/${item.episodeId}`} className="flex-shrink-0 w-36">
                    <div className={`aspect-video rounded-xl bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
                      {item.coverUrl && <img src={item.coverUrl} alt={item.seriesTitle} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[10px] font-bold leading-tight">{item.seriesTitle}</p>
                        <p className="text-[8px] text-white/50 mt-0.5">Анги {item.episodeNumber}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(item.progress, 100)}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Active Bundle Purchases */}
          {bundlePurchases.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 px-4 mb-2">
                <Package size={12} className="text-yellow-400" />
                <p className="text-xs font-semibold text-white/60">Багцаар нээсэн</p>
              </div>
              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {bundlePurchases.map((bp) => (
                  <Link key={bp.seriesId} href={`/series/${bp.seriesId}`} className="flex-shrink-0 w-28">
                    <div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${bp.gradient} relative overflow-hidden`}>
                      {bp.coverUrl && <img src={bp.coverUrl} alt={bp.seriesTitle} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[10px] font-bold leading-tight">{bp.seriesTitle}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={8} className="text-yellow-400" />
                          <p className="text-[8px] text-yellow-400">{Math.max(0, Math.round((new Date(bp.expiresAt).getTime() - Date.now()) / 3600000))} цаг</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-white/10 mt-6">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab ? "text-white" : "text-white/30"}`}>
                <div className="flex items-center justify-center gap-1.5">
                  {tab === "Үзсэн" && <Eye size={14} />}
                  {tab === "Дагсан" && <Users size={14} />}
                  {tab === "Тасалбар" && <Ticket size={14} />}
                  {tab}
                </div>
                {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "Үзсэн" && <WatchedTab series={watchedSeries} />}
          {activeTab === "Дагсан" && <FollowingTab creators={followedCreators} series={followedSeries} />}
          {activeTab === "Тасалбар" && <TasalbarTab tasalbar={tasalbar} />}

          <ProfileMenu user={user} />
        </div>
      </div>
    </MobileShell>
  );
}
