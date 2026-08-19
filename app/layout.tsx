import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import { SiteShell } from "@/shared/components/layout/SiteShell";
import { QueryProvider } from "@/shared/components/providers/QueryProvider";
import { SessionProvider } from "@/shared/components/providers/SessionProvider";
import { CONTENT } from "@/shared/content";
import "./globals.css";

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  subsets: ["latin"],
  weight: "400",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: CONTENT.rootLayout.title,
  description: CONTENT.rootLayout.description,
};

const THEME_BOOTSTRAP_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem('tulips-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (stored !== 'light' && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${caprasimo.variable} ${figtree.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SessionProvider>
          <QueryProvider>
            <SiteShell>{children}</SiteShell>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
