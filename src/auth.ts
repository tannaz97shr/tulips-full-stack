import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { signInSchema } from "@/modules/auth/lib/schemas";
import { findOrCreateGoogleUser, findUserByEmail } from "@/modules/auth/lib/userRepository";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const record = await findUserByEmail(parsed.data.email);
        if (!record || !record.passwordHash) return null;

        const isValid = await bcrypt.compare(parsed.data.password, record.passwordHash);
        if (!isValid) return null;

        return record.sessionUser;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const sessionUser = await findOrCreateGoogleUser({
          email: user.email,
          name: user.name ?? user.email,
        });
        user.id = sessionUser.id;
        user.role = sessionUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "customer";
      }
      return token;
    },
  },
});
