import type { R2Bucket } from "@cloudflare/workers-types";

export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer,
  contentType: string
): Promise<string> {
  await bucket.put(key, data, {
    httpMetadata: { contentType },
  });
  return key;
}

export async function getFromR2(bucket: R2Bucket, key: string) {
  return bucket.get(key);
}

export async function deleteFromR2(bucket: R2Bucket, key: string) {
  await bucket.delete(key);
}

export function getR2PublicUrl(key: string): string {
  return `/api/storage/${key}`;
}

export function generateStorageKey(prefix: string, companyId: string, filename: string): string {
  const ext = filename.split(".").pop() || "bin";
  const uniqueId = crypto.randomUUID();
  return `${prefix}/${companyId}/${uniqueId}.${ext}`;
}