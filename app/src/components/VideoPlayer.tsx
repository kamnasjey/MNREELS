"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Lock, Ticket } from "lucide-react";

interface VideoPlayerProps {
  src: string; // HLS manifest URL (.m3u8) or direct MP4
  poster?: string;
  isLocked?: boolean;
  tasalbarCost?: number;
  onUnlock?: () => void;
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  fullScreen?: boolean; // Fill entire parent container (for Reels-style)
}

export default function VideoPlayer({
  src,
  poster,
  isLocked = false,
  tasalbarCost = 2,
  onUnlock,
  onProgress,
  onEnded,
  autoPlay = false,
  fullScreen = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<NodeJS.Timeout>(undefined);

  // Initialize video source (HLS or direct MP4)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLocked) return;

    const isHLS = src.includes(".m3u8");

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (isHLS && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    } else {
      // Direct MP4/WebM playback
      video.src = src;
      video.load();
      if (autoPlay) video.play().catch(() => {});
      return () => {
        video.src = "";
      };
    }
  }, [src, isLocked, autoPlay]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress(video.currentTime);
      // Report progress every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0 && onProgress) {
        onProgress(Math.floor(video.currentTime));
      }
    };

    const handleDuration = () => setDuration(video.duration);
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleEnded = () => {
      setPlaying(false);
      onEnded?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onProgress, onEnded]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    video.currentTime = x * duration;
  }, [duration]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const containerClass = fullScreen
    ? "relative w-full h-full bg-black overflow-hidden select-none"
    : "relative w-full aspect-video bg-black rounded-xl overflow-hidden select-none";

  // Locked state
  if (isLocked) {
    return (
      <div className={`${containerClass} flex flex-col items-center justify-center`}>
        {poster && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
            style={{ backgroundImage: `url(${poster})` }}
          />
        )}
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
            <Lock size={28} className="text-white/60" />
          </div>
          <p className="text-sm font-medium text-white/70">Түгжээтэй анги</p>
          <button
            onClick={onUnlock}
            className="mt-3 flex items-center gap-1.5 bg-yellow-500 text-black font-semibold text-sm px-5 py-2.5 rounded-full mx-auto"
          >
            <Ticket size={14} />
            {tasalbarCost} тасалбараар нээх
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={containerClass}
      onClick={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        className={`w-full h-full ${fullScreen ? "object-cover" : "object-contain"}`}
      />

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Center play/pause */}
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          {playing ? (
            <Pause size={24} className="text-white" />
          ) : (
            <Play size={24} className="text-white ml-1" />
          )}
        </button>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Progress bar */}
          <div
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2"
            onClick={(e) => { e.stopPropagation(); seek(e); }}
          >
            <div
              className="h-full bg-red-500 rounded-full relative"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/60">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
            <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
                {muted ? (
                  <VolumeX size={16} className="text-white/60" />
                ) : (
                  <Volume2 size={16} className="text-white/60" />
                )}
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                videoRef.current?.requestFullscreen?.();
              }}>
                <Maximize size={16} className="text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
