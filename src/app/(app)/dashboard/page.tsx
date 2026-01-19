"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	FileText,
	Users,
	BarChart3,
	Eye,
	Edit,
	Trash2,
	Plus,
	TrendingUp,
	Calendar,
	Target,
	Clock,
	MoreHorizontal,
	ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

// Import our custom hooks
import {
	useMySurveys,
	useSurveyCount,
	useDeleteSurvey,
	usePublishSurvey,
} from "@/hooks/use-surveys";
import { useResponseStats } from "@/hooks/use-responses";
import { Separator } from "@/components/ui/separator";
import ThemeSwitch from "@/components/ui/theme-switch";

export default function DashboardPage() {
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [surveyToDelete, setSurveyToDelete] = useState<number | null>(null);

	// Get current session and user data
	const { data: session, isLoading: sessionLoading } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const result = await authClient.getSession();
			return result;
		},
	});

	// Use our custom hooks for real data
	const { data: surveys, isLoading: surveysLoading, error: surveysError } = useMySurveys();
	const { data: surveyCount, isLoading: countLoading } = useSurveyCount();
	const { stats: responseStats, isLoading: responseStatsLoading } = useResponseStats();

	// Mutations
	const deleteSurveyMutation = useDeleteSurvey();
	const publishSurveyMutation = usePublishSurvey();

	const user = session?.data?.user;
	const isAuthenticated = !!session?.data?.session;

	// Redirect to signin if not authenticated
	if (!sessionLoading && !isAuthenticated) {
		router.push("/signin");
		return null;
	}

	// Show loading state
	if (sessionLoading) {
		return (
			<div className="flex-1 space-y-4 p-8 pt-6">
				<div className="flex items-center justify-between space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-3 w-32 mt-2" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Calculate stats from real data
	const safesurveys = Array.isArray(surveys) ? surveys : [];
	const totalSurveys = safesurveys.length;
	const publishedSurveys = safesurveys.filter((s) => s.status === "PUBLISHED").length;
	const draftSurveys = safesurveys.filter((s) => s.status === "DRAFT").length;
	const totalResponses = responseStats?.totalResponses || 0;

	// Calculate average response rate
	const avgResponseRate =
		safesurveys.length > 0
			? Math.round(
					safesurveys.reduce((acc, survey) => {
						const count = survey._count?.responses || 0;
						// Assuming 100 views per survey for demo - in real app you'd track views
						const rate = count > 0 ? (count / 100) * 100 : 0;
						return acc + rate;
					}, 0) / safesurveys.length
				)
			: 0;

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PUBLISHED":
				return (
					<Badge variant="default" className="bg-green-600">
						Published
					</Badge>
				);
			case "DRAFT":
				return <Badge variant="secondary">Draft</Badge>;
			case "CLOSED":
				return <Badge variant="destructive">Closed</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const handleDeleteSurvey = async () => {
		if (!surveyToDelete) return;

		try {
			await deleteSurveyMutation.mutateAsync(surveyToDelete);
			setDeleteDialogOpen(false);
			setSurveyToDelete(null);
		} catch (error) {
			// Error handling is done in the hook
		}
	};

	const handlePublishSurvey = async (surveyId: number) => {
		try {
			await publishSurveyMutation.mutateAsync(surveyId);
		} catch (error) {
			// Error handling is done in the hook
		}
	};

	// Handle errors
	if (surveysError) {
		return (
			<div className="flex-1 space-y-4 p-8 pt-6">
				<div className="text-center py-8">
					<div className="text-red-500 mb-2">Error loading dashboard data</div>
					<Button onClick={() => window.location.reload()}>Retry</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div className="flex items-center space-x-2">
					<SidebarTrigger />
					<Separator orientation="vertical" className="h-4 w-px bg-muted" />
					<div>
						<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
						<p className="text-muted-foreground">
							Welcome back, {user?.name}! Here's an overview of your surveys.
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<ThemeSwitch />
					<Button asChild>
						<Link href="/surveys/create">
							<Plus className="mr-2 h-4 w-4" />
							Create Survey
						</Link>
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{countLoading ? (
								<Skeleton className="h-7 w-12" />
							) : (
								surveyCount || totalSurveys
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{draftSurveys} drafts, {publishedSurveys} published
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Responses</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{responseStatsLoading ? (
								<Skeleton className="h-7 w-12" />
							) : (
								totalResponses
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{responseStats?.anonymousResponses || 0} anonymous,{" "}
							{responseStats?.registeredResponses || 0} registered
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{publishedSurveys}</div>
						<p className="text-xs text-muted-foreground">
							Currently collecting responses
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Avg. Response Rate</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{avgResponseRate}%</div>
						<p className="text-xs text-muted-foreground">
							{responseStats?.recentResponses || 0} this week
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Tabs defaultValue="surveys" className="space-y-4">
				<TabsList>
					<TabsTrigger value="surveys">My Surveys</TabsTrigger>
					<TabsTrigger value="recent">Recent Activity</TabsTrigger>
					<TabsTrigger value="analytics">Quick Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="surveys" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Your Surveys</CardTitle>
							<CardDescription>
								Manage and monitor your survey collection
							</CardDescription>
						</CardHeader>
						<CardContent>
							{surveysLoading ? (
								<div className="space-y-2">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : safesurveys.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Survey</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Responses</TableHead>
											<TableHead>Created</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{safesurveys.map((survey) => (
											<TableRow key={survey.id}>
												<TableCell>
													<div>
														<div className="font-medium">
															{survey.title}
														</div>
														<div className="text-sm text-muted-foreground">
															{survey.description?.slice(0, 50)}...
														</div>
														<div className="text-xs text-muted-foreground mt-1">
															{survey._count?.questions || 0}{" "}
															questions •{" "}
															{survey.isPublic ? "Public" : "Private"}
														</div>
													</div>
												</TableCell>
												<TableCell>
													{getStatusBadge(survey.status)}
												</TableCell>
												<TableCell>
													<div className="text-sm font-medium">
														{survey._count?.responses || 0}
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{formatDistanceToNow(
															new Date(survey.createdAt),
															{
																addSuffix: true,
															}
														)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem asChild>
																<Link
																	href={`/responses?survey=${survey.id}`}
																>
																	<Eye className="mr-2 h-4 w-4" />
																	View Responses
																</Link>
															</DropdownMenuItem>
															<DropdownMenuItem asChild>
																<Link
																	href={`/surveys/${survey.id}/edit`}
																>
																	<Edit className="mr-2 h-4 w-4" />
																	Edit Survey
																</Link>
															</DropdownMenuItem>
															{survey.status === "DRAFT" && (
																<DropdownMenuItem
																	onClick={() =>
																		handlePublishSurvey(
																			survey.id
																		)
																	}
																	disabled={
																		publishSurveyMutation.isPending
																	}
																>
																	<ExternalLink className="mr-2 h-4 w-4" />
																	Publish Survey
																</DropdownMenuItem>
															)}
															<DropdownMenuItem
																onClick={() => {
																	setSurveyToDelete(survey.id);
																	setDeleteDialogOpen(true);
																}}
																className="text-red-600"
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Delete Survey
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-8">
									<FileText className="mx-auto h-12 w-12 text-muted-foreground" />
									<h3 className="mt-2 text-sm font-medium">No surveys</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										Get started by creating your first survey.
									</p>
									<div className="mt-6">
										<Button asChild>
											<Link href="/surveys/create">
												<Plus className="mr-2 h-4 w-4" />
												Create Survey
											</Link>
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>
								Latest actions and updates on your surveys
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{responseStatsLoading ? (
									Array.from({ length: 3 }).map((_, i) => (
										<div key={i} className="flex items-start space-x-3">
											<Skeleton className="h-6 w-6 rounded-full" />
											<div className="flex-1 space-y-1">
												<Skeleton className="h-4 w-3/4" />
												<Skeleton className="h-3 w-1/4" />
											</div>
										</div>
									))
								) : (
									<>
										<div className="flex items-start space-x-3">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
												<Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
											</div>
											<div className="flex-1 space-y-1">
												<p className="text-sm">
													{responseStats?.recentResponses || 0} new
													responses this week
												</p>
												<p className="text-xs text-muted-foreground">
													Across all your surveys
												</p>
											</div>
										</div>
										<div className="flex items-start space-x-3">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
												<FileText className="h-3 w-3 text-green-600 dark:text-green-400" />
											</div>
											<div className="flex-1 space-y-1">
												<p className="text-sm">
													{publishedSurveys} active surveys collecting
													responses
												</p>
												<p className="text-xs text-muted-foreground">
													{draftSurveys} drafts waiting to be published
												</p>
											</div>
										</div>
										<div className="flex items-start space-x-3">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
												<BarChart3 className="h-3 w-3 text-orange-600 dark:text-orange-400" />
											</div>
											<div className="flex-1 space-y-1">
												<p className="text-sm">
													Average response rate: {avgResponseRate}%
												</p>
												<p className="text-xs text-muted-foreground">
													{responseStats?.anonymousResponses || 0}{" "}
													anonymous,{" "}
													{responseStats?.registeredResponses || 0}{" "}
													registered
												</p>
											</div>
										</div>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Response Overview</CardTitle>
								<CardDescription>Your survey response statistics</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{responseStatsLoading ? (
										<Skeleton className="h-7 w-12" />
									) : (
										totalResponses
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									Total responses across all surveys
								</p>
								<div className="mt-4 space-y-2">
									<div className="flex justify-between text-sm">
										<span>Anonymous</span>
										<span>{responseStats?.anonymousResponses || 0}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Registered Users</span>
										<span>{responseStats?.registeredResponses || 0}</span>
									</div>
									<div className="flex justify-between text-sm font-medium">
										<span>This Week</span>
										<span>{responseStats?.recentResponses || 0}</span>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Survey Performance</CardTitle>
								<CardDescription>
									Overview of your survey collection
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalSurveys}</div>
								<p className="text-xs text-muted-foreground">
									Total surveys created
								</p>
								<div className="mt-4 space-y-2">
									<div className="flex justify-between text-sm">
										<span>Published</span>
										<span className="text-green-600">{publishedSurveys}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Drafts</span>
										<span className="text-yellow-600">{draftSurveys}</span>
									</div>
									<div className="flex justify-between text-sm font-medium">
										<span>Avg. Response Rate</span>
										<span>{avgResponseRate}%</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Survey</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this survey? This action cannot be
							undone. All responses and data will be permanently lost.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end space-x-2">
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteSurvey}
							disabled={deleteSurveyMutation.isPending}
						>
							{deleteSurveyMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
