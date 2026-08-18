interface LoadingStateProps {
  variant?: "inline" | "grid";
  message?: string;
  count?: number;
}

export function LoadingState({ variant = "inline", message = "Loading…", count = 8 }: LoadingStateProps) {
  if (variant === "grid") {
    return (
      <div
        className="grid grid-cols-2 gap-lg md:grid-cols-3 lg:grid-cols-4"
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex flex-col gap-sm">
            <div className="aspect-4/5 animate-pulse rounded-lg bg-foreground/8" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-foreground/8" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-foreground/8" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-sm py-2xl text-center text-[13px] text-foreground/70"
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-accent" />
      <span>{message}</span>
    </div>
  );
}
