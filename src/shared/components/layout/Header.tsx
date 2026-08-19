"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/components/atoms/Button";
import { CartIcon, MenuIcon, SearchIcon, UserIcon } from "@/shared/components/icons";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { status } = useSession();
  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/products");
  const accountHref = status === "authenticated" ? "/account" : "/sign-in";

  return (
    <header className="sticky top-0 z-30 border-b border-divider bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-lg px-lg py-md">
        <Button variant="icon" aria-label="Open menu" onClick={onMenuClick} className="md:hidden">
          <MenuIcon width={20} height={20} />
        </Button>
        <div className="flex flex-1 items-center gap-xl">
          <Link href="/" className="font-heading text-lg">
            Tulips
          </Link>
          <nav className="hidden gap-lg md:flex">
            <Link href="/" aria-current={isHome ? "page" : undefined} className={isHome ? "text-accent" : undefined}>
              Home
            </Link>
            <Link
              href="/products"
              aria-current={isShop ? "page" : undefined}
              className={isShop ? "text-accent" : undefined}
            >
              Shop
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="icon" aria-label="Search">
            <SearchIcon width={20} height={20} />
          </Button>
          <Button
            variant="icon"
            aria-label="Account"
            href={accountHref}
            aria-disabled={status === "loading"}
            className={status === "loading" ? "pointer-events-none opacity-60" : undefined}
          >
            <UserIcon width={20} height={20} />
          </Button>
          <Button variant="icon" aria-label="Cart">
            <CartIcon width={20} height={20} />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
