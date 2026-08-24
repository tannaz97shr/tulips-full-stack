export function logError(
  error: unknown,
  context?: string | Record<string, unknown>,
  options?: { level?: "error" | "warn" },
): void {
  const level = options?.level ?? "error";
  console[level](error, context);
}
