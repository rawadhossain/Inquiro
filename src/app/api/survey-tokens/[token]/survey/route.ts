import { NextRequest, NextResponse } from 'next/server';
import { tokenDAL } from '@/lib/dal/response';

// GET /api/survey-tokens/[token]/survey - Get survey by token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    
    if (!token || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const survey = await tokenDAL.getSurveyByToken(token);
    return NextResponse.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('GET /api/survey-tokens/[token]/survey error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid or inactive token') {
        return NextResponse.json(
          { success: false, error: 'Invalid or inactive token' },
          { status: 404 }
        );
      }
      if (error.message === 'Token has expired') {
        return NextResponse.json(
          { success: false, error: 'Token has expired' },
          { status: 410 }
        );
      }
      if (error.message === 'Token has reached maximum uses') {
        return NextResponse.json(
          { success: false, error: 'Token has reached maximum uses' },
          { status: 410 }
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