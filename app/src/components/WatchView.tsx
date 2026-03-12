"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import { saveWatchProgress } from "@/lib/actions/series";
import { unlockEpisode } from "@/lib/actions/tasalbar";

interface EpisodeData {
  id: string;
  title: string;
  number: number;
  duration: string;
  videoUrl: string;
  isFree: boolean;
  isUnlocked: boolean;
  tasalbarCost: number;
}

interface WatchViewProps {
  episodes: EpisodeData[];
  seriesId: string;
  seriesTitle: string;
  creator: string;
  isLoggedIn: boolean;
}

export default function WatchView({
  episodes: initialEpisodes,
  seriesId,
  seriesTitle,
  creator,
  isLoggedIn,
}: WatchViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [episodes, setEpisodes] = useState(initialEpisodes);

  // Detect which episode is in view using IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [episodes.length]);

  // Auto-scroll to next episode when current ends
  const scrollToNext = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const nextItem = container.querySelector(`[data-index="${activeIndex + 1}"]`);
    if (nextItem) {
      nextItem.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeIndex]);

  // Unlock handler — updates local state on success
  const handleUnlock = useCallback(async (episodeId: string, index: number) => {
    setEpisodes(prev => prev.map((ep, i) =>
      i === index ? { ...ep, isUnlocked: true } : ep
    ));
  }, []);

  return (
    <div className="h-dvh bg-black text-white relative overflow-hidden">
      {/* Top overlay — back button (always visible) */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/60 to-transparent pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3 flex items-center">
          <Link
            href={`/series/${seriesId}`}
            className="flex items-center gap-1.5 text-white/80 active:text-white"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium truncate max-w-[200px]">{seriesTitle}</span>
          </Link>
        </div>
      </div>

      {/* Vertical snap-scroll container */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {episodes.map((episode, index) => (
          <EpisodeSlide
            key={episode.id}
            episode={episode}
            index={index}
            isActive={index === activeIndex}
            creator={creator}
            isLoggedIn={isLoggedIn}
            onEnded={scrollToNext}
            onUnlock={handleUnlock}
            isLast={index === episodes.length - 1}
          />
        ))}
      </div>

      {/* Scroll indicator dots (right side) */}
      {episodes.length > 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5">
          {episodes.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "h-4 bg-white" : "h-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Individual episode slide ─── */

function EpisodeSlide({
  episode,
  index,
  isActive,
  creator,
  isLoggedIn,
  onEnded,
  onUnlock,
  isLast,
}: {
  episode: EpisodeData;
  index: number;
  isActive: boolean;
  creator: string;
  isLoggedIn: boolean;
  onEnded: () => void;
  onUnlock: (episodeId: string, index: number) => void;
  isLast: boolean;
}) {
  const lastSavedProgress = useRef(0);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");

  const handleProgress = useCallback(
    (seconds: number) => {
      if (!isLoggedIn) return;
      if (seconds - lastSavedProgress.current >= 10) {
        lastSavedProgress.current = seconds;
        saveWatchProgress(episode.id, seconds, false).catch(() => {});
      }
    },
    [episode.id, isLoggedIn]
  );

  const handleEnded = useCallback(() => {
    if (isLoggedIn) {
      saveWatchProgress(episode.id, 0, true).catch(() => {});
    }
    // Auto-scroll to next
    if (!isLast) onEnded();
  }, [episode.id, isLoggedIn, isLast, onEnded]);

  const handleUnlockClick = useCallback(async () => {
    if (!isLoggedIn) {
      window.location.href = "/auth/login";
      return;
    }
    setUnlocking(true);
    setError("");
    try {
      const result = await unlockEpisode(episode.id);
      if (result.success) {
        onUnlock(episode.id, index);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setUnlocking(false);
    }
  }, [episode.id, index, isLoggedIn, onUnlock]);

  const isLocked = !episode.isUnlocked;

  return (
    <div
      data-index={index}
      className="h-dvh w-full snap-start snap-always relative shrink-0"
    >
      {/* Video — only render player for active and adjacent slides */}
      <div className="absolute inset-0">
        {isActive ? (
          <VideoPlayer
            src={episode.videoUrl}
            isLocked={isLocked}
            tasalbarCost={episode.tasalbarCost}
            onProgress={handleProgress}
            onEnded={handleEnded}
            onUnlock={handleUnlockClick}
            autoPlay
            fullScreen
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white/20 text-sm">Анги {episode.number}</div>
          </div>
        )}
      </div>

      {/* Unlock loading overlay */}
      {unlocking && (
        <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-yellow-400 animate-spin" />
            <p className="text-sm text-white/60">Нээж байна...</p>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-40">
          <div className="bg-red-500/90 text-white text-sm px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        </div>
      )}

      {/* Bottom overlay — episode info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 pb-5 pt-16">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
            Анги {episode.number}
          </p>
          <h2 className="text-base font-bold drop-shadow-lg">
            {episode.title}
          </h2>
          <p className="text-xs text-white/50 mt-1 drop-shadow-lg">
            {creator} • {episode.duration}
          </p>

          {/* Swipe hint on first slide */}
          {index === 0 && !isLast && (
            <div className="mt-3 flex items-center justify-center gap-1 text-white/30 animate-bounce">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              <span className="text-[10px]">Доош шударч дараагийн анги</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
