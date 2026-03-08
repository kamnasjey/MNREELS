import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPresignedPutUrl, R2_PUBLIC_URL } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
      return NextResponse.json(
        { error: "R2 тохиргоо хийгдээгүй" },
        { status: 503 }
      );
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_creator")
      .eq("id", user.id)
      .single();

    if (!profile?.is_creator) {
      return NextResponse.json({ error: "Not a creator" }, { status: 403 });
    }

    const { filename, contentType, seriesId, episodeNumber, title, isFree } =
      await request.json();

    const { data: episode, error } = await supabase
      .from("episodes")
      .insert({
        series_id: seriesId,
        episode_number: episodeNumber,
        title,
        is_free: isFree,
        status: "processing",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const r2Key = `originals/${seriesId}/${episode.id}/${filename}`;

    const presignedUrl = await getPresignedPutUrl(
      r2Key,
      contentType || "video/mp4",
      3600
    );

    return NextResponse.json({
      episodeId: episode.id,
      presignedUrl,
      r2Key,
      publicUrl: `${R2_PUBLIC_URL}/${r2Key}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload алдаа" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { episodeId, r2Key } = await request.json();

    await supabase
      .from("episodes")
      .update({
        video_url: `${R2_PUBLIC_URL}/${r2Key}`,
        status: "moderation",
      })
      .eq("id", episodeId);

    const publishAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      episodeId,
      publishAt: publishAt.toISOString(),
      message: "Видео модерацид орлоо. 2 цагийн дараа нийтлэгдэнэ.",
    });
  } catch (err) {
    console.error("Upload complete error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Алдаа" },
      { status: 500 }
    );
  }
}
