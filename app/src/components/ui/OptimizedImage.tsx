"use client";

import { optimizeImageUrl, IMAGE_SIZES, getImageSrcSet } from "@/lib/utils/image";

type SizePreset = keyof typeof IMAGE_SIZES;

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  size?: SizePreset;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  size,
  width,
  height,
  className = "",
  loading = "lazy",
  priority = false,
}: OptimizedImageProps) {
  if (!src) return null;

  const sizeConfig = size ? IMAGE_SIZES[size] : { width, height, quality: 80 };
  const optimizedSrc = optimizeImageUrl(src, sizeConfig);
  const srcSet = getImageSrcSet(src, [
    (sizeConfig.width ?? 400) / 2,
    sizeConfig.width ?? 400,
    (sizeConfig.width ?? 400) * 1.5,
  ]);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={`${sizeConfig.width ?? 400}px`}
      alt={alt}
      width={sizeConfig.width}
      height={"height" in sizeConfig ? sizeConfig.height : undefined}
      className={className}
      loading={priority ? "eager" : loading}
      decoding="async"
    />
  );
}
