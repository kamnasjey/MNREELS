import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2";

function extractR2Key(url: string): string {
  if (url.startsWith("/api/video/")) {
    return url.replace("/api/video/", "");
  } else if (url.startsWith("http")) {
    return new URL(url).pathname.replace(/^\//, "");
  }
  return url;
}

export async function POST(request: NextRequest) {
  try {
    const { seriesId, episodeId } = await request.json();
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    // Delete single episode
    if (episodeId) {
      // Get video URL before deleting
      const { data: episode } = await supabase
        .from("episodes")
        .select("video_url, series:series_id!inner(creator_id)")
        .eq("id", episodeId)
        .single();

      if (!episode) {
        return NextResponse.json({ error: "Анги олдсонгүй" }, { status: 404 });
      }

      const series = episode.series as unknown as { creator_id: string };
      if (series.creator_id !== user.id) {
        return NextResponse.json({ error: "Эрх байхгүй" }, { status: 403 });
      }

      // Delete from DB using RPC (cascade)
      const { error: rpcError } = await supabase.rpc("delete_episode_cascade", {
        p_episode_id: episodeId,
        p_user_id: user.id,
      });

      if (rpcError) {
        console.error("delete_episode_cascade error:", rpcError);
        return NextResponse.json({ error: "Устгахад алдаа: " + rpcError.message }, { status: 500 });
      }

      // Delete video from R2
      if (episode.video_url) {
        try {
          const r2Key = extractR2Key(episode.video_url);
          if (r2Key) await deleteFromR2(r2Key);
        } catch {}
      }

      return NextResponse.json({ success: true });
    }

    // Delete entire series
    if (seriesId) {
      // Get series info and episodes before deleting
      const { data: seriesData } = await supabase
        .from("series")
        .select("creator_id, cover_url")
        .eq("id", seriesId)
        .single();

      if (!seriesData || seriesData.creator_id !== user.id) {
        return NextResponse.json({ error: "Эрх байхгүй" }, { status: 403 });
      }

      const { data: episodes } = await supabase
        .from("episodes")
        .select("video_url")
        .eq("series_id", seriesId);

      // Delete from DB using RPC (cascade)
      const { error: rpcError } = await supabase.rpc("delete_series_cascade", {
        p_series_id: seriesId,
        p_user_id: user.id,
      });

      if (rpcError) {
        console.error("delete_series_cascade error:", rpcError);
        return NextResponse.json({ error: "Устгахад алдаа: " + rpcError.message }, { status: 500 });
      }

      // Delete videos from R2 (after DB delete succeeds)
      for (const ep of (episodes ?? [])) {
        if (ep.video_url) {
          try {
            const r2Key = extractR2Key(ep.video_url);
            if (r2Key) await deleteFromR2(r2Key);
          } catch {}
        }
      }

      // Delete cover from R2
      if (seriesData.cover_url) {
        try {
          const r2Key = extractR2Key(seriesData.cover_url);
          if (r2Key) await deleteFromR2(r2Key);
        } catch {}
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "seriesId эсвэл episodeId шаардлагатай" }, { status: 400 });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" },
      { status: 500 }
    );
  }
}
