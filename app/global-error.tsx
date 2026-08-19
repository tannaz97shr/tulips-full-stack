"use client";

import { useEffect } from "react";
import { CONTENT } from "@/shared/content";
import { logError } from "@/shared/lib/log-error";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    logError(error, { boundary: "global" });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <style>{`
          body { background: #f9f4ed; color: #2e2b25; }
          @media (prefers-color-scheme: dark) {
            body { background: #2e2b25; color: #f9f4ed; }
          }
          button { font: inherit; cursor: pointer; }
        `}</style>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          <p>{CONTENT.errorState.defaultMessage}</p>
          <button type="button" onClick={retry}>
            {CONTENT.errorState.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
