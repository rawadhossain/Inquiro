"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, ChevronDown, FileText } from "lucide-react";
import type { User as UserType } from "@/types";

export default function RespondentLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	// Get current session and user data
	const { data: session, isLoading: sessionLoading } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const result = await authClient.getSession();
			return result;
		},
	});

	const user = session?.data?.user as UserType | undefined;
	const isAuthenticated = !!session?.data?.session;

	// Logout mutation
	const logoutMutation = useMutation({
		mutationFn: async () => {
			const result = await authClient.signOut();
			return result;
		},
		onSuccess: () => {
			router.push("/signin");
		},
	});

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	return (
		<div className="dark min-h-screen bg-background">
			<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
					{/* Logo/Brand */}
					<div className="flex items-center space-x-4">
						<Link
							href="/respondent"
							className="flex items-center space-x-3 transition-opacity hover:opacity-80"
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<FileText className="h-4 w-4" />
							</div>
							<div className="flex flex-col">
								<span className="font-bold text-lg leading-none">Inquiro</span>
								<span className="text-xs text-muted-foreground">Respondent</span>
							</div>
						</Link>
					</div>

					{/* User Avatar or Login Button */}
					<div className="flex items-center space-x-4">
						{sessionLoading ? (
							<div className="flex items-center space-x-3">
								<div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
								<div className="hidden sm:flex sm:flex-col sm:space-y-1">
									<div className="h-3 w-20 animate-pulse rounded bg-muted" />
									<div className="h-2 w-16 animate-pulse rounded bg-muted" />
								</div>
							</div>
						) : isAuthenticated && user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative flex items-center space-x-3 h-10 rounded-lg px-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user.image ?? undefined}
												alt={user.name ?? undefined}
											/>
											<AvatarFallback className="bg-primary text-primary-foreground font-medium">
												{user.name?.charAt(0)?.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="hidden sm:flex sm:flex-col sm:items-start sm:text-left">
											<span className="text-sm font-medium leading-none">
												{user.name}
											</span>
											<Badge
												variant={
													user.role === "CREATOR"
														? "default"
														: "secondary"
												}
												className="mt-1 text-xs"
											>
												{user.role}
											</Badge>
										</div>
										<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-64" align="end" forceMount>
									<div className="flex items-center justify-start gap-3 p-3 border-b">
										<Avatar className="h-10 w-10">
											<AvatarImage
												src={user.image ?? undefined}
												alt={user.name ?? undefined}
											/>
											<AvatarFallback className="bg-primary text-primary-foreground font-medium">
												{user.name?.charAt(0)?.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col space-y-1 leading-none">
											<p className="font-medium">{user.name}</p>
											<p className="w-[180px] truncate text-sm text-muted-foreground">
												{user.email}
											</p>
											<Badge
												variant={
													user.role === "CREATOR"
														? "default"
														: "secondary"
												}
												className="w-fit text-xs"
											>
												{user.role}
											</Badge>
										</div>
									</div>
									<div className="p-1">
										<DropdownMenuItem
											onClick={handleLogout}
											disabled={logoutMutation.isPending}
											className="text-destructive focus:text-destructive cursor-pointer"
										>
											<LogOut className="mr-2 h-4 w-4" />
											{logoutMutation.isPending
												? "Logging out..."
												: "Log out"}
										</DropdownMenuItem>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className="flex items-center space-x-3">
								<Button variant="ghost" asChild className="h-9 px-4">
									<Link href="/signin">Sign In</Link>
								</Button>
								<Button asChild className="h-9 px-4">
									<Link href="/signup">Sign Up</Link>
								</Button>
							</div>
						)}
					</div>
				</div>
			</header>
			<main className="container mx-auto p-8">{children}</main>
		</div>
	);
}
