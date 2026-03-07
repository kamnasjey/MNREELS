import MobileShell from "@/components/MobileShell";
import { SkeletonGrid } from "@/components/SkeletonCard";

export default function SearchLoading() {
  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="sticky top-0 z-30 bg-black/95 px-4 pt-[env(safe-area-inset-top)] pb-2">
          <div className="pt-3">
            <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="flex gap-2 mt-3 pb-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-16 bg-white/5 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="mt-4">
          <SkeletonGrid />
        </div>
      </div>
    </MobileShell>
  );
}
