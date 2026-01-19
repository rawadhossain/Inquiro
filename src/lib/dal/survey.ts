import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { 
  Survey, 
  Question, 
  SurveyResponse, 
  SurveyToken,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateQuestionRequest,
  SubmitResponseRequest,
  SurveyStatus,
  UserRole
} from '@/types';
import { headers } from 'next/headers';

// Helper function to get current user
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session.user;
}

// Helper function to check if user is creator
export async function requireCreatorRole() {
  const user = await getCurrentUser();
  if (user.role !== UserRole.CREATOR) {
    throw new Error('Forbidden: Creator role required');
  }
  return user;
}

// Helper function to check survey ownership
export async function checkSurveyOwnership(surveyId: number, userId: string) {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { creatorId: true }
  });
  
  if (!survey) {
    throw new Error('Survey not found');
  }
  
  if (survey.creatorId !== userId) {
    throw new Error('Forbidden: Not survey owner');
  }
  
  return survey;
}

// Survey DAL functions
export const surveyDAL = {
  // Get all published surveys (public access)
  async getAllPublicSurveys(): Promise<Survey[]> {
    return await prisma.survey.findMany({
      where: {
        status: SurveyStatus.PUBLISHED,
        isPublic: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { questions: true, responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
          }) as any;
  },

  // Get surveys by current user
  async getSurveysByUser(): Promise<Survey[]> {
    const user = await requireCreatorRole();
    
    return await prisma.survey.findMany({
      where: { creatorId: user.id },
      include: {
        _count: {
          select: { questions: true, responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any;
  },

  // Get survey by ID (with ownership check)
  async getSurveyById(id: number): Promise<Survey> {
    const user = await getCurrentUser();
    
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { responses: true }
        }
      }
    });

    if (!survey) {
      throw new Error('Survey not found');
    }

    // Check if user has access to this survey
    if (survey.creatorId !== user.id && survey.status !== SurveyStatus.PUBLISHED) {
      throw new Error('Forbidden: Access denied');
    }

    return survey as any;
  },

  // Get active survey by ID (public access for published surveys)
  async getActiveSurveyById(id: number): Promise<Survey> {
    const survey = await prisma.survey.findUnique({
      where: {
        id,
        status: SurveyStatus.PUBLISHED,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      },
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
    });

    if (!survey) {
      throw new Error('Survey not found or not active');
    }

    return survey as any;
  },

  // Create survey
  async createSurvey(data: CreateSurveyRequest): Promise<Survey> {
    const user = await requireCreatorRole();
    
    return await prisma.survey.create({
      data: {
        ...data,
        creatorId: user.id
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { questions: true, responses: true }
        }
      }
    }) as any;
  },

  // Update survey
  async updateSurvey(id: number, data: UpdateSurveyRequest): Promise<Survey> {
    const user = await requireCreatorRole();
    await checkSurveyOwnership(id, user.id);
    
    return await prisma.survey.update({
      where: { id },
      data,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { questions: true, responses: true }
        }
      }
    }) as any;
  },

  // Delete survey
  async deleteSurvey(id: number): Promise<void> {
    const user = await requireCreatorRole();
    await checkSurveyOwnership(id, user.id);
    
    await prisma.survey.delete({
      where: { id }
    });
  },

  // Publish survey
  async publishSurvey(id: number): Promise<Survey> {
    const user = await requireCreatorRole();
    await checkSurveyOwnership(id, user.id);
    
    // Check if survey has at least one question
    const questionCount = await prisma.question.count({
      where: { surveyId: id }
    });
    
    if (questionCount === 0) {
      throw new Error('Cannot publish survey without questions');
    }
    
    return await prisma.survey.update({
      where: { id },
      data: { status: SurveyStatus.PUBLISHED },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { questions: true, responses: true }
        }
      }
    }) as any;
  },

  // Get survey count
  async getSurveyCount(): Promise<number> {
    const user = await requireCreatorRole();
    
    return await prisma.survey.count({
      where: { creatorId: user.id }
    });
  }
};

// Question DAL functions
export const questionDAL = {
  // Add question to survey
  async addQuestionToSurvey(surveyId: number, data: CreateQuestionRequest): Promise<Question> {
    const user = await requireCreatorRole();
    await checkSurveyOwnership(surveyId, user.id);
    
    return (await prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          text: data.text,
          description: data.description,
          type: data.type,
          isRequired: data.isRequired || false,
          order: data.order,
          surveyId
        },
        include: {
          options: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // Add options if provided
      if (data.options && data.options.length > 0) {
        await tx.questionOption.createMany({
          data: data.options.map(option => ({
            text: option.text,
            value: option.value,
            order: option.order,
            questionId: question.id
          }))
        });

        // Fetch question with options
        return tx.question.findUnique({
          where: { id: question.id },
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          }
        }) as Promise<Question>;
      }

      return question;
    })) as any;
  },

  // Update question
  async updateQuestion(questionId: number, data: CreateQuestionRequest): Promise<Question> {
    const user = await requireCreatorRole();
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { survey: true }
    });
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    await checkSurveyOwnership(question.surveyId, user.id);
    
    return await prisma.$transaction(async (tx) => {
      // Update question
      const updatedQuestion = await tx.question.update({
        where: { id: questionId },
        data: {
          text: data.text,
          description: data.description,
          type: data.type,
          isRequired: data.isRequired || false,
          order: data.order
        }
      });

      // Delete existing options
      await tx.questionOption.deleteMany({
        where: { questionId }
      });

      // Add new options if provided
      if (data.options && data.options.length > 0) {
        await tx.questionOption.createMany({
          data: data.options.map(option => ({
            text: option.text,
            value: option.value,
            order: option.order,
            questionId
          }))
        });
      }

      // Return question with options
      return tx.question.findUnique({
        where: { id: questionId },
        include: {
          options: {
            orderBy: { order: 'asc' }
          }
        }
      }) as Promise<Question>;
    });
  },

  // Delete question
  async deleteQuestion(questionId: number): Promise<void> {
    const user = await requireCreatorRole();
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { survey: true }
    });
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    await checkSurveyOwnership(question.surveyId, user.id);
    
    await prisma.question.delete({
      where: { id: questionId }
    });
  },

  // Get questions by survey
  async getQuestionsBySurvey(surveyId: number): Promise<Question[]> {
    // Check if user has access to this survey
    await surveyDAL.getSurveyById(surveyId);
    
    return await prisma.question.findMany({
      where: { surveyId },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    }) as any;
  },

  // Add option to question
  async addOptionToQuestion(questionId: number, optionData: { optionText: string }): Promise<any> {
    const user = await requireCreatorRole();
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { survey: true }
    });
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    await checkSurveyOwnership(question.surveyId, user.id);
    
    // Get next order number
    const maxOrder = await prisma.questionOption.findFirst({
      where: { questionId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    
    return prisma.questionOption.create({
      data: {
        text: optionData.optionText,
        order: (maxOrder?.order || 0) + 1,
        questionId
      }
    });
  },

  // Get question by ID
  async getQuestionById(questionId: number): Promise<Question> {
    // Fetch the question with its options first
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // Ensure the current user has access to the parent survey
    await surveyDAL.getSurveyById(question.surveyId);

    return question as any;
  }
}; 