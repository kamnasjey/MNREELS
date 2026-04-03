"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { ArrowLeft, Loader2, Unlock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { saveWatchProgress } from "@/lib/actions/series";
import { unlockEpisode } from "@/lib/actions/tasalbar";
import { useVideoPrefetch } from "@/lib/hooks/useVideoPrefetch";

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
  startIndex?: number;
}

export default function WatchView({
  episodes: initialEpisodes,
  seriesId,
  seriesTitle,
  creator,
  isLoggedIn,
  startIndex = 0,
}: WatchViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [episodes, setEpisodes] = useState(initialEpisodes);

  // Prefetch next 2 videos in background for instant playback
  const prefetchUrls = useMemo(() => {
    return episodes
      .slice(activeIndex + 1, activeIndex + 3)
      .map(ep => ep.videoUrl)
      .filter(Boolean);
  }, [episodes, activeIndex]);
  useVideoPrefetch(prefetchUrls);

  // Scroll to startIndex on mount
  useEffect(() => {
    if (startIndex > 0 && scrollRef.current) {
      const container = scrollRef.current;
      const targetScroll = startIndex * container.clientHeight;
      container.scrollTo({ top: targetScroll, behavior: "instant" });
    }
  }, [startIndex]);

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
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch" }}
      >
        {episodes.map((episode, index) => (
          <EpisodeSlide
            key={episode.id}
            episode={episode}
            index={index}
            isActive={index === activeIndex}
            isNext={index === activeIndex + 1}
            creator={creator}
            isLoggedIn={isLoggedIn}
            onEnded={scrollToNext}
            onUnlock={handleUnlock}
            isLast={index === episodes.length - 1}
            seriesId={seriesId}
            firstEpisodeId={episodes[0]?.id}
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
  isNext,
  creator,
  isLoggedIn,
  onEnded,
  onUnlock,
  isLast,
  seriesId,
  firstEpisodeId,
}: {
  episode: EpisodeData;
  index: number;
  isActive: boolean;
  isNext: boolean;
  creator: string;
  isLoggedIn: boolean;
  onEnded: () => void;
  onUnlock: (episodeId: string, index: number) => void;
  isLast: boolean;
  seriesId: string;
  firstEpisodeId?: string;
}) {
  const router = useRouter();
  const lastSavedProgress = useRef(0);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [needTasalbar, setNeedTasalbar] = useState(false);
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);
  const [showReplay, setShowReplay] = useState(false);

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
    if (isLast) {
      setShowReplay(true);
    } else {
      onEnded();
    }
  }, [episode.id, isLoggedIn, isLast, onEnded]);

  const handleUnlockClick = useCallback(async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    setUnlocking(true);
    setError("");
    try {
      const result = await unlockEpisode(episode.id);
      if (result.success) {
        setShowUnlockAnim(true);
        setTimeout(() => {
          setShowUnlockAnim(false);
          onUnlock(episode.id, index);
        }, 1500);
        return;
      } else if (result.needTasalbar) {
        setError("Тасалбар хүрэхгүй байна. Тасалбараа аваарай!");
        setNeedTasalbar(true);
      } else {
        setError(result.error || "Алдаа гарлаа");
      }
    } catch {
      // Server action амжилттай байсан ч response алдагдсан байж болно
      // Бодит нээгдсэн эсэхийг шалгана
      try {
        const retry = await unlockEpisode(episode.id);
        if (retry.success || retry.alreadyPurchased) {
          setShowUnlockAnim(true);
          setTimeout(() => {
            setShowUnlockAnim(false);
            onUnlock(episode.id, index);
          }, 1500);
          return;
        }
      } catch {
        // Давхар оролдлого ч амжилтгүй
      }
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setUnlocking(false);
    }
  }, [episode.id, index, isLoggedIn, onUnlock]);

  const isLocked = !episode.isUnlocked;

  return (
    <div
      data-index={index}
      className="h-dvh w-full snap-start snap-always relative shrink-0 touch-pan-y"
    >
      {/* Video — active plays, next preloads silently */}
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
            loop={!isLast}
          />
        ) : isNext && episode.videoUrl ? (
          /* Далд preload: дараагийн ангийн metadata-г урьдчилж татна (locked ч гэсэн) */
          <video
            src={episode.videoUrl}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white/20 text-sm">Анги {episode.number}</div>
          </div>
        )}
      </div>

      {/* Unlock loading overlay */}
      {unlocking && !showUnlockAnim && (
        <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-yellow-400 animate-spin" />
            <p className="text-sm text-white/60">Нээж байна...</p>
          </div>
        </div>
      )}

      {/* Unlock success animation */}
      {showUnlockAnim && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="relative">
            {/* Confetti particles */}
            {[
              { tx: "-60px", ty: "-80px", color: "bg-yellow-400", delay: "0s" },
              { tx: "70px", ty: "-60px", color: "bg-red-400", delay: "0.05s" },
              { tx: "-80px", ty: "30px", color: "bg-blue-400", delay: "0.1s" },
              { tx: "60px", ty: "70px", color: "bg-green-400", delay: "0.15s" },
              { tx: "-30px", ty: "-90px", color: "bg-purple-400", delay: "0.08s" },
              { tx: "90px", ty: "10px", color: "bg-pink-400", delay: "0.12s" },
              { tx: "-50px", ty: "80px", color: "bg-yellow-300", delay: "0.06s" },
              { tx: "40px", ty: "-70px", color: "bg-red-300", delay: "0.18s" },
              { tx: "-90px", ty: "-20px", color: "bg-cyan-400", delay: "0.03s" },
              { tx: "20px", ty: "90px", color: "bg-orange-400", delay: "0.14s" },
              { tx: "80px", ty: "-40px", color: "bg-emerald-400", delay: "0.07s" },
              { tx: "-40px", ty: "60px", color: "bg-amber-400", delay: "0.11s" },
            ].map((p, i) => (
              <div
                key={i}
                className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full ${p.color}`}
                style={{
                  "--tx": p.tx,
                  "--ty": p.ty,
                  animation: `confetti-pop 1s ease-out ${p.delay} forwards`,
                } as React.CSSProperties}
              />
            ))}
            {/* Unlock icon */}
            <div style={{ animation: "unlock-scale 0.5s ease-out forwards" }}>
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Unlock size={36} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-center text-yellow-400 font-bold text-lg mt-3" style={{ animation: "unlock-scale 0.5s ease-out 0.3s both" }}>
              Нээгдлээ!
            </p>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-40">
          <div className={`text-white text-sm px-4 py-3 rounded-xl text-center ${needTasalbar ? "bg-yellow-600/90" : "bg-red-500/90"}`}>
            {error}
            {needTasalbar && (
              <button
                onClick={() => { router.push("/tasalbar"); }}
                className="block mx-auto mt-2 bg-yellow-400 text-black text-xs font-bold px-4 py-1.5 rounded-full"
              >
                🎫 Тасалбар худалдаж авах
              </button>
            )}
          </div>
        </div>
      )}

      {/* Replay overlay — shown when last episode ends */}
      {showReplay && isLast && (
        <div className="absolute inset-0 z-40 bg-black/70 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-white/60">Цуврал дууслаа</p>
          {firstEpisodeId && (
            <Link
              href={`/watch/${firstEpisodeId}`}
              className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              Дахин эхнээс үзэх
            </Link>
          )}
          <Link
            href={`/series/${seriesId}`}
            className="text-xs text-white/40 underline"
          >
            Цуврал руу буцах
          </Link>
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
