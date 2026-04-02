import { NextRequest, NextResponse } from "next/server";
import { uploadPart } from "@/lib/r2";

// Dedicated route for chunk uploads — receives raw binary body
// instead of FormData to minimize Worker memory usage.
// Auth is NOT checked here — the uploadId from /api/upload "start" action
// acts as a secret token. Only the authenticated creator who started
// the upload knows the uploadId + r2Key.
export async function POST(request: NextRequest) {
  try {
    // Metadata from headers (no FormData parsing needed)
    const r2Key = request.headers.get("x-r2-key");
    const uploadId = request.headers.get("x-upload-id");
    const partNumber = parseInt(request.headers.get("x-part-number") || "0");

    if (!r2Key || !uploadId || !partNumber) {
      return NextResponse.json({ error: "Missing part metadata" }, { status: 400 });
    }

    // Read body directly as ArrayBuffer — single copy, no FormData overhead
    const body = await request.arrayBuffer();

    const result = await uploadPart(r2Key, uploadId, partNumber, body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Part upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Part upload алдаа" },
      { status: 500 }
    );
  }
}
