import { NextRequest, NextResponse } from 'next/server';
import { responseDAL } from '@/lib/dal/response';

// GET /api/responses/[id] - Get response by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response ID' },
        { status: 400 }
      );
    }

    const response = await responseDAL.getResponseById(id);
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('GET /api/responses/[id] error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'Response not found') {
        return NextResponse.json(
          { success: false, error: 'Response not found' },
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