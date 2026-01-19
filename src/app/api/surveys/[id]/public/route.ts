import { NextRequest, NextResponse } from 'next/server';
import { surveyDAL } from '@/lib/dal/survey';

// GET /api/surveys/[id]/public - Get active survey by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid survey ID' },
        { status: 400 }
      );
    }

    const survey = await surveyDAL.getActiveSurveyById(id);
    return NextResponse.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('GET /api/surveys/[id]/public error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Survey not found or not active') {
        return NextResponse.json(
          { success: false, error: 'Survey not found or not active' },
          { status: 404 }
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