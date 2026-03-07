"use client";

import { useState } from "react";
import { Settings, Edit3, Eye, Users, LogOut, ChevronRight, Star } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";

interface SeriesItem {
  id: string;
  title: string;
  creator: string;
  episodes: number;
  category: string;
  rating: number;
  gradient: string;
  watchedEpisodes?: number;
  coverUrl?: string;
}

interface CreatorItem {
  id: string;
  name: string;
  avatar: string;
  seriesCount: number;
  gradient: string;
}

interface UserProfile {
  username: string;
  displayName: string;
  avatarInitial: string;
  bio: string;
  followingCount: number;
}

interface ProfileFeedProps {
  user: UserProfile;
  watchedSeries: SeriesItem[];
  followedCreators: CreatorItem[];
  followedSeries: SeriesItem[];
  isLoggedIn: boolean;
}

const tabs = ["Үзсэн", "Дагсан"];

export default function ProfileFeed({
  user,
  watchedSeries,
  followedCreators,
  followedSeries,
  isLoggedIn,
}: ProfileFeedProps) {
  const [activeTab, setActiveTab] = useState("Үзсэн");

  if (!isLoggedIn) {
    return (
      <MobileShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-8">
          <p className="text-4xl mb-4">👤</p>
          <p className="text-sm text-white/50 text-center mb-4">
            Профайл харахын тулд нэвтэрнэ үү
          </p>
          <Link
            href="/login"
            className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl"
          >
            Нэвтрэх
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Settings size={22} className="text-white/60" />
            <button className="flex items-center gap-1.5 text-sm text-white/60">
              <Edit3 size={14} />
              Засах
            </button>
          </div>

          {/* Profile info */}
          <div className="flex flex-col items-center px-4 mt-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
              {user.avatarInitial}
            </div>
            <h2 className="font-bold text-lg mt-3">@{user.username}</h2>
            {user.bio && (
              <p className="text-sm text-white/40 mt-1 text-center">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="mt-4 bg-white/5 rounded-xl px-6 py-3">
              <div className="text-center">
                <p className="font-bold text-lg">{user.followingCount}</p>
                <p className="text-[11px] text-white/40">Дагсан</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab ? "text-white" : "text-white/30"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {tab === "Үзсэн" && <Eye size={14} />}
                  {tab === "Дагсан" && <Users size={14} />}
                  {tab}
                </div>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Үзсэн tab — кино grid */}
          {activeTab === "Үзсэн" && (
            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
              {watchedSeries.length > 0 ? (
                watchedSeries.map((series) => (
                  <Link key={series.id} href={`/series/${series.id}`}>
                    <div className={`aspect-[3/4] bg-gradient-to-br ${series.gradient} relative`}>
                      {series.coverUrl && (
                        <img src={series.coverUrl} alt={series.title} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="font-bold text-[10px] leading-tight">{series.title}</p>
                        <p className="text-[9px] text-white/50">{series.episodes} анги</p>
                      </div>
                      {series.watchedEpisodes !== undefined && (
                        <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-full px-1.5 py-0.5">
                          <span className="text-[8px] text-white/70">
                            {series.watchedEpisodes}/{series.episodes}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-3xl mb-2">🎬</p>
                  <p className="text-sm text-white/30">Одоогоор юу ч үзээгүй</p>
                </div>
              )}
            </div>
          )}

          {/* Дагсан tab */}
          {activeTab === "Дагсан" && (
            <div className="px-4 mt-3 space-y-2">
              {followedCreators.length > 0 ? (
                <>
                  {followedCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                    >
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${creator.gradient} flex items-center justify-center text-sm font-bold`}>
                        {creator.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{creator.name}</p>
                        <p className="text-[11px] text-white/40">
                          {creator.seriesCount} цуврал
                        </p>
                      </div>
                      <button className="text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full">
                        Дагсан
                      </button>
                    </div>
                  ))}

                  {followedSeries.length > 0 && (
                    <>
                      <p className="text-xs text-white/30 mt-4 mb-2 font-medium">Цуврал</p>
                      {followedSeries.map((series) => (
                        <Link
                          key={series.id}
                          href={`/series/${series.id}`}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                        >
                          <div className={`w-11 h-14 rounded-lg bg-gradient-to-br ${series.gradient} relative overflow-hidden flex items-end p-1.5`}>
                            {series.coverUrl && (
                              <img src={series.coverUrl} alt={series.title} className="absolute inset-0 w-full h-full object-cover" />
                            )}
                            <p className="text-[8px] font-bold leading-tight relative z-10">{series.title}</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{series.title}</p>
                            <p className="text-[11px] text-white/40">
                              {series.episodes} анги • {series.creator}
                            </p>
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
          )}

          {/* Menu items */}
          <div className="px-4 mt-6 space-y-1 pb-4">
            <Link
              href="/creator/register"
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-left">Бүтээгч болох</p>
                <p className="text-[11px] text-white/30">Кино оруулж орлого олох</p>
              </div>
              <ChevronRight size={18} className="text-white/20" />
            </Link>
            {[
              { label: "Тохиргоо", desc: "Мэдэгдэл, нууцлал, хэл" },
              { label: "Тусламж", desc: "Түгээмэл асуулт & хариулт" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-left">{item.label}</p>
                  <p className="text-[11px] text-white/30">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-white/20" />
              </button>
            ))}

            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors mt-2">
              <LogOut size={18} className="text-red-400" />
              <span className="text-sm text-red-400">Гарах</span>
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
