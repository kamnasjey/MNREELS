"use client";

import { useState } from "react";
import { ArrowLeft, Image, ChevronDown } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";
import { categories } from "@/lib/mock-data";

export default function NewSeriesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [ageRating, setAgeRating] = useState("Бүгд");

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Link href="/creator" className="text-white/60">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-base">Шинэ цуврал</h1>
            <div className="w-5" />
          </div>

          <div className="px-4 mt-4 space-y-5">
            {/* Cover image */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Cover зураг</p>
              <div className="aspect-video rounded-xl bg-white/5 border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
                <Image size={32} className="text-white/20" />
                <p className="text-xs text-white/30">Зураг оруулах</p>
                <p className="text-[10px] text-white/20">16:9 хэмжээ, 2MB хүртэл</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Цувралын нэр</p>
              <input
                type="text"
                placeholder="Жишээ: Хар шөнө"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Тайлбар</p>
              <textarea
                placeholder="Цувралын тухай товч тайлбар..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 outline-none focus:border-white/30 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Ангилал</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== "Бүгд").map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-xs font-medium px-3.5 py-2 rounded-full transition-all ${
                      category === cat
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Age rating */}
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Насны зэрэглэл</p>
              <div className="flex gap-2">
                {["Бүгд", "13+", "16+", "18+"].map((age) => (
                  <button
                    key={age}
                    onClick={() => setAgeRating(age)}
                    className={`flex-1 text-xs font-medium py-2.5 rounded-xl transition-all ${
                      ageRating === age
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                title && category
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Цуврал үүсгэх
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
