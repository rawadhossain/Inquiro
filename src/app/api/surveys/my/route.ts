import { NextResponse } from 'next/server';
import { surveyDAL } from '@/lib/dal/survey';

// GET /api/surveys/my - Get current user's surveys
export async function GET() {
  try {
    const surveys = await surveyDAL.getSurveysByUser();
    return NextResponse.json({
      success: true,
      data: surveys
    });
  } catch (error) {
    console.error('GET /api/surveys/my error:', error);
    
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