export function logError(error: Error & { digest?: string }, context?: Record<string, unknown>): void {
  console.error(error, context);
}
