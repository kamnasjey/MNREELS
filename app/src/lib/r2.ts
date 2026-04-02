import { getCloudflareContext } from "@opennextjs/cloudflare";

async function getR2Bucket() {
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as Record<string, unknown>).R2_BUCKET;
  if (!bucket) {
    throw new Error("R2_BUCKET binding not configured. Available keys: " + Object.keys(env).join(", "));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return bucket as any;
}

// Simple single upload (for small files: covers, avatars)
export async function uploadToR2(key: string, file: File | Blob): Promise<void> {
  const bucket = await getR2Bucket();
  const body = await file.arrayBuffer();

  await bucket.put(key, body, {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
    },
  });
}

export async function deleteFromR2(key: string): Promise<void> {
  const bucket = await getR2Bucket();
  await bucket.delete(key);
}

// ── Multipart Upload (for large files: videos up to 2GB) ──

export async function startMultipartUpload(
  key: string,
  contentType: string
): Promise<{ uploadId: string; key: string }> {
  const bucket = await getR2Bucket();
  const upload = await bucket.createMultipartUpload(key, {
    httpMetadata: { contentType },
  });
  return { uploadId: upload.uploadId, key };
}

export async function uploadPart(
  key: string,
  uploadId: string,
  partNumber: number,
  body: ArrayBuffer
): Promise<{ partNumber: number; etag: string }> {
  const bucket = await getR2Bucket();
  const upload = bucket.resumeMultipartUpload(key, uploadId);
  const part = await upload.uploadPart(partNumber, body);
  return { partNumber: part.partNumber, etag: part.etag };
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<void> {
  const bucket = await getR2Bucket();
  const upload = bucket.resumeMultipartUpload(key, uploadId);
  await upload.complete(parts);
}

export async function abortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  const bucket = await getR2Bucket();
  const upload = bucket.resumeMultipartUpload(key, uploadId);
  await upload.abort();
}

export function getR2PublicUrl(): string {
  return process.env.R2_PUBLIC_URL || "https://pub-1f798cba797b457f8c51e162eb4ec9e7.r2.dev";
}
