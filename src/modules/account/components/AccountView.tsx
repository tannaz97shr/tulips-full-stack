import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { ROUTES } from "@/shared/routes";
import { CONTENT } from "@/modules/account/content";

interface AccountViewProps {
  name: string;
  email: string;
  isAdmin: boolean;
  /** Rendered by the page so the sign-out server action stays in `app/`. */
  signOutForm: (button: ReactNode) => ReactNode;
}

function ShortcutLink({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-md rounded-lg border border-divider p-lg transition-colors hover:bg-foreground/5"
    >
      <span className="flex flex-col gap-1">
        <span className="font-heading text-lg">{title}</span>
        <span className="text-sm text-foreground/70">{detail}</span>
      </span>
      <span aria-hidden className="text-xl text-accent-700">
        →
      </span>
    </Link>
  );
}

export function AccountView({ name, email, isAdmin, signOutForm }: AccountViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-xl px-lg py-2xl">
      <div className="flex flex-col gap-1">
        <p className="text-base text-foreground/70">{CONTENT.accountView.heading}</p>
        <h1 className="font-heading text-2xl">{CONTENT.accountView.greeting(name)}</h1>
      </div>

      <section className="flex flex-col gap-md rounded-lg border border-divider p-lg">
        <h2 className="text-lg">{CONTENT.accountView.detailsHeading}</h2>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-sm text-base">
          <dt className="text-foreground/70">{CONTENT.accountView.nameLabel}</dt>
          <dd className="break-words">{name}</dd>
          <dt className="text-foreground/70">{CONTENT.accountView.emailLabel}</dt>
          <dd className="break-all">{email}</dd>
        </dl>
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="mb-xs text-lg">{CONTENT.accountView.shortcutsHeading}</h2>
        <ShortcutLink href={ROUTES.orders} title={CONTENT.accountView.orders} detail={CONTENT.accountView.ordersDetail} />
        {isAdmin ? (
          <ShortcutLink href={ROUTES.admin} title={CONTENT.accountView.admin} detail={CONTENT.accountView.adminDetail} />
        ) : null}
      </section>

      <div>
        {signOutForm(
          <Button type="submit" variant="secondary">
            {CONTENT.accountView.signOut}
          </Button>
        )}
      </div>
    </div>
  );
}
