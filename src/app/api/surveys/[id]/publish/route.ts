import { NextRequest, NextResponse } from 'next/server';
import { surveyDAL } from '@/lib/dal/survey';

// POST /api/surveys/[id]/publish - Publish survey
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>  }
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

    const survey = await surveyDAL.publishSurvey(id);
    return NextResponse.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('POST /api/surveys/[id]/publish error:', error);
    
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
      if (error.message === 'Cannot publish survey without questions') {
        return NextResponse.json(
          { success: false, error: 'Cannot publish survey without questions' },
          { status: 400 }
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