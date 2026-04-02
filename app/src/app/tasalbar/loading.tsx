export default function Loading() {
  return (
    <div className="h-dvh bg-black text-white">
      <div className="pt-[env(safe-area-inset-top)] px-4 pt-4">
        <div className="h-7 w-24 bg-white/10 rounded-lg animate-pulse mb-4" />
        <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 mb-4">
          <div className="h-10 w-20 bg-yellow-500/10 rounded animate-pulse mx-auto mb-2" />
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse mx-auto" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
