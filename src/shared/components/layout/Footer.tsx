import Link from "next/link";
import { CONTENT } from "@/shared/content";

function FooterColumn({ title, links }: { title: string; links: readonly string[] }) {
  return (
    <div className="flex flex-col gap-2 text-base">
      <span className="text-xs tracking-wide text-foreground/70 uppercase">{title}</span>
      {links.map((label) => (
        <Link key={label} href="#">
          {label}
        </Link>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-divider">
      <div className="mx-auto grid w-full max-w-7xl gap-xl px-lg py-2xl md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-sm font-heading text-lg">{CONTENT.wordmark}</div>
          <p className="max-w-[32ch] text-base text-foreground/70">{CONTENT.footer.tagline}</p>
        </div>
        <FooterColumn title={CONTENT.footer.shopColumnTitle} links={CONTENT.footer.shopLinks} />
        <FooterColumn title={CONTENT.footer.companyColumnTitle} links={CONTENT.footer.companyLinks} />
        <FooterColumn title={CONTENT.footer.helpColumnTitle} links={CONTENT.footer.helpLinks} />
      </div>
      <div className="h-px bg-divider" />
      <div className="mx-auto w-full max-w-7xl px-lg py-md text-xs text-foreground/70">
        {CONTENT.footer.disclaimer}
      </div>
    </footer>
  );
}
