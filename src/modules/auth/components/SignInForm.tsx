"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";
import { ROUTES } from "@/shared/routes";
import { CONTENT } from "@/modules/auth/content";
import { signInSchema, type SignInInput } from "@/modules/auth/lib/schemas";

interface SignInFormProps {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl = ROUTES.home }: SignInFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInInput) {
    setFormError(null);
    const result = await signIn("credentials", { ...values, redirect: false });
    if (result?.error) {
      setFormError(CONTENT.signInForm.invalidCredentials);
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
      <FormField label={CONTENT.fields.email} error={errors.email?.message}>
        {(id) => <Input id={id} type="email" autoComplete="email" {...register("email")} />}
      </FormField>
      <FormField label={CONTENT.fields.password} error={errors.password?.message}>
        {(id) => <Input id={id} type="password" autoComplete="current-password" {...register("password")} />}
      </FormField>
      {formError ? (
        <p className="text-base text-accent-700" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" variant="primary" block disabled={isSubmitting}>
        {isSubmitting ? CONTENT.signInForm.submitting : CONTENT.signInForm.submit}
      </Button>
    </form>
  );
}
