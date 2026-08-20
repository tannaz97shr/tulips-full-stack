/** Recomputes `primaryImageIndex` after `removedIndex` is spliced out of an images array of the given length before removal. */
export function nextPrimaryImageIndexAfterRemoval(
  currentPrimaryIndex: number,
  removedIndex: number,
  remainingCount: number
): number {
  if (remainingCount === 0) return 0;
  if (removedIndex < currentPrimaryIndex) return currentPrimaryIndex - 1;
  return Math.min(currentPrimaryIndex, remainingCount - 1);
}

/** Moves an image from `fromIndex` to `toIndex`, keeping `primaryIndex` pointing at the same photo (by URL) even though its position may shift. */
export function moveImage(
  images: string[],
  primaryIndex: number,
  fromIndex: number,
  toIndex: number
): { images: string[]; primaryIndex: number } {
  const primaryUrl = images[primaryIndex];
  const nextImages = [...images];
  const [moved] = nextImages.splice(fromIndex, 1);
  nextImages.splice(toIndex, 0, moved);
  return { images: nextImages, primaryIndex: nextImages.indexOf(primaryUrl) };
}
