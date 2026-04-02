export default function Loading() {
  return (
    <div className="h-dvh bg-black text-white">
      <div className="pt-[env(safe-area-inset-top)] px-4 pt-4">
        <div className="h-7 w-20 bg-white/10 rounded-lg animate-pulse mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-40 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
