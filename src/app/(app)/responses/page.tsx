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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	MessageSquare,
	Eye,
	Search,
	Calendar,
	User,
	Globe,
	Clock,
	MoreHorizontal,
	FileDown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useMySurveys } from "@/hooks/use-surveys";
import { useMyResponses, useResponsesBySurvey } from "@/hooks/use-responses";
import ThemeSwitch from "@/components/ui/theme-switch";

export default function ResponsesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchTerm, setSearchTerm] = useState("");
	const [surveyFilter, setSurveyFilter] = useState("all");
	const [selectedResponse, setSelectedResponse] = useState<any>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	// Get URL parameters
	const urlSurveyId = searchParams.get("survey");
	const urlTab = searchParams.get("tab") || "all";

	// Get current session
	const { data: session, isLoading: sessionLoading } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			const result = await authClient.getSession();
			return result;
		},
	});

	// Use our custom hooks for real data
	const { data: surveys, isLoading: surveysLoading } = useMySurveys();
	const { data: allResponses, isLoading: allResponsesLoading } = useMyResponses();

	// If a specific survey is selected, get its responses
	const selectedSurveyId = urlSurveyId ? parseInt(urlSurveyId) : null;
	const { data: surveyResponses, isLoading: surveyResponsesLoading } = useResponsesBySurvey(
		selectedSurveyId || 0,
	);

	// Set survey filter from URL
	useEffect(() => {
		if (urlSurveyId) {
			setSurveyFilter(urlSurveyId);
		}
	}, [urlSurveyId]);

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

	// Determine which responses to show
	const responses = selectedSurveyId ? surveyResponses : allResponses;
	const responsesLoading = selectedSurveyId ? surveyResponsesLoading : allResponsesLoading;

	// Filter responses
	const filteredResponses =
		responses?.filter((response: any) => {
			const matchesSearch =
				response.survey?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				response.respondent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				response.respondent?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(response.isAnonymous && "anonymous".includes(searchTerm.toLowerCase()));

			const matchesSurvey =
				surveyFilter === "all" || response.surveyId.toString() === surveyFilter;

			return matchesSearch && matchesSurvey;
		}) || [];

	const anonymousResponses = filteredResponses.filter((r: any) => r.isAnonymous);
	const registeredResponses = filteredResponses.filter((r: any) => !r.isAnonymous);
	const recentResponses = filteredResponses.filter((r: any) => {
		const responseDate = new Date(r.createdAt);
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return responseDate > weekAgo;
	});

	const handleViewResponse = (response: any) => {
		setSelectedResponse(response);
		setIsDetailOpen(true);
	};

	const handleExportResponses = () => {
		// Create CSV content
		if (!filteredResponses || filteredResponses.length === 0) {
			toast.error("No responses to export");
			return;
		}

		const headers = [
			"Response ID",
			"Survey",
			"Respondent",
			"Email",
			"Type",
			"Submitted At",
			"IP Address",
		];

		// Add answer columns
		const allQuestions = new Set<string>();
		filteredResponses.forEach((response: any) => {
			response.answers?.forEach((answer: any) => {
				if (answer.question?.text) {
					allQuestions.add(answer.question.text);
				}
			});
		});

		const questionHeaders = Array.from(allQuestions);
		const csvHeaders = [...headers, ...questionHeaders];

		const csvRows = filteredResponses.map((response: any) => {
			const baseRow = [
				response.id,
				response.survey?.title || "Unknown Survey",
				response.isAnonymous ? "Anonymous" : response.respondent?.name || "Unknown",
				response.isAnonymous ? "" : response.respondent?.email || "",
				response.isAnonymous ? "Anonymous" : "Registered",
				format(new Date(response.completedAt || response.createdAt), "yyyy-MM-dd HH:mm:ss"),
				response.ipAddress || "",
			];

			// Add answer values
			const answerValues = questionHeaders.map((questionText) => {
				const answer = response.answers?.find(
					(a: any) => a.question?.text === questionText,
				);
				return (
					answer?.textValue ||
					answer?.numberValue?.toString() ||
					answer?.booleanValue?.toString() ||
					""
				);
			});

			return [...baseRow, ...answerValues];
		});

		const csvContent = [csvHeaders, ...csvRows]
			.map((row) => row.map((field: any) => `"${field}"`).join(","))
			.join("\n");

		// Download CSV
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `survey-responses-${format(new Date(), "yyyy-MM-dd")}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		toast.success("Responses exported successfully");
	};

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div className="flex items-center space-x-2">
					<SidebarTrigger />
					<div>
						<h2 className="text-3xl font-bold tracking-tight">Survey Responses</h2>
						<p className="text-muted-foreground">
							{selectedSurveyId
								? `Responses for ${surveys?.find((s) => s.id === selectedSurveyId)?.title || "Selected Survey"}`
								: "View and analyze responses from all your surveys"}
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<ThemeSwitch />
					<Button onClick={handleExportResponses} variant="outline">
						<FileDown className="mr-2 h-4 w-4" />
						Export CSV
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Responses</CardTitle>
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{responsesLoading ? (
								<Skeleton className="h-7 w-12" />
							) : (
								filteredResponses.length
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{selectedSurveyId ? "For this survey" : "Across all surveys"}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Registered Users</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{responsesLoading ? (
								<Skeleton className="h-7 w-12" />
							) : (
								registeredResponses.length
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{Math.round(
								(registeredResponses.length / (filteredResponses.length || 1)) *
									100,
							)}
							% of total
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Anonymous</CardTitle>
						<Globe className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{responsesLoading ? (
								<Skeleton className="h-7 w-12" />
							) : (
								anonymousResponses.length
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{Math.round(
								(anonymousResponses.length / (filteredResponses.length || 1)) * 100,
							)}
							% of total
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">This Week</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{responsesLoading ? (
								<Skeleton className="h-7 w-12" />
							) : (
								recentResponses.length
							)}
						</div>
						<p className="text-xs text-muted-foreground">Recent activity</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search responses..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-8"
					/>
				</div>
				{!selectedSurveyId && (
					<Select value={surveyFilter} onValueChange={setSurveyFilter}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="All Surveys" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Surveys</SelectItem>
							{surveys?.map((survey) => (
								<SelectItem key={survey.id} value={survey.id.toString()}>
									{survey.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>

			{/* Main Content */}
			<Tabs defaultValue={urlTab} className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Responses</TabsTrigger>
					<TabsTrigger value="recent">Recent</TabsTrigger>
					<TabsTrigger value="anonymous">Anonymous</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Responses ({filteredResponses.length})</CardTitle>
							<CardDescription>
								Complete list of survey responses with details
							</CardDescription>
						</CardHeader>
						<CardContent>
							{responsesLoading ? (
								<div className="space-y-2">
									{Array.from({ length: 5 }).map((_, i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : filteredResponses.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Survey</TableHead>
											<TableHead>Respondent</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Submitted</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredResponses.map((response: any) => (
											<TableRow key={response.id}>
												<TableCell>
													<div>
														<div className="font-medium">
															{response.survey?.title || "Inquiro"}
														</div>
														<div className="text-sm text-muted-foreground">
															{response.answers?.length || 0} answers
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center">
														{response.isAnonymous ? (
															<>
																<Globe className="h-4 w-4 mr-2 text-muted-foreground" />
																<span className="text-muted-foreground">
																	Anonymous
																</span>
															</>
														) : (
															<>
																<User className="h-4 w-4 mr-2 text-blue-600" />
																<div>
																	<div className="font-medium">
																		{response.respondent
																			?.name || "Unknown"}
																	</div>
																	<div className="text-sm text-muted-foreground">
																		{response.respondent?.email}
																	</div>
																</div>
															</>
														)}
													</div>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															response.isAnonymous
																? "secondary"
																: "default"
														}
													>
														{response.isAnonymous
															? "Anonymous"
															: "Registered"}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{formatDistanceToNow(
															new Date(
																response.completedAt ||
																	response.createdAt,
															),
															{
																addSuffix: true,
															},
														)}
													</div>
													<div className="text-xs text-muted-foreground">
														{format(
															new Date(
																response.completedAt ||
																	response.createdAt,
															),
															"MMM d, yyyy",
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
															<DropdownMenuItem
																onClick={() =>
																	handleViewResponse(response)
																}
															>
																<Eye className="mr-2 h-4 w-4" />
																View Details
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
									<MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
									<h3 className="mt-2 text-sm font-medium">No responses yet</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										{searchTerm || surveyFilter !== "all"
											? "No responses match your current filters"
											: "Responses will appear here once people start completing your surveys"}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Responses ({recentResponses.length})</CardTitle>
							<CardDescription>
								Responses submitted in the last 7 days
							</CardDescription>
						</CardHeader>
						<CardContent>
							{responsesLoading ? (
								<div className="space-y-2">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : recentResponses.length > 0 ? (
								<div className="space-y-4">
									{recentResponses.map((response: any) => (
										<div
											key={response.id}
											className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
											onClick={() => handleViewResponse(response)}
										>
											<div className="flex items-center space-x-4">
												<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
													{response.isAnonymous ? (
														<Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
													) : (
														<User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
													)}
												</div>
												<div>
													<div className="font-medium">
														{response.survey?.title || "Unknown Survey"}
													</div>
													<div className="text-sm text-muted-foreground">
														{response.isAnonymous
															? "Anonymous response"
															: `From ${response.respondent?.name || "Unknown"}`}
													</div>
												</div>
											</div>
											<div className="text-sm text-muted-foreground">
												{formatDistanceToNow(
													new Date(
														response.completedAt || response.createdAt,
													),
													{
														addSuffix: true,
													},
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<Clock className="mx-auto h-12 w-12 text-muted-foreground" />
									<h3 className="mt-2 text-sm font-medium">
										No recent responses
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										No responses have been submitted in the last 7 days
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="anonymous" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Anonymous Responses ({anonymousResponses.length})</CardTitle>
							<CardDescription>
								Responses submitted without user identification
							</CardDescription>
						</CardHeader>
						<CardContent>
							{responsesLoading ? (
								<div className="space-y-2">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : anonymousResponses.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Survey</TableHead>
											<TableHead>IP Address</TableHead>
											<TableHead>Submitted</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{anonymousResponses.map((response: any) => (
											<TableRow key={response.id}>
												<TableCell>
													<div>
														<div className="font-medium">
															{response.survey?.title ||
																"Unknown Survey"}
														</div>
														<div className="text-sm text-muted-foreground">
															{response.answers?.length || 0} answers
														</div>
													</div>
												</TableCell>
												<TableCell>
													<code className="text-sm">
														{response.ipAddress || "Unknown"}
													</code>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														{formatDistanceToNow(
															new Date(
																response.completedAt ||
																	response.createdAt,
															),
															{
																addSuffix: true,
															},
														)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleViewResponse(response)}
													>
														<Eye className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-8">
									<Globe className="mx-auto h-12 w-12 text-muted-foreground" />
									<h3 className="mt-2 text-sm font-medium">
										No anonymous responses
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										All responses have been submitted by registered users
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Response Distribution</CardTitle>
								<CardDescription>Breakdown of response types</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<User className="h-4 w-4 text-blue-600" />
											<span className="text-sm">Registered Users</span>
										</div>
										<div className="text-sm font-medium">
											{registeredResponses.length} (
											{Math.round(
												(registeredResponses.length /
													(filteredResponses.length || 1)) *
													100,
											)}
											%)
										</div>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<Globe className="h-4 w-4 text-gray-600" />
											<span className="text-sm">Anonymous</span>
										</div>
										<div className="text-sm font-medium">
											{anonymousResponses.length} (
											{Math.round(
												(anonymousResponses.length /
													(filteredResponses.length || 1)) *
													100,
											)}
											%)
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Survey Performance</CardTitle>
								<CardDescription>Response counts by survey</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{surveys?.slice(0, 5).map((survey) => {
										const surveyResponseCount = filteredResponses.filter(
											(r: any) => r.surveyId === survey.id,
										).length;
										return (
											<div
												key={survey.id}
												className="flex items-center justify-between"
											>
												<div className="text-sm font-medium truncate">
													{survey.title}
												</div>
												<div className="text-sm text-muted-foreground">
													{surveyResponseCount}
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Response Detail Dialog */}
			<Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Response Details</DialogTitle>
						<DialogDescription>Detailed view of the survey response</DialogDescription>
					</DialogHeader>
					{selectedResponse && (
						<div className="space-y-6">
							{/* Response Info */}
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label className="text-sm font-medium">Survey</Label>
									<p className="text-sm text-muted-foreground">
										{selectedResponse.survey?.title || "Unknown Survey"}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Respondent</Label>
									<p className="text-sm text-muted-foreground">
										{selectedResponse.isAnonymous
											? "Anonymous"
											: selectedResponse.respondent?.name || "Unknown"}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Submitted</Label>
									<p className="text-sm text-muted-foreground">
										{format(
											new Date(
												selectedResponse.completedAt ||
													selectedResponse.createdAt,
											),
											"PPpp",
										)}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">IP Address</Label>
									<p className="text-sm text-muted-foreground">
										{selectedResponse.ipAddress || "Unknown"}
									</p>
								</div>
							</div>

							{/* Answers */}
							<div>
								<Label className="text-sm font-medium">Answers</Label>
								<div className="mt-2 space-y-4">
									{selectedResponse.answers?.map((answer: any, index: number) => (
										<div key={index} className="border rounded-lg p-4">
											<div className="font-medium text-sm">
												{answer.question?.text || `Question ${index + 1}`}
											</div>
											<div className="mt-2 text-sm text-muted-foreground">
												{answer.textValue ||
													answer.numberValue?.toString() ||
													answer.booleanValue?.toString() ||
													answer.selectedOption?.text ||
													"No answer provided"}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
