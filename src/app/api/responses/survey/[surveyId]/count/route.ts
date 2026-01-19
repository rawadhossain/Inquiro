import { NextRequest, NextResponse } from 'next/server';
import { responseDAL } from '@/lib/dal/response';

// GET /api/responses/survey/[surveyId]/count - Get response count
export async function GET(
  request: NextRequest,
  { params }: { params: { surveyId: string } }
) {
  try {
    const surveyId = parseInt(params.surveyId);
    
    if (isNaN(surveyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid survey ID' },
        { status: 400 }
      );
    }

    const count = await responseDAL.getResponseCount(surveyId);
    return NextResponse.json(count);
  } catch (error) {
    console.error('GET /api/responses/survey/[surveyId]/count error:', error);
    
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