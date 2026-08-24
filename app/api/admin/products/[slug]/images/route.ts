import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { toProduct } from "@/modules/catalog/lib/toProduct";
import { logError } from "@/shared/lib/log-error";
import { requireAdminSession } from "@/modules/admin/lib/requireAdminSession";
import { nextPrimaryImageIndexAfterRemoval } from "@/modules/admin/lib/productImages";
import {
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES_PER_UPLOAD,
  deleteProductImage,
  detectProductImageMimeType,
  productImagePathFromUrl,
  uploadProductImage,
} from "@/shared/lib/storage";

interface ValidatedUpload {
  buffer: Buffer;
  mimeType: NonNullable<ReturnType<typeof detectProductImageMimeType>>;
}

const reorderSchema = z.object({
  images: z.array(z.string()),
  primaryImageIndex: z.number().int().nonnegative(),
});

export async function POST(request: Request, { params }: RouteContext<"/api/admin/products/[slug]/images">) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  const { slug } = await params;
  const db = getAdminFirestore();
  const ref = db.collection("products").doc(slug);
  const existing = await ref.get();

  if (!existing.exists) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }
  if (existing.data()?.isComposite === true) {
    return Response.json({ error: "Bouquets don't support image uploads through this endpoint yet" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "No files provided" }, { status: 400 });
  }
  if (files.length > MAX_PRODUCT_IMAGES_PER_UPLOAD) {
    return Response.json({ error: `A maximum of ${MAX_PRODUCT_IMAGES_PER_UPLOAD} files can be uploaded at once` }, { status: 400 });
  }

  // Validate every file (size + sniffed magic bytes) before uploading any of
  // them, so a bad file later in the batch never leaves earlier ones orphaned
  // in Storage.
  const validated: ValidatedUpload[] = [];
  for (const file of files) {
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      return Response.json({ error: `${file.name} exceeds the 5MB limit` }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = detectProductImageMimeType(buffer);
    if (!mimeType) {
      return Response.json({ error: `${file.name} is not a supported image type (JPEG, PNG, or WEBP)` }, { status: 400 });
    }
    validated.push({ buffer, mimeType });
  }

  const uploadedUrls: string[] = [];
  try {
    for (const { buffer, mimeType } of validated) {
      uploadedUrls.push(await uploadProductImage(slug, buffer, mimeType));
    }

    await ref.update({
      images: FieldValue.arrayUnion(...uploadedUrls),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logError(error, "POST /api/admin/products/[slug]/images");
    await Promise.allSettled(
      uploadedUrls.map((url) => {
        const path = productImagePathFromUrl(url);
        return path ? deleteProductImage(path) : Promise.resolve();
      })
    );
    return Response.json({ error: "Failed to upload image(s)" }, { status: 500 });
  }

  const doc = await ref.get();
  return Response.json({ product: toProduct(doc) }, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteContext<"/api/admin/products/[slug]/images">) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  const { slug } = await params;
  const db = getAdminFirestore();
  const ref = db.collection("products").doc(slug);
  const existing = await ref.get();

  if (!existing.exists) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : null;
  if (!url) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  const data = existing.data();
  const currentImages: string[] = data?.images ?? [];
  const currentPrimaryIndex: number = data?.primaryImageIndex ?? 0;
  const removedIndex = currentImages.indexOf(url);
  if (removedIndex === -1) {
    return Response.json({ error: "Image not found on this product" }, { status: 404 });
  }

  const path = productImagePathFromUrl(url);
  if (!path) {
    return Response.json({ error: "Unrecognized image URL" }, { status: 400 });
  }

  try {
    await deleteProductImage(path);

    const nextImages = currentImages.filter((image) => image !== url);
    await ref.update({
      images: nextImages,
      primaryImageIndex: nextPrimaryImageIndexAfterRemoval(currentPrimaryIndex, removedIndex, nextImages.length),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logError(error, "DELETE /api/admin/products/[slug]/images");
    return Response.json({ error: "Failed to delete image" }, { status: 500 });
  }

  const doc = await ref.get();
  return Response.json({ product: toProduct(doc) });
}

/**
 * Reorders the images array and/or moves `primaryImageIndex` — used for
 * both the up/down reorder controls and "set as primary" (same array, new
 * index). Never trusts the client's `images` array outright: it must be an
 * exact permutation of what's currently stored, so a stale or tampered
 * client can't smuggle in URLs that were never uploaded through this
 * product's own upload endpoint.
 */
export async function PATCH(request: Request, { params }: RouteContext<"/api/admin/products/[slug]/images">) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  const { slug } = await params;
  const db = getAdminFirestore();
  const ref = db.collection("products").doc(slug);
  const existing = await ref.get();

  if (!existing.exists) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { images: nextImages, primaryImageIndex } = parsed.data;
  const currentImages: string[] = existing.data()?.images ?? [];

  const isSamePermutation =
    nextImages.length === currentImages.length &&
    new Set(nextImages).size === currentImages.length &&
    currentImages.every((url) => nextImages.includes(url));
  if (!isSamePermutation) {
    return Response.json({ error: "Image list is out of date — reload and try again" }, { status: 409 });
  }
  if (nextImages.length > 0 && primaryImageIndex >= nextImages.length) {
    return Response.json({ error: "primaryImageIndex is out of range" }, { status: 400 });
  }

  await ref.update({
    images: nextImages,
    primaryImageIndex,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await ref.get();
  return Response.json({ product: toProduct(doc) });
}
