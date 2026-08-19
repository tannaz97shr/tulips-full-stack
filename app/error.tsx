"use client";

import { useEffect } from "react";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { logError } from "@/shared/lib/log-error";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    logError(error, { boundary: "root" });
  }, [error]);

  return <ErrorState message="Something went wrong." onRetry={retry} />;
}
