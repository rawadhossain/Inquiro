// Enums
export enum SurveyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED'
}

export enum QuestionType {
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  RATING = 'RATING',
  DATE = 'DATE',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER'
}

export enum UserRole {
  RESPONDENT = 'RESPONDENT',
  CREATOR = 'CREATOR'
}

// Base types
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Survey {
  id: number;
  title: string;
  description: string | null;
  status: SurveyStatus;
  isPublic: boolean;
  allowAnonymous: boolean;
  maxResponses: number | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  creator?: User;
  questions?: Question[];
  responses?: SurveyResponse[];
  tokens?: SurveyToken[];
  _count?: {
    questions: number;
    responses: number;
  };
}

export interface Question {
  id: number;
  text: string;
  description: string | null;
  type: QuestionType;
  isRequired: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  surveyId: number;
  survey?: Survey;
  options?: QuestionOption[];
  answers?: ResponseAnswer[];
}

export interface QuestionOption {
  id: number;
  text: string;
  value: string | null;
  order: number;
  createdAt: Date;
  questionId: number;
  question?: Question;
}

export interface SurveyResponse {
  id: number;
  isAnonymous: boolean;
  ipAddress?: string;
  userAgent?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  surveyId: number;
  respondentId?: string;
  survey?: Survey;
  respondent?: User;
  answers?: ResponseAnswer[];
  tokenId?: number;
  token?: SurveyToken;
}

export interface ResponseAnswer {
  id: number;
  textValue?: string;
  numberValue?: number;
  dateValue?: Date;
  booleanValue?: boolean;
  createdAt: Date;
  responseId: number;
  questionId: number;
  selectedOptionId?: number;
  response?: SurveyResponse;
  question?: Question;
  selectedOption?: QuestionOption;
}

export interface SurveyToken {
  id: number;
  token: string;
  isActive: boolean;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  createdAt: Date;
  updatedAt: Date;
  surveyId: number;
  survey?: Survey;
  responses?: SurveyResponse[];
}

// Request types
export interface CreateSurveyRequest {
  title: string;
  description?: string;
  isPublic?: boolean;
  allowAnonymous?: boolean;
  maxResponses?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateSurveyRequest {
  title?: string;
  description?: string;
  isPublic?: boolean;
  allowAnonymous?: boolean;
  maxResponses?: number;
  startDate?: Date;
  endDate?: Date;
  status?: SurveyStatus;
}

export interface CreateQuestionRequest {
  text: string;
  description?: string;
  type: QuestionType;
  isRequired?: boolean;
  order: number;
  options?: CreateQuestionOptionRequest[];
}

export interface CreateQuestionOptionRequest {
  text: string;
  value?: string;
  order: number;
}

export interface SubmitResponseRequest {
  isAnonymous?: boolean;
  answers: {
    questionId: number;
    textValue?: string;
    numberValue?: number;
    dateValue?: Date;
    booleanValue?: boolean;
    selectedOptionId?: number;
  }[];
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
} 