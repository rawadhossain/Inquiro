import { NextRequest, NextResponse } from 'next/server';
import { responseDAL } from '@/lib/dal/response';

// GET /api/responses/question/[questionId]/answers - Get answers by question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const questionId = parseInt(resolvedParams.questionId);
    
    if (isNaN(questionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const answers = await responseDAL.getAnswersByQuestion(questionId);
    return NextResponse.json({
      success: true,
      data: answers
    });
  } catch (error) {
    console.error('GET /api/responses/question/[questionId]/answers error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'Question not found') {
        return NextResponse.json(
          { success: false, error: 'Question not found' },
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