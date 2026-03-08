"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Image, Check, Loader2 } from "lucide-react";
import CreatorShell from "@/components/CreatorShell";
import Link from "next/link";
import { createSeries } from "@/lib/actions/series";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Уран сайхан", "Романтик", "Комеди", "Аймшиг", "Адал явдал", "Гэмт хэрэг", "Түүх"];

export default function NewSeriesPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [ageRating, setAgeRating] = useState("Бүгд");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("Cover зураг 2MB-аас бага байх ёстой");
      return;
    }
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async () => {
    if (!title || !category || saving) return;
    setSaving(true);
    setError("");

    try {
      let coverUrl: string | undefined;

      // Upload cover if selected
      if (coverFile) {
        const res = await fetch("/api/upload/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: coverFile.name,
            contentType: coverFile.type,
            seriesId: "new",
          }),
        });

        if (!res.ok) throw new Error("Cover upload алдаа");

        const { presignedUrl, publicUrl } = await res.json();

        // Upload to R2
        await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": coverFile.type },
          body: coverFile,
        });

        coverUrl = publicUrl;
      }

      // Create series in Supabase
      await createSeries({
        title,
        description,
        category,
        ageRating,
        coverUrl,
      });

      router.push("/creator");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      setSaving(false);
    }
  };

  const canSubmit = title && category && !saving;

  return (
    <CreatorShell>
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
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverSelect}
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-video rounded-xl bg-white/5 border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors overflow-hidden relative"
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-medium">Дарж солих</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Image size={32} className="text-white/20" />
                    <p className="text-xs text-white/30">Зураг оруулах</p>
                    <p className="text-[10px] text-white/20">16:9 хэмжээ, 2MB хүртэл</p>
                  </>
                )}
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
                {CATEGORIES.map((cat) => (
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

            {/* Error */}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                canSubmit
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Цуврал үүсгэх"}
            </button>
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
