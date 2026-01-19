"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	FileText,
	Eye,
	Users,
	Globe,
	Search,
	Filter,
	Clock,
	CheckCircle,
	ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAvailableSurveys } from "@/hooks/use-public-surveys";

export default function PublicSurveysPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");

	// Get available public surveys
	const { data: surveys, isLoading: surveysLoading, error: surveysError } = useAvailableSurveys();

	// Filter surveys based on search term
	const filteredSurveys =
		surveys?.filter((survey) => {
			const matchesSearch =
				survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(survey.description &&
					survey.description.toLowerCase().includes(searchTerm.toLowerCase()));
			return matchesSearch;
		}) || [];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PUBLISHED":
				return (
					<Badge variant="default" className="bg-green-600">
						<Globe className="h-3 w-3 mr-1" />
						Available
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (surveysError) {
		return (
			<div className="flex-1 space-y-4 p-8 pt-6">
				<div className="text-center py-8">
					<div className="text-red-500 mb-2">Error loading public surveys</div>
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
						<h2 className="text-3xl font-bold tracking-tight">Public Surveys</h2>
						<p className="text-muted-foreground">
							Discover and participate in available surveys
						</p>
					</div>
				</div>
			</div>

			{/* Search */}
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
			</div>

			{/* Surveys Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
								className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
								onClick={() => router.push(`/survey/${survey.id}`)}
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="text-lg group-hover:text-primary transition-colors">
												{survey.title}
											</CardTitle>
											<CardDescription className="mt-1 line-clamp-2">
												{survey.description || "No description available"}
											</CardDescription>
										</div>
										<ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Status and Visibility */}
										<div className="flex items-center justify-between">
											{getStatusBadge(survey.status)}
											<div className="flex items-center text-sm text-muted-foreground">
												<Globe className="h-4 w-4 mr-1" />
												Public
											</div>
										</div>

										{/* Survey Info */}
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground flex items-center">
													<FileText className="h-4 w-4 mr-1" />
													{survey._count?.questions || 0} questions
												</span>
												<span className="text-muted-foreground flex items-center">
													<Users className="h-4 w-4 mr-1" />
													{survey._count?.responses || 0} responses
												</span>
											</div>

											{/* Anonymous indicator */}
											{survey.allowAnonymous && (
												<div className="flex items-center text-sm text-green-600">
													<CheckCircle className="h-4 w-4 mr-1" />
													Anonymous participation allowed
												</div>
											)}

											{/* Response limit */}
											{survey.maxResponses && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														Response limit:
													</span>
													<span className="font-medium">
														{survey._count?.responses || 0}/
														{survey.maxResponses}
													</span>
												</div>
											)}

											{/* Time info */}
											<div className="flex items-center text-xs text-muted-foreground">
												<Clock className="h-3 w-3 mr-1" />
												Updated{" "}
												{formatDistanceToNow(new Date(survey.updatedAt), {
													addSuffix: true,
												})}
											</div>
										</div>

										{/* Action Button */}
										<Button
											className="w-full"
											onClick={(e) => {
												e.stopPropagation();
												router.push(`/survey/${survey.id}`);
											}}
										>
											<Eye className="h-4 w-4 mr-2" />
											Take Survey
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
			</div>

			{/* Empty State */}
			{!surveysLoading && filteredSurveys.length === 0 && (
				<div className="text-center py-12">
					<FileText className="mx-auto h-12 w-12 text-muted-foreground" />
					<h3 className="mt-2 text-sm font-medium">
						{searchTerm ? "No surveys found" : "No public surveys available"}
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						{searchTerm
							? "Try adjusting your search terms"
							: "Check back later for new surveys to participate in."}
					</p>
					{searchTerm && (
						<div className="mt-6">
							<Button variant="outline" onClick={() => setSearchTerm("")}>
								Clear Search
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Survey Count */}
			{!surveysLoading && filteredSurveys.length > 0 && (
				<div className="text-center text-sm text-muted-foreground">
					Showing {filteredSurveys.length} of {surveys?.length || 0} available surveys
				</div>
			)}
		</div>
	);
}
