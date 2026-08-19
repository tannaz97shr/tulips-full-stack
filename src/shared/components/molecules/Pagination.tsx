"use client";

import { cn } from "@/shared/utils/cn";

interface PaginationProps {
  pageCount: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ pageCount, page, onPageChange }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="mt-xl flex justify-center gap-1.5">
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-base",
            pageNumber === page ? "bg-accent text-background" : "hover:bg-foreground/7"
          )}
        >
          {pageNumber}
        </button>
      ))}
    </div>
  );
}
