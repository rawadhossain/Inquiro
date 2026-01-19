import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { apiClient } from '@/lib/api-client';
import { SubmitResponseRequest } from '@/types';
import { toastActions } from '@/lib/toast-utils';

// Query keys for consistent cache management
export const responseKeys = {
  all: ['responses'] as const,
  lists: () => [...responseKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...responseKeys.lists(), { filters }] as const,
  details: () => [...responseKeys.all, 'detail'] as const,
  detail: (id: number) => [...responseKeys.details(), id] as const,
  bySurvey: (surveyId: number) => [...responseKeys.all, 'survey', surveyId] as const,
  count: (surveyId: number) => [...responseKeys.all, 'count', surveyId] as const,
  myResponses: () => [...responseKeys.all, 'my'] as const,
  answers: (questionId: number) => [...responseKeys.all, 'answers', questionId] as const,
};

// Get responses by survey ID
export function useResponsesBySurvey(surveyId: number) {
  return useQuery({
    queryKey: responseKeys.bySurvey(surveyId),
    queryFn: () => apiClient.responses.getResponsesBySurvey(surveyId),
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 2, // 2 minutes
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

// Get response count for a survey
export function useResponseCount(surveyId: number) {
  return useQuery({
    queryKey: responseKeys.count(surveyId),
    queryFn: () => apiClient.responses.getResponseCount(surveyId),
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 2,
  });
}

// Get all responses for user's surveys
export function useMyResponses() {
  return useQuery({
    queryKey: responseKeys.myResponses(),
    queryFn: () => apiClient.responses.getAllMyResponses(),
    staleTime: 1000 * 60 * 5,
  });
}

// Get answers by question ID
export function useAnswersByQuestion(questionId: number) {
  return useQuery({
    queryKey: responseKeys.answers(questionId),
    queryFn: () => apiClient.responses.getAnswersByQuestion(questionId),
    enabled: !!questionId,
    staleTime: 1000 * 60 * 2,
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

  const submitResponseWithToast = async (params: { surveyId: number; data: SubmitResponseRequest }) => {
    return toastActions.response.submit(mutation.mutateAsync(params));
  };

  return {
    ...mutation,
    mutateAsync: submitResponseWithToast,
  };
}

// Get response statistics for dashboard
export function useResponseStats() {
  const { data: myResponses, isLoading: isLoadingResponses } = useMyResponses();
  
  // Calculate stats from responses
  const stats = {
    totalResponses: myResponses?.length || 0,
    anonymousResponses: myResponses?.filter(r => r.isAnonymous).length || 0,
    registeredResponses: myResponses?.filter(r => !r.isAnonymous).length || 0,
    recentResponses: myResponses?.filter(r => {
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

// Calculate response rate for a survey
export function useResponseRate(surveyId: number, totalViews?: number) {
  const { data: responseCount } = useResponseCount(surveyId);
  
  if (!totalViews || !responseCount) return 0;
  
  return Math.round((responseCount / totalViews) * 100);
} 