import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { SubmitResponseRequest } from "@/types";
import { toastActions } from "@/lib/toast-utils";
import type { AxiosError } from "axios";

// Query keys for consistent cache management
export const responseKeys = {
	all: ["responses"] as const,
	lists: () => [...responseKeys.all, "list"] as const,
	list: (filters: Record<string, any>) => [...responseKeys.lists(), { filters }] as const,
	details: () => [...responseKeys.all, "detail"] as const,
	detail: (id: number) => [...responseKeys.details(), id] as const,
	bySurvey: (surveyId: number) => [...responseKeys.all, "survey", surveyId] as const,
	count: (surveyId: number) => [...responseKeys.all, "count", surveyId] as const,
	myResponses: () => [...responseKeys.all, "my"] as const,
	answers: (questionId: number) => [...responseKeys.all, "answers", questionId] as const,
};

// Don't retry on 401 (session missing); retry other errors up to 2 times
function retryUnless401(failureCount: number, error: unknown): boolean {
	if (error && typeof error === "object" && "response" in error) {
		const status = (error as AxiosError<unknown>).response?.status;
		if (status === 401) return false;
	}
	return failureCount < 2;
}

export interface UseCreatorQueriesOptions {
	/** Only run when authenticated; avoids 401s from race or stale session. Default true. */
	enabled?: boolean;
}

// Get responses by survey ID (creator only when used in app)
export function useResponsesBySurvey(surveyId: number, options?: UseCreatorQueriesOptions) {
	const enabled = options?.enabled !== false && !!surveyId;
	return useQuery({
		queryKey: responseKeys.bySurvey(surveyId),
		queryFn: () => apiClient.responses.getResponsesBySurvey(surveyId),
		enabled,
		staleTime: 1000 * 60 * 2, // 2 minutes
		retry: retryUnless401,
	});
}

// Get response by ID
export function useResponse(id: number) {
	return useQuery({
		queryKey: responseKeys.detail(id),
		queryFn: () => apiClient.responses.getResponseById(id),
		enabled: !!id,
	});
}

// Get response count for a survey (creator only when used in app)
export function useResponseCount(surveyId: number, options?: UseCreatorQueriesOptions) {
	const enabled = options?.enabled !== false && !!surveyId;
	return useQuery({
		queryKey: responseKeys.count(surveyId),
		queryFn: () => apiClient.responses.getResponseCount(surveyId),
		enabled,
		staleTime: 1000 * 60 * 2,
		retry: retryUnless401,
	});
}

// Get all responses for user's surveys (creator only)
export function useMyResponses(options?: UseCreatorQueriesOptions) {
	const enabled = options?.enabled !== false;
	return useQuery({
		queryKey: responseKeys.myResponses(),
		queryFn: () => apiClient.responses.getAllMyResponses(),
		staleTime: 1000 * 60 * 5,
		enabled,
		retry: retryUnless401,
	});
}

// Get answers by question ID (creator only when used in app)
export function useAnswersByQuestion(questionId: number, options?: UseCreatorQueriesOptions) {
	const enabled = options?.enabled !== false && !!questionId;
	return useQuery({
		queryKey: responseKeys.answers(questionId),
		queryFn: () => apiClient.responses.getAnswersByQuestion(questionId),
		enabled,
		staleTime: 1000 * 60 * 2,
		retry: retryUnless401,
	});
}

// Submit response mutation
export function useSubmitResponse() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({ surveyId, data }: { surveyId: number; data: SubmitResponseRequest }) =>
			apiClient.responses.submitResponse(surveyId, data),
		onSuccess: (newResponse, { surveyId }) => {
			// Invalidate responses for this survey
			queryClient.invalidateQueries({ queryKey: responseKeys.bySurvey(surveyId) });
			queryClient.invalidateQueries({ queryKey: responseKeys.count(surveyId) });
			queryClient.invalidateQueries({ queryKey: responseKeys.myResponses() });

			// Add the new response to the cache
			queryClient.setQueryData(responseKeys.detail(newResponse.id), newResponse);
		},
	});

	const submitResponseWithToast = async (params: {
		surveyId: number;
		data: SubmitResponseRequest;
	}) => {
		return toastActions.response.submit(mutation.mutateAsync(params));
	};

	return {
		...mutation,
		mutateAsync: submitResponseWithToast,
	};
}

// Get response statistics for dashboard (creator only)
export function useResponseStats(options?: UseCreatorQueriesOptions) {
	const { data: myResponses, isLoading: isLoadingResponses } = useMyResponses(options);

	// Calculate stats from responses
	const stats = {
		totalResponses: myResponses?.length || 0,
		anonymousResponses: myResponses?.filter((r) => r.isAnonymous).length || 0,
		registeredResponses: myResponses?.filter((r) => !r.isAnonymous).length || 0,
		recentResponses:
			myResponses?.filter((r) => {
				const responseDate = new Date(r.createdAt);
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				return responseDate > weekAgo;
			}).length || 0,
	};

	return {
		stats,
		responses: myResponses,
		isLoading: isLoadingResponses,
	};
}

// Calculate response rate for a survey (creator only when used in app)
export function useResponseRate(
	surveyId: number,
	totalViews?: number,
	options?: UseCreatorQueriesOptions
) {
	const { data: responseCount } = useResponseCount(surveyId, options);

	if (!totalViews || !responseCount) return 0;

	return Math.round((responseCount / totalViews) * 100);
}
