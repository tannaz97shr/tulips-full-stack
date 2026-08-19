"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";
import { signInSchema, type SignInInput } from "@/modules/auth/lib/schemas";

interface SignInFormProps {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl = "/" }: SignInFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInInput) {
    setFormError(null);
    const result = await signIn("credentials", { ...values, redirect: false });
    if (result?.ok !== true) {
      setFormError("Invalid email or password.");
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
      <FormField label="Email" error={errors.email?.message}>
        {(id) => <Input id={id} type="email" autoComplete="email" {...register("email")} />}
      </FormField>
      <FormField label="Password" error={errors.password?.message}>
        {(id) => <Input id={id} type="password" autoComplete="current-password" {...register("password")} />}
      </FormField>
      {formError ? (
        <p className="text-[13px] text-accent-700" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" variant="primary" block disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
