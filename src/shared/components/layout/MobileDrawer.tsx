"use client";

import Link from "next/link";
import { CATEGORIES } from "@/modules/catalog/constants";
import { CloseIcon } from "@/shared/components/icons";
import { Drawer } from "@/shared/components/molecules/Drawer";
import { CONTENT } from "@/shared/content";
import { ROUTES } from "@/shared/routes";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <span className="font-heading text-lg">{CONTENT.wordmark}</span>
        <button
          type="button"
          aria-label={CONTENT.mobileDrawer.closeMenu}
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/7"
        >
          <CloseIcon width={20} height={20} />
        </button>
      </div>
      <nav className="flex flex-col gap-md font-heading text-xl">
        <Link href={ROUTES.home} onClick={onClose}>
          {CONTENT.mobileDrawer.home}
        </Link>
        <Link href={ROUTES.products.list} onClick={onClose}>
          {CONTENT.mobileDrawer.shopAll}
        </Link>
      </nav>
      <div className="h-px bg-divider" />
      <div className="flex flex-col gap-sm">
        <span className="text-xs tracking-wide text-foreground/70 uppercase">
          {CONTENT.mobileDrawer.categories}
        </span>
        {CATEGORIES.map((category) => (
          <Link key={category} href={ROUTES.products.list} onClick={onClose} className="text-lg">
            {category}
          </Link>
        ))}
      </div>
    </Drawer>
  );
}
