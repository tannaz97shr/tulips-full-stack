import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16 renamed middleware.ts -> proxy.ts. Built from authConfig (no
// providers) rather than importing the full @/auth, so bcryptjs/firebase-admin
// stay out of this path even though Proxy now defaults to the Node.js runtime.
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
