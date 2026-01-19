import { NextRequest, NextResponse } from 'next/server';
import { questionDAL } from '@/lib/dal/survey';

// POST /api/questions/[id]/options - Add option to question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    const body: { optionText: string } = await request.json();
    
    // Basic validation
    if (!body.optionText || body.optionText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Option text is required' },
        { status: 400 }
      );
    }

    const option = await questionDAL.addOptionToQuestion(id, body);
    return NextResponse.json({
      success: true,
      data: option
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/questions/[id]/options error:', error);
    
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