"use client";

import { useState, useRef, useCallback } from "react";
import { Settings, Edit3, X, Check, Loader2, Camera } from "lucide-react";
import { updateDisplayName, updateAvatar } from "@/lib/actions/profile";
import type { UserProfile } from "./types";

interface ProfileHeaderProps {
  user: UserProfile;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user.displayName);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Avatar upload алдаа");

      const { publicUrl } = await res.json();
      await updateAvatar(publicUrl);
      setAvatarUrl(publicUrl);
    } catch {
      alert("Зураг оруулахад алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <>
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
            <img src={avatarUrl} alt="" loading="lazy" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
              {user.avatarInitial}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </div>
          {(user.loginStreak ?? 0) >= 2 && (
            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[24px] text-center shadow-lg">
              🔥{user.loginStreak}
            </div>
          )}
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
    </>
  );
}
