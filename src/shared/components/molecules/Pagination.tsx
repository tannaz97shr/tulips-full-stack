"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";

interface PaginationProps {
  pageCount: number;
}

/** Visual-only for Phase 1 — wiring to real page state happens with data fetching. */
export function Pagination({ pageCount }: PaginationProps) {
  const [page, setPage] = useState(1);

  return (
    <div className="mt-xl flex justify-center gap-1.5">
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => setPage(pageNumber)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-[13px]",
            pageNumber === page ? "bg-accent text-background" : "hover:bg-foreground/7"
          )}
        >
          {pageNumber}
        </button>
      ))}
    </div>
  );
}
