import axios from 'axios';
import { 
  Survey, 
  Question, 
  SurveyResponse, 
  SurveyToken,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateQuestionRequest,
  SubmitResponseRequest
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth headers if needed
api.interceptors.request.use((config) => {
  // Add any auth headers here if needed
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// Survey API functions
export const surveyApi = {
  // Get all user's surveys
  async getMySurveys(): Promise<Survey[]> {
    const response = await api.get('/surveys/my');
    return response.data.data;
  },

  // Get survey count
  async getSurveyCount(): Promise<number> {
    const response = await api.get('/surveys/count');
    return response.data; // Count API returns direct value
  },

  // Get public surveys
  async getPublicSurveys(): Promise<Survey[]> {
    const response = await api.get('/surveys');
    return response.data.data;
  },

  // Get survey by ID
  async getSurveyById(id: number): Promise<Survey> {
    const response = await api.get(`/surveys/${id}`);
    return response.data.data;
  },

  // Create survey
  async createSurvey(data: CreateSurveyRequest): Promise<Survey> {
    const response = await api.post('/surveys', data);
    return response.data.data; // Extract data from API wrapper
  },

  // Update survey
  async updateSurvey(id: number, data: UpdateSurveyRequest): Promise<Survey> {
    const response = await api.put(`/surveys/${id}`, data);
    return response.data.data;
  },

  // Delete survey
  async deleteSurvey(id: number): Promise<void> {
    await api.delete(`/surveys/${id}`);
  },

  // Publish survey
  async publishSurvey(id: number): Promise<Survey> {
    const response = await api.post(`/surveys/${id}/publish`);
    return response.data.data;
  },

  // Get public survey (for anonymous access)
  async getPublicSurvey(id: number): Promise<Survey> {
    const response = await api.get(`/surveys/${id}/public`);
    return response.data.data;
  }
};

// Question API functions
export const questionApi = {
  // Get questions for a survey
  async getQuestionsBySurvey(surveyId: number): Promise<Question[]> {
    const response = await api.get(`/questions/survey/${surveyId}`);
    return response.data.data;
  },

  // Get question by ID
  async getQuestionById(id: number): Promise<Question> {
    const response = await api.get(`/questions/${id}`);
    return response.data.data;
  },

  // Create question
  async createQuestion(surveyId: number, data: CreateQuestionRequest): Promise<Question> {
    const response = await api.post(`/questions/survey/${surveyId}`, data);
    return response.data.data;
  },

  // Update question
  async updateQuestion(id: number, data: CreateQuestionRequest): Promise<Question> {
    const response = await api.put(`/questions/${id}`, data);
    return response.data.data;
  },

  // Delete question
  async deleteQuestion(id: number): Promise<void> {
    await api.delete(`/questions/${id}`);
  },

  // Add option to question
  async addOptionToQuestion(questionId: number, optionText: string): Promise<any> {
    const response = await api.post(`/questions/${questionId}/options`, { optionText });
    return response.data.data;
  }
};

// Response API functions
export const responseApi = {
  // Submit response
  async submitResponse(surveyId: number, data: SubmitResponseRequest): Promise<SurveyResponse> {
    const response = await api.post('/responses/submit', { ...data, surveyId });
    return response.data.data;
  },

  // Get responses by survey (creator only)
  async getResponsesBySurvey(surveyId: number): Promise<SurveyResponse[]> {
    const response = await api.get(`/responses/survey/${surveyId}`);
    return response.data.data;
  },

  // Get response by ID
  async getResponseById(id: number): Promise<SurveyResponse> {
    const response = await api.get(`/responses/${id}`);
    return response.data.data;
  },

  // Get response count for survey
  async getResponseCount(surveyId: number): Promise<number> {
    const response = await api.get(`/responses/survey/${surveyId}/count`);
    return response.data; // Count API returns direct value
  },

  // Get answers by question
  async getAnswersByQuestion(questionId: number): Promise<any[]> {
    const response = await api.get(`/responses/question/${questionId}/answers`);
    return response.data.data;
  },

  // Get all responses for user's surveys
  async getAllMyResponses(): Promise<SurveyResponse[]> {
    // This would need a custom endpoint or we'll aggregate from individual surveys
    const surveys = await surveyApi.getMySurveys();
    const allResponses: SurveyResponse[] = [];
    
    for (const survey of surveys) {
      try {
        const responses = await this.getResponsesBySurvey(survey.id);
        allResponses.push(...responses);
      } catch (error) {
        console.warn(`Failed to fetch responses for survey ${survey.id}:`, error);
      }
    }
    
    return allResponses;
  },

  // Get analytics data for responses (future API endpoint)
  async getResponseAnalytics(surveyId?: number): Promise<any> {
    const endpoint = surveyId ? `/responses/analytics/${surveyId}` : '/responses/analytics';
    const response = await api.get(endpoint);
    return response.data.data;
  },

  // Get question-level analytics
  async getQuestionAnalytics(questionId: number): Promise<any> {
    const response = await api.get(`/responses/question/${questionId}/analytics`);
    return response.data.data;
  },

  // Check if user has already responded to a survey
  async hasUserResponded(surveyId: number): Promise<boolean> {
    const response = await api.get(`/responses/survey/${surveyId}/has-responded`);
    return response.data.data;
  }
};

// Token API functions
export const tokenApi = {
  // Generate survey token
  async generateSurveyToken(surveyId: number): Promise<SurveyToken> {
    const response = await api.post(`/survey-tokens/survey/${surveyId}`);
    return response.data;
  },

  // Get survey by token
  async getSurveyByToken(token: string): Promise<Survey> {
    const response = await api.get(`/survey-tokens/${token}/survey`);
    return response.data;
  },

  // Submit response by token
  async submitResponseByToken(token: string, data: Omit<SubmitResponseRequest, 'surveyId'>): Promise<SurveyResponse> {
    const response = await api.post(`/survey-tokens/${token}/respond`, data);
    return response.data;
  },

  // Get tokens for survey
  async getTokensBySurvey(surveyId: number): Promise<SurveyToken[]> {
    const response = await api.get(`/survey-tokens/survey/${surveyId}`);
    return response.data;
  }
};

// User API functions
export const userApi = {
  // Get current user
  async getCurrentUser(): Promise<any> {
    const response = await api.get('/user/me');
    return response.data;
  }
};

// Export main API object
export const apiClient = {
  surveys: surveyApi,
  questions: questionApi,
  responses: responseApi,
  tokens: tokenApi,
  user: userApi,
};

export default apiClient; 