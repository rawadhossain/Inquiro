import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SurveyGenerationSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(z.object({
    text: z.string(),
    description: z.string().optional(),
    type: z.enum(['TEXT', 'MULTIPLE_CHOICE', 'RADIO', 'CHECKBOX', 'RATING', 'DATE', 'EMAIL', 'NUMBER']),
    isRequired: z.boolean(),
    options: z.array(z.object({
      text: z.string(),
    })).optional(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact the administrator.' },
        { status: 500 }
      );
    }

    const { topic, numberOfQuestions = 5, targetAudience = 'general public', additionalContext } = await request.json();
    
    if (!topic) {
      console.error('Topic is required');
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }


    const prompt = `Create a comprehensive survey about "${topic}" with ${numberOfQuestions} questions for ${targetAudience}.

Requirements:
- Generate a compelling title and description for the survey
- Create ${numberOfQuestions} diverse, well-crafted questions
- Use different question types (TEXT, MULTIPLE_CHOICE, RADIO, CHECKBOX, RATING, DATE, EMAIL, NUMBER) appropriately
- For choice-based questions (MULTIPLE_CHOICE, RADIO, CHECKBOX), provide 3-5 relevant options
- Mix required and optional questions strategically
- Ensure questions are clear, unbiased, and relevant to the topic
- Questions should flow logically and gather meaningful insights

Topic: ${topic}
Target Audience: ${targetAudience}
Number of Questions: ${numberOfQuestions}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

The survey should be professional and engaging for the target audience.`;

    console.log('📋 Generated prompt length:', prompt.length);

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: SurveyGenerationSchema,
      prompt,
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error('AI survey generation error:', error);
    
    // More specific error messages
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please contact the administrator.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'AI service quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'AI service timeout. Please try again.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate survey. Please try again later.' },
      { status: 500 }
    );
  }
} 