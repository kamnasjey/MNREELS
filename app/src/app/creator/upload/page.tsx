"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Upload, Film, Check, Loader2, X, Plus, Pencil, Zap } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCreatorSeries, getNextEpisodeNumber } from "@/lib/actions/series";
import { compressVideo, formatFileSize } from "@/lib/compress";

interface SeriesOption {
  id: string;
  title: string;
}

interface EpisodeEntry {
  id: string;
  file: File;
  title: string;
  episodeNumber: number;
  isFree: boolean;
  tasalbarCost: number;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk (2x том = 2x бага HTTP request)
const PARALLEL_UPLOADS = 3; // 3 chunk зэрэг upload

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  // Timeout: 30s to prevent hanging on slow/broken response streams
  const textPromise = res.text();
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Response timeout (30s)")), 30_000)
  );
  const text = await Promise.race([textPromise, timeoutPromise]);
  try {
    return JSON.parse(text);
  } catch {
    console.error("Server returned non-JSON:", text.slice(0, 200));
    if (text.includes("1102")) {
      throw new Error("Worker crash (1102). Файл хэт том эсвэл R2 алдаа.");
    }
    if (text.includes("503")) {
      throw new Error("Сервер завгүй (503). Дахин оролдоно уу.");
    }
    throw new Error(`Сервер алдаа (${res.status}). Дахин оролдоно уу.`);
  }
}

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [series, setSeries] = useState<SeriesOption[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [nextEpNum, setNextEpNum] = useState(1);
  const [episodes, setEpisodes] = useState<EpisodeEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [globalIsFree, setGlobalIsFree] = useState(false);
  const [globalCost, setGlobalCost] = useState("1");

  useEffect(() => {
    getCreatorSeries()
      .then((data) => {
        const list = (data ?? []).map((s: { id: string; title: string }) => ({
          id: s.id,
          title: s.title,
        }));
        setSeries(list);
        if (list.length === 1) {
          setSelectedSeriesId(list[0].id);
          getNextEpisodeNumber(list[0].id)
            .then((n) => setNextEpNum(n))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSeries(false));
  }, []);

  const handleSeriesSelect = async (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    try {
      const n = await getNextEpisodeNumber(seriesId);
      setNextEpNum(n);
    } catch {}
  };

  // Extract episode number from filename, ignoring resolution/quality numbers
  const extractNumber = (name: string): number => {
    // Remove file extension
    const base = name.replace(/\.[^.]+$/, "");

    // Remove known non-episode numbers (resolution, quality)
    const cleaned = base.replace(/\b(360|480|720|1080|1440|2160|4k|hd|fhd)\s*p?\b/gi, "");

    // Try common patterns: "ep3", "episode 3", "анги 3", "E03", "#3"
    const epMatch = cleaned.match(/(?:ep|episode|анги|e|#)\s*(\d+)/i);
    if (epMatch) return parseInt(epMatch[1]) || 0;

    // Try "S01E03" pattern
    const seMatch = cleaned.match(/s\d+e(\d+)/i);
    if (seMatch) return parseInt(seMatch[1]) || 0;

    // Try number in parentheses: "love strike (3)"
    const parenMatch = cleaned.match(/\((\d+)\)/);
    if (parenMatch) return parseInt(parenMatch[1]) || 0;

    // Try number after dash/underscore: "love-strike-3" or "love_strike_3"
    const sepMatch = cleaned.match(/[-_]\s*(\d+)\s*$/);
    if (sepMatch) return parseInt(sepMatch[1]) || 0;

    // Fallback: use the last reasonable number (< 1000 to avoid resolution)
    const matches = cleaned.match(/(\d+)/g);
    if (!matches) return 0;
    for (let i = matches.length - 1; i >= 0; i--) {
      const n = parseInt(matches[i]);
      if (n > 0 && n < 1000) return n;
    }
    return parseInt(matches[0]) || 0;
  };

  // Add multiple files
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Sort files by number in filename for correct episode ordering
    const sorted = Array.from(files)
      .filter((f) => f.size <= 2 * 1024 * 1024 * 1024)
      .sort((a, b) => extractNumber(a.name) - extractNumber(b.name));

    const existingCount = episodes.filter(e => e.status !== "error").length;
    const newEntries: EpisodeEntry[] = sorted.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      file: f,
      title: f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
      episodeNumber: nextEpNum + existingCount + i,
      isFree: globalIsFree,
      tasalbarCost: parseInt(globalCost) || 1,
      status: "pending",
      progress: 0,
    }));

    setEpisodes((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const removeEpisode = (id: string) => {
    setEpisodes((prev) => {
      const filtered = prev.filter((ep) => ep.id !== id);
      // Auto-renumber remaining episodes sequentially
      return filtered.map((ep, i) => ({
        ...ep,
        episodeNumber: ep.status === "done" ? ep.episodeNumber : nextEpNum + i,
      }));
    });
  };

  const updateEpisode = (id: string, updates: Partial<EpisodeEntry>) => {
    setEpisodes((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, ...updates } : ep))
    );
  };

  // Upload single episode
  const uploadOne = useCallback(async (entry: EpisodeEntry) => {
    updateEpisode(entry.id, { status: "uploading", progress: 0 });

    try {
      // Get duration (with 10s timeout to prevent hang)
      const duration = await new Promise<number>((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(video.src);
          resolve(0);
        }, 10_000);
        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve(Math.round(video.duration));
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => { clearTimeout(timeout); resolve(0); };
        video.src = URL.createObjectURL(entry.file);
      });

      // START
      const startRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          seriesId: selectedSeriesId,
          title: entry.title,
          episodeNumber: entry.episodeNumber,
          isFree: entry.isFree,
          tasalbarCost: entry.isFree ? 0 : entry.tasalbarCost,
          duration,
          filename: entry.file.name,
        }),
      });

      if (!startRes.ok) {
        const err = await safeJson(startRes);
        throw new Error((err.error as string) || "Upload эхлүүлэхэд алдаа");
      }

      const { episodeId, uploadId, r2Key } = (await safeJson(startRes)) as {
        episodeId: string;
        uploadId: string;
        r2Key: string;
      };

      // UPLOAD PARTS — parallel (3 зэрэг, retry бүхий)
      const totalChunks = Math.ceil(entry.file.size / CHUNK_SIZE);
      const parts: { partNumber: number; etag: string }[] = new Array(totalChunks);
      let completedChunks = 0;

      // Single chunk upload with retry
      const uploadChunk = async (i: number) => {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, entry.file.size);
        const chunk = entry.file.slice(start, end);

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const partRes = await fetch("/api/upload/part", {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "x-r2-key": r2Key,
                "x-upload-id": uploadId,
                "x-part-number": String(i + 1),
              },
              body: chunk,
            });

            if (!partRes.ok) {
              const err = await safeJson(partRes);
              if (attempt < 2) { await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); continue; }
              throw new Error((err.error as string) || `Хэсэг ${i + 1} алдаа`);
            }

            const result = (await safeJson(partRes)) as { partNumber: number; etag: string };
            parts[i] = result;
            completedChunks++;
            updateEpisode(entry.id, { progress: Math.round((completedChunks / totalChunks) * 95) });
            return;
          } catch (fetchErr) {
            if (attempt < 2) { await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); continue; }
            throw new Error(`Хэсэг ${i + 1}: ${fetchErr instanceof Error ? fetchErr.message : "Алдаа"}`);
          }
        }
      };

      // Upload in parallel batches of PARALLEL_UPLOADS
      for (let batch = 0; batch < totalChunks; batch += PARALLEL_UPLOADS) {
        const batchEnd = Math.min(batch + PARALLEL_UPLOADS, totalChunks);
        const batchPromises = [];
        for (let i = batch; i < batchEnd; i++) {
          batchPromises.push(uploadChunk(i));
        }
        await Promise.all(batchPromises);
      }

      // COMPLETE (with retry — R2 can be slow to finalize large files)
      updateEpisode(entry.id, { progress: 98 });

      let completed = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 60_000); // 60s timeout

          const completeRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "complete",
              episodeId,
              uploadId,
              r2Key,
              parts,
            }),
            signal: controller.signal,
          });

          clearTimeout(timer);

          if (!completeRes.ok) {
            const err = await safeJson(completeRes);
            throw new Error((err.error as string) || "Нэгтгэхэд алдаа");
          }

          completed = true;
          break;
        } catch (completeErr) {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
            continue;
          }
          throw new Error(
            `Видео нэгтгэхэд алдаа: ${completeErr instanceof Error ? completeErr.message : "Unknown"}. Дахин оролдоно уу.`
          );
        }
      }

      if (!completed) throw new Error("Видео нэгтгэж чадсангүй");

      updateEpisode(entry.id, { status: "done", progress: 100 });
    } catch (err) {
      updateEpisode(entry.id, {
        status: "error",
        error: err instanceof Error ? err.message : "Алдаа",
      });
    }
  }, [selectedSeriesId]);

  // Compress + Upload all episodes sequentially
  const handleUploadAll = async () => {
    if (!selectedSeriesId || episodes.length === 0) return;
    setUploading(true);

    for (const ep of episodes) {
      if (ep.status === "done") continue;

      // Compress заавал хийгдэнэ — амжилтгүй бол алдаа харуулна
      updateEpisode(ep.id, { status: "compressing", progress: 0, originalSize: ep.file.size });
      let fileToUpload: File;
      try {
        fileToUpload = await compressVideo(ep.file, {
          onProgress: (p) => updateEpisode(ep.id, { progress: p }),
          timeoutMs: 15 * 60 * 1000, // 15 мин timeout
        });
        updateEpisode(ep.id, {
          file: fileToUpload,
          compressedSize: fileToUpload.size,
        });
      } catch (err) {
        // Compress timeout/stall — FFmpeg reset хийгдсэн, дахин оролдоно
        const msg = err instanceof Error ? err.message : "Тодорхойгүй алдаа";
        updateEpisode(ep.id, {
          status: "error",
          error: `Шахалт: ${msg}`,
        });
        continue;
      }

      // Upload (зөвхөн compress амжилттай бол)
      await uploadOne({ ...ep, file: fileToUpload });
    }

    setUploading(false);
    setEpisodes((prev) => {
      const allCompleted = prev.every((ep) => ep.status === "done");
      if (allCompleted) setAllDone(true);
      return prev;
    });
  };

  const pendingCount = episodes.filter((ep) => ep.status !== "done").length;
  const doneCount = episodes.filter((ep) => ep.status === "done").length;
  const totalSize = episodes.reduce((sum, ep) => sum + ep.file.size, 0);
  const canSubmit = episodes.length > 0 && selectedSeriesId && !uploading && !allDone;

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
            {/* Series selection */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Цуврал сонгох</p>
              {loadingSeries ? (
                <div className="text-center py-4 bg-white/5 rounded-xl">
                  <Loader2 size={16} className="animate-spin mx-auto text-white/30" />
                </div>
              ) : series.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {series.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSeriesSelect(s.id)}
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

            {/* Global settings */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-xs font-medium">Үнэгүй ангиуд</p>
              </div>
              <button
                onClick={() => {
                  setGlobalIsFree(!globalIsFree);
                  setEpisodes((prev) =>
                    prev.map((ep) => ({ ...ep, isFree: !globalIsFree }))
                  );
                }}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  globalIsFree ? "bg-green-500" : "bg-white/15"
                }`}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ left: globalIsFree ? "20px" : "2px" }}
                />
              </button>
            </div>

            {/* Auto compress info */}
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-xl">
              <Zap size={12} className="text-yellow-400 shrink-0" />
              <p className="text-[10px] text-yellow-400/80">
                Видео автоматаар шахагдана (720p) — хэмжээ 5-10x жижирнэ
              </p>
            </div>

            {!globalIsFree && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <p className="text-xs font-medium text-white/60">Тасалбар:</p>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={parseInt(globalCost) || 2}
                  onChange={(e) => {
                    setGlobalCost(e.target.value);
                    setEpisodes((prev) =>
                      prev.map((ep) => ({
                        ...ep,
                        tasalbarCost: parseInt(e.target.value) || 2,
                      }))
                    );
                  }}
                  className="flex-1 accent-yellow-500"
                />
                <span className="text-sm font-bold text-yellow-400 w-8 text-center">
                  {parseInt(globalCost) || 2}
                </span>
              </div>
            )}

            {/* File upload area */}
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              multiple
              onChange={handleFilesChange}
            />

            {/* Episode list */}
            {episodes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/60">
                  Ангиуд ({episodes.length}) • {(totalSize / 1024 / 1024).toFixed(0)}MB
                </p>
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className={`relative p-3 rounded-xl border transition-all ${
                      ep.status === "done"
                        ? "bg-green-500/10 border-green-500/30"
                        : ep.status === "error"
                        ? "bg-red-500/10 border-red-500/30"
                        : ep.status === "compressing"
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : ep.status === "uploading"
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Episode number - editable */}
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        {ep.status === "done" ? (
                          <Check size={14} className="text-green-400" />
                        ) : ep.status === "compressing" ? (
                          <Zap size={14} className="text-yellow-400 animate-pulse" />
                        ) : ep.status === "uploading" ? (
                          <Loader2 size={14} className="text-blue-400 animate-spin" />
                        ) : (
                          <input
                            type="number"
                            value={ep.episodeNumber}
                            onChange={(e) =>
                              updateEpisode(ep.id, { episodeNumber: parseInt(e.target.value) || 1 })
                            }
                            className="w-full h-full bg-transparent text-center text-xs font-bold text-white/50 outline-none focus:text-white focus:bg-white/5 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={1}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Editable title with edit button */}
                        <div className="flex items-center gap-1.5">
                          <input
                            id={`title-${ep.id}`}
                            type="text"
                            value={ep.title}
                            onChange={(e) =>
                              updateEpisode(ep.id, { title: e.target.value })
                            }
                            disabled={ep.status !== "pending"}
                            className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-white/20 disabled:opacity-60 focus:border-b focus:border-white/30"
                            placeholder="Ангийн нэр"
                          />
                          {ep.status === "pending" && (
                            <button
                              onClick={() => {
                                const input = document.getElementById(`title-${ep.id}`) as HTMLInputElement;
                                input?.focus();
                                input?.select();
                              }}
                              className="text-white/30 hover:text-white/60 p-0.5 shrink-0"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          Анги {ep.episodeNumber} • {formatFileSize(ep.file.size)}
                          {ep.compressedSize && ep.originalSize && (
                            <span className="text-green-400"> ({formatFileSize(ep.originalSize)} → {formatFileSize(ep.compressedSize)})</span>
                          )}
                          {ep.status === "compressing" && (
                            <span className="text-yellow-400"> • Шахаж байна {ep.progress}%</span>
                          )}
                          {ep.status === "uploading" && (
                            <span className="text-blue-400"> • Илгээж байна {ep.progress}%</span>
                          )}
                          {ep.status === "error" && (
                            <span className="text-red-400 ml-1">{ep.error}</span>
                          )}
                        </p>
                      </div>

                      {/* Remove button */}
                      {ep.status === "pending" && (
                        <button
                          onClick={() => removeEpisode(ep.id)}
                          className="text-white/20 hover:text-white/60 p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    {(ep.status === "compressing" || ep.status === "uploading") && (
                      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            ep.status === "compressing" ? "bg-yellow-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${ep.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add more files button */}
            {!uploading && !allDone && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-4 rounded-xl bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center gap-2 text-white/40 hover:bg-white/10 hover:border-white/25 transition-all"
              >
                {episodes.length === 0 ? (
                  <>
                    <Upload size={18} />
                    <span className="text-sm">Видео файл сонгох (олноор сонгож болно)</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span className="text-xs">Нэмж файл сонгох</span>
                  </>
                )}
              </button>
            )}

            {/* Upload status */}
            {uploading && (
              <div className="text-center py-2">
                <p className="text-xs text-white/40">
                  {doneCount}/{episodes.length} анги upload хийгдлээ
                  {episodes.some(e => e.status === "compressing") && " • Видео шахаж байна..."}
                </p>
              </div>
            )}

            {/* Submit */}
            {allDone ? (
              <button
                onClick={() => router.push("/creator")}
                className="w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold text-sm"
              >
                {episodes.length} анги амжилттай! Самбар руу буцах →
              </button>
            ) : (
              <button
                onClick={handleUploadAll}
                disabled={!canSubmit}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  canSubmit
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Upload хийж байна...
                  </>
                ) : (
                  `${episodes.length > 0 ? episodes.length + " анги " : ""}Upload & Нийтлэх`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
