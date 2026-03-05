import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

// Generate presigned URL for cover image upload
export async function POST(request: NextRequest) {
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

  const { filename, contentType, seriesId } = await request.json();

  const ext = filename.split(".").pop() || "jpg";
  const r2Key = `covers/${seriesId || user.id}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    ContentType: contentType || "image/jpeg",
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 600, // 10 minutes
  });

  return NextResponse.json({
    presignedUrl,
    publicUrl: `${R2_PUBLIC_URL}/${r2Key}`,
  });
}
