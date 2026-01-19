import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Question, CreateQuestionRequest } from '@/types';
import { surveyKeys } from './use-surveys';
import { toastActions } from '@/lib/toast-utils';

// Query keys for consistent cache management
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...questionKeys.lists(), { filters }] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: number) => [...questionKeys.details(), id] as const,
  bySurvey: (surveyId: number) => [...questionKeys.all, 'survey', surveyId] as const,
};

// Get questions by survey ID
export function useQuestionsBySurvey(surveyId: number) {
  return useQuery({
    queryKey: questionKeys.bySurvey(surveyId),
    queryFn: () => apiClient.questions.getQuestionsBySurvey(surveyId),
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Alias for backward compatibility
export function useQuestions(surveyId: number) {
  return useQuestionsBySurvey(surveyId);
}

// Get question by ID
export function useQuestion(id: number) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => apiClient.questions.getQuestionById(id),
    enabled: !!id,
  });
}

// Create question mutation
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: number; data: CreateQuestionRequest }) => 
      apiClient.questions.createQuestion(surveyId, data),
    onSuccess: (newQuestion, { surveyId }) => {
      // Invalidate questions for this survey
      queryClient.invalidateQueries({ queryKey: questionKeys.bySurvey(surveyId) });
      
      // Add the new question to the cache
      queryClient.setQueryData(questionKeys.detail(newQuestion.id), newQuestion);
      
      // Update the questions list in cache
      queryClient.setQueryData(questionKeys.bySurvey(surveyId), (old: Question[] | undefined) => {
        if (!old) return [newQuestion];
        return [...old, newQuestion].sort((a, b) => a.order - b.order);
      });
      
      // Invalidate survey data since question count changed
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
      queryClient.invalidateQueries({ queryKey: surveyKeys.my() });
    },
  });

  const createQuestionWithToast = async (params: { surveyId: number; data: CreateQuestionRequest }) => {
      return toastActions.question.create(mutation.mutateAsync(params));
  };

  return {
    ...mutation,
    mutateAsync: createQuestionWithToast,
  };
}

// Update question mutation
export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateQuestionRequest }) => 
      apiClient.questions.updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
      // Update the specific question in cache
      queryClient.setQueryData(questionKeys.detail(updatedQuestion.id), updatedQuestion);
      
      // Get the survey ID from the updated question
      const surveyId = updatedQuestion.surveyId;
      
      // Update the question in the survey's questions list
      queryClient.setQueryData(questionKeys.bySurvey(surveyId), (old: Question[] | undefined) => {
        if (!old) return old;
        return old.map(question => 
          question.id === updatedQuestion.id ? updatedQuestion : question
        ).sort((a, b) => a.order - b.order);
      });
      
      // Invalidate survey data
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
    },
  });

  // Wrapper function with toast.promise
  const updateQuestionWithToast = async (params: { id: number; data: CreateQuestionRequest }) => {
    return toastActions.question.update(mutation.mutateAsync(params));
  };

  return {
    ...mutation,
    mutateAsync: updateQuestionWithToast,
  };
}

// Delete question mutation
export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (id: number) => apiClient.questions.deleteQuestion(id),
    onSuccess: (_, deletedId) => {
      // Remove question from cache
      queryClient.removeQueries({ queryKey: questionKeys.detail(deletedId) });
      
      // Find and update the survey's questions list
      const questionCacheData = queryClient.getQueryData(questionKeys.detail(deletedId)) as Question;
      if (questionCacheData) {
        const surveyId = questionCacheData.surveyId;
        
        queryClient.setQueryData(questionKeys.bySurvey(surveyId), (old: Question[] | undefined) => {
          if (!old) return old;
          return old.filter(question => question.id !== deletedId);
        });
        
        // Invalidate survey data since question count changed
        queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
        queryClient.invalidateQueries({ queryKey: surveyKeys.my() });
      }
    },
  });

  // Wrapper function with toast.promise
  const deleteQuestionWithToast = async (id: number) => {
    return toastActions.question.delete(mutation.mutateAsync(id));
  };

  return {
    ...mutation,
    mutateAsync: deleteQuestionWithToast,
  };
}

// Add option to question mutation
export function useAddOptionToQuestion() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ questionId, optionText }: { questionId: number; optionText: string }) => 
      apiClient.questions.addOptionToQuestion(questionId, optionText),
    onSuccess: (newOption, { questionId }) => {
      // Invalidate the question to refetch with new option
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
      
      // Also invalidate the survey's questions list
      const questionData = queryClient.getQueryData(questionKeys.detail(questionId)) as Question;
      if (questionData) {
        queryClient.invalidateQueries({ queryKey: questionKeys.bySurvey(questionData.surveyId) });
      }
    },
  });

  // Wrapper function with toast.promise
  const addOptionWithToast = async (params: { questionId: number; optionText: string }) => {
    return toastActions.question.addOption(mutation.mutateAsync(params));
  };

  return {
    ...mutation,
    mutateAsync: addOptionWithToast,
  };
} 