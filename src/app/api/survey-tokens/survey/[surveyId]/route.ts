import { NextRequest, NextResponse } from 'next/server';
import { tokenDAL } from '@/lib/dal/response';

// POST /api/survey-tokens/survey/[surveyId] - Generate survey token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const resolvedParams = await params;
    const surveyId = parseInt(resolvedParams.surveyId);
    
    if (isNaN(surveyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid survey ID' },
        { status: 400 }
      );
    }

    const token = await tokenDAL.generateSurveyToken(surveyId);
    return NextResponse.json({
      success: true,
      data: token
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/survey-tokens/survey/[surveyId] error:', error);
    
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