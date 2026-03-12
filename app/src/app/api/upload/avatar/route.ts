import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPresignedPutUrl, R2_PUBLIC_URL } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
      return NextResponse.json({ error: "R2 тохиргоо хийгдээгүй" }, { status: 503 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await request.json();

    const ext = filename.split(".").pop() || "jpg";
    const r2Key = `avatars/${user.id}/${Date.now()}.${ext}`;

    const presignedUrl = await getPresignedPutUrl(
      r2Key,
      contentType || "image/jpeg",
      600
    );

    const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;

    // Don't save to DB here — client will call updateAvatar after R2 upload succeeds
    return NextResponse.json({ presignedUrl, publicUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload алдаа" },
      { status: 500 }
    );
  }
}
