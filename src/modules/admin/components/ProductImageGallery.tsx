"use client";

import { useState } from "react";
import Image from "next/image";
import { isAxiosError } from "axios";
import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { ArrowDownIcon, ArrowUpIcon, CloseIcon, StarIcon } from "@/shared/components/icons";
import { ConfirmDialog } from "@/shared/components/molecules/ConfirmDialog";
import { logError } from "@/shared/lib/log-error";
import { MAX_PRODUCT_IMAGE_BYTES } from "@/shared/lib/productImageLimits";
import { CONTENT } from "@/modules/admin/content";
import { useUploadProductImages } from "@/modules/admin/hooks/useUploadProductImages";
import { useDeleteProductImage } from "@/modules/admin/hooks/useDeleteProductImage";
import { useReorderProductImages } from "@/modules/admin/hooks/useReorderProductImages";
import { moveImage } from "@/modules/admin/lib/productImages";
import type { Product } from "@/modules/catalog/types";

interface ProductImageGalleryProps {
  product: Product;
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [error, setError] = useState<string | null>(null);
  const [imageUrlPendingRemoval, setImageUrlPendingRemoval] = useState<string | null>(null);

  const uploadMutation = useUploadProductImages();
  const deleteMutation = useDeleteProductImage();
  const reorderMutation = useReorderProductImages();

  const isBusy = uploadMutation.isPending || deleteMutation.isPending || reorderMutation.isPending;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);

    const oversizedFile = files.find((file) => file.size > MAX_PRODUCT_IMAGE_BYTES);
    if (oversizedFile) {
      setError(CONTENT.productImageGallery.uploadTooLarge(oversizedFile.name));
      return;
    }

    try {
      await uploadMutation.mutateAsync({ slug: product.slug, files });
    } catch (error) {
      logError(error, "ProductImageGallery.handleFileChange");
      const serverMessage = isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
      setError(serverMessage ?? CONTENT.productImageGallery.uploadError);
    }
  }

  function handleRemoveRequest(url: string) {
    setImageUrlPendingRemoval(url);
  }

  function handleRemoveCancel() {
    setImageUrlPendingRemoval(null);
  }

  async function handleRemoveConfirm() {
    if (!imageUrlPendingRemoval) return;
    const url = imageUrlPendingRemoval;
    setImageUrlPendingRemoval(null);
    setError(null);
    try {
      await deleteMutation.mutateAsync({ slug: product.slug, url });
    } catch (error) {
      logError(error, "ProductImageGallery.handleRemoveConfirm");
      setError(CONTENT.productImageGallery.removeError);
    }
  }

  async function handleMove(fromIndex: number, toIndex: number) {
    setError(null);
    const { images, primaryIndex } = moveImage(product.images, product.primaryImageIndex, fromIndex, toIndex);
    try {
      await reorderMutation.mutateAsync({ slug: product.slug, images, primaryImageIndex: primaryIndex });
    } catch (error) {
      logError(error, "ProductImageGallery.handleMove");
      setError(CONTENT.productImageGallery.reorderError);
    }
  }

  async function handleSetPrimary(index: number) {
    setError(null);
    try {
      await reorderMutation.mutateAsync({ slug: product.slug, images: product.images, primaryImageIndex: index });
    } catch (error) {
      logError(error, "ProductImageGallery.handleSetPrimary");
      setError(CONTENT.productImageGallery.reorderError);
    }
  }

  return (
    <div className="flex flex-col gap-sm">
      <span className="text-xs tracking-wide text-foreground/70 uppercase">
        {CONTENT.productImageGallery.heading}
      </span>

      {product.images.length === 0 ? (
        <p className="text-base text-foreground/60">{CONTENT.productImageGallery.empty}</p>
      ) : (
        <div className="flex flex-wrap gap-sm">
          {product.images.map((url, index) => (
            <div key={url} className="flex w-28 flex-col gap-1">
              <div className="relative aspect-square overflow-hidden rounded-sm border border-divider">
                <Image src={url} alt="" fill sizes="112px" className="object-cover" />
                {index === product.primaryImageIndex ? (
                  <Tag variant="accent" className="absolute top-1 left-1">
                    {CONTENT.productImageGallery.primary}
                  </Tag>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-0.5">
                <Button
                  type="button"
                  variant="icon"
                  aria-label={CONTENT.productImageGallery.moveUp}
                  disabled={isBusy || index === 0}
                  onClick={() => handleMove(index, index - 1)}
                >
                  <ArrowUpIcon width={14} height={14} />
                </Button>
                <Button
                  type="button"
                  variant="icon"
                  aria-label={CONTENT.productImageGallery.moveDown}
                  disabled={isBusy || index === product.images.length - 1}
                  onClick={() => handleMove(index, index + 1)}
                >
                  <ArrowDownIcon width={14} height={14} />
                </Button>
                <Button
                  type="button"
                  variant="icon"
                  aria-label={CONTENT.productImageGallery.setPrimary}
                  disabled={isBusy || index === product.primaryImageIndex}
                  onClick={() => handleSetPrimary(index)}
                >
                  <StarIcon width={14} height={14} />
                </Button>
                <Button
                  type="button"
                  variant="icon"
                  aria-label={CONTENT.productImageGallery.remove}
                  disabled={isBusy}
                  onClick={() => handleRemoveRequest(url)}
                >
                  <CloseIcon width={14} height={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <input
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          disabled={isBusy}
          onChange={handleFileChange}
          className="text-base"
        />
        <span className="text-sm text-foreground/60">
          {uploadMutation.isPending ? CONTENT.productImageGallery.uploading : CONTENT.productImageGallery.uploadHint}
        </span>
      </div>

      {error ? (
        <p className="text-base text-accent-700" role="alert">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={imageUrlPendingRemoval !== null}
        title={CONTENT.productImageGallery.removeConfirmTitle}
        message={CONTENT.productImageGallery.removeConfirm}
        confirmLabel={CONTENT.productImageGallery.remove}
        cancelLabel={CONTENT.productImageGallery.cancel}
        variant="danger"
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
    </div>
  );
}
