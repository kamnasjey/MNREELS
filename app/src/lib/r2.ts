import { AwsClient } from "aws4fetch";

let _client: AwsClient | null = null;

function getR2Client() {
  if (!_client) {
    _client = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    });
  }
  return _client;
}

export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = getR2Client();
  const endpoint = process.env.R2_ENDPOINT!;
  const bucket = process.env.R2_BUCKET_NAME!;

  const url = new URL(`${endpoint}/${bucket}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expiresIn));

  const signed = await client.sign(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    aws: { signQuery: true },
  });

  return signed.url;
}

export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
