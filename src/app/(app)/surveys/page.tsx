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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	FileText,
	Eye,
	Edit,
	Trash2,
	Plus,
	MoreHorizontal,
	Share2,
	BarChart3,
	Users,
	Globe,
	Lock,
	Filter,
	Search,
	ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

// Import our custom hooks
import { useMySurveys, useDeleteSurvey, usePublishSurvey } from "@/hooks/use-surveys";
import ThemeSwitch from "@/components/ui/theme-switch";

export default function SurveysPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [surveyToDelete, setSurveyToDelete] = useState<any>(null);

	// Get current session
	const { data: session, isLoading: sessionLoading } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const result = await authClient.getSession();
			return result;
		},
	});

	// Use our custom hooks for real data
	const { data: surveys, isLoading: surveysLoading, error: surveysError } = useMySurveys();

	// Mutations
	const deleteSurveyMutation = useDeleteSurvey();
	const publishSurveyMutation = usePublishSurvey();

	const user = session?.data?.user;
	const isAuthenticated = !!session?.data?.session;

	// Redirect if not authenticated
	if (!sessionLoading && !isAuthenticated) {
		router.push("/signin");
		return null;
	}

	if (sessionLoading) {
		return (
			<div className="flex-1 space-y-4 p-8 pt-6">
				<Skeleton className="h-8 w-64" />
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			</div>
		);
	}

	// Filter surveys
	const filteredSurveys =
		surveys?.filter((survey) => {
			const matchesSearch =
				survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(survey.description &&
					survey.description.toLowerCase().includes(searchTerm.toLowerCase()));
			const matchesStatus =
				statusFilter === "all" ||
				survey.status.toLowerCase() === statusFilter.toLowerCase();
			return matchesSearch && matchesStatus;
		}) || [];

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

	const handleDeleteSurvey = (survey: any) => {
		setSurveyToDelete(survey);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (surveyToDelete) {
			try {
				await deleteSurveyMutation.mutateAsync(surveyToDelete.id);
				setDeleteDialogOpen(false);
				setSurveyToDelete(null);
			} catch (error) {
				// Error handling is done in the hook
			}
		}
	};

	const handlePublishSurvey = async (surveyId: number) => {
		try {
			await publishSurveyMutation.mutateAsync(surveyId);
		} catch (error) {
			// Error handling is done in the hook
		}
	};

	const handleShareSurvey = (survey: any) => {
		const url = `${window.location.origin}/survey/${survey.id}`;
		navigator.clipboard.writeText(url);
		toast.success("Survey link copied to clipboard");
	};

	// Handle errors
	if (surveysError) {
		return (
			<div className="flex-1 space-y-4 p-8 pt-6">
				<div className="text-center py-8">
					<div className="text-red-500 mb-2">Error loading surveys</div>
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
					<div>
						<h2 className="text-3xl font-bold tracking-tight">My Surveys</h2>
						<p className="text-muted-foreground">
							Create and manage your survey collection
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

			{/* Filters */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search surveys..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-8"
					/>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">
							<Filter className="mr-2 h-4 w-4" />
							{statusFilter === "all" ? "All Status" : statusFilter}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => setStatusFilter("all")}>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setStatusFilter("draft")}>
							Draft
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setStatusFilter("published")}>
							Published
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setStatusFilter("closed")}>
							Closed
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Surveys Content */}
			<Tabs defaultValue="list" className="space-y-4">
				<TabsList>
					<TabsTrigger value="list">List View</TabsTrigger>
					<TabsTrigger value="grid">Grid View</TabsTrigger>
				</TabsList>

				<TabsContent value="list" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Your Surveys ({filteredSurveys.length})</CardTitle>
							<CardDescription>
								Manage your survey collection with detailed information
							</CardDescription>
						</CardHeader>
						<CardContent>
							{surveysLoading ? (
								<div className="space-y-2">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : filteredSurveys.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Survey</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Visibility</TableHead>
											<TableHead>Responses</TableHead>
											<TableHead>Last Updated</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredSurveys.map((survey) => (
											<TableRow key={survey.id}>
												<TableCell>
													<div>
														<div className="font-medium">
															{survey.title}
														</div>
														<div className="text-sm text-muted-foreground">
															{survey.description?.slice(0, 50)}...
														</div>
														<div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
															<span>
																{survey._count?.questions || 0}{" "}
																questions
															</span>
															{survey.allowAnonymous && (
																<span className="flex items-center">
																	<Users className="h-3 w-3 mr-1" />
																	Anonymous
																</span>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													{getStatusBadge(survey.status)}
												</TableCell>
												<TableCell>
													<div className="flex items-center">
														{survey.isPublic ? (
															<>
																<Globe className="h-4 w-4 mr-1 text-green-600" />
																<span className="text-sm">
																	Public
																</span>
															</>
														) : (
															<>
																<Lock className="h-4 w-4 mr-1 text-orange-600" />
																<span className="text-sm">
																	Private
																</span>
															</>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm font-medium">
														{survey._count?.responses || 0}
														{survey.maxResponses && (
															<span className="text-muted-foreground">
																/{survey.maxResponses}
															</span>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{formatDistanceToNow(
															new Date(survey.updatedAt),
															{
																addSuffix: true,
															}
														)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																className="h-8 w-8 p-0"
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>
																Actions
															</DropdownMenuLabel>
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
																	href={`/responses?survey=${survey.id}&tab=analytics`}
																>
																	<BarChart3 className="mr-2 h-4 w-4" />
																	Analytics
																</Link>
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem asChild>
																<Link
																	href={`/surveys/${survey.id}/edit`}
																>
																	<Edit className="mr-2 h-4 w-4" />
																	Edit
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
																	Publish
																</DropdownMenuItem>
															)}
															{survey.status === "PUBLISHED" && (
																<DropdownMenuItem
																	onClick={() =>
																		handleShareSurvey(survey)
																	}
																>
																	<Share2 className="mr-2 h-4 w-4" />
																	Share
																</DropdownMenuItem>
															)}
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() =>
																	handleDeleteSurvey(survey)
																}
																className="text-red-600 focus:text-red-600"
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Delete
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
									<h3 className="mt-2 text-sm font-medium">
										{searchTerm || statusFilter !== "all"
											? "No surveys found"
											: "No surveys yet"}
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										{searchTerm || statusFilter !== "all"
											? "Try adjusting your search or filters"
											: "Get started by creating your first survey."}
									</p>
									{!searchTerm && statusFilter === "all" && (
										<div className="mt-6">
											<Button asChild>
												<Link href="/surveys/create">
													<Plus className="mr-2 h-4 w-4" />
													Create Survey
												</Link>
											</Button>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="grid" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{surveysLoading
							? Array.from({ length: 6 }).map((_, i) => (
									<Card key={i}>
										<CardHeader>
											<Skeleton className="h-4 w-3/4" />
											<Skeleton className="h-3 w-full" />
										</CardHeader>
										<CardContent>
											<Skeleton className="h-20 w-full" />
										</CardContent>
									</Card>
								))
							: filteredSurveys.map((survey) => (
									<Card
										key={survey.id}
										className="hover:shadow-md transition-shadow"
									>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<CardTitle className="text-lg">
														{survey.title}
													</CardTitle>
													<CardDescription className="mt-1">
														{survey.description}
													</CardDescription>
												</div>
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
																Edit
															</Link>
														</DropdownMenuItem>
														{survey.status === "DRAFT" && (
															<DropdownMenuItem
																onClick={() =>
																	handlePublishSurvey(survey.id)
																}
																disabled={
																	publishSurveyMutation.isPending
																}
															>
																<ExternalLink className="mr-2 h-4 w-4" />
																Publish
															</DropdownMenuItem>
														)}
														{survey.status === "PUBLISHED" && (
															<DropdownMenuItem
																onClick={() =>
																	handleShareSurvey(survey)
																}
															>
																<Share2 className="mr-2 h-4 w-4" />
																Share
															</DropdownMenuItem>
														)}
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() =>
																handleDeleteSurvey(survey)
															}
															className="text-red-600"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardHeader>
										<CardContent>
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													{getStatusBadge(survey.status)}
													<div className="flex items-center text-sm text-muted-foreground">
														{survey.isPublic ? (
															<Globe className="h-4 w-4 mr-1" />
														) : (
															<Lock className="h-4 w-4 mr-1" />
														)}
														{survey.isPublic ? "Public" : "Private"}
													</div>
												</div>

												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														{survey._count?.questions || 0} questions
													</span>
													<span className="font-medium">
														{survey._count?.responses || 0} responses
													</span>
												</div>

												<div className="text-xs text-muted-foreground">
													Updated{" "}
													{formatDistanceToNow(
														new Date(survey.updatedAt),
														{
															addSuffix: true,
														}
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								))}
					</div>

					{!surveysLoading && filteredSurveys.length === 0 && (
						<div className="text-center py-12">
							<FileText className="mx-auto h-12 w-12 text-muted-foreground" />
							<h3 className="mt-2 text-sm font-medium">
								{searchTerm || statusFilter !== "all"
									? "No surveys found"
									: "No surveys yet"}
							</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								{searchTerm || statusFilter !== "all"
									? "Try adjusting your search or filters"
									: "Get started by creating your first survey."}
							</p>
							{!searchTerm && statusFilter === "all" && (
								<div className="mt-6">
									<Button asChild>
										<Link href="/surveys/create">
											<Plus className="mr-2 h-4 w-4" />
											Create Survey
										</Link>
									</Button>
								</div>
							)}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Survey</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{surveyToDelete?.title}"? This action
							cannot be undone and will permanently delete all survey data and
							responses.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteSurveyMutation.isPending}
						>
							{deleteSurveyMutation.isPending ? "Deleting..." : "Delete Survey"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
