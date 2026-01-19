import prisma from '@/lib/db';
import { 
  Survey,
  SurveyResponse, 
  SurveyToken,
  SubmitResponseRequest,
  ResponseAnswer
} from '@/types';
import { getCurrentUser, checkSurveyOwnership } from './survey';
import { headers } from 'next/headers';

// Helper function to get client IP and user agent
async function getClientInfo() {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const userAgent = headersList.get('user-agent');
  
  const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return { ipAddress, userAgent };
}

// Response DAL functions
export const responseDAL = {
  // Submit response
  async submitResponse(data: SubmitResponseRequest & { surveyId: number }): Promise<SurveyResponse> {
    const { ipAddress, userAgent } = await getClientInfo();
    
    // Get current user (optional for anonymous responses)
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (error) {
      // User not authenticated, but might be allowed for anonymous surveys
    }
    
    // Validate survey exists and is published
    const survey = await prisma.survey.findUnique({
      where: {
        id: data.surveyId,
        status: 'PUBLISHED'
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });
    
    if (!survey) {
      throw new Error('Survey not found or not published');
    }
    
    // Check if anonymous responses are allowed
    if (!currentUser && !survey.allowAnonymous) {
      throw new Error('Anonymous responses not allowed for this survey');
    }
    
    // Check if survey is within date range
    const now = new Date();
    if (survey.startDate && survey.startDate > now) {
      throw new Error('Survey has not started yet');
    }
    if (survey.endDate && survey.endDate < now) {
      throw new Error('Survey has ended');
    }
    
    // Check max responses limit
    if (survey.maxResponses) {
      const responseCount = await prisma.surveyResponse.count({
        where: { surveyId: data.surveyId }
      });
      if (responseCount >= survey.maxResponses) {
        throw new Error('Survey has reached maximum responses');
      }
    }
    
    // Validate required questions are answered
    const requiredQuestions = survey.questions.filter(q => q.isRequired);
    const answeredQuestionIds = data.answers.map(a => parseInt(String(a.questionId), 10));
    
    for (const question of requiredQuestions) {
      if (!answeredQuestionIds.includes(question.id)) {
        throw new Error(`Required question "${question.text}" must be answered`);
      }
    }
    
    // Create response and answers in transaction
    return prisma.$transaction(async (tx) => {
      const response = await tx.surveyResponse.create({
        data: {
          surveyId: data.surveyId,
          respondentId: currentUser?.id,
          isAnonymous: data.isAnonymous || !currentUser,
          ipAddress,
          userAgent,
          completedAt: new Date()
        }
      });
      
      // Create answers
      for (const answer of data.answers) {
        await tx.responseAnswer.create({
          data: {
            responseId: response.id,
            questionId: parseInt(String(answer.questionId), 10),
            textValue: answer.textValue,
            numberValue: answer.numberValue,
            dateValue: answer.dateValue,
            booleanValue: answer.booleanValue,
            selectedOptionId: answer.selectedOptionId ? parseInt(String(answer.selectedOptionId), 10) : null
          }
        });
      }
      
      // Return response with answers
      return tx.surveyResponse.findUnique({
        where: { id: response.id },
        include: {
          answers: {
            include: {
              question: true,
              selectedOption: true
            }
          },
          survey: {
            select: { title: true, id: true }
          }
        }
      }) as any;
    });
  },

  // Get responses by survey (creator only)
  async getResponsesBySurvey(surveyId: number): Promise<SurveyResponse[]> {
    const user = await getCurrentUser();
    await checkSurveyOwnership(surveyId, user.id);
    
    return prisma.surveyResponse.findMany({
      where: { surveyId },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true
          }
        },
        survey: {
          select: { id: true, title: true, description: true }
        },
        respondent: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any;
  },

  // Get response by ID (creator only)
  async getResponseById(responseId: number): Promise<SurveyResponse> {
    const user = await getCurrentUser();
    
    const response = await prisma.surveyResponse.findUnique({
      where: { id: responseId },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true
          }
        },
        survey: {
          select: { creatorId: true, title: true }
        },
        respondent: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!response) {
      throw new Error('Response not found');
    }
    
    // Check if user owns the survey
    if (response.survey.creatorId !== user.id) {
      throw new Error('Forbidden: Access denied');
    }
    
    return response as any;
  },

  // Get response count
  async getResponseCount(surveyId: number): Promise<number> {
    const user = await getCurrentUser();
    await checkSurveyOwnership(surveyId, user.id);
    
    return prisma.surveyResponse.count({
      where: { surveyId }
    });
  },

  // Get answers by question (creator only)
  async getAnswersByQuestion(questionId: number): Promise<ResponseAnswer[]> {
    const user = await getCurrentUser();
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { survey: true }
    });
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    await checkSurveyOwnership(question.surveyId, user.id);
    
    return prisma.responseAnswer.findMany({
      where: { questionId },
      include: {
        selectedOption: true,
        response: {
          select: { id: true, createdAt: true, isAnonymous: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any;
  },

  // Check if current user has already responded to a survey
  async hasUserResponded(surveyId: number): Promise<boolean> {
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (error) {
      // User not authenticated, return false
      return false;
    }

    if (!currentUser) {
      return false;
    }

    const existingResponse = await prisma.surveyResponse.findFirst({
      where: {
        surveyId,
        respondentId: currentUser.id
      }
    });

    return !!existingResponse;
  }
};

// Token DAL functions
export const tokenDAL = {
  // Generate survey token
  async generateSurveyToken(surveyId: number): Promise<SurveyToken> {
    const user = await getCurrentUser();
    await checkSurveyOwnership(surveyId, user.id);
    
    return prisma.surveyToken.create({
      data: {
        surveyId,
        // Token is auto-generated by Prisma default
      },
      include: {
        survey: {
          select: { id: true, title: true, status: true }
        }
      }
    }) as any;
  },

  // Get survey by token
  async getSurveyByToken(token: string): Promise<Survey> {
    const surveyToken = await prisma.surveyToken.findUnique({
      where: { 
        token,
        isActive: true
      },
      include: {
        survey: {
          include: {
            questions: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
    
    if (!surveyToken) {
      throw new Error('Invalid or inactive token');
    }
    
    // Check if token has expired
    if (surveyToken.expiresAt && surveyToken.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }
    
    // Check if token has reached max uses
    if (surveyToken.maxUses && surveyToken.currentUses >= surveyToken.maxUses) {
      throw new Error('Token has reached maximum uses');
    }
    
    return surveyToken.survey as any;
  },

  // Submit response by token
  async submitResponseByToken(
    token: string, 
    data: Omit<SubmitResponseRequest, 'surveyId'>
  ): Promise<SurveyResponse> {
    const { ipAddress, userAgent } = await getClientInfo();
    
    const surveyToken = await prisma.surveyToken.findUnique({
      where: { 
        token,
        isActive: true
      },
      include: {
        survey: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });
    
    if (!surveyToken) {
      throw new Error('Invalid or inactive token');
    }
    
    // Check token validity (same checks as getSurveyByToken)
    if (surveyToken.expiresAt && surveyToken.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }
    
    if (surveyToken.maxUses && surveyToken.currentUses >= surveyToken.maxUses) {
      throw new Error('Token has reached maximum uses');
    }
    
    // Submit response using the response DAL
    const response = await responseDAL.submitResponse({
      ...data,
      surveyId: surveyToken.surveyId
    });
    
    // Update token usage count
    await prisma.surveyToken.update({
      where: { id: surveyToken.id },
      data: {
        currentUses: { increment: 1 }
      }
    });
    
    return response;
  },

  // Get all tokens for a survey (creator only)
  async getTokensBySurvey(surveyId: number): Promise<SurveyToken[]> {
    const user = await getCurrentUser();
    await checkSurveyOwnership(surveyId, user.id);
    
    return prisma.surveyToken.findMany({
      where: { surveyId },
      orderBy: { createdAt: 'desc' }
    }) as any;
  },

  // Deactivate token (creator only)
  async deactivateToken(tokenId: number): Promise<SurveyToken> {
    const user = await getCurrentUser();
    
    const token = await prisma.surveyToken.findUnique({
      where: { id: tokenId },
      include: { survey: true }
    });
    
    if (!token) {
      throw new Error('Token not found');
    }
    
    await checkSurveyOwnership(token.surveyId, user.id);
    
    return prisma.surveyToken.update({
      where: { id: tokenId },
      data: { isActive: false }
    }) as any;
  }
}; 