import { NextRequest, NextResponse } from 'next/server';
import { questionDAL } from '@/lib/dal/survey';
import { CreateQuestionRequest } from '@/types';

// POST /api/questions/survey/[surveyId] - Add question to survey
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params;
    const surveyIdInt = parseInt(surveyId);
    
    if (isNaN(surveyIdInt)) {
      return NextResponse.json(
        { success: false, error: 'Invalid survey ID' },
        { status: 400 }
      );
    }

    const body: CreateQuestionRequest = await request.json();
    
    // Basic validation
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Question text is required' },
        { status: 400 }
      );
    }

    if (!body.type) {
      return NextResponse.json(
        { success: false, error: 'Question type is required' },
        { status: 400 }
      );
    }

    const question = await questionDAL.addQuestionToSurvey(surveyIdInt, body);
    return NextResponse.json({
      success: true,
      data: question
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/questions/survey/[surveyId] error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'Survey not found') {
        return NextResponse.json(
          { success: false, error: 'Survey not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET /api/questions/survey/[surveyId] - Get questions by survey
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params;
    const surveyIdInt = parseInt(surveyId);
    
    if (isNaN(surveyIdInt)) {
      return NextResponse.json(
        { success: false, error: 'Invalid survey ID' },
        { status: 400 }
      );
    }

    const questions = await questionDAL.getQuestionsBySurvey(surveyIdInt);
    return NextResponse.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('GET /api/questions/survey/[surveyId] error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'Survey not found') {
        return NextResponse.json(
          { success: false, error: 'Survey not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 