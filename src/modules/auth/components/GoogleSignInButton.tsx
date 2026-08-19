"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/shared/components/atoms/Button";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

export function GoogleSignInButton({ callbackUrl }: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      block
      onClick={() => signIn("google", { redirectTo: callbackUrl ?? "/" })}
    >
      Continue with Google
    </Button>
  );
}
