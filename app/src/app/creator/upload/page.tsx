"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Film, Check, Loader2 } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SeriesOption {
  id: string;
  title: string;
}

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [series, setSeries] = useState<SeriesOption[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch creator's series
  useEffect(() => {
    fetch("/api/creator/series")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSeries(data);
      })
      .catch(() => {});
  }, []);

  const handleFileSelect = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024 * 1024) {
      setError("Файл хэт том (2GB хүртэл)");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleUpload = async () => {
    if (!file || !selectedSeriesId || !episodeTitle || !episodeNumber) return;
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      // 1. Get presigned URL from API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "video/mp4",
          seriesId: selectedSeriesId,
          episodeNumber: parseInt(episodeNumber),
          title: episodeTitle,
          isFree,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Presigned URL авахад алдаа");
      }

      const { episodeId, presignedUrl, r2Key } = await res.json();

      // 2. Upload file to R2 via presigned URL with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("Upload амжилтгүй"));
        });
        xhr.addEventListener("error", () => reject(new Error("Сүлжээний алдаа")));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
      });

      // 3. Notify server upload is complete
      await fetch("/api/upload", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, r2Key }),
      });

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = file && selectedSeriesId && episodeTitle && episodeNumber && !uploading && !done;

  return (
    <CreatorShell>
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
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={handleFileChange}
            />

            {!file ? (
              <div
                onClick={handleFileSelect}
                className="aspect-video rounded-xl bg-white/5 border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-white/25 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Upload size={24} className="text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/60">Видео файл сонгох</p>
                  <p className="text-[10px] text-white/30 mt-1">MP4, MOV, WebM • 2GB хүртэл</p>
                </div>
              </div>
            ) : done ? (
              <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={24} className="text-green-400" />
                </div>
                <p className="text-sm font-medium text-green-400">Upload амжилттай!</p>
                <p className="text-[10px] text-white/30">{file.name} • {(file.size / 1024 / 1024).toFixed(0)}MB</p>
              </div>
            ) : uploading ? (
              <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <Film size={32} className="text-blue-400 animate-pulse" />
                <p className="text-sm font-medium">{progress}% upload хийж байна...</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div
                onClick={handleFileSelect}
                className="aspect-video rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all"
              >
                <Film size={28} className="text-blue-400" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-[10px] text-white/30">{(file.size / 1024 / 1024).toFixed(0)}MB • Дарж солих</p>
              </div>
            )}

            {/* Series selection */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Цуврал сонгох</p>
              {series.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {series.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSeriesId(s.id)}
                      className={`text-xs px-3.5 py-2 rounded-full transition-all ${
                        selectedSeriesId === s.id
                          ? "bg-white text-black font-medium"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-white/30 mb-2">Цуврал байхгүй</p>
                  <Link href="/creator/series/new" className="text-xs text-blue-400 underline">
                    Эхлээд цуврал үүсгэх
                  </Link>
                </div>
              )}
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
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all`} style={{ left: isFree ? '22px' : '2px' }} />
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 rounded-xl p-3.5 border border-blue-500/20">
              <p className="text-xs text-blue-300 leading-relaxed">
                Upload хийсний дараа видео автомат transcode хийгдэж, 2 цагийн модерацид орно.
                Admin зөвшөөрвөл эсвэл 2 цагийн дараа автомат нийтлэгдэнэ.
              </p>
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            {/* Submit */}
            {done ? (
              <button
                onClick={() => router.push("/creator")}
                className="w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold text-sm"
              >
                Самбар руу буцах →
              </button>
            ) : (
              <button
                onClick={handleUpload}
                disabled={!canSubmit}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  canSubmit
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : "Upload & Нийтлэх"}
              </button>
            )}
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
