import { toastActions } from '@/lib/toast-utils';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface GenerateSurveyRequest {
  topic: string;
  numberOfQuestions?: number;
  targetAudience?: string;
  additionalContext?: string;
}

interface GeneratedQuestion {
  text: string;
  description?: string;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'RADIO' | 'CHECKBOX' | 'RATING' | 'DATE' | 'EMAIL' | 'NUMBER';
  isRequired: boolean;
  options?: { text: string }[];
}

interface GeneratedSurvey {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

export const useGenerateAISurvey = () => {
  const mutation = useMutation<GeneratedSurvey, Error, GenerateSurveyRequest>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/ai/generate-survey', data);
      return response.data;
    },
  });

  const generateSurveyWithToast = async (data: GenerateSurveyRequest) => {
    return toastActions.ai.generate(mutation.mutateAsync(data));
  };

  return {
    ...mutation,
    mutateAsync: generateSurveyWithToast,
  };
}; 