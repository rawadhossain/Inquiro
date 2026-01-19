import { NextRequest, NextResponse } from 'next/server';
import { surveyDAL } from '@/lib/dal/survey';
import { UpdateSurveyRequest } from '@/types';

// GET /api/surveys/[id] - Get survey by ID
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

    const survey = await surveyDAL.getSurveyById(id);
    return NextResponse.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('GET /api/surveys/[id] error:', error);
    
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
      if (error.message === 'Forbidden: Access denied') {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Access denied' },
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

// PUT /api/surveys/[id] - Update survey
export async function PUT(
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

    const body: UpdateSurveyRequest = await request.json();
    
    const survey = await surveyDAL.updateSurvey(id, body);
    return NextResponse.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('PUT /api/surveys/[id] error:', error);
    
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

// DELETE /api/surveys/[id] - Delete survey
export async function DELETE(
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

    await surveyDAL.deleteSurvey(id);
    return NextResponse.json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/surveys/[id] error:', error);
    
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