"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type { User } from "@/lib/auth";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signInInput, SignInSchema } from "@/validators/auth-schema";

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInInput),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInSchema) => {
      const signInPromise = authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      toast.promise(signInPromise, {
        loading: "Signing in...",
        success: (result) => {
          if (result.error) {
            throw new Error(result.error.message);
          }
          return "Signed in successfully!";
        },
        error: (error) => error?.message || "Failed to sign in",
      });

      return await signInPromise;
    },

    onSuccess: (data) => {
      if (data.error) {
        form.setError("root", { message: data.error.message });
      } else {
        // Use the user data from the signin response
        const user = data.data?.user as User; // Type assertion for additional fields
        if (user?.role === "CREATOR") {
          router.push("/dashboard");
        } else if (user?.role === "RESPONDENT") {
          router.push("/respondent");
        } else {
          router.push("/");
        }
      }
    },

    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (data: SignInSchema) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="flex flex-col min-h-[50vh] h-full w-full items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to signin to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@example.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="******"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                {form.formState.errors.root && (
                  <div className="text-sm text-red-600 text-center">
                    {form.formState.errors.root.message}
                  </div>
                )}
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
