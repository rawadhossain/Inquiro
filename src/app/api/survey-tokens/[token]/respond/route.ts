import { NextRequest, NextResponse } from 'next/server';
import { tokenDAL } from '@/lib/dal/response';
import { SubmitResponseRequest } from '@/types';

// POST /api/survey-tokens/[token]/respond - Submit response by token
export async function POST(
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

    const body: Omit<SubmitResponseRequest, 'surveyId'> = await request.json();
    
    // Basic validation
    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one answer is required' },
        { status: 400 }
      );
    }

    // Validate each answer has a questionId
    for (const answer of body.answers) {
      if (!answer.questionId) {
        return NextResponse.json(
          { success: false, error: 'Question ID is required for all answers' },
          { status: 400 }
        );
      }
    }

    const response = await tokenDAL.submitResponseByToken(token, body);
    return NextResponse.json({
      success: true,
      data: response
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/survey-tokens/[token]/respond error:', error);
    
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
      // Handle other response submission errors
      if (error.message === 'Survey not found or not published') {
        return NextResponse.json(
          { success: false, error: 'Survey not found or not published' },
          { status: 404 }
        );
      }
      if (error.message === 'Anonymous responses not allowed for this survey') {
        return NextResponse.json(
          { success: false, error: 'Anonymous responses not allowed for this survey' },
          { status: 403 }
        );
      }
      if (error.message === 'Survey has not started yet') {
        return NextResponse.json(
          { success: false, error: 'Survey has not started yet' },
          { status: 400 }
        );
      }
      if (error.message === 'Survey has ended') {
        return NextResponse.json(
          { success: false, error: 'Survey has ended' },
          { status: 400 }
        );
      }
      if (error.message === 'Survey has reached maximum responses') {
        return NextResponse.json(
          { success: false, error: 'Survey has reached maximum responses' },
          { status: 400 }
        );
      }
      if (error.message.includes('Required question')) {
        return NextResponse.json(
          { success: false, error: error.message },
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