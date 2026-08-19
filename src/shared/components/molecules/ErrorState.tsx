import { Button } from "@/shared/components/atoms/Button";
import { CONTENT } from "@/shared/content";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = CONTENT.errorState.defaultMessage, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-md py-2xl text-center" role="alert">
      <p className="text-lg text-foreground/70">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {CONTENT.errorState.retry}
        </Button>
      ) : null}
    </div>
  );
}
