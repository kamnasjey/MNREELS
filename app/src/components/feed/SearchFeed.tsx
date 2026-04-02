"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, X, Star, Clock, Trash2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";

interface SeriesItem {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  episodes: number;
  category: string;
  rating: number;
  gradient: string;
  coverUrl?: string;
}

interface CreatorItem {
  id: string;
  name: string;
  avatar: string;
  seriesCount: number;
  gradient: string;
}

interface SearchFeedProps {
  seriesList: SeriesItem[];
  creatorsList: CreatorItem[];
  categories: string[];
}

const SEARCH_HISTORY_KEY = "mnreels_search_history";
const MAX_HISTORY = 10;

function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  } catch { return []; }
}

function saveSearchHistory(history: string[]) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch { /* */ }
}

export default function SearchFeed({ seriesList, creatorsList, categories }: SearchFeedProps) {
  const [activeCategory, setActiveCategory] = useState("Бүгд");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
    setSearchHistory(updated);
    saveSearchHistory(updated);
  }, [searchHistory]);

  const removeFromHistory = useCallback((query: string) => {
    const updated = searchHistory.filter(h => h !== query);
    setSearchHistory(updated);
    saveSearchHistory(updated);
  }, [searchHistory]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
  }, []);

  const filteredSeries = useMemo(() => {
    let results = seriesList;
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
  }, [activeCategory, searchQuery, seriesList]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return creatorsList.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchQuery, creatorsList]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-lg px-4 pt-[env(safe-area-inset-top)] pb-2">
          <div className="pt-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Цуврал, бүтээгч хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) { addToHistory(searchQuery); setShowHistory(false); } }}
                className="w-full bg-white/10 rounded-xl pl-10 pr-10 py-3 text-sm placeholder:text-white/30 outline-none focus:bg-white/15 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowHistory(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Search History */}
          {showHistory && !searchQuery && searchHistory.length > 0 && (
            <div className="mt-2 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <p className="text-[10px] text-white/30 font-medium">Сүүлд хайсан</p>
                <button onClick={clearHistory} className="text-[10px] text-red-400/60">Устгах</button>
              </div>
              {searchHistory.map((h) => (
                <div key={h} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5">
                  <Clock size={12} className="text-white/20 shrink-0" />
                  <button
                    className="flex-1 text-left text-xs text-white/60 truncate"
                    onMouseDown={() => { setSearchQuery(h); setShowHistory(false); }}
                  >
                    {h}
                  </button>
                  <button onMouseDown={() => removeFromHistory(h)} className="text-white/20 shrink-0"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat ? "bg-white text-black" : "bg-white/10 text-white/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {!isSearching && activeCategory === "Бүгд" ? (
          <div className="px-4 mt-4">
            <p className="text-xs text-white/30 font-medium mb-3">Бүх цуврал</p>
            <div className="grid grid-cols-3 gap-2">
              {seriesList.map((series) => (
                <SeriesGridCard key={series.id} series={series} />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 mt-4">
            {filteredCreators.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-white/30 font-medium mb-2">Бүтээгч</p>
                {filteredCreators.map((creator) => (
                  <Link key={creator.id} href={`/creator-profile/${creator.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${creator.gradient} flex items-center justify-center text-xs font-bold`}>
                      {creator.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{creator.name}</p>
                      <p className="text-[10px] text-white/40">{creator.seriesCount} цуврал</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filteredSeries.length > 0 ? (
              <>
                <p className="text-xs text-white/30 font-medium mb-2">
                  {isSearching ? "Хайлтын үр дүн" : activeCategory}
                  <span className="ml-1">({filteredSeries.length})</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {filteredSeries.map((series) => (
                    <SeriesGridCard key={series.id} series={series} />
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

function SeriesGridCard({ series }: { series: SeriesItem }) {
  return (
    <Link href={`/series/${series.id}`}>
      <div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${series.gradient} relative overflow-hidden`}>
        {series.coverUrl && <img src={series.coverUrl} alt={series.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {series.rating > 0 && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
            <Star size={8} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[8px]">{series.rating}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-[10px] font-bold leading-tight">{series.title}</p>
          {series.episodes > 0 && <p className="text-[8px] text-white/50 mt-0.5">{series.episodes} анги</p>}
        </div>
      </div>
    </Link>
  );
}
