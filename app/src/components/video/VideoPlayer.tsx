"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import { Play, Pause, Lock, Ticket, Volume2, VolumeX, RotateCcw, RotateCw } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isLocked?: boolean;
  tasalbarCost?: number;
  onUnlock?: () => void;
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  fullScreen?: boolean;
  loop?: boolean;
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
  loop: loopVideo = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [loading, setLoading] = useState(!!src);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPlayedOnce = useRef(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [seekAction, setSeekAction] = useState<"back" | "forward" | null>(null);
  const pauseIconTimer = useRef<NodeJS.Timeout>(undefined);
  const controlsTimer = useRef<NodeJS.Timeout>(undefined);
  const seekTimer = useRef<NodeJS.Timeout>(undefined);
  const tapTimer = useRef<NodeJS.Timeout>(undefined);
  const tapCount = useRef(0);
  const lastTapX = useRef(0);
  const lastReportedProgress = useRef(0);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Autoplay helper — try with sound first, fallback to muted
  const tryAutoplay = useCallback((video: HTMLVideoElement) => {
    video.muted = false;
    setMuted(false);
    video.play().then(() => {
      setPlaying(true);
    }).catch(() => {
      // Browser blocked unmuted autoplay — try muted
      video.muted = true;
      setMuted(true);
      video.play().then(() => {
        setPlaying(true);
      }).catch(() => {
        setPlaying(false);
      });
    });
  }, []);

  // Initialize video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLocked || !src) return;

    setLoading(true);
    // Safety: always hide spinner after 2s max
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => setLoading(false), 2000);
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
        if (autoPlay) tryAutoplay(video);
      });
      hlsRef.current = hls;
      return () => { hls.destroy(); hlsRef.current = null; };
    } else if (isHLS && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (autoPlay) tryAutoplay(video);
    } else {
      video.src = src;
      // Don't call video.load() — setting src already triggers loading
      if (autoPlay) tryAutoplay(video);
      return () => { video.src = ""; };
    }
  }, [src, isLocked, autoPlay, tryAutoplay]);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Helper: grab duration whenever available
    const grabDuration = () => {
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
    };

    const onTimeUpdate = () => {
      setProgress(video.currentTime);
      grabDuration();
      // Once time updates, video is definitely playing — kill spinner forever
      if (!hasPlayedOnce.current) {
        hasPlayedOnce.current = true;
      }
      setLoading(false);
      const sec = Math.floor(video.currentTime);
      if (sec - lastReportedProgress.current >= 5 && onProgress) {
        lastReportedProgress.current = sec;
        onProgress(sec);
      }
    };
    const onPlay = () => { setPlaying(true); setLoading(false); hasPlayedOnce.current = true; };
    const onPause = () => setPlaying(false);
    const onEnded2 = () => { setPlaying(false); onEnded?.(); };
    // Only show spinner on initial load, never after first play — with 2s max
    const onWaiting = () => {
      if (!hasPlayedOnce.current) {
        setLoading(true);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = setTimeout(() => setLoading(false), 2000);
      }
    };
    const onCanPlay = () => { setLoading(false); grabDuration(); };
    const onLoadedData = () => { setLoading(false); grabDuration(); };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", grabDuration);
    video.addEventListener("durationchange", grabDuration);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("play", onPlay);
    video.addEventListener("playing", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded2);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);

    // If video already has data (e.g. re-render), use it
    if (video.readyState >= 2) { setLoading(false); grabDuration(); }
    // Fallback: force hide spinner after 3s no matter what
    const fallbackTimer = setTimeout(() => setLoading(false), 3000);

    return () => {
      clearTimeout(fallbackTimer);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", grabDuration);
      video.removeEventListener("durationchange", grabDuration);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded2);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [onProgress, onEnded]);

  // Loop video (like TikTok/Reels) — disabled for last episode
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.loop = loopVideo;
  }, [loopVideo]);

  // Seek 5 seconds
  const seekBy = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    setSeekAction(seconds < 0 ? "back" : "forward");
    if (seekTimer.current) clearTimeout(seekTimer.current);
    seekTimer.current = setTimeout(() => setSeekAction(null), 600);
  }, []);

  // Auto-hide controls after 3 seconds
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  // Tap handler — single tap = toggle controls overlay, double tap = seek ±5s
  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    // First user interaction — unmute if was forced muted
    if (!userInteracted) {
      setUserInteracted(true);
      if (video.muted) {
        video.muted = false;
        setMuted(false);
        // Re-trigger play to activate audio context on iOS
        video.play().catch(() => {});
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftSide = x < rect.width / 2;
    lastTapX.current = x;

    tapCount.current += 1;

    if (tapCount.current === 1) {
      tapTimer.current = setTimeout(() => {
        if (tapCount.current === 1) {
          // Single tap — toggle controls overlay
          if (showControls) {
            setShowControls(false);
          } else {
            showControlsTemporarily();
          }
        }
        tapCount.current = 0;
      }, 250);
    } else if (tapCount.current === 2) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCount.current = 0;
      seekBy(isLeftSide ? -5 : 5);
    }
  }, [userInteracted, seekBy, showControls, showControlsTemporarily]);

  // Toggle mute
  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!userInteracted) setUserInteracted(true);
  }, [userInteracted]);

  // Seek on progress bar
  const handleSeek = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = x * duration;
  }, [duration]);

  const containerClass = fullScreen
    ? "relative w-full h-full bg-black overflow-hidden select-none touch-pan-y"
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
    <div className={containerClass} onClick={handleTap}>
      {/* Video element */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="auto"
        className={`w-full h-full ${fullScreen ? "object-contain" : "object-contain"} touch-pan-y`}
        style={{ backgroundColor: "#000" }}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Controls overlay — appears on tap, auto-hides after 2s */}
      <div className={`absolute inset-0 z-20 transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
        {/* Dark overlay background */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Center controls: seek back, play/pause, seek forward */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
          <button
            onClick={(e) => { e.stopPropagation(); seekBy(-5); showControlsTemporarily(); }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <RotateCcw size={22} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) { v.play().catch(() => {}); } else { v.pause(); }
              showControlsTemporarily();
            }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            {playing ? (
              <Pause size={30} className="text-white" />
            ) : (
              <Play size={30} className="text-white ml-1" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); seekBy(5); showControlsTemporarily(); }}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <RotateCw size={22} className="text-white" />
          </button>
        </div>

        {/* Mute button — top right */}
        <button
          onClick={(e) => { handleMuteToggle(e); showControlsTemporarily(); }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
        >
          {muted ? (
            <VolumeX size={16} className="text-white" />
          ) : (
            <Volume2 size={16} className="text-white" />
          )}
        </button>

        {/* Progress bar + time — bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-2"
            onClick={(e) => { handleSeek(e); showControlsTemporarily(); }}
            onTouchMove={(e) => { handleSeek(e); }}
          >
            <div
              className="h-full bg-white rounded-full relative"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-white/70">{formatTime(progress)}</span>
            <span className="text-[10px] text-white/70">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Seek indicator — double tap feedback (shows even without controls) */}
      {seekAction && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-pulse ${
          seekAction === "back" ? "left-8" : "right-8"
        }`}>
          <div className="flex flex-col items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-4 py-3">
            {seekAction === "back" ? (
              <RotateCcw size={24} className="text-white" />
            ) : (
              <RotateCw size={24} className="text-white" />
            )}
            <span className="text-white text-xs font-semibold">5с</span>
          </div>
        </div>
      )}

      {/* Progress bar — always visible thin line at bottom (when controls hidden) */}
      {!showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-10 h-[2px] bg-white/10">
          <div
            className="h-full bg-white/50 transition-[width] duration-200"
            style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
          />
        </div>
      )}
    </div>
  );
}
