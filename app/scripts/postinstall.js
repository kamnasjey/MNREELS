/**
 * Postinstall script: npm ci хийсний дараа node_modules дотор
 * Windows-д шаардлагатай patch-уудыг автоматаар хийнэ.
 *
 * 1) copyTracedFiles.js — symlink EPERM үед файлыг хуулдаг болгоно
 * 2) @vercel/og index.edge.js — WASM import дээрх ?module suffix-ийг устгана
 */

const fs = require("fs");
const path = require("path");

const isWindows = process.platform === "win32";

// ── Patch 1: copyTracedFiles.js (symlink → copy fallback on Windows) ──
function patchCopyTracedFiles() {
  const file = path.join(
    __dirname,
    "..",
    "node_modules",
    "@opennextjs",
    "aws",
    "dist",
    "build",
    "copyTracedFiles.js"
  );
  if (!fs.existsSync(file)) return;

  let src = fs.readFileSync(file, "utf8");

  // Already patched?
  if (src.includes("EPERM")) return;

  // Find the catch block after symlinkSync and inject EPERM fallback
  const oldCatch = `catch (e) {
                if (e.code === "EEXIST") {
                    // already exists, skip
                }
                else {
                    throw e;
                }`;

  const newCatch = `catch (e) {
                if (e.code === "EEXIST") {
                    // already exists, skip
                }
                else if (e.code === "EPERM") {
                    // Windows: symlinks not allowed, copy instead
                    try {
                        const resolvedFrom = require("path").resolve(require("path").dirname(from), symlink);
                        const { cpSync, statSync } = require("fs");
                        if (statSync(resolvedFrom).isDirectory()) {
                            cpSync(resolvedFrom, to, { recursive: true });
                        } else {
                            copyFileAndMakeOwnerWritable(resolvedFrom, to);
                        }
                    } catch (copyErr) {
                        logger.debug("Error copying symlink target:", copyErr);
                    }
                }
                else {
                    throw e;
                }`;

  if (!src.includes(oldCatch)) {
    console.log("[postinstall] copyTracedFiles.js: already patched or pattern changed, skipping");
    return;
  }

  src = src.replace(oldCatch, newCatch);
  fs.writeFileSync(file, src, "utf8");
  console.log("[postinstall] Patched copyTracedFiles.js (symlink EPERM fallback)");
}

// ── Patch 2: @vercel/og index.edge.js (remove ?module from WASM imports) ──
function patchVercelOg() {
  const file = path.join(
    __dirname,
    "..",
    "node_modules",
    "next",
    "dist",
    "compiled",
    "@vercel",
    "og",
    "index.edge.js"
  );
  if (!fs.existsSync(file)) return;

  let src = fs.readFileSync(file, "utf8");

  let changed = false;
  if (src.includes('"./resvg.wasm?module"')) {
    src = src.replace('"./resvg.wasm?module"', '"./resvg.wasm"');
    changed = true;
  }
  if (src.includes('"./yoga.wasm?module"')) {
    src = src.replace('"./yoga.wasm?module"', '"./yoga.wasm"');
    changed = true;
  }

  if (!changed) {
    console.log("[postinstall] index.edge.js: already patched or pattern changed, skipping");
    return;
  }

  fs.writeFileSync(file, src, "utf8");
  console.log("[postinstall] Patched @vercel/og index.edge.js (removed ?module from WASM imports)");
}

// ── Run ──
if (isWindows) {
  console.log("[postinstall] Windows detected, applying patches...");
  patchCopyTracedFiles();
  patchVercelOg();
} else {
  console.log("[postinstall] Not Windows, skipping patches");
}
