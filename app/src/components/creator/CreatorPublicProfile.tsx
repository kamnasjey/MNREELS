"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Plus, Check, Star, MessageCircle, Send, Loader2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";
import { followCreator, unfollowCreator } from "@/lib/actions/series";
import { getComments, addComment } from "@/lib/actions/posts";

interface CreatorData {
  id: string;
  name: string;
  avatarUrl?: string;
  bio: string;
  followerCount: number;
  seriesCount: number;
}

interface SeriesItem {
  id: string;
  title: string;
  coverUrl?: string;
  category: string;
  episodes: number;
  gradient: string;
}

interface PostItem {
  id: string;
  imageUrl?: string;
  caption: string;
  createdAt: string;
  creatorName: string;
  creatorAvatar?: string;
  commentCount: number;
}

interface Props {
  creator: CreatorData;
  series: SeriesItem[];
  posts: PostItem[];
  initialFollowing: boolean;
  isLoggedIn: boolean;
}

export default function CreatorPublicProfile({ creator, series, posts, initialFollowing, isLoggedIn }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"series" | "posts">("series");

  const handleFollow = useCallback(async () => {
    if (!isLoggedIn) {
      window.location.href = "/auth/login";
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowCreator(creator.id);
        setIsFollowing(false);
      } else {
        await followCreator(creator.id);
        setIsFollowing(true);
      }
    } catch { /* */ }
    setFollowLoading(false);
  }, [creator.id, isFollowing, isLoggedIn]);

  return (
    <MobileShell>
      <div className="h-dvh w-full overflow-y-auto pb-20 hide-scrollbar">
        <div className="pt-[env(safe-area-inset-top)]">
          {/* Header */}
          <div className="flex items-center px-4 pt-3 pb-2">
            <Link href="/search" className="text-white/60"><ArrowLeft size={20} /></Link>
            <h1 className="font-bold text-base ml-3 truncate">{creator.name}</h1>
          </div>

          {/* Profile */}
          <div className="flex flex-col items-center px-4 mt-2">
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold">
                {creator.name.slice(0, 2)}
              </div>
            )}
            <h2 className="font-bold text-lg mt-3">{creator.name}</h2>
            {creator.bio && <p className="text-xs text-white/40 mt-1 text-center max-w-[250px]">{creator.bio}</p>}

            {/* Stats */}
            <div className="flex gap-8 mt-4">
              <div className="text-center">
                <p className="font-bold text-sm">{creator.seriesCount}</p>
                <p className="text-[10px] text-white/40">Цуврал</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">{creator.followerCount}</p>
                <p className="text-[10px] text-white/40">Дагагч</p>
              </div>
            </div>

            {/* Follow button */}
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`mt-4 flex items-center gap-1.5 text-sm font-semibold px-6 py-2.5 rounded-full transition-all ${
                isFollowing ? "bg-white/10 text-white/60" : "bg-white text-black"
              }`}
            >
              {followLoading ? <Loader2 size={14} className="animate-spin" /> : isFollowing ? <Check size={14} /> : <Plus size={14} />}
              {isFollowing ? "Дагсан" : "Дагах"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 mt-6">
            <button onClick={() => setActiveTab("series")} className={`flex-1 py-3 text-sm font-medium relative ${activeTab === "series" ? "text-white" : "text-white/30"}`}>
              Цуврал ({series.length})
              {activeTab === "series" && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />}
            </button>
            <button onClick={() => setActiveTab("posts")} className={`flex-1 py-3 text-sm font-medium relative ${activeTab === "posts" ? "text-white" : "text-white/30"}`}>
              Ниитлэл ({posts.length})
              {activeTab === "posts" && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />}
            </button>
          </div>

          {/* Series grid */}
          {activeTab === "series" && (
            <div className="grid grid-cols-3 gap-1 mt-1 px-1">
              {series.length > 0 ? series.map((s) => (
                <Link key={s.id} href={`/series/${s.id}`}>
                  <div className={`aspect-[3/4] rounded-lg bg-gradient-to-br ${s.gradient} relative overflow-hidden`}>
                    {s.coverUrl && <img src={s.coverUrl} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[10px] font-bold leading-tight">{s.title}</p>
                      <p className="text-[8px] text-white/50 mt-0.5">{s.episodes} анги</p>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-sm text-white/30">Цуврал байхгүй</p>
                </div>
              )}
            </div>
          )}

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="mt-2">
              {posts.length > 0 ? posts.map((post) => (
                <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
              )) : (
                <div className="text-center py-12">
                  <p className="text-sm text-white/30">Ниитлэл байхгүй</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function PostCard({ post, isLoggedIn }: { post: PostItem; isLoggedIn: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: string; content: string; profiles: Record<string, unknown> }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} цаг`;
    return `${Math.floor(hours / 24)} өдөр`;
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await getComments(post.id);
        setComments(data as typeof comments);
      } catch { /* */ }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !isLoggedIn) return;
    setSending(true);
    try {
      const newComment = await addComment(post.id, commentText.trim());
      setComments(prev => [...prev, newComment as typeof prev[0]]);
      setCommentText("");
    } catch { /* */ }
    setSending(false);
  };

  return (
    <div className="border-b border-white/5 pb-3 mb-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-2">
        {post.creatorAvatar ? (
          <img src={post.creatorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-[10px] font-bold">
            {post.creatorName.slice(0, 2)}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold">{post.creatorName}</p>
          <p className="text-[10px] text-white/30">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="w-full aspect-square object-cover" />
      )}

      {/* Caption */}
      {post.caption && (
        <p className="text-sm px-4 mt-2 text-white/80">{post.caption}</p>
      )}

      {/* Actions */}
      <button onClick={handleToggleComments} className="flex items-center gap-1.5 px-4 mt-2 text-white/40 text-xs">
        <MessageCircle size={14} />
        {post.commentCount > 0 ? `${post.commentCount} сэтгэгдэл` : "Сэтгэгдэл"}
      </button>

      {/* Comments */}
      {showComments && (
        <div className="px-4 mt-2">
          {loadingComments ? (
            <Loader2 size={14} className="animate-spin text-white/30 mx-auto my-2" />
          ) : (
            <>
              {comments.map((c) => {
                const prof = c.profiles as Record<string, unknown>;
                return (
                  <div key={c.id} className="flex gap-2 py-1.5">
                    {prof?.avatar_url ? (
                      <img src={String(prof.avatar_url)} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                        {String(prof?.display_name ?? "").slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px]"><span className="font-semibold">{String(prof?.display_name ?? "")}</span> {c.content}</p>
                    </div>
                  </div>
                );
              })}
              {isLoggedIn && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Сэтгэгдэл бичих..."
                    className="flex-1 bg-white/5 rounded-full px-3 py-2 text-xs outline-none"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendComment(); }}
                  />
                  <button onClick={handleSendComment} disabled={sending || !commentText.trim()} className="text-blue-400 disabled:opacity-30">
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
