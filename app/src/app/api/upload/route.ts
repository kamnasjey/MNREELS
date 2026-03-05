import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

// Generate presigned R2 upload URL
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify creator
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

  // Create episode record
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

  // Generate R2 presigned upload URL
  const r2Key = `originals/${seriesId}/${episode.id}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    ContentType: contentType || "video/mp4",
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 3600, // 1 hour
  });

  return NextResponse.json({
    episodeId: episode.id,
    presignedUrl,
    r2Key,
    publicUrl: `${R2_PUBLIC_URL}/${r2Key}`,
  });
}

// After upload complete — trigger transcode
export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { episodeId, r2Key } = await request.json();

  // Update episode with video URL and set to moderation
  await supabase
    .from("episodes")
    .update({
      video_url: `${R2_PUBLIC_URL}/${r2Key}`,
      status: "moderation",
    })
    .eq("id", episodeId);

  // TODO: Trigger ffmpeg transcode job on VPS
  // POST to transcode server: { r2Key, episodeId }
  // Transcode server will:
  // 1. Download from R2
  // 2. ffmpeg → 480p, 720p, 1080p HLS
  // 3. Upload segments to R2 /transcoded/{episodeId}/
  // 4. Callback to update episode.video_url with HLS manifest

  // Auto-publish after 2 hours moderation
  const publishAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  return NextResponse.json({
    success: true,
    episodeId,
    publishAt: publishAt.toISOString(),
    message: "Видео transcode хийгдэж байна. 2 цагийн модерацийн дараа нийтлэгдэнэ.",
  });
}
