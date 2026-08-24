"use client";

import { useEffect, useId, useRef } from "react";
import type { MouseEvent } from "react";
import { Button } from "@/shared/components/atoms/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={onCancel}
      onClick={handleDialogClick}
      className="m-auto border-0 bg-transparent p-0 backdrop:bg-neutral-900/55 backdrop:animate-[tp-fade_0.2s_ease]"
    >
      <div className="w-[min(400px,90vw)] rounded-lg bg-surface p-lg shadow-lg animate-[tp-fade_0.2s_ease]">
        <h2 id={titleId} className="font-heading text-lg text-foreground">
          {title}
        </h2>
        <p id={messageId} className="mt-sm text-base text-foreground/80">
          {message}
        </p>
        <div className="mt-lg flex justify-end gap-sm">
          <Button type="button" variant="secondary" autoFocus onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
