"use client";

import { useCallback, useRef } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import { saveWatchProgress } from "@/lib/actions/series";

interface EpisodeData {
  id: string;
  title: string;
  number: number;
  duration: string;
  videoUrl: string;
  isFree: boolean;
}

interface WatchViewProps {
  episode: EpisodeData;
  seriesId: string;
  seriesTitle: string;
  creator: string;
  nextEpisodeId?: string;
  isLoggedIn: boolean;
}

export default function WatchView({
  episode,
  seriesId,
  seriesTitle,
  creator,
  nextEpisodeId,
  isLoggedIn,
}: WatchViewProps) {
  const lastSavedProgress = useRef(0);

  const handleProgress = useCallback(
    (seconds: number) => {
      if (!isLoggedIn) return;
      // Save every 10 seconds of video
      if (seconds - lastSavedProgress.current >= 10) {
        lastSavedProgress.current = seconds;
        saveWatchProgress(episode.id, seconds, false).catch(() => {});
      }
    },
    [episode.id, isLoggedIn]
  );

  const handleEnded = useCallback(() => {
    if (!isLoggedIn) return;
    saveWatchProgress(episode.id, 0, true).catch(() => {});
  }, [episode.id, isLoggedIn]);

  return (
    <div className="min-h-dvh bg-black text-white">
      {/* Video Player */}
      <div className="w-full">
        <VideoPlayer
          src={episode.videoUrl}
          isLocked={!episode.isFree}
          onProgress={handleProgress}
          onEnded={handleEnded}
          autoPlay
        />
      </div>

      {/* Episode info */}
      <div className="px-4 pt-4">
        <Link href={`/series/${seriesId}`} className="flex items-center gap-1.5 text-white/40 mb-2">
          <ArrowLeft size={16} />
          <span className="text-xs">{seriesTitle}</span>
        </Link>

        <h1 className="text-lg font-bold">
          Анги {episode.number}: {episode.title}
        </h1>
        <p className="text-xs text-white/40 mt-1">{creator} • {episode.duration}</p>
      </div>

      {/* Next episode */}
      {nextEpisodeId && (
        <div className="px-4 mt-6">
          <Link
            href={`/watch/${nextEpisodeId}`}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div>
              <p className="text-xs text-white/40">Дараагийн анги</p>
              <p className="text-sm font-semibold mt-0.5">Анги {episode.number + 1}</p>
            </div>
            <ChevronRight size={20} className="text-white/30" />
          </Link>
        </div>
      )}
    </div>
  );
}
