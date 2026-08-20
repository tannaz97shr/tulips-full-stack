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
