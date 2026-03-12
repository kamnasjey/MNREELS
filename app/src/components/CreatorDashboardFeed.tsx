"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Upload, TrendingUp, Eye, Ticket, Clock, ChevronRight, Users, BarChart3, DollarSign } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";

interface CreatorSeriesItem {
  id: string;
  title: string;
  episodes: number;
  views: string;
  viewsNum: number;
  gradient: string;
  earnings: number;
  hasPending?: boolean;
  coverUrl?: string;
}

interface CreatorStats {
  totalEarnings: number;
  totalViews: string;
  weeklyGrowth: string;
  followers: string;
  totalEpisodes: number;
  avgViewsPerEpisode: string;
  topSeriesTitle: string;
  topSeriesViews: string;
  revenuePerView: string;
}

interface CreatorDashboardFeedProps {
  series: CreatorSeriesItem[];
  stats: CreatorStats;
  isCreator: boolean;
}

export default function CreatorDashboardFeed({ series, stats, isCreator }: CreatorDashboardFeedProps) {
  if (!isCreator) {
    return (
      <CreatorShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-8">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-sm text-white/50 text-center mb-4">
            Бүтээгч болж бүртгүүлнэ үү
          </p>
          <Link
            href="/creator/register"
            className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl"
          >
            Бүртгүүлэх
          </Link>
        </div>
      </CreatorShell>
    );
  }

  const [activeTab, setActiveTab] = useState<"content" | "analytics">("content");

  // Sort series by views for ranking
  const sortedByViews = [...series].sort((a, b) => b.viewsNum - a.viewsNum);
  const sortedByEarnings = [...series].sort((a, b) => b.earnings - a.earnings);

  return (
    <CreatorShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Link href="/profile" className="flex items-center gap-2 text-white/60">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-base">Бүтээгчийн самбар</h1>
            <div className="w-5" />
          </div>

          {/* Earnings card */}
          <div className="mx-4 mt-3 p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20 border border-purple-500/20">
            <p className="text-sm text-white/50 mb-1">Миний орлого</p>
            <div className="flex items-baseline gap-2">
              <Ticket size={20} className="text-purple-400" />
              <span className="text-3xl font-black text-purple-400">
                {stats.totalEarnings.toLocaleString()}
              </span>
              <span className="text-sm text-white/40">тасалбар</span>
            </div>
            <p className="text-sm text-white/30 mt-1">
              {(stats.totalEarnings * 50).toLocaleString()}₮
            </p>
            <Link
              href="/creator/withdraw"
              className="mt-3 block text-center bg-purple-500/30 hover:bg-purple-500/40 text-purple-300 font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              Мөнгө татах →
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 px-4 mt-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Eye size={14} className="text-blue-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.totalViews}</p>
              <p className="text-[9px] text-white/40">Нийт үзэлт</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <TrendingUp size={14} className="text-green-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.weeklyGrowth}</p>
              <p className="text-[9px] text-white/40">7 хоногт</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Users size={14} className="text-yellow-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.followers}</p>
              <p className="text-[9px] text-white/40">Дагагч</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <BarChart3 size={14} className="text-cyan-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.totalEpisodes}</p>
              <p className="text-[9px] text-white/40">Нийт анги</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Eye size={14} className="text-pink-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.avgViewsPerEpisode}</p>
              <p className="text-[9px] text-white/40">Дундаж/анги</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <DollarSign size={14} className="text-emerald-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.revenuePerView}</p>
              <p className="text-[9px] text-white/40">Орлого/үзэлт</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 px-4 mt-4">
            <Link
              href="/creator/series/new"
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl py-3 transition-colors"
            >
              <Plus size={18} className="text-green-400" />
              <span className="text-sm font-medium">Шинэ цуврал</span>
            </Link>
            <Link
              href="/creator/upload"
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl py-3 transition-colors"
            >
              <Upload size={18} className="text-blue-400" />
              <span className="text-sm font-medium">Видео upload</span>
            </Link>
          </div>

          {/* Tabs: Content / Analytics */}
          <div className="flex border-b border-white/10 mt-5">
            <button onClick={() => setActiveTab("content")} className={`flex-1 py-3 text-sm font-medium relative ${activeTab === "content" ? "text-white" : "text-white/30"}`}>
              Контент
              {activeTab === "content" && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />}
            </button>
            <button onClick={() => setActiveTab("analytics")} className={`flex-1 py-3 text-sm font-medium relative ${activeTab === "analytics" ? "text-white" : "text-white/30"}`}>
              Аналитик
              {activeTab === "analytics" && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />}
            </button>
          </div>

          {/* Content tab */}
          {activeTab === "content" && (
            <div className="px-4 mt-4">
              {series.length > 0 ? (
                <div className="space-y-3">
                  {series.map((s) => (
                    <Link key={s.id} href={`/creator/series/${s.id}`} className="flex gap-3 p-3 rounded-xl bg-white/5">
                      <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${s.gradient} relative overflow-hidden flex items-end p-1.5 flex-shrink-0`}>
                        {s.coverUrl && <img src={s.coverUrl} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />}
                        <p className="text-[8px] font-bold leading-tight relative z-10">{s.title}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{s.title}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{s.episodes} анги • {s.views} үзэлт</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Ticket size={12} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">{s.earnings.toLocaleString()} тасалбар</span>
                        </div>
                        {s.hasPending && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={12} className="text-orange-400" />
                            <span className="text-[10px] text-orange-400">Модераци хүлээж байна</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-white/20 self-center" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-xl">
                  <p className="text-3xl mb-2">🎬</p>
                  <p className="text-sm text-white/30">Цуврал нэмээгүй</p>
                  <Link href="/creator/series/new" className="inline-block mt-3 text-xs font-semibold bg-white/10 px-4 py-2 rounded-lg">Эхний цуврал нэмэх</Link>
                </div>
              )}
            </div>
          )}

          {/* Analytics tab */}
          {activeTab === "analytics" && (
            <div className="px-4 mt-4 pb-4">
              {/* Top performing by views */}
              {sortedByViews.length > 0 && (
                <div className="mb-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5"><Eye size={14} className="text-blue-400" /> Үзэлтээр</h3>
                  <div className="space-y-2">
                    {sortedByViews.slice(0, 5).map((s, i) => {
                      const maxViews = sortedByViews[0]?.viewsNum || 1;
                      const pct = Math.max(5, (s.viewsNum / maxViews) * 100);
                      return (
                        <Link key={s.id} href={`/creator/series/${s.id}`} className="block">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/30 w-4 text-right font-mono">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium truncate">{s.title}</p>
                                <p className="text-xs text-white/50 ml-2 shrink-0">{s.views}</p>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top performing by earnings */}
              {sortedByEarnings.length > 0 && sortedByEarnings[0].earnings > 0 && (
                <div className="mb-5">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5"><Ticket size={14} className="text-yellow-400" /> Орлогоор</h3>
                  <div className="space-y-2">
                    {sortedByEarnings.filter(s => s.earnings > 0).slice(0, 5).map((s, i) => {
                      const maxEarn = sortedByEarnings[0]?.earnings || 1;
                      const pct = Math.max(5, (s.earnings / maxEarn) * 100);
                      return (
                        <Link key={s.id} href={`/creator/series/${s.id}`} className="block">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/30 w-4 text-right font-mono">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium truncate">{s.title}</p>
                                <p className="text-xs text-yellow-400 ml-2 shrink-0">{s.earnings.toLocaleString()}₮</p>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500/60 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary info */}
              {stats.topSeriesTitle && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/15">
                  <p className="text-[10px] text-white/40 mb-1">Хамгийн алдартай цуврал</p>
                  <p className="font-bold text-sm">{stats.topSeriesTitle}</p>
                  <p className="text-xs text-white/50 mt-0.5">{stats.topSeriesViews} үзэлт</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CreatorShell>
  );
}
