"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Film, ChevronDown, Check } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";

export default function UploadPage() {
  const [selectedSeries, setSelectedSeries] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setUploading(true);
    // Simulate upload progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setProgress(Math.min(p, 100));
    }, 500);
  };

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Link href="/creator" className="text-white/60">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-base">Видео upload</h1>
            <div className="w-5" />
          </div>

          <div className="px-4 mt-4 space-y-5">
            {/* File upload area */}
            {!uploading ? (
              <div
                onClick={handleUpload}
                className="aspect-video rounded-xl bg-white/5 border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-white/25 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Upload size={24} className="text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/60">Видео файл сонгох</p>
                  <p className="text-[10px] text-white/30 mt-1">MP4, MOV • 1080p хүртэл • 2GB хүртэл</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                {progress < 100 ? (
                  <>
                    <Film size={32} className="text-blue-400 animate-pulse" />
                    <p className="text-sm font-medium">{Math.round(progress)}% upload хийж байна...</p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check size={24} className="text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-green-400">Upload амжилттай!</p>
                    <p className="text-[10px] text-white/30">video_episode_01.mp4 • 245MB</p>
                  </>
                )}
              </div>
            )}

            {/* Series selection */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Цуврал сонгох</p>
              <button className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className={`text-sm ${selectedSeries ? "text-white" : "text-white/20"}`}>
                  {selectedSeries || "Цуврал сонгоно уу"}
                </span>
                <ChevronDown size={16} className="text-white/30" />
              </button>
              {/* Quick select */}
              <div className="flex gap-2 mt-2">
                {["Хар шөнө", "Цагаан мөрөөдөл"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeries(s)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      selectedSeries === s
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode info */}
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/60 mb-2">Ангийн нэр</p>
                <input
                  type="text"
                  placeholder="Жишээ: Эхлэл"
                  value={episodeTitle}
                  onChange={(e) => setEpisodeTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="w-24">
                <p className="text-sm font-medium text-white/60 mb-2">Анги №</p>
                <input
                  type="number"
                  placeholder="1"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Free toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm font-medium">Үнэгүй анги</p>
                <p className="text-[10px] text-white/40 mt-0.5">Эхний 3 анги үнэгүй болгохыг зөвлөж байна</p>
              </div>
              <button
                onClick={() => setIsFree(!isFree)}
                className={`w-12 h-7 rounded-full transition-all relative ${
                  isFree ? "bg-green-500" : "bg-white/15"
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${
                  isFree ? "left-5.5 translate-x-0" : "left-0.5"
                }`} style={{ left: isFree ? '22px' : '2px' }} />
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 rounded-xl p-3.5 border border-blue-500/20">
              <p className="text-xs text-blue-300 leading-relaxed">
                Upload хийсний дараа видео автомат transcode хийгдэж, 2 цагийн модерацид орно.
                Admin зөвшөөрвөл эсвэл 2 цагийн дараа автомат нийтлэгдэнэ.
              </p>
            </div>

            {/* Submit */}
            <button
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                progress >= 100 && selectedSeries && episodeTitle
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Нийтлэх
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
