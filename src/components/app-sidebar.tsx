"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
	ChevronUp,
	FileText,
	MessageSquare,
	Settings,
	Users,
	LogOut,
	Plus,
	Search,
	LayoutDashboard,
	Wand2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";

const mainNavItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
		tooltip: "View your dashboard overview",
	},
	{
		title: "My Surveys",
		url: "/surveys",
		icon: FileText,
		tooltip: "Manage your surveys",
	},
	{
		title: "Responses",
		url: "/responses",
		icon: MessageSquare,
		tooltip: "View survey responses",
	},
];

const quickActions = [
	{
		title: "Create Survey",
		url: "/surveys/create",
		icon: Plus,
		tooltip: "Create a new survey",
	},
	{
		title: "Browse Public",
		url: "/surveys/public",
		icon: Search,
		tooltip: "Browse public surveys",
	},
];

export function AppSidebar() {
	const router = useRouter();
	const pathname = usePathname();

	// Get current session and user data
	const { data: session } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const result = await authClient.getSession();
			return result;
		},
	});

	const user = session?.data?.user as User | undefined;

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
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							tooltip="Inquiro - Survey Platform"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<FileText className="h-6 w-6" />
							</div>
							<div className="flex flex-col gap-0.5 leading-none">
								<span className="font-semibold">Inquiro</span>
								<span className="text-xs text-muted-foreground">
									Survey Platform
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.url}
										tooltip={item.tooltip}
									>
										<a href={item.url}>
											<item.icon className="size-4" />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Quick Actions - Collapsible */}
				<SidebarGroup>
					<SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{quickActions.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild tooltip={item.tooltip}>
										<a href={item.url}>
											<item.icon className="size-4" />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									tooltip={`${user?.name || "User"} - ${user?.role || "RESPONDENT"}`}
								>
									<Avatar className="size-8 rounded-lg">
										<AvatarImage
											src={user?.image ?? undefined}
											alt={user?.name ?? undefined}
										/>
										<AvatarFallback className="rounded-lg">
											{user?.name?.charAt(0)?.toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{user?.name || "User"}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{user?.email || "user@example.com"}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											variant={
												user?.role === "CREATOR" ? "default" : "secondary"
											}
											className="text-xs"
										>
											{user?.role || "RESPONDENT"}
										</Badge>
										<ChevronUp className="ml-auto size-4" />
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel>
									<div className="flex flex-col gap-0.5 leading-none">
										<span className="truncate font-semibold">
											{user?.name || "User"}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{user?.email || "user@example.com"}
										</span>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									disabled={logoutMutation.isPending}
									className="text-red-600 focus:text-red-600 dark:text-red-400"
								>
									<LogOut className="mr-2 size-4" />
									{logoutMutation.isPending ? "Logging out..." : "Logout"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
