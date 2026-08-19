"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { isAxiosError } from "axios";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";
import { ROUTES } from "@/shared/routes";
import { CONTENT } from "@/modules/auth/content";
import { useRegister } from "@/modules/auth/hooks/useRegister";
import { signUpSchema, type SignUpInput } from "@/modules/auth/lib/schemas";

interface SignUpFormProps {
  callbackUrl?: string;
}

export function SignUpForm({ callbackUrl = ROUTES.home }: SignUpFormProps) {
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
        setError("email", { message: CONTENT.signUpForm.emailAlreadyExists });
        return;
      }
      setFormError(CONTENT.signUpForm.genericError);
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      setFormError(CONTENT.signUpForm.postRegisterSignInFailed);
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
      <FormField label={CONTENT.fields.name} error={errors.name?.message}>
        {(id) => <Input id={id} type="text" autoComplete="name" {...register("name")} />}
      </FormField>
      <FormField label={CONTENT.fields.email} error={errors.email?.message}>
        {(id) => <Input id={id} type="email" autoComplete="email" {...register("email")} />}
      </FormField>
      <FormField label={CONTENT.fields.password} error={errors.password?.message}>
        {(id) => <Input id={id} type="password" autoComplete="new-password" {...register("password")} />}
      </FormField>
      <FormField label={CONTENT.fields.confirmPassword} error={errors.confirmPassword?.message}>
        {(id) => <Input id={id} type="password" autoComplete="new-password" {...register("confirmPassword")} />}
      </FormField>
      {formError ? (
        <p className="text-base text-accent-700" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" variant="primary" block disabled={isSubmitting || registerMutation.isPending}>
        {isSubmitting || registerMutation.isPending ? CONTENT.signUpForm.submitting : CONTENT.signUpForm.submit}
      </Button>
    </form>
  );
}
