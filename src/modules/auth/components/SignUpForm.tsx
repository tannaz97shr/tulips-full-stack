"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { isAxiosError } from "axios";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";
import { useRegister } from "@/modules/auth/hooks/useRegister";
import { signUpSchema, type SignUpInput } from "@/modules/auth/lib/schemas";

interface SignUpFormProps {
  callbackUrl?: string;
}

export function SignUpForm({ callbackUrl = "/" }: SignUpFormProps) {
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpInput) {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(values);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError("email", { message: "An account with this email already exists." });
        return;
      }
      setFormError("Something went wrong. Please try again.");
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      setFormError("Account created, but sign-in failed. Try signing in.");
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
      <FormField label="Name" error={errors.name?.message}>
        {(id) => <Input id={id} type="text" autoComplete="name" {...register("name")} />}
      </FormField>
      <FormField label="Email" error={errors.email?.message}>
        {(id) => <Input id={id} type="email" autoComplete="email" {...register("email")} />}
      </FormField>
      <FormField label="Password" error={errors.password?.message}>
        {(id) => <Input id={id} type="password" autoComplete="new-password" {...register("password")} />}
      </FormField>
      <FormField label="Confirm password" error={errors.confirmPassword?.message}>
        {(id) => <Input id={id} type="password" autoComplete="new-password" {...register("confirmPassword")} />}
      </FormField>
      {formError ? (
        <p className="text-[13px] text-accent-700" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" variant="primary" block disabled={isSubmitting || registerMutation.isPending}>
        {isSubmitting || registerMutation.isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
