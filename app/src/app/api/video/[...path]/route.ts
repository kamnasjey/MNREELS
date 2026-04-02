import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Parse HTTP Range header: "bytes=0-1023" → { offset: 0, length: 1024 }
function parseRange(rangeHeader: string, totalSize: number): { offset: number; end: number; length: number } | null {
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if (!match) return null;

  const start = match[1] ? parseInt(match[1]) : 0;
  const end = match[2] ? parseInt(match[2]) : totalSize - 1;
  return { offset: start, end: Math.min(end, totalSize - 1), length: Math.min(end, totalSize - 1) - start + 1 };
}

// Serve videos through Worker with Range request support + caching
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.join("/");

    const { env } = await getCloudflareContext({ async: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bucket = (env as Record<string, unknown>).R2_BUCKET as any;

    const rangeHeader = request.headers.get("range");

    // If Range requested, first get object head to know total size
    if (rangeHeader) {
      const head = await bucket.head(key);
      if (!head) return new NextResponse("Not found", { status: 404 });

      const parsed = parseRange(rangeHeader, head.size);
      if (!parsed) return new NextResponse("Invalid range", { status: 416 });

      const object = await bucket.get(key, {
        range: { offset: parsed.offset, length: parsed.length },
      });

      if (!object) return new NextResponse("Not found", { status: 404 });

      const headers = new Headers();
      headers.set("Content-Type", head.httpMetadata?.contentType || "video/mp4");
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Range", `bytes ${parsed.offset}-${parsed.end}/${head.size}`);
      headers.set("Content-Length", String(parsed.length));
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      return new NextResponse(object.body as ReadableStream, { status: 206, headers });
    }

    // Full file request
    const object = await bucket.get(key);
    if (!object) return new NextResponse("Not found", { status: 404 });

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "video/mp4");
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", String(object.size));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(object.body as ReadableStream, { status: 200, headers });
  } catch (err) {
    console.error("Video serve error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
