import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { uploadToR2, getR2PublicUrl } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const seriesId = formData.get("seriesId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File шаардлагатай" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const r2Key = `covers/${seriesId || user.id}/${Date.now()}.${ext}`;

    await uploadToR2(r2Key, file);

    return NextResponse.json({
      publicUrl: `/api/video/${r2Key}`,
    });
  } catch (err) {
    console.error("Cover upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload алдаа" },
      { status: 500 }
    );
  }
}
