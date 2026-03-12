"use client";

import { useState } from "react";
import { approveEpisode, rejectEpisode } from "@/lib/actions/admin";
import { Check, X, Loader2, Film, Eye, Clock } from "lucide-react";

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  status: string;
  video_url: string | null;
  views?: number;
  created_at: string;
  published_at?: string | null;
  series: {
    id: string;
    title: string;
    profiles: { display_name: string } | null;
  } | null;
}

const STATUS_STYLES: Record<string, string> = {
  moderation: "bg-orange-500/20 text-orange-300",
  processing: "bg-yellow-500/20 text-yellow-300",
  published: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
};

export default function EpisodeModerationClient({
  pending,
  all,
}: {
  pending: Episode[];
  all: Episode[];
}) {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await approveEpisode(id);
      setRemoved((prev) => new Set(prev).add(id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа");
    }
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Энэ видеог татгалзах уу?")) return;
    setLoadingId(id);
    try {
      await rejectEpisode(id);
      setRemoved((prev) => new Set(prev).add(id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа");
    }
    setLoadingId(null);
  };

  const filteredPending = pending.filter((e) => !removed.has(e.id));
  const episodes = tab === "pending" ? filteredPending : all;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("mn-MN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Видео модераци</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === "pending" ? "bg-orange-500/20 text-orange-300" : "text-white/40 hover:bg-white/5"
            }`}
          >
            Хүлээж буй ({filteredPending.length})
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === "all" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5"
            }`}
          >
            Бүгд ({all.length})
          </button>
        </div>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Film size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {tab === "pending" ? "Хүлээж буй видео байхгүй" : "Видео байхгүй"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <div key={ep.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[ep.status] ?? "bg-white/10 text-white/40"}`}>
                      {ep.status}
                    </span>
                    <span className="text-xs text-white/30">#{ep.episode_number}</span>
                  </div>
                  <p className="font-semibold text-sm">{ep.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {ep.series?.title} • {ep.series?.profiles?.display_name ?? "?"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {formatDate(ep.created_at)}
                    </span>
                    {ep.views !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> {ep.views}
                      </span>
                    )}
                  </div>
                  {ep.video_url && (
                    <a
                      href={ep.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline mt-1 inline-block"
                    >
                      Видео үзэх →
                    </a>
                  )}
                </div>

                {(ep.status === "moderation" || ep.status === "processing") && !removed.has(ep.id) && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(ep.id)}
                      disabled={loadingId === ep.id}
                      className="flex items-center gap-1 bg-green-500/20 text-green-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      {loadingId === ep.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Зөвшөөрөх
                    </button>
                    <button
                      onClick={() => handleReject(ep.id)}
                      disabled={loadingId === ep.id}
                      className="flex items-center gap-1 bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
