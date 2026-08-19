import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[28rem] flex-1 flex-col justify-center gap-lg px-lg py-2xl">
      {children}
    </div>
  );
}
