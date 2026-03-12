"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Eye, Ticket, Users, Upload, Clock, Check, X, Film, Package, Loader2 } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";
import { updateSeriesBundlePrice } from "@/lib/actions/series";

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  status: string;
  views: number;
  is_free: boolean;
  tasalbar_cost: number;
  video_url: string | null;
  created_at: string;
  published_at: string | null;
  earnings: number;
}

interface Series {
  id: string;
  title: string;
  description: string;
  category: string;
  age_rating: string;
  cover_url: string | null;
  total_views: number;
  created_at: string;
  bundle_price: number | null;
}

const STATUS_BADGE: Record<string, { text: string; style: string }> = {
  published: { text: "Нийтлэгдсэн", style: "bg-green-500/20 text-green-300" },
  moderation: { text: "Модераци", style: "bg-orange-500/20 text-orange-300" },
  processing: { text: "Боловсруулж буй", style: "bg-yellow-500/20 text-yellow-300" },
  rejected: { text: "Татгалзсан", style: "bg-red-500/20 text-red-300" },
};

export default function CreatorSeriesDetailClient({
  series,
  episodes,
  totalEarnings,
  totalViews,
  followCount,
}: {
  series: Series;
  episodes: Episode[];
  totalEarnings: number;
  totalViews: number;
  followCount: number;
}) {
  const paidEpisodes = episodes.filter(e => !e.is_free);
  const totalIndividual = paidEpisodes.reduce((sum, ep) => sum + ep.tasalbar_cost, 0);

  const [bundleInput, setBundleInput] = useState(series.bundle_price ? String(series.bundle_price) : "");
  const [bundleEnabled, setBundleEnabled] = useState(!!series.bundle_price);
  const [bundleSaving, setBundleSaving] = useState(false);
  const [bundleSaved, setBundleSaved] = useState(false);

  const handleSaveBundle = useCallback(async () => {
    setBundleSaving(true);
    setBundleSaved(false);
    try {
      const price = bundleEnabled ? (parseInt(bundleInput) || null) : null;
      await updateSeriesBundlePrice(series.id, price);
      setBundleSaved(true);
      setTimeout(() => setBundleSaved(false), 2000);
    } catch {
      alert("Алдаа гарлаа");
    } finally {
      setBundleSaving(false);
    }
  }, [series.id, bundleInput, bundleEnabled]);

  return (
    <CreatorShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Link href="/creator" className="text-white/60">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-base truncate max-w-[200px]">{series.title}</h1>
            <Link href="/creator/upload" className="text-blue-400">
              <Upload size={20} />
            </Link>
          </div>

          {/* Cover */}
          {series.cover_url && (
            <div className="mx-4 mt-2 rounded-xl overflow-hidden aspect-video relative">
              <img src={series.cover_url} alt={series.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{series.category}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full ml-1">{series.age_rating}</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 px-4 mt-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Eye size={14} className="text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-bold">{totalViews.toLocaleString()}</p>
              <p className="text-[10px] text-white/40">Үзэлт</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Ticket size={14} className="text-purple-400 mx-auto mb-1" />
              <p className="text-sm font-bold">{totalEarnings.toLocaleString()}</p>
              <p className="text-[10px] text-white/40">Орлого</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Users size={14} className="text-green-400 mx-auto mb-1" />
              <p className="text-sm font-bold">{followCount}</p>
              <p className="text-[10px] text-white/40">Дагагч</p>
            </div>
          </div>

          {/* Description */}
          {series.description && (
            <p className="text-xs text-white/40 px-4 mt-3 leading-relaxed">{series.description}</p>
          )}

          {/* Bundle Price Config */}
          {paidEpisodes.length > 0 && (
            <div className="mx-4 mt-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-yellow-400" />
                  <p className="text-sm font-semibold">Бүхлээр авах (багц)</p>
                </div>
                <button
                  onClick={() => setBundleEnabled(!bundleEnabled)}
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    bundleEnabled ? "bg-yellow-500" : "bg-white/15"
                  }`}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: bundleEnabled ? '18px' : '2px' }} />
                </button>
              </div>

              {bundleEnabled && (
                <div>
                  <p className="text-[10px] text-white/40 mb-2">
                    Ангиар авбал нийт {totalIndividual} тасалбар. Хямдрал тогтоо:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bundleInput}
                      onChange={(e) => setBundleInput(e.target.value)}
                      placeholder={String(Math.round(totalIndividual * 0.7))}
                      min={1}
                      max={totalIndividual}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-yellow-500/50"
                    />
                    <button
                      onClick={handleSaveBundle}
                      disabled={bundleSaving}
                      className="bg-yellow-500 text-black text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1"
                    >
                      {bundleSaving ? <Loader2 size={12} className="animate-spin" /> : bundleSaved ? <Check size={12} /> : null}
                      {bundleSaved ? "Хадгалсан" : "Хадгалах"}
                    </button>
                  </div>
                  {parseInt(bundleInput) > 0 && (
                    <p className="text-[10px] text-white/30 mt-1.5">
                      Хэмнэлт: <span className="text-green-400">{totalIndividual - parseInt(bundleInput)} тасалбар ({Math.round((1 - parseInt(bundleInput) / totalIndividual) * 100)}%)</span>
                      {" "}• Үзэгч 96 цаг нээлттэй
                    </p>
                  )}
                </div>
              )}

              {!bundleEnabled && series.bundle_price && (
                <button
                  onClick={handleSaveBundle}
                  disabled={bundleSaving}
                  className="text-xs text-red-400 mt-1"
                >
                  {bundleSaving ? "Хадгалж байна..." : "Багц хүчингүй болгох"}
                </button>
              )}
            </div>
          )}

          {/* Episodes */}
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">Ангиуд ({episodes.length})</h2>
              <Link
                href="/creator/upload"
                className="text-xs text-blue-400 flex items-center gap-1"
              >
                <Upload size={12} /> Анги нэмэх
              </Link>
            </div>

            {episodes.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <Film size={32} className="mx-auto mb-2 text-white/20" />
                <p className="text-sm text-white/30">Анги байхгүй</p>
                <Link
                  href="/creator/upload"
                  className="inline-block mt-3 text-xs font-semibold bg-white/10 px-4 py-2 rounded-lg"
                >
                  Эхний анги upload хийх
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {episodes.map((ep) => {
                  const badge = STATUS_BADGE[ep.status] ?? STATUS_BADGE.processing;
                  return (
                    <div key={ep.id} className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white/50">#{ep.episode_number}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${badge.style}`}>
                              {badge.text}
                            </span>
                            {ep.is_free && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                Үнэгүй
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate">{ep.title}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
                            <span className="flex items-center gap-1">
                              <Eye size={10} /> {ep.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Ticket size={10} className="text-purple-400" /> {ep.earnings}
                            </span>
                            {!ep.is_free && (
                              <span>{ep.tasalbar_cost} тасалбар</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {ep.status === "published" ? (
                            <Check size={16} className="text-green-400" />
                          ) : ep.status === "rejected" ? (
                            <X size={16} className="text-red-400" />
                          ) : (
                            <Clock size={16} className="text-orange-400 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
