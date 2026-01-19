"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAvailableSurveys,
  useHasUserResponded,
} from "@/hooks/use-public-surveys";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Clock,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// Individual survey card component that checks user response status
function SurveyCard({
  survey,
  getSurveyStatus,
  getTimeRemaining,
  formatDate,
}: {
  survey: any;
  getSurveyStatus: (survey: any) => { label: string; variant: any };
  getTimeRemaining: (endDate: string | Date | null) => string | null;
  formatDate: (date: string | Date | null) => string;
}) {
  const { data: hasResponded, isLoading: responseLoading } =
    useHasUserResponded(survey.id);

  const status = getSurveyStatus(survey);
  const timeRemaining = getTimeRemaining(survey.endDate);
  const canParticipate =
    (status.label === "Active" || status.label === "Ending Soon") &&
    !hasResponded;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {survey.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={status.variant} className="w-fit">
                {status.label}
              </Badge>
              {hasResponded && (
                <Badge variant="secondary" className="w-fit">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
        {survey.description && (
          <CardDescription className="line-clamp-3">
            {survey.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {survey._count?.responses || 0} response
              {(survey._count?.responses || 0) !== 1 ? "s" : ""}
              {survey.maxResponses && ` / ${survey.maxResponses} max`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Ends: {formatDate(survey.endDate)}</span>
          </div>

          {timeRemaining && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span
                className={
                  timeRemaining.includes("left") ? "text-orange-600" : ""
                }
              >
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2">
          {responseLoading ? (
            <Button disabled className="w-full">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              Checking...
            </Button>
          ) : hasResponded ? (
            <Button disabled variant="secondary" className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Already Completed
            </Button>
          ) : canParticipate ? (
            <Button asChild className="w-full">
              <Link href={`/survey/${survey.id}`}>
                Start Survey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button disabled className="w-full">
              {status.label === "Full"
                ? "Survey Full"
                : status.label === "Ended"
                  ? "Survey Ended"
                  : status.label === "Upcoming"
                    ? "Not Started"
                    : "Unavailable"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RespondentDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { data: surveys = [], isLoading, error } = useAvailableSurveys();

  // Filter surveys based on search term
  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort surveys
  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "ending-soon":
        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case "most-responses":
        return (b._count?.responses || 0) - (a._count?.responses || 0);
      default:
        return 0;
    }
  });

  const getSurveyStatus = (survey: any) => {
    const now = new Date();
    const endDate = survey.endDate ? new Date(survey.endDate) : null;
    const startDate = survey.startDate ? new Date(survey.startDate) : null;

    if (
      survey.maxResponses &&
      (survey._count?.responses || 0) >= survey.maxResponses
    ) {
      return { label: "Full", variant: "secondary" as const };
    }

    if (endDate && endDate < now) {
      return { label: "Ended", variant: "secondary" as const };
    }

    if (startDate && startDate > now) {
      return { label: "Upcoming", variant: "outline" as const };
    }

    if (
      endDate &&
      endDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      return { label: "Ending Soon", variant: "destructive" as const };
    }

    return { label: "Active", variant: "default" as const };
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "No deadline";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeRemaining = (endDate: string | Date | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
    return "Less than 1 hour left";
  };

  // Calculate stats
  const totalSurveys = surveys.length;
  const totalResponses = surveys.reduce(
    (acc, survey) => acc + (survey._count?.responses || 0),
    0
  );
  const endingSoon = surveys.filter((survey) => {
    if (!survey.endDate) return false;
    const endDate = new Date(survey.endDate);
    const now = new Date();
    return (
      endDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000 &&
      endDate > now
    );
  }).length;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Available Surveys</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load surveys. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Surveys</h1>
        <p className="text-muted-foreground">
          Discover and participate in surveys that interest you
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Surveys
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSurveys}</div>
            <p className="text-xs text-muted-foreground">
              Ready for participation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              From all participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ending Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endingSoon}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="ending-soon">Ending Soon</SelectItem>
            <SelectItem value="most-responses">Most Responses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Surveys Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedSurveys.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No surveys found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "No surveys are currently available for participation"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedSurveys.map((survey) => {
            return (
              <SurveyCard
                key={survey.id}
                survey={survey}
                getSurveyStatus={getSurveyStatus}
                getTimeRemaining={getTimeRemaining}
                formatDate={formatDate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
