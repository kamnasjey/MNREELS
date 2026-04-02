import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  getR2PublicUrl,
  startMultipartUpload,
  completeMultipartUpload,
} from "@/lib/r2";

// Helper: verify creator
async function verifyCreator(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_creator")
    .eq("id", user.id)
    .single();

  if (!profile?.is_creator) return null;
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const user = await verifyCreator(supabase);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // ── Multipart: JSON actions (start / part / complete) ──
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { action } = body;

      // START: create episode + start multipart upload
      if (action === "start") {
        const { seriesId, title, episodeNumber, isFree, tasalbarCost, duration, filename } = body;

        if (!seriesId || !title) {
          return NextResponse.json({ error: "Цуврал болон ангийн нэр шаардлагатай" }, { status: 400 });
        }

        // Use client-provided episodeNumber (creator controls ordering)
        // Fallback to max+1 if not provided
        let finalEpisodeNumber = episodeNumber;
        if (!finalEpisodeNumber || finalEpisodeNumber < 1) {
          const { data: maxEp } = await supabase
            .from("episodes")
            .select("episode_number")
            .eq("series_id", seriesId)
            .order("episode_number", { ascending: false })
            .limit(1)
            .single();
          finalEpisodeNumber = (maxEp?.episode_number || 0) + 1;
        }

        const cost = isFree ? 0 : Math.min(20, Math.max(1, tasalbarCost || 2));

        const { data: episode, error } = await supabase
          .from("episodes")
          .insert({
            series_id: seriesId,
            episode_number: finalEpisodeNumber,
            title,
            is_free: isFree,
            tasalbar_cost: cost,
            duration: duration || 0,
            status: "processing",
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const ext = (filename || "video.mp4").split(".").pop() || "mp4";
        const r2Key = `originals/${seriesId}/${episode.id}/${Date.now()}.${ext}`;

        try {
          const { uploadId } = await startMultipartUpload(r2Key, "video/mp4");

          return NextResponse.json({
            episodeId: episode.id,
            uploadId,
            r2Key,
          });
        } catch (r2Err) {
          console.error("R2 startMultipartUpload error:", r2Err);
          // Clean up the episode if R2 fails
          await supabase.from("episodes").delete().eq("id", episode.id);
          return NextResponse.json(
            { error: "R2 multipart эхлүүлэхэд алдаа: " + (r2Err instanceof Error ? r2Err.message : "Unknown") },
            { status: 500 }
          );
        }
      }

      // COMPLETE: finalize multipart upload
      if (action === "complete") {
        const { episodeId, uploadId, r2Key, parts } = body;

        try {
          await completeMultipartUpload(r2Key, uploadId, parts);
        } catch (r2Err) {
          console.error("R2 completeMultipart error:", r2Err);
          return NextResponse.json(
            { error: "R2 нэгтгэхэд алдаа: " + (r2Err instanceof Error ? r2Err.message : "Unknown") },
            { status: 500 }
          );
        }

        // Serve directly from R2 CDN for fastest loading
        const publicUrl = `${getR2PublicUrl()}/${r2Key}`;

        // DB updates зэрэг хийнэ (performance)
        const [updateResult] = await Promise.all([
          supabase
            .from("episodes")
            .update({ video_url: publicUrl, status: "published", published_at: new Date().toISOString() })
            .eq("id", episodeId)
            .select("series_id")
            .single(),
        ]);

        if (updateResult.data?.series_id) {
          await supabase.from("series").update({ is_published: true }).eq("id", updateResult.data.series_id).eq("is_published", false);
        }

        return NextResponse.json({
          success: true,
          episodeId,
          publicUrl,
          message: "Видео амжилттай нийтлэгдлээ!",
        });
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Part uploads now handled by /api/upload/part route
    return NextResponse.json({ error: "Invalid content type. Use /api/upload/part for chunks." }, { status: 400 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload алдаа" },
      { status: 500 }
    );
  }
}
