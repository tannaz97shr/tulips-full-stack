import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// specs/authentication.md: login required at checkout, and for
// cart/account/order-history pages. specs/user-roles.md: admin routes
// require an authenticated session AND role === "admin", server-side.
const PROTECTED_PREFIXES = ["/account", "/orders", "/cart", "/checkout", "/admin"];
const ADMIN_PREFIXES = ["/admin"];

/**
 * Deliberately has no providers/no bcrypt/firebase-admin imports — this is
 * the config `proxy.ts` builds its own NextAuth instance from, so the
 * route-guard check stays cheap on every navigation.
 *
 * `session` lives here (not just in auth.ts) because proxy.ts constructs
 * its own separate NextAuth(authConfig) instance — without this callback,
 * that instance falls back to Auth.js's default session shaping, which
 * strips custom claims like `role` from `session.user`, and `authorized`
 * below would then treat every user as non-admin.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
      if (!isProtected) return true;

      if (!auth?.user) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
      }

      const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
      if (isAdminRoute && auth.user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return true;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
};
