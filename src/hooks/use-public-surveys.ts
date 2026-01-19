import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Survey } from '@/types';
import { toast } from 'sonner';

// Query keys for public surveys
export const publicSurveyKeys = {
  all: ['publicSurveys'] as const,
  lists: () => [...publicSurveyKeys.all, 'list'] as const,
  available: () => [...publicSurveyKeys.all, 'available'] as const,
};

// Get all available public surveys for respondents
export function useAvailableSurveys() {
  return useQuery({
    queryKey: publicSurveyKeys.available(),
    queryFn: async (): Promise<Survey[]> => {
      try {
        // Use the existing public surveys endpoint
        const surveys = await apiClient.surveys.getPublicSurveys();
        // Filter to only show published surveys that are currently active
        return surveys.filter(survey => {
          const now = new Date();
          const isActive = survey.status === 'PUBLISHED';
          const hasStarted = !survey.startDate || new Date(survey.startDate) <= now;
          const hasNotEnded = !survey.endDate || new Date(survey.endDate) >= now;
          const hasCapacity = !survey.maxResponses || (survey._count?.responses || 0) < survey.maxResponses;
          
          return isActive && hasStarted && hasNotEnded && hasCapacity;
        });
      } catch (error: any) {
        toast.error('Failed to load available surveys');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
}

// Get survey details for participation
export function useSurveyForParticipation(surveyId: number) {
  return useQuery({
    queryKey: [...publicSurveyKeys.all, 'participate', surveyId],
    queryFn: async () => {
      try {
        return await apiClient.surveys.getPublicSurvey(surveyId);
      } catch (error: any) {
        toast.error('Failed to load survey details');
        throw error;
      }
    },
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Check if user has already responded to a survey
export function useHasUserResponded(surveyId: number) {
  return useQuery({
    queryKey: ['userResponse', surveyId],
    queryFn: async (): Promise<boolean> => {
      try {
        return await apiClient.responses.hasUserResponded(surveyId);
      } catch (error) {
        // If there's an error (e.g., user not authenticated), return false
        // Don't show toast for this as it's expected behavior for anonymous users
        return false;
      }
    },
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 