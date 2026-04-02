"use client";

import { useState } from "react";
import { Play, Lock } from "lucide-react";
import { Video } from "@/lib/mock-data";

export default function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(true);

  const handleTap = () => {
    setPlaying(!playing);
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* Video background (gradient placeholder) */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${video.gradient}`}
        onClick={handleTap}
      >
        {/* Center play icon when paused */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={32} className="text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Paid content overlay */}
      {!video.isFree && (
        <div className="absolute top-16 left-0 right-0 flex justify-center">
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <Lock size={14} className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">
              {video.tasalbar} тасалбар
            </span>
            <button className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full ml-1">
              Нээх
            </button>
          </div>
        </div>
      )}

      {/* Bottom info overlay */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold border-2 border-white">
            {video.creatorAvatar}
          </div>
          <span className="font-bold text-sm">@{video.creator.replace(/\.\s*/g, "").replace(/\s/g, "")}</span>
        </div>
        <h3 className="font-semibold text-sm mb-0.5">
          {video.seriesTitle} • Анги {video.episode}
        </h3>
        <p className="text-white/70 text-xs mb-2">&ldquo;{video.title}&rdquo;</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/15 rounded-full px-2.5 py-0.5">
            {video.category}
          </span>
          {video.isFree && (
            <span className="text-[10px] bg-green-500/30 text-green-300 rounded-full px-2.5 py-0.5">
              ҮНЭГҮЙ
            </span>
          )}
          <span className="text-[10px] text-white/50">{video.duration}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-0 right-0 h-0.5 bg-white/20">
        <div
          className="h-full bg-white rounded-full transition-all duration-1000"
          style={{ width: "35%" }}
        />
      </div>
    </div>
  );
}
