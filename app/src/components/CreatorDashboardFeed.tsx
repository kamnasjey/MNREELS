"use client";

import { ArrowLeft, Plus, Upload, TrendingUp, Eye, Ticket, Clock, ChevronRight } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";

interface CreatorSeriesItem {
  id: string;
  title: string;
  episodes: number;
  views: string;
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

          {/* Stats row */}
          <div className="flex gap-3 px-4 mt-4">
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <Eye size={16} className="text-blue-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.totalViews}</p>
              <p className="text-[10px] text-white/40">Нийт үзэлт</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <TrendingUp size={16} className="text-green-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.weeklyGrowth}</p>
              <p className="text-[10px] text-white/40">Энэ 7 хоногт</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <Ticket size={16} className="text-yellow-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{stats.followers}</p>
              <p className="text-[10px] text-white/40">Дагагч</p>
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

          {/* My content */}
          <div className="px-4 mt-6">
            <h2 className="font-bold text-base mb-3">Миний контент</h2>
            {series.length > 0 ? (
              <div className="space-y-3">
                {series.map((s) => (
                  <Link
                    key={s.id}
                    href={`/creator/series/${s.id}`}
                    className="flex gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${s.gradient} relative overflow-hidden flex items-end p-1.5 flex-shrink-0`}>
                      {s.coverUrl && (
                        <img src={s.coverUrl} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <p className="text-[8px] font-bold leading-tight relative z-10">{s.title}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {s.episodes} анги • {s.views} үзэлт
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Ticket size={12} className="text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-medium">
                          {s.earnings.toLocaleString()} тасалбар
                        </span>
                      </div>
                      {s.hasPending && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock size={12} className="text-orange-400" />
                          <span className="text-[10px] text-orange-400">
                            Модераци хүлээж байна
                          </span>
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
                <Link
                  href="/creator/series/new"
                  className="inline-block mt-3 text-xs font-semibold bg-white/10 px-4 py-2 rounded-lg"
                >
                  Эхний цуврал нэмэх
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
