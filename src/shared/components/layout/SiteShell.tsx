"use client";

import { useState, type ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";

export function SiteShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
