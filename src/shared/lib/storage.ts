import { randomUUID } from "node:crypto";
import { getAdminStorage } from "@/shared/lib/firebase-admin";

export type ProductImageMimeType = "image/jpeg" | "image/png" | "image/webp";

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES_PER_UPLOAD = 10;

const PRODUCT_IMAGE_EXTENSIONS: Record<ProductImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Sniffs the actual file signature rather than trusting the client-supplied
 * multipart Content-Type, which is just a spoofable request header.
 */
export function detectProductImageMimeType(buffer: Buffer): ProductImageMimeType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

/**
 * Uploads a validated product image and returns a stable, permanent download
 * URL using Firebase's token-gated `alt=media` pattern (the same shape
 * `getDownloadURL` from firebase-admin/storage constructs). This works
 * regardless of the bucket's ACL/uniform-bucket-level-access configuration,
 * unlike `file.makePublic()` — and unlike `getSignedUrl()`, it has no
 * expiry (GCS V4 signed URLs are capped at 7 days by the SDK itself).
 */
export async function uploadProductImage(
  slug: string,
  buffer: Buffer,
  mimeType: ProductImageMimeType
): Promise<string> {
  const extension = PRODUCT_IMAGE_EXTENSIONS[mimeType];
  const path = `products/${slug}/${randomUUID()}.${extension}`;
  const token = randomUUID();
  const bucket = getAdminStorage().bucket();

  await bucket.file(path).save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

export async function deleteProductImage(path: string): Promise<void> {
  await getAdminStorage().bucket().file(path).delete({ ignoreNotFound: true });
}

/** Inverse of the URL built by {@link uploadProductImage} — recovers the storage object path from a stored download URL. */
export function productImagePathFromUrl(url: string): string | null {
  const marker = "/o/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;
  const encodedPath = url.slice(markerIndex + marker.length).split("?")[0];
  if (!encodedPath) return null;
  return decodeURIComponent(encodedPath);
}
