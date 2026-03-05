"use client";

import { useState, useMemo } from "react";
import { Search, X, Clock, Star } from "lucide-react";
import { mockSeries, mockCreators, categories } from "@/lib/mock-data";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";

const recentSearches = ["Хар шөнө", "Батболд", "Аймшиг"];

export default function SearchPage() {
  const [activeCategory, setActiveCategory] = useState("Бүгд");
  const [searchQuery, setSearchQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filteredSeries = useMemo(() => {
    let results = mockSeries;
    if (activeCategory !== "Бүгд") {
      results = results.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.creator.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [activeCategory, searchQuery]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return mockCreators.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        {/* Search bar */}
        <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-lg px-4 pt-[env(safe-area-inset-top)] pb-2">
          <div className="pt-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Кино, бүтээгч хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                className="w-full bg-white/10 rounded-xl pl-10 pr-10 py-3 text-sm placeholder:text-white/30 outline-none focus:bg-white/15 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state — no search yet */}
        {!isSearching && activeCategory === "Бүгд" ? (
          <div className="px-4 mt-4">
            {/* Recent searches */}
            <div className="mb-6">
              <p className="text-xs text-white/30 font-medium mb-3">Сүүлд хайсан</p>
              <div className="space-y-1">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="w-full flex items-center gap-3 py-2.5 px-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Clock size={14} className="text-white/20" />
                    <span className="text-sm text-white/50">{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* All series grid */}
            <p className="text-xs text-white/30 font-medium mb-3">Бүх цуврал</p>
            <div className="grid grid-cols-3 gap-2">
              {mockSeries.map((series) => (
                <Link key={series.id} href={`/series/${series.id}`}>
                  <div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${series.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
                      <Star size={8} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[8px]">{series.rating}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[10px] font-bold leading-tight">{series.title}</p>
                      <p className="text-[8px] text-white/50 mt-0.5">{series.episodes} анги</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 mt-4">
            {/* Creator results */}
            {filteredCreators.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-white/30 font-medium mb-2">Бүтээгч</p>
                {filteredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${creator.gradient} flex items-center justify-center text-xs font-bold`}>
                      {creator.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{creator.name}</p>
                      <p className="text-[10px] text-white/40">
                        {creator.seriesCount} цуврал • {creator.followers} дагагч
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Series results */}
            {filteredSeries.length > 0 ? (
              <>
                <p className="text-xs text-white/30 font-medium mb-2">
                  {isSearching ? "Хайлтын үр дүн" : activeCategory}
                  <span className="ml-1">({filteredSeries.length})</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {filteredSeries.map((series) => (
                    <Link key={series.id} href={`/series/${series.id}`}>
                      <div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${series.gradient} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
                          <Star size={8} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-[8px]">{series.rating}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-[10px] font-bold leading-tight">{series.title}</p>
                          <p className="text-[8px] text-white/50 mt-0.5">{series.episodes} анги</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center mt-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm text-white/40">Үр дүн олдсонгүй</p>
                <p className="text-xs text-white/20 mt-1">Өөр түлхүүр үгээр хайна уу</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
