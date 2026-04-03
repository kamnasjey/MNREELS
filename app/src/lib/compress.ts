import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

// Lazy load FFmpeg — only downloads when first used (~25MB core)
async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (onLog) {
    ffmpeg.on("log", ({ message }) => onLog(message));
  }

  // Load from CDN — single-threaded (umd) version that works WITHOUT SharedArrayBuffer
  // This works on all browsers regardless of COOP/COEP headers
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

// Reset FFmpeg instance (use after crash/hang)
export function resetFFmpeg() {
  if (ffmpeg) {
    try { ffmpeg.terminate(); } catch { /* ignore */ }
  }
  ffmpeg = null;
}

export interface CompressOptions {
  onProgress?: (progress: number) => void; // 0-100
  onLog?: (msg: string) => void;
  maxHeight?: number; // default 720
  crf?: number; // default 28 (lower = better quality, larger file)
  timeoutMs?: number; // default 10 minutes
}

export async function compressVideo(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    onProgress,
    onLog,
    maxHeight = 720,
    crf = 28,
    timeoutMs = 10 * 60 * 1000, // 10 minutes default
  } = options;

  onProgress?.(1);

  const ff = await getFFmpeg(onLog);
  onProgress?.(5);

  // Set up progress tracking with stall detection
  let lastProgressTime = Date.now();
  const progressHandler = ({ progress }: { progress: number }) => {
    lastProgressTime = Date.now();
    onProgress?.(Math.round(5 + progress * 90));
  };
  ff.on("progress", progressHandler);

  // Write input file
  const inputName = "input" + getExtension(file.name);
  const outputName = "output.mp4";

  await ff.writeFile(inputName, await fetchFile(file));
  onProgress?.(10);

  // Compress with timeout + stall detection
  const execPromise = ff.exec([
    "-i", inputName,
    "-vf", `scale=-2:${maxHeight}`,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", String(crf),
    "-c:a", "aac",
    "-b:a", "96k",
    "-movflags", "+faststart",
    "-y",
    outputName,
  ]);

  // Timeout: reject if total time exceeds limit OR progress stalls for 60s
  const timeoutPromise = new Promise<never>((_, reject) => {
    const overallTimer = setTimeout(() => {
      reject(new Error("Compression timeout: хэт удаан байна"));
    }, timeoutMs);

    // Check for stall every 15 seconds
    const stallInterval = setInterval(() => {
      if (Date.now() - lastProgressTime > 60_000) {
        clearTimeout(overallTimer);
        clearInterval(stallInterval);
        reject(new Error("Compression stalled: progress зогссон"));
      }
    }, 15_000);

    // Clean up timers when exec finishes
    execPromise.finally(() => {
      clearTimeout(overallTimer);
      clearInterval(stallInterval);
    });
  });

  try {
    await Promise.race([execPromise, timeoutPromise]);
  } catch (err) {
    ff.off("progress", progressHandler);
    // Reset FFmpeg instance after timeout/stall — it may be in a bad state
    resetFFmpeg();
    throw err;
  }

  ff.off("progress", progressHandler);
  onProgress?.(95);

  // Read output
  const data = await ff.readFile(outputName);
  const blob = new Blob([data], { type: "video/mp4" });

  // Clean up WASM filesystem
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  onProgress?.(100);

  const compressedName = file.name.replace(/\.[^.]+$/, "") + "_compressed.mp4";
  return new File([blob], compressedName, { type: "video/mp4" });
}

function getExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "mov") return ".mov";
  if (ext === "webm") return ".webm";
  return ".mp4";
}

// Check if browser supports WebAssembly (required for FFmpeg.wasm)
export function isCompressionSupported(): boolean {
  return typeof WebAssembly !== "undefined";
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
