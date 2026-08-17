"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/** Generic slide-in-from-right panel, shared by the mobile nav drawer and the mobile filters drawer. */
export function Drawer({ open, onClose, children, className }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="fixed inset-0 animate-[tp-fade_0.2s_ease] bg-neutral-900/55" />
      <div
        className={cn(
          "fixed top-0 right-0 flex h-full w-[min(320px,85vw)] flex-col gap-xl overflow-y-auto bg-background p-lg shadow-lg animate-[tp-slide-in_0.25s_ease]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
