import { NextRequest, NextResponse } from 'next/server';
import { responseDAL } from '@/lib/dal/response';

// GET /api/responses/survey/[surveyId] - Get responses by survey
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const resolvedParams = await params;
    const surveyId = parseInt(resolvedParams.surveyId);

    if (isNaN(surveyId)) {
      return NextResponse.json(
        { success: false, error: "Invalid survey ID" },
        { status: 400 }
      );
    }

    const responses = await responseDAL.getResponsesBySurvey(surveyId);
    return NextResponse.json({
      success: true,
      data: responses
    });
  } catch (error) {
    console.error('GET /api/responses/survey/[surveyId] error:', error);
    
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