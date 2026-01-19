import { NextRequest, NextResponse } from 'next/server';
import { surveyDAL } from '@/lib/dal/survey';
import { CreateSurveyRequest } from '@/types';

// GET /api/surveys - Get all public surveys
export async function GET() {
  try {
    const surveys = await surveyDAL.getAllPublicSurveys();
    return NextResponse.json({
      success: true,
      data: surveys
    });
  } catch (error) {
    console.error('GET /api/surveys error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/surveys - Create new survey
export async function POST(request: NextRequest) {
  try {
    const body: CreateSurveyRequest = await request.json();
    
    // Basic validation
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title is required'
        },
        { status: 400 }
      );
    }

    const survey = await surveyDAL.createSurvey(body);
    
    return NextResponse.json({
      success: true,
      data: survey
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/surveys error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'Forbidden: Creator role required') {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Creator role required' },
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