import { NextRequest, NextResponse } from 'next/server';
import { responseDAL } from '@/lib/dal/response';

// GET /api/responses/survey/[surveyId]/has-responded - Check if user has responded
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

    const hasResponded = await responseDAL.hasUserResponded(surveyId);
    return NextResponse.json({
      success: true,
      data: hasResponded
    });
  } catch (error) {
    console.error('GET /api/responses/survey/[surveyId]/has-responded error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
} 