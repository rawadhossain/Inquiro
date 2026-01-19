import { NextResponse } from 'next/server';
import { surveyDAL } from '@/lib/dal/survey';

// GET /api/surveys/count - Get current user's survey count
export async function GET() {
  try {
    const count = await surveyDAL.getSurveyCount();
    return NextResponse.json(count);
  } catch (error) {
    console.error('GET /api/surveys/count error:', error);
    
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