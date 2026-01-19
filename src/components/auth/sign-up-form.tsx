"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { signUpInput, SignUpSchema } from "@/validators/auth-schema";

export default function SignUpForm() {
	const router = useRouter();

	const form = useForm<SignUpSchema>({
		resolver: zodResolver(signUpInput),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "",
		},
	});

	const signUpMutation = useMutation({
		mutationFn: async (data: SignUpSchema) => {
			const signUpPromise = authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
				role: data.role,
			});

			toast.promise(signUpPromise, {
				loading: "Creating account...",
				success: (result) => {
					if (result.error) {
						throw new Error(result.error.message);
					}
					return "Account created successfully!";
				},
				error: (error) => error?.message || "Failed to create account",
			});

			return await signUpPromise;
		},

		onSuccess: (data, variables) => {
			if (data.error) {
				form.setError("root", { message: data.error.message });
			} else {
				const redirectPath = variables.role === "CREATOR" ? "/dashboard" : "/respondent";
				router.push(redirectPath);
			}
		},

		onError: (error) => {
			form.setError("root", { message: error.message });
		},
	});

	const onSubmit = (data: SignUpSchema) => {
		signUpMutation.mutate(data);
	};

	return (
		<div className="flex flex-col min-h-[50vh] h-full w-full items-center justify-center px-4">
			<Card className="w-full">
				<CardHeader>
					<CardTitle className="text-2xl">Sign Up</CardTitle>
					<CardDescription>Create your account to get started.</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel htmlFor="name">Name</FormLabel>
											<FormControl>
												<Input
													id="name"
													placeholder="John Doe"
													autoComplete="name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel htmlFor="email">Email</FormLabel>
											<FormControl>
												<Input
													id="email"
													placeholder="johndoe@mail.com"
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
											<FormLabel htmlFor="password">Password</FormLabel>
											<FormControl>
												<PasswordInput
													id="password"
													placeholder="******"
													autoComplete="new-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel>Role</FormLabel>
											<FormControl>
												<RadioGroup
													onValueChange={field.onChange}
													defaultValue={field.value}
													className="flex flex-row gap-4 justify-start"
												>
													<div className="flex items-center space-x-2">
														<RadioGroupItem
															value="RESPONDENT"
															id="respondent"
														/>
														<Label htmlFor="respondent">
															Respondent
														</Label>
													</div>
													<div className="flex items-center space-x-2">
														<RadioGroupItem
															value="CREATOR"
															id="creator"
														/>
														<Label htmlFor="creator">Creator</Label>
													</div>
												</RadioGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full"
									disabled={signUpMutation.isPending}
								>
									{signUpMutation.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating Account...
										</>
									) : (
										"Create Account"
									)}
								</Button>
							</div>
						</form>
					</Form>
					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<Link href="/signin" className="underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
