/**
 * Compress all existing videos on R2
 * Uses ffmpeg.wasm (no native FFmpeg needed)
 *
 * Usage: node compress-all.js
 */

const { createClient } = require("@supabase/supabase-js");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Read from .env if not in environment
function loadEnv() {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, ".env.local"), "utf-8");
    envFile.split("\n").forEach(line => {
      const [key, ...val] = line.split("=");
      if (key && val.length) {
        const value = val.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) process.env[key.trim()] = value;
      }
    });
  } catch {}
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars. Check app/.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Download file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

// Find ffmpeg binary
function findFFmpeg() {
  const locations = [
    "ffmpeg",
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
    "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
    path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages")
  ];

  // Try WinGet packages folder
  const wingetPkgs = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
  if (fs.existsSync(wingetPkgs)) {
    const dirs = fs.readdirSync(wingetPkgs).filter(d => d.toLowerCase().includes("ffmpeg"));
    for (const dir of dirs) {
      const binDir = path.join(wingetPkgs, dir);
      const found = findFileRecursive(binDir, "ffmpeg.exe", 3);
      if (found) return found;
    }
  }

  // Try direct command
  try {
    execSync("ffmpeg -version", { stdio: "pipe" });
    return "ffmpeg";
  } catch {}

  for (const loc of locations) {
    if (fs.existsSync(loc)) return loc;
  }

  return null;
}

function findFileRecursive(dir, filename, depth) {
  if (depth <= 0) return null;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.toLowerCase() === filename.toLowerCase()) return fullPath;
      if (entry.isDirectory()) {
        const found = findFileRecursive(fullPath, filename, depth - 1);
        if (found) return found;
      }
    }
  } catch {}
  return null;
}

async function main() {
  console.log("🔍 Finding FFmpeg...");
  const ffmpegPath = findFFmpeg();
  if (!ffmpegPath) {
    console.error("❌ FFmpeg not found. Please install: winget install Gyan.FFmpeg");
    console.error("   Then restart your terminal and run again.");
    process.exit(1);
  }
  console.log(`✅ FFmpeg found: ${ffmpegPath}`);

  // Get all episodes with video URLs
  console.log("📋 Fetching episodes...");
  const { data: episodes, error } = await supabase
    .from("episodes")
    .select("id, title, episode_number, video_url, series_id, duration")
    .eq("status", "published")
    .not("video_url", "is", null)
    .order("series_id")
    .order("episode_number");

  if (error) {
    console.error("❌ Supabase error:", error.message);
    process.exit(1);
  }

  console.log(`📺 Found ${episodes.length} episodes to compress\n`);

  const tmpDir = path.join(__dirname, "tmp_compress");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let compressed = 0;
  let skipped = 0;
  let totalSaved = 0;

  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    const videoUrl = ep.video_url;
    if (!videoUrl) { skipped++; continue; }

    console.log(`[${i + 1}/${episodes.length}] Анги ${ep.episode_number}: ${ep.title}`);

    const inputPath = path.join(tmpDir, `input_${ep.id}.mp4`);
    const outputPath = path.join(tmpDir, `output_${ep.id}.mp4`);

    try {
      // Download
      console.log(`   ⬇️  Татаж байна: ${videoUrl.substring(0, 80)}...`);
      await downloadFile(videoUrl, inputPath);

      const inputSize = fs.statSync(inputPath).size;
      const inputMB = (inputSize / 1024 / 1024).toFixed(1);

      // Skip if already small (< 5MB)
      if (inputSize < 5 * 1024 * 1024) {
        console.log(`   ⏭️  Алгасав (${inputMB}MB — аль хэдийн жижиг)`);
        fs.unlinkSync(inputPath);
        skipped++;
        continue;
      }

      // Compress
      console.log(`   🔄 Шахаж байна (${inputMB}MB)...`);
      const cmd = `"${ffmpegPath}" -i "${inputPath}" -vf "scale=-2:720" -c:v libx264 -preset fast -crf 28 -c:a aac -b:a 96k -movflags +faststart -y "${outputPath}"`;

      execSync(cmd, { stdio: "pipe", timeout: 300000 }); // 5 min timeout per video

      const outputSize = fs.statSync(outputPath).size;
      const outputMB = (outputSize / 1024 / 1024).toFixed(1);
      const saved = inputSize - outputSize;
      const savedMB = (saved / 1024 / 1024).toFixed(1);

      // Only use compressed version if it's actually smaller
      if (outputSize >= inputSize) {
        console.log(`   ⏭️  Алгасав (шахсан нь том: ${outputMB}MB >= ${inputMB}MB)`);
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        skipped++;
        continue;
      }

      console.log(`   ✅ ${inputMB}MB → ${outputMB}MB (${savedMB}MB хэмнэлт)`);
      totalSaved += saved;

      // Get duration from compressed file
      let duration = ep.duration || 0;
      try {
        const probeCmd = `"${ffmpegPath.replace('ffmpeg', 'ffprobe')}" -v error -show_entries format=duration -of csv=p=0 "${outputPath}"`;
        const durationStr = execSync(probeCmd, { stdio: "pipe" }).toString().trim();
        duration = Math.round(parseFloat(durationStr));
      } catch {}

      // Upload compressed version back to R2 via the upload API
      // We need to use the R2 SDK directly or upload via API
      // For now, we'll use the public R2 URL pattern and wrangler

      // Parse the R2 key from the video URL
      const urlParts = new URL(videoUrl);
      const r2Key = urlParts.pathname.replace(/^\//, "");

      console.log(`   ⬆️  R2 руу upload хийж байна (${r2Key})...`);

      // Upload using wrangler r2 object put
      const uploadCmd = `npx wrangler r2 object put "mnreels/${r2Key}" --file="${outputPath}" --content-type="video/mp4"`;
      execSync(uploadCmd, { stdio: "pipe", timeout: 120000, cwd: __dirname });

      // Update duration in database if changed
      if (duration > 0 && duration !== ep.duration) {
        await supabase
          .from("episodes")
          .update({ duration })
          .eq("id", ep.id);
      }

      compressed++;
      console.log(`   ✅ Дууслаа!\n`);

    } catch (err) {
      console.error(`   ❌ Алдаа: ${err.message}\n`);
      skipped++;
    } finally {
      // Cleanup
      try { fs.unlinkSync(inputPath); } catch {}
      try { fs.unlinkSync(outputPath); } catch {}
    }
  }

  // Cleanup tmp dir
  try { fs.rmdirSync(tmpDir); } catch {}

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Дууслаа!`);
  console.log(`   ✅ Шахсан: ${compressed}`);
  console.log(`   ⏭️  Алгассан: ${skipped}`);
  console.log(`   💾 Нийт хэмнэлт: ${(totalSaved / 1024 / 1024 / 1024).toFixed(2)} GB`);
}

main().catch(console.error);
