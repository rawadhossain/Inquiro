import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/** Must match questionnaire UI caps (surveys/create + ai-survey-assistant). */
const MAX_AI_QUESTIONS = 15;

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

const SURVEY_SYSTEM = `Survey builder. Emit one structured object matching the schema.
Produce exactly N questions where N appears in the user message.
Types: TEXT, MULTIPLE_CHOICE, RADIO, CHECKBOX, RATING, DATE, EMAIL, NUMBER—pick what fits each item; MULTIPLE_CHOICE/RADIO/CHECKBOX need 3-5 concise options.
Mix required and optional answers. Neutral, unbiased wording; logical flow.
Be concise in the overview description (2-4 sentences). Omit question-level description unless clarification is genuinely needed—do not duplicate the question text.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact the administrator.' },
        { status: 500 }
      );
    }

    const { topic, numberOfQuestions: rawCount, targetAudience: rawAudience = 'general public', additionalContext } = await request.json();
    
    const topicStr =
      typeof topic === 'string'
        ? topic.trim().slice(0, 420)
        : String(topic ?? '').trim().slice(0, 420);
    if (!topicStr) {
      console.error('Topic is required');
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    let questionCount =
      typeof rawCount === 'number' ? rawCount : Number.parseInt(String(rawCount ?? ''), 10);
    if (!Number.isFinite(questionCount)) questionCount = 5;
    questionCount = Math.min(MAX_AI_QUESTIONS, Math.max(3, Math.round(questionCount)));

    const audienceStr =
      typeof rawAudience === 'string'
        ? rawAudience.trim().slice(0, 200)
        : 'general public';
    const promptParts = [
      `topic: ${topicStr}`,
      `exactly ${questionCount} questions`,
      `audience: ${audienceStr || 'general public'}`,
    ];
    if (additionalContext?.trim())
      promptParts.push(`context: ${additionalContext.trim().slice(0, 1600)}`);
    const prompt = promptParts.join('\n');

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: SurveyGenerationSchema,
      schemaName: 'Survey',
      system: SURVEY_SYSTEM,
      prompt,
      temperature: 0,
      /** Caps worst-case completion size; scaled by size of survey requested. */
      maxTokens: Math.min(1400 + questionCount * 420, 8000),
      maxRetries: 1,
    });

    return NextResponse.json(result.object);
  } catch (error: unknown) {
    console.error('AI survey generation error:', error);

    const message = String(
      error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : error ?? '',
    ).toLowerCase();

    const statusCode =
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      typeof (error as { statusCode: unknown }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : undefined;

    if (
      statusCode === 429 ||
      message.includes('quota') ||
      message.includes('rate limit') ||
      message.includes('429')
    ) {
      return NextResponse.json(
        {
          error:
            'AI usage limit reached. Wait a bit and try again, or check your OpenAI billing settings.',
        },
        { status: 429 },
      );
    }

    if (
      message.includes('api key') ||
      message.includes('incorrect api key') ||
      message.includes('invalid_api_key') ||
      statusCode === 401
    ) {
      return NextResponse.json(
        {
          error:
            'AI API key was rejected. Verify OPENAI_API_KEY for this server and restart the app.',
        },
        { status: 500 },
      );
    }

    if (message.includes('timeout')) {
      return NextResponse.json(
        { error: 'The AI request took too long. Please try again.' },
        { status: 408 },
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong generating the survey. Try again in a moment.' },
      { status: 500 },
    );
  }
} 