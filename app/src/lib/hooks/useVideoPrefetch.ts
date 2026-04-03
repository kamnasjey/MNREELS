"use client";

import { useEffect, useRef } from "react";

/**
 * Prefetches the next video URL in the background using link preload.
 * This tells the browser to start downloading the video before the user swipes.
 * Much more efficient than creating a hidden <video> element.
 */
export function useVideoPrefetch(urls: string[]) {
  const prefetched = useRef(new Set<string>());

  useEffect(() => {
    // Clean up old prefetch links
    return () => {
      document.querySelectorAll('link[data-prefetch="mnreels"]').forEach(el => el.remove());
    };
  }, []);

  useEffect(() => {
    for (const url of urls) {
      if (!url || prefetched.current.has(url)) continue;
      prefetched.current.add(url);

      // Use <link rel="prefetch"> — low priority background download
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = url;
      link.dataset.prefetch = "mnreels";
      document.head.appendChild(link);
    }
  }, [urls]);
}
