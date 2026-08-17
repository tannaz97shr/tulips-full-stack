"use client";

import Link from "next/link";
import { CATEGORIES } from "@/modules/catalog/constants";
import { CloseIcon } from "@/shared/components/icons";
import { Drawer } from "@/shared/components/molecules/Drawer";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <span className="font-heading text-lg">Tulips</span>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/7"
        >
          <CloseIcon width={20} height={20} />
        </button>
      </div>
      <nav className="flex flex-col gap-md font-heading text-xl">
        <Link href="/" onClick={onClose}>
          Home
        </Link>
        <Link href="/products" onClick={onClose}>
          Shop all
        </Link>
      </nav>
      <div className="h-px bg-divider" />
      <div className="flex flex-col gap-sm">
        <span className="text-[11px] tracking-wide text-foreground/70 uppercase">Categories</span>
        {CATEGORIES.map((category) => (
          <Link key={category} href="/products" onClick={onClose} className="text-[15px]">
            {category}
          </Link>
        ))}
      </div>
    </Drawer>
  );
}
