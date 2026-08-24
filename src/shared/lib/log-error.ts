export function logError(error: unknown, context?: string | Record<string, unknown>): void {
  console.error(error, context);
}
