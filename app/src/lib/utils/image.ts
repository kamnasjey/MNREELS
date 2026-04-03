/**
 * Image optimization utility
 * Uses Cloudflare Image Resizing for on-the-fly WebP conversion and resize
 * Falls back to original URL if transform not available
 */

// Generate optimized image URL via Cloudflare transform
export function optimizeImageUrl(
  url: string | undefined | null,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "auto";
    fit?: "cover" | "contain" | "scale-down";
  } = {}
): string | undefined {
  if (!url) return undefined;

  const {
    width,
    height,
    quality = 80,
    format = "webp",
    fit = "cover",
  } = options;

  // Build Cloudflare Image Resizing params
  const params: string[] = [`quality=${quality}`, `format=${format}`, `fit=${fit}`];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);

  // If URL is from our R2 CDN or our domain, use Cloudflare transform
  if (url.includes("mnreels.online") || url.includes("r2.dev")) {
    return `/cdn-cgi/image/${params.join(",")}/${url}`;
  }

  // For other URLs (external), return as-is
  return url;
}

// Predefined sizes for common use cases
export const IMAGE_SIZES = {
  // Cover images in cards (small thumbnails)
  thumbnail: { width: 200, height: 267, quality: 75 },
  // Cover in series detail hero
  hero: { width: 800, height: 500, quality: 85 },
  // Avatar
  avatar: { width: 80, height: 80, quality: 80 },
  // Banner on home page
  banner: { width: 600, height: 375, quality: 85 },
  // Full width cover
  full: { width: 1200, quality: 85 },
} as const;

// Helper: get srcSet for responsive images
export function getImageSrcSet(
  url: string | undefined | null,
  widths: number[] = [200, 400, 800]
): string | undefined {
  if (!url) return undefined;
  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
}
