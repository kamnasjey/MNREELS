"use client";

export function SkeletonBanner() {
  return (
    <div className="px-4 mt-1">
      <div className="aspect-[16/10] rounded-2xl bg-white/5 animate-pulse" />
      <div className="flex justify-center gap-1.5 mt-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonSection() {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-4 mb-2.5">
        <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-28">
            <div className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonHomeFeed() {
  return (
    <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
      <div className="pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="h-6 w-28 bg-white/5 rounded animate-pulse" />
          <div className="w-6 h-6 bg-white/5 rounded-full animate-pulse" />
        </div>
      </div>
      <SkeletonBanner />
      <SkeletonSection />
      <SkeletonSection />
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export function SkeletonSeriesDetail() {
  return (
    <div className="h-dvh w-full overflow-y-auto pb-20">
      <div className="aspect-[16/10] bg-white/5 animate-pulse" />
      <div className="px-4 mt-4 space-y-3">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse mt-4" />
        <div className="space-y-2 mt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="h-dvh w-full overflow-y-auto pb-20">
      <div className="pt-[env(safe-area-inset-top)]">
        <div className="flex flex-col items-center px-4 mt-8">
          <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse" />
          <div className="h-5 w-24 bg-white/5 rounded animate-pulse mt-3" />
          <div className="h-4 w-32 bg-white/5 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-3 gap-0.5 mt-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
