import Link from "next/link";

const SHOP_LINKS = ["Flowers", "Bouquets", "Vases", "Greenery", "Gift add-ons"];
const COMPANY_LINKS = ["About", "Careers", "Press"];
const HELP_LINKS = ["Shipping", "Returns", "Contact"];

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-2 text-[13px]">
      <span className="text-[11px] tracking-wide text-foreground/70 uppercase">{title}</span>
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
          <div className="mb-sm font-heading text-lg">Tulips</div>
          <p className="max-w-[32ch] text-[13px] text-foreground/70">
            A portfolio demo of a flower and bouquet shop — real checkout flow, fictional store.
          </p>
        </div>
        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Company" links={COMPANY_LINKS} />
        <FooterColumn title="Help" links={HELP_LINKS} />
      </div>
      <div className="h-px bg-divider" />
      <div className="mx-auto w-full max-w-7xl px-lg py-md text-xs text-foreground/70">
        Tulips is a portfolio project. Not a real store.
      </div>
    </footer>
  );
}
