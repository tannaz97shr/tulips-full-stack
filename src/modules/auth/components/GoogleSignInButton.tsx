"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/shared/components/atoms/Button";
import { ROUTES } from "@/shared/routes";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

export function GoogleSignInButton({ callbackUrl }: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      block
      onClick={() => signIn("google", { redirectTo: callbackUrl ?? ROUTES.home })}
    >
      Continue with Google
    </Button>
  );
}
