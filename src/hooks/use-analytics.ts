import { useQuery } from '@tanstack/react-query';
import { useMySurveys } from './use-surveys';
import { useMyResponses } from './use-responses';
import { Survey, SurveyResponse, QuestionType } from '@/types';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

// Analytics query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: () => [...analyticsKeys.all, 'overview'] as const,
  timesSeries: (period: string) => [...analyticsKeys.all, 'timeSeries', period] as const,
  questionAnalytics: (questionId: number) => [...analyticsKeys.all, 'question', questionId] as const,
  surveyAnalytics: (surveyId: number) => [...analyticsKeys.all, 'survey', surveyId] as const,
};

// Types for analytics data
export interface AnalyticsOverview {
  totalSurveys: number;
  totalResponses: number;
  totalQuestions: number;
  avgResponseRate: number;
  avgCompletionTime: number;
  activeNow: number;
  growthRate: number;
  responseDistribution: {
    anonymous: number;
    registered: number;
  };
  statusDistribution: {
    published: number;
    draft: number;
    closed: number;
  };
}

export interface TimeSeriesData {
  date: string;
  responses: number;
  surveys: number;
  completionRate: number;
}

export interface QuestionAnalytics {
  questionId: number;
  type: QuestionType;
  text: string;
  totalAnswers: number;
  skipRate: number;
  averageTime?: number;
  responseDistribution: Record<string, number>;
  sentimentScore?: number;
}

export interface SurveyAnalytics {
  surveyId: number;
  title: string;
  totalResponses: number;
  completionRate: number;
  avgResponseTime: number;
  dropOffPoints: Array<{
    questionId: number;
    questionText: string;
    dropOffRate: number;
  }>;
  bestPerformingQuestions: Array<{
    questionId: number;
    questionText: string;
    engagementScore: number;
  }>;
  demographics: {
    anonymous: number;
    registered: number;
    uniqueIPs: number;
  };
}

// Main analytics overview hook
export function useAnalyticsOverview() {
  const { data: surveys, isLoading: surveysLoading } = useMySurveys();
  const { data: responses, isLoading: responsesLoading } = useMyResponses();

  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: () => calculateOverviewAnalytics(surveys || [], responses || []),
    enabled: !surveysLoading && !responsesLoading && !!surveys && !!responses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Time series analytics hook
export function useTimeSeriesAnalytics(period: 'week' | 'month' | 'quarter' = 'month') {
  const { data: surveys } = useMySurveys();
  const { data: responses } = useMyResponses();

  return useQuery({
    queryKey: analyticsKeys.timesSeries(period),
    queryFn: () => calculateTimeSeriesAnalytics(surveys || [], responses || [], period),
    enabled: !!surveys && !!responses,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Survey-specific analytics hook
export function useSurveyAnalytics(surveyId: number) {
  const { data: surveys } = useMySurveys();
  const { data: responses } = useMyResponses();

  return useQuery({
    queryKey: analyticsKeys.surveyAnalytics(surveyId),
    queryFn: () => calculateSurveyAnalytics(surveyId, surveys || [], responses || []),
    enabled: !!surveyId && !!surveys && !!responses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper function to calculate overview analytics
function calculateOverviewAnalytics(surveys: Survey[], responses: SurveyResponse[]): AnalyticsOverview {
  const now = new Date();
  const lastWeek = subDays(now, 7);

  // Basic counts
  const totalSurveys = surveys.length;
  const totalResponses = responses.length;
  const totalQuestions = surveys.reduce((sum, survey) => sum + (survey._count?.questions || 0), 0);

  // Status distribution
  const statusDistribution = {
    published: surveys.filter(s => s.status === 'PUBLISHED').length,
    draft: surveys.filter(s => s.status === 'DRAFT').length,
    closed: surveys.filter(s => s.status === 'CLOSED').length,
  };

  // Response distribution
  const responseDistribution = {
    anonymous: responses.filter(r => r.isAnonymous).length,
    registered: responses.filter(r => !r.isAnonymous).length,
  };

  // Calculate average response rate (simplified - assuming 100 views per survey)
  const avgResponseRate = surveys.length > 0 
    ? Math.round(surveys.reduce((acc, survey) => {
        const count = survey._count?.responses || 0;
        const rate = count > 0 ? (count / 100) * 100 : 0; // Simplified view count
        return acc + rate;
      }, 0) / surveys.length)
    : 0;

  // Calculate growth rate (responses this week vs last week)
  const thisWeekResponses = responses.filter(r => new Date(r.createdAt) >= lastWeek).length;
  const lastWeekResponses = responses.filter(r => {
    const responseDate = new Date(r.createdAt);
    return responseDate >= subDays(lastWeek, 7) && responseDate < lastWeek;
  }).length;
  
  const growthRate = lastWeekResponses > 0 
    ? Math.round(((thisWeekResponses - lastWeekResponses) / lastWeekResponses) * 100)
    : thisWeekResponses > 0 ? 100 : 0;

  // Average completion time (mock calculation)
  const avgCompletionTime = Math.round(Math.random() * 300 + 120); // 2-7 minutes mock

  // Active surveys (published)
  const activeNow = statusDistribution.published;

  return {
    totalSurveys,
    totalResponses,
    totalQuestions,
    avgResponseRate,
    avgCompletionTime,
    activeNow,
    growthRate,
    responseDistribution,
    statusDistribution,
  };
}

// Helper function to calculate time series analytics
function calculateTimeSeriesAnalytics(
  surveys: Survey[], 
  responses: SurveyResponse[], 
  period: 'week' | 'month' | 'quarter'
): TimeSeriesData[] {
  const now = new Date();
  let startDate: Date;
  let days: number;

  switch (period) {
    case 'week':
      startDate = startOfWeek(now);
      days = 7;
      break;
    case 'month':
      startDate = startOfMonth(now);
      days = 30;
      break;
    case 'quarter':
      startDate = subDays(now, 90);
      days = 90;
      break;
  }

  const timeSeriesData: TimeSeriesData[] = [];

  for (let i = 0; i < days; i++) {
    const date = subDays(now, days - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayResponses = responses.filter(r => 
      format(new Date(r.createdAt), 'yyyy-MM-dd') === dateStr
    ).length;

    const daySurveys = surveys.filter(s => 
      format(new Date(s.createdAt), 'yyyy-MM-dd') === dateStr
    ).length;

    const completionRate = dayResponses > 0 ? Math.round(Math.random() * 30 + 70) : 0; // Mock completion rate

    timeSeriesData.push({
      date: dateStr,
      responses: dayResponses,
      surveys: daySurveys,
      completionRate,
    });
  }

  return timeSeriesData;
}

// Helper function to calculate survey-specific analytics
function calculateSurveyAnalytics(
  surveyId: number, 
  surveys: Survey[], 
  responses: SurveyResponse[]
): SurveyAnalytics | null {
  const survey = surveys.find(s => s.id === surveyId);
  if (!survey) return null;

  const surveyResponses = responses.filter(r => r.surveyId === surveyId);
  const totalResponses = surveyResponses.length;

  // Demographics
  const demographics = {
    anonymous: surveyResponses.filter(r => r.isAnonymous).length,
    registered: surveyResponses.filter(r => !r.isAnonymous).length,
    uniqueIPs: new Set(surveyResponses.map(r => r.ipAddress).filter(Boolean)).size,
  };

  // Mock data for completion rate and response time
  const completionRate = totalResponses > 0 ? Math.round(Math.random() * 20 + 75) : 0;
  const avgResponseTime = Math.round(Math.random() * 180 + 120); // 2-5 minutes

  // Mock drop-off points (would need actual question-level analytics)
  const dropOffPoints = survey.questions?.slice(0, 3).map((q, index) => ({
    questionId: q.id,
    questionText: q.text,
    dropOffRate: Math.round(Math.random() * 15 + 5), // 5-20% drop-off
  })) || [];

  // Mock best performing questions
  const bestPerformingQuestions = survey.questions?.slice(0, 3).map((q, index) => ({
    questionId: q.id,
    questionText: q.text,
    engagementScore: Math.round(Math.random() * 30 + 70), // 70-100% engagement
  })) || [];

  return {
    surveyId,
    title: survey.title,
    totalResponses,
    completionRate,
    avgResponseTime,
    dropOffPoints,
    bestPerformingQuestions,
    demographics,
  };
}

// Question type distribution analytics
export function useQuestionTypeAnalytics() {
  const { data: surveys } = useMySurveys();

  return useQuery({
    queryKey: [...analyticsKeys.all, 'questionTypes'],
    queryFn: () => {
      if (!surveys) return null;
      
      const questionTypes: Record<QuestionType, number> = {
        TEXT: 0,
        MULTIPLE_CHOICE: 0,
        CHECKBOX: 0,
        RADIO: 0,
        RATING: 0,
        DATE: 0,
        EMAIL: 0,
        NUMBER: 0,
      };

      surveys.forEach(survey => {
        survey.questions?.forEach(question => {
          questionTypes[question.type]++;
        });
      });

      return Object.entries(questionTypes).map(([type, count]) => ({
        type,
        count,
        percentage: surveys.length > 0 ? Math.round((count / surveys.reduce((sum, s) => sum + (s._count?.questions || 0), 0)) * 100) : 0,
      }));
    },
    enabled: !!surveys,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Response rate trends
export function useResponseRateTrends() {
  const { data: surveys } = useMySurveys();
  const { data: responses } = useMyResponses();

  return useQuery({
    queryKey: [...analyticsKeys.all, 'responseRates'],
    queryFn: () => {
      if (!surveys || !responses) return [];

      return surveys.map(survey => {
        const surveyResponses = responses.filter(r => r.surveyId === survey.id);
        const responseRate = surveyResponses.length > 0 ? 
          Math.round((surveyResponses.length / 100) * 100) : 0; // Mock view count

        return {
          surveyId: survey.id,
          title: survey.title,
          responseCount: surveyResponses.length,
          responseRate,
          status: survey.status,
          createdAt: survey.createdAt,
        };
      }).sort((a, b) => b.responseRate - a.responseRate);
    },
    enabled: !!surveys && !!responses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 