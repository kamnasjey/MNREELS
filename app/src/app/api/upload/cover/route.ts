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

    const { filename, contentType, seriesId } = await request.json();

    const ext = filename.split(".").pop() || "jpg";
    const r2Key = `covers/${seriesId || user.id}/${Date.now()}.${ext}`;

    const presignedUrl = await getPresignedPutUrl(
      r2Key,
      contentType || "image/jpeg",
      600
    );

    return NextResponse.json({
      presignedUrl,
      publicUrl: `${R2_PUBLIC_URL}/${r2Key}`,
    });
  } catch (err) {
    console.error("Cover upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload алдаа" },
      { status: 500 }
    );
  }
}
