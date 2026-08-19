import { z } from "zod";
import { CONTENT } from "@/modules/auth/content";

export const signUpSchema = z
  .object({
    name: z.string().min(1, CONTENT.validation.nameRequired),
    email: z.email(CONTENT.validation.invalidEmail),
    password: z.string().min(8, CONTENT.validation.passwordMinLength),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: CONTENT.validation.passwordsDoNotMatch,
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.email(CONTENT.validation.invalidEmail),
  password: z.string().min(1, CONTENT.validation.passwordRequired),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
