import { z } from "zod";

export const signUpInput = z.object({
  name: z.string().min(3, { message: "Name must be of atleast 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: 'Password must be of atleast 6 characters' })
    .regex(/[a-zA-Z0-9]/, { message: 'Password must be alphanumeric' }),
  role: z.enum(["RESPONDENT", "CREATOR", ""]),
});

export const signInInput = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: 'Password must be of atleast 6 characters' })
    .regex(/[a-zA-Z0-9]/, { message: 'Password must be alphanumeric' }),
});

export const forgotPasswordInput = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const resetPasswordInput = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be of atleast 6 characters' })
    .regex(/[a-zA-Z0-9]/, { message: 'Password must be alphanumeric' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'Password must be of atleast 6 characters' })
    .regex(/[a-zA-Z0-9]/, { message: 'Password must be alphanumeric' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpSchema = z.infer<typeof signUpInput>;
export type SignInSchema = z.infer<typeof signInInput>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordInput>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordInput>;