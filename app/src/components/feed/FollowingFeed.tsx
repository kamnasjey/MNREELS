"use client";

import { useState, useCallback, useRef } from "react";
import { MessageCircle, Send, Loader2, ImagePlus, X, Trash2 } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getComments, addComment, createPost, deletePost } from "@/lib/actions/posts";

interface PostItem {
  id: string;
  creatorId: string;
  imageUrl?: string;
  caption: string;
  createdAt: string;
  creatorName: string;
  creatorAvatar?: string;
  commentCount: number;
}

interface Props {
  posts: PostItem[];
  myPosts?: PostItem[];
  isLoggedIn: boolean;
  isCreator: boolean;
  currentUserId?: string;
}

export default function FollowingFeed({ posts: initialPosts, myPosts: initialMyPosts = [], isLoggedIn, isCreator, currentUserId }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [myPosts, setMyPosts] = useState(initialMyPosts);
  const [tab, setTab] = useState<"following" | "mine">("following");
  const [showCreate, setShowCreate] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreatePost = useCallback(async () => {
    if (!caption.trim() && !imageFile) return;
    setCreating(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        // Upload image via cover upload API
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("seriesId", "posts");

        const res = await fetch("/api/upload/cover", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Зураг upload алдаа");

        const { publicUrl } = await res.json();
        imageUrl = publicUrl;
      }

      await createPost(imageUrl, caption.trim());
      setCaption("");
      setImageFile(null);
      setImagePreview(null);
      setShowCreate(false);
      // Refresh server data without full page reload
      router.refresh();
    } catch {
      alert("Ниитлэхэд алдаа гарлаа");
    }
    setCreating(false);
  }, [caption, imageFile]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (!isLoggedIn) {
    return (
      <MobileShell>
        <div className="h-dvh w-full flex flex-col items-center justify-center px-8">
          <p className="text-4xl mb-4">📱</p>
          <p className="text-sm text-white/50 text-center mb-4">Дагасан бүтээгчдийн ниитлэл харахын тулд нэвтэрнэ үү</p>
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
            <h1 className="text-lg font-bold">Дагсан</h1>
            {isCreator && (
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full"
              >
                {showCreate ? "Болих" : "+ Ниитлэл"}
              </button>
            )}
          </div>

          {/* Tabs: Дагсан / Миний */}
          {isCreator && initialMyPosts.length > 0 && (
            <div className="flex gap-2 px-4 mb-3">
              <button
                onClick={() => setTab("following")}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                  tab === "following" ? "bg-white text-black" : "bg-white/5 text-white/40"
                }`}
              >
                Дагсан
              </button>
              <button
                onClick={() => setTab("mine")}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                  tab === "mine" ? "bg-white text-black" : "bg-white/5 text-white/40"
                }`}
              >
                Миний ({myPosts.length})
              </button>
            </div>
          )}

          {/* Create post */}
          {showCreate && isCreator && (
            <div className="mx-4 mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Юу бодож байна?"
                rows={3}
                className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-white/30"
              />
              {imagePreview && (
                <div className="relative mt-2">
                  <img src={imagePreview} alt="" loading="lazy" className="w-full rounded-lg max-h-60 object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <button onClick={() => fileRef.current?.click()} className="text-white/40">
                  <ImagePlus size={20} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <button
                  onClick={handleCreatePost}
                  disabled={creating || (!caption.trim() && !imageFile)}
                  className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full disabled:opacity-30"
                >
                  {creating ? <Loader2 size={12} className="animate-spin" /> : "Нийтлэх"}
                </button>
              </div>
            </div>
          )}

          {/* Posts feed */}
          {(tab === "mine" ? myPosts : posts).length > 0 ? (
            (tab === "mine" ? myPosts : posts).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLoggedIn={isLoggedIn}
                isOwn={post.creatorId === currentUserId}
                onDelete={async (postId) => {
                  try {
                    await deletePost(postId);
                    setMyPosts(prev => prev.filter(p => p.id !== postId));
                    setPosts(prev => prev.filter(p => p.id !== postId));
                  } catch { /* */ }
                }}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm text-white/40">Дагасан бүтээгчдийн ниитлэл байхгүй</p>
              <p className="text-xs text-white/20 mt-1">Хайлт хэсгээс бүтээгч дагаарай</p>
              <Link href="/search" className="inline-block mt-4 text-xs font-semibold bg-white/10 px-4 py-2 rounded-full">
                Бүтээгч хайх
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function PostCard({ post, isLoggedIn, isOwn, onDelete }: { post: PostItem; isLoggedIn: boolean; isOwn?: boolean; onDelete?: (id: string) => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: string; content: string; profiles: Record<string, unknown> }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      <div className="flex items-center gap-2.5 px-4 py-2">
        <Link href={`/creator-profile/${post.creatorId}`}>
          {post.creatorAvatar ? (
            <img src={post.creatorAvatar} alt="" loading="lazy" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-[10px] font-bold">
              {post.creatorName.slice(0, 2)}
            </div>
          )}
        </Link>
        <div className="flex-1">
          <Link href={`/creator-profile/${post.creatorId}`}>
            <p className="text-sm font-semibold">{post.creatorName}</p>
          </Link>
          <p className="text-[10px] text-white/30">{timeAgo(post.createdAt)}</p>
        </div>
        {isOwn && onDelete && (
          showDeleteConfirm ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={async () => {
                  setDeleting(true);
                  await onDelete(post.id);
                  setDeleting(false);
                }}
                disabled={deleting}
                className="text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-lg font-semibold"
              >
                {deleting ? <Loader2 size={10} className="animate-spin" /> : "Устгах"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[10px] bg-white/10 text-white px-2.5 py-1 rounded-lg"
              >
                Үгүй
              </button>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="text-white/20 hover:text-red-400 p-1">
              <Trash2 size={14} />
            </button>
          )
        )}
      </div>

      {post.imageUrl && <img src={post.imageUrl} alt="" loading="lazy" className="w-full aspect-square object-cover" />}
      {post.caption && <p className="text-sm px-4 mt-2 text-white/80">{post.caption}</p>}

      <button onClick={handleToggleComments} className="flex items-center gap-1.5 px-4 mt-2 text-white/40 text-xs">
        <MessageCircle size={14} />
        {post.commentCount > 0 ? `${post.commentCount} сэтгэгдэл` : "Сэтгэгдэл"}
      </button>

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
                      <img src={String(prof.avatar_url)} alt="" loading="lazy" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                        {String(prof?.display_name ?? "").slice(0, 1)}
                      </div>
                    )}
                    <p className="text-[11px]"><span className="font-semibold">{String(prof?.display_name ?? "")}</span> {c.content}</p>
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
