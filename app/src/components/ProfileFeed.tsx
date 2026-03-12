"use client";

import { useState, useRef, useCallback } from "react";
import { Settings, Edit3, Eye, Users, LogOut, ChevronRight, Ticket, Film, Shield, X, Check, Loader2, Camera, Play, Package, Clock, ArrowDownLeft, ArrowUpRight, Copy, CheckCircle, XCircle } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { updateDisplayName, updateAvatar } from "@/lib/actions/profile";
import { createManualPurchase } from "@/lib/actions/tasalbar";

interface SeriesItem {
  id: string;
  title: string;
  creator: string;
  episodes: number;
  category: string;
  rating: number;
  gradient: string;
  watchedEpisodes?: number;
  coverUrl?: string;
}

interface CreatorItem {
  id: string;
  name: string;
  avatar: string;
  seriesCount: number;
  gradient: string;
}

interface ContinueWatchingItem {
  episodeId: string;
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  progress: number;
  gradient: string;
  coverUrl?: string;
}

interface BundlePurchase {
  seriesId: string;
  seriesTitle: string;
  coverUrl?: string;
  expiresAt: string;
  gradient: string;
}

interface TasalbarTransaction {
  id: string;
  type: string;
  amount: number;
  desc: string;
  time: string;
}

interface TasalbarPurchaseItem {
  id: string;
  tasalbar_amount: number;
  tugrug_amount: number;
  status: string;
  created_at: string;
}

interface TasalbarData {
  balance: number;
  transactions: TasalbarTransaction[];
  purchases: TasalbarPurchaseItem[];
  paymentId: number | null;
}

interface CreatorStats {
  totalEarnings: number;
  totalViews: number;
  seriesCount: number;
}

interface UserProfile {
  username: string;
  displayName: string;
  avatarInitial: string;
  avatarUrl?: string;
  bio: string;
  followingCount: number;
  isCreator?: boolean;
  isAdmin?: boolean;
  creatorStats?: CreatorStats;
}

interface ProfileFeedProps {
  user: UserProfile;
  watchedSeries: SeriesItem[];
  followedCreators: CreatorItem[];
  followedSeries: SeriesItem[];
  continueWatching: ContinueWatchingItem[];
  bundlePurchases: BundlePurchase[];
  tasalbar: TasalbarData;
  isLoggedIn: boolean;
}

// Bank details for tasalbar purchase
const BANK_NAME = "Хаан банк";
const BANK_ACCOUNT = "5013221055";
const BANK_ACCOUNT_NAME = "Зоригт Ариунжаргал";
const BANK_IBAN = "85000500";
const PRICE_PER_TASALBAR = 50;
const MIN_TASALBAR = 100;

const tabs = ["Үзсэн", "Дагсан", "Тасалбар"];

export default function ProfileFeed({
  user,
  watchedSeries,
  followedCreators,
  followedSeries,
  continueWatching,
  bundlePurchases,
  tasalbar,
  isLoggedIn,
}: ProfileFeedProps) {
  const [activeTab, setActiveTab] = useState("Үзсэн");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user.displayName);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tasalbar state
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<{ id: string; name: string; amount: number; priceMNT: number } | null>(null);
  const [tasalbarLoading, setTasalbarLoading] = useState(false);
  const [tasalbarError, setTasalbarError] = useState<string | null>(null);
  const [tasalbarSuccess, setTasalbarSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const result = await updateDisplayName(newName.trim());
    if (result.success) {
      setDisplayName(newName.trim());
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { presignedUrl, publicUrl } = await res.json();
      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      // Save to DB after R2 upload succeeds
      await updateAvatar(publicUrl);
      setAvatarUrl(publicUrl);
    } catch {
      alert("Зураг оруулахад алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleCustomBuy = useCallback(() => {
    const num = parseInt(customAmount);
    if (!num || num < MIN_TASALBAR) return;
    setSelectedPurchase({ id: `custom-${num}`, name: `${num} тасалбар`, amount: num, priceMNT: num * PRICE_PER_TASALBAR });
    setTasalbarError(null);
    setTasalbarSuccess(false);
  }, [customAmount]);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleSubmitPurchase = useCallback(async () => {
    if (!selectedPurchase) return;
    setTasalbarLoading(true);
    setTasalbarError(null);
    try {
      const result = await createManualPurchase(selectedPurchase.id, selectedPurchase.amount, selectedPurchase.priceMNT);
      if (!result.success) {
        setTasalbarError(result.error || "Алдаа гарлаа");
      } else {
        setTasalbarSuccess(true);
      }
    } catch {
      setTasalbarError("Алдаа гарлаа");
    } finally {
      setTasalbarLoading(false);
    }
  }, [selectedPurchase]);

  const customNum = parseInt(customAmount) || 0;
  const customPrice = customNum * PRICE_PER_TASALBAR;

  if (!isLoggedIn) {
    return (
      <MobileShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-8">
          <p className="text-4xl mb-4">👤</p>
          <p className="text-sm text-white/50 text-center mb-4">Профайл харахын тулд нэвтэрнэ үү</p>
          <Link href="/auth/login" className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl">Нэвтрэх</Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Settings size={22} className="text-white/60" />
            {!editing ? (
              <button onClick={() => { setEditing(true); setNewName(displayName); }} className="flex items-center gap-1.5 text-sm text-white/60">
                <Edit3 size={14} /> Нэр засах
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(false)} className="text-white/40 p-1"><X size={16} /></button>
                <button onClick={handleSaveName} disabled={saving || !newName.trim()} className="flex items-center gap-1 text-sm text-green-400 disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Хадгалах
                </button>
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="flex flex-col items-center px-4 mt-2">
            <button onClick={() => fileInputRef.current?.click()} className="relative" disabled={uploading}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                  {user.avatarInitial}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

            {editing ? (
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={50} autoFocus
                className="mt-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center text-lg font-bold outline-none focus:border-purple-500 w-full max-w-[200px]"
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
              />
            ) : (
              <h2 className="font-bold text-lg mt-3">{displayName || `@${user.username}`}</h2>
            )}
            <p className="text-xs text-white/30 mt-0.5">@{user.username}</p>
            {user.bio && <p className="text-sm text-white/40 mt-1 text-center">{user.bio}</p>}

            <div className="mt-4 bg-white/5 rounded-xl px-6 py-3">
              <div className="text-center">
                <p className="font-bold text-lg">{user.followingCount}</p>
                <p className="text-[11px] text-white/40">Дагсан</p>
              </div>
            </div>
          </div>

          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-1.5 px-4 mb-2">
                <Play size={12} className="text-red-400" />
                <p className="text-xs font-semibold text-white/60">Үргэлжлүүлэх</p>
              </div>
              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {continueWatching.map((item) => (
                  <Link key={item.episodeId} href={`/watch/${item.episodeId}`} className="flex-shrink-0 w-36">
                    <div className={`aspect-video rounded-xl bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
                      {item.coverUrl && <img src={item.coverUrl} alt={item.seriesTitle} className="absolute inset-0 w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[10px] font-bold leading-tight">{item.seriesTitle}</p>
                        <p className="text-[8px] text-white/50 mt-0.5">Анги {item.episodeNumber}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(item.progress, 100)}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Active Bundle Purchases */}
          {bundlePurchases.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 px-4 mb-2">
                <Package size={12} className="text-yellow-400" />
                <p className="text-xs font-semibold text-white/60">Багцаар нээсэн</p>
              </div>
              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {bundlePurchases.map((bp) => (
                  <Link key={bp.seriesId} href={`/series/${bp.seriesId}`} className="flex-shrink-0 w-28">
                    <div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${bp.gradient} relative overflow-hidden`}>
                      {bp.coverUrl && <img src={bp.coverUrl} alt={bp.seriesTitle} className="absolute inset-0 w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[10px] font-bold leading-tight">{bp.seriesTitle}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={8} className="text-yellow-400" />
                          <p className="text-[8px] text-yellow-400">{Math.max(0, Math.round((new Date(bp.expiresAt).getTime() - Date.now()) / 3600000))} цаг</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-white/10 mt-6">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab ? "text-white" : "text-white/30"}`}>
                <div className="flex items-center justify-center gap-1.5">
                  {tab === "Үзсэн" && <Eye size={14} />}
                  {tab === "Дагсан" && <Users size={14} />}
                  {tab === "Тасалбар" && <Ticket size={14} />}
                  {tab}
                </div>
                {activeTab === tab && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />}
              </button>
            ))}
          </div>

          {/* Үзсэн tab */}
          {activeTab === "Үзсэн" && (
            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
              {watchedSeries.length > 0 ? watchedSeries.map((series) => (
                <Link key={series.id} href={`/series/${series.id}`}>
                  <div className={`aspect-[3/4] bg-gradient-to-br ${series.gradient} relative`}>
                    {series.coverUrl && <img src={series.coverUrl} alt={series.title} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="font-bold text-[10px] leading-tight">{series.title}</p>
                      <p className="text-[9px] text-white/50">{series.episodes} анги</p>
                    </div>
                    {series.watchedEpisodes !== undefined && (
                      <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-full px-1.5 py-0.5">
                        <span className="text-[8px] text-white/70">{series.watchedEpisodes}/{series.episodes}</span>
                      </div>
                    )}
                  </div>
                </Link>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-3xl mb-2">🎬</p>
                  <p className="text-sm text-white/30">Одоогоор юу ч үзээгүй</p>
                </div>
              )}
            </div>
          )}

          {/* Дагсан tab */}
          {activeTab === "Дагсан" && (
            <div className="px-4 mt-3 space-y-2">
              {followedCreators.length > 0 ? (
                <>
                  {followedCreators.map((creator) => (
                    <Link key={creator.id} href={`/creator-profile/${creator.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${creator.gradient} flex items-center justify-center text-sm font-bold`}>{creator.avatar}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{creator.name}</p>
                        <p className="text-[11px] text-white/40">{creator.seriesCount} цуврал</p>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </Link>
                  ))}
                  {followedSeries.length > 0 && (
                    <>
                      <p className="text-xs text-white/30 mt-4 mb-2 font-medium">Цуврал</p>
                      {followedSeries.map((series) => (
                        <Link key={series.id} href={`/series/${series.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                          <div className={`w-11 h-14 rounded-lg bg-gradient-to-br ${series.gradient} relative overflow-hidden`}>
                            {series.coverUrl && <img src={series.coverUrl} alt={series.title} className="absolute inset-0 w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{series.title}</p>
                            <p className="text-[11px] text-white/40">{series.episodes} анги • {series.creator}</p>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-sm text-white/30">Хэнийг ч дагаагүй</p>
                </div>
              )}
            </div>
          )}

          {/* Тасалбар tab */}
          {activeTab === "Тасалбар" && (
            <div className="px-4 mt-3">
              {/* Balance card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Ticket size={18} className="text-yellow-400" />
                  <span className="text-xs text-white/50">Үлдэгдэл</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-yellow-400">{tasalbar.balance}</span>
                  <span className="text-sm text-white/40">тасалбар</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-white/30">{(tasalbar.balance * PRICE_PER_TASALBAR).toLocaleString()}₮</p>
                  {tasalbar.paymentId && <p className="text-[10px] text-white/30">ID: <span className="text-white/50 font-mono">{tasalbar.paymentId}</span></p>}
                </div>
              </div>

              {tasalbarError && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">{tasalbarError}</p>
                </div>
              )}

              {/* Buy tasalbar */}
              <div className="mt-4">
                <h3 className="font-bold text-sm mb-2">Тасалбар худалдаж авах</h3>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-white/40 mb-2">Хэдэн тасалбар авах вэ? <span className="text-white/25">(доод хэмжээ {MIN_TASALBAR})</span></p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`${MIN_TASALBAR}-с дээш`}
                      min={MIN_TASALBAR}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-yellow-500/50 placeholder:text-white/20"
                    />
                    <button onClick={handleCustomBuy} disabled={customNum < MIN_TASALBAR} className="bg-yellow-500 text-black font-bold text-xs px-4 py-2.5 rounded-xl disabled:opacity-30 shrink-0">
                      Авах
                    </button>
                  </div>
                  {customNum > 0 && customNum < MIN_TASALBAR && (
                    <p className="text-[10px] text-red-400/70 mt-2">Доод хэмжээ {MIN_TASALBAR} тасалбар</p>
                  )}
                  {customNum >= MIN_TASALBAR && (
                    <p className="text-[10px] text-white/40 mt-2">= <span className="text-yellow-400 font-bold">{customPrice.toLocaleString()}₮</span> <span className="text-white/20">(1 тасалбар = {PRICE_PER_TASALBAR}₮)</span></p>
                  )}
                </div>
              </div>

              {/* Pending purchases */}
              {tasalbar.purchases.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold text-sm mb-2">Миний хүсэлтүүд</h3>
                  <div className="space-y-1.5">
                    {tasalbar.purchases.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        {p.status === "pending" && <Clock size={14} className="text-yellow-400 shrink-0" />}
                        {p.status === "approved" && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                        {p.status === "rejected" && <XCircle size={14} className="text-red-400 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs">{p.tasalbar_amount} тасалбар • {p.tugrug_amount.toLocaleString()}₮</p>
                          <p className="text-[9px] text-white/30">{p.status === "pending" ? "Хүлээгдэж байна" : p.status === "approved" ? "Төлөгдсөн" : "Татгалзсан"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction history */}
              <div className="mt-4 pb-4">
                <h3 className="font-bold text-sm mb-2">Гүйлгээний түүх</h3>
                {tasalbar.transactions.length > 0 ? (
                  <div className="space-y-1">
                    {tasalbar.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${tx.type === "buy" || tx.type === "earn" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                          {tx.type === "buy" || tx.type === "earn" ? <ArrowDownLeft size={14} className="text-green-400" /> : <ArrowUpRight size={14} className="text-red-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{tx.desc}</p>
                          <p className="text-[10px] text-white/30">{tx.time}</p>
                        </div>
                        <span className={`font-semibold text-xs ${tx.type === "buy" || tx.type === "earn" ? "text-green-400" : "text-red-400"}`}>
                          {tx.type === "buy" || tx.type === "earn" ? "+" : ""}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-white/30">Гүйлгээ байхгүй</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank Transfer Payment Modal */}
          {selectedPurchase && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl w-full max-w-sm sm:mx-6 relative max-h-[90dvh] overflow-y-auto">
                <div className="sticky top-0 bg-zinc-900 z-10 p-4 pb-0 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Төлбөр төлөх</h3>
                  <button onClick={() => { setSelectedPurchase(null); setTasalbarSuccess(false); }} className="text-white/40 hover:text-white p-1"><X size={20} /></button>
                </div>
                <div className="p-4">
                  {tasalbarSuccess ? (
                    <div className="text-center py-6">
                      <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                      <h4 className="font-bold text-lg">Хүсэлт илгээгдлээ!</h4>
                      <p className="text-sm text-white/50 mt-2">Банкны шилжүүлэг хийсний дараа админ баталгаажуулахад таны тасалбар орно.</p>
                      <button onClick={() => { setSelectedPurchase(null); setTasalbarSuccess(false); window.location.reload(); }} className="mt-4 bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl">Ойлголоо</button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{selectedPurchase.name}</p>
                            <p className="text-xs text-white/40 mt-0.5">{selectedPurchase.amount} тасалбар</p>
                          </div>
                          <span className="font-black text-lg text-yellow-400">{selectedPurchase.priceMNT.toLocaleString()}₮</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Дансны мэдээлэл</p>
                        <div className="p-3 rounded-xl bg-white/5 space-y-2.5">
                          <div><p className="text-[10px] text-white/30">Банк</p><p className="text-sm font-medium">{BANK_NAME}</p></div>
                          <div className="flex items-center justify-between">
                            <div><p className="text-[10px] text-white/30">Дансны дугаар</p><p className="text-sm font-mono font-medium">{BANK_ACCOUNT}</p></div>
                            <button onClick={() => handleCopy(BANK_ACCOUNT, "account")} className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5">
                              {copiedField === "account" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div><p className="text-[10px] text-white/30">Дансны нэр</p><p className="text-sm font-medium">{BANK_ACCOUNT_NAME}</p></div>
                            <button onClick={() => handleCopy(BANK_ACCOUNT_NAME, "name")} className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5">
                              {copiedField === "name" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                          {BANK_IBAN && (
                            <div className="flex items-center justify-between">
                              <div><p className="text-[10px] text-white/30">IBAN</p><p className="text-sm font-mono font-medium">{BANK_IBAN}</p></div>
                              <button onClick={() => handleCopy(BANK_IBAN, "iban")} className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5">
                                {copiedField === "iban" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <p className="text-[10px] text-white/30 mb-1">Гүйлгээний утга (заавал бичнэ!)</p>
                          <div className="flex items-center justify-between">
                            <p className="text-base font-mono font-bold text-purple-300">{tasalbar.paymentId} {selectedPurchase.amount}</p>
                            <button onClick={() => handleCopy(`${tasalbar.paymentId} ${selectedPurchase.amount}`, "desc")} className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5">
                              {copiedField === "desc" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="text-[10px] text-white/40 mt-1">Таны ID: {tasalbar.paymentId} • Тасалбар: {selectedPurchase.amount}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5">
                          <p className="text-[10px] text-white/30 mb-1">Шилжүүлэх дүн</p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold">{selectedPurchase.priceMNT.toLocaleString()}₮</p>
                            <button onClick={() => handleCopy(String(selectedPurchase.priceMNT), "amount")} className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5">
                              {copiedField === "amount" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <button onClick={handleSubmitPurchase} disabled={tasalbarLoading} className="w-full mt-4 bg-yellow-500 text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                        {tasalbarLoading ? <Loader2 size={16} className="animate-spin" /> : <><Ticket size={16} />Шилжүүлэг хийсэн, хүсэлт илгээх</>}
                      </button>
                      <p className="text-[10px] text-white/30 text-center mt-2">Шилжүүлэг хийсний дараа дарна уу. Админ шалгаад тасалбар олгоно.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Creator stats */}
          {user.isCreator && user.creatorStats && (
            <div className="px-4 mt-4">
              <Link href="/creator" className="block bg-gradient-to-br from-purple-500/15 to-indigo-500/10 rounded-xl p-4 border border-purple-500/20">
                <p className="text-xs text-white/40 mb-2">Бүтээгчийн самбар</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center"><Ticket size={14} className="text-purple-400 mx-auto mb-1" /><p className="text-sm font-bold">{user.creatorStats.totalEarnings.toLocaleString()}</p><p className="text-[9px] text-white/40">Орлого</p></div>
                  <div className="text-center"><Eye size={14} className="text-blue-400 mx-auto mb-1" /><p className="text-sm font-bold">{user.creatorStats.totalViews.toLocaleString()}</p><p className="text-[9px] text-white/40">Үзэлт</p></div>
                  <div className="text-center"><Film size={14} className="text-green-400 mx-auto mb-1" /><p className="text-sm font-bold">{user.creatorStats.seriesCount}</p><p className="text-[9px] text-white/40">Цуврал</p></div>
                </div>
                <p className="text-[11px] text-purple-300 text-center mt-2">Самбар руу очих →</p>
              </Link>
            </div>
          )}

          {/* Menu items */}
          <div className="px-4 mt-6 space-y-1 pb-4">
            {user.isCreator ? (
              <Link href="/creator" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div><p className="text-sm font-medium text-left">Бүтээгчийн самбар</p><p className="text-[11px] text-white/30">Контент удирдах, орлого</p></div>
                <ChevronRight size={18} className="text-white/20" />
              </Link>
            ) : (
              <Link href="/creator/register" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div><p className="text-sm font-medium text-left">Бүтээгч болох</p><p className="text-[11px] text-white/30">Кино оруулж орлого олох</p></div>
                <ChevronRight size={18} className="text-white/20" />
              </Link>
            )}
            {user.isAdmin && (
              <Link href="/admin" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-yellow-400" />
                  <div><p className="text-sm font-medium text-left">Админ самбар</p><p className="text-[11px] text-white/30">Модераци, хэрэглэгчид</p></div>
                </div>
                <ChevronRight size={18} className="text-white/20" />
              </Link>
            )}
            <button
              onClick={async () => {
                const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                await supabase.auth.signOut();
                window.location.href = "/auth/login";
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors mt-2"
            >
              <LogOut size={18} className="text-red-400" />
              <span className="text-sm text-red-400">Гарах</span>
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
