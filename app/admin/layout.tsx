import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CONTENT } from "@/modules/admin/content";
import { ROUTES } from "@/shared/routes";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(ROUTES.signInWithCallback(ROUTES.admin));
  }
  if (session.user.role !== "admin") {
    redirect(ROUTES.home);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-lg px-lg py-xl">
      <div className="flex items-baseline gap-lg border-b border-foreground/15 pb-md">
        <h1 className="font-heading text-2xl">{CONTENT.shell.heading}</h1>
        <nav className="flex gap-md text-base">
          <Link href={ROUTES.adminProducts} className="text-foreground/70 hover:text-foreground">
            {CONTENT.shell.nav.products}
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
