import type { DefaultSession } from "next-auth";

export type UserRole = "customer" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}

// Augmenting the "@auth/core/jwt" module directly, not the "next-auth/jwt"
// re-export barrel — TS's declaration-merging resolver for `declare module`
// doesn't reliably follow subpath-export re-exports under this project's
// moduleResolution: "bundler" setting.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
