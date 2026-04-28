"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Loader2,
  Users,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useGenerateAISurvey } from "@/hooks/use-ai-survey";
import { getApiRouteErrorMessage } from "@/lib/toast-utils";

interface AIAssistantProps {
  onSurveyGenerated: (survey: {
    title: string;
    description: string;
    questions: Array<{
      id: string;
      type: any;
      text: string;
      description?: string;
      isRequired: boolean;
      order: number;
      options?: { id: string; text: string; order: number }[];
    }>;
  }) => void;
}

interface AIFormData {
  topic: string;
  numberOfQuestions: number;
  targetAudience: string;
  additionalContext?: string;
}

const STAGE_MESSAGES = [
  "Outlining your survey…",
  "Drafting questions…",
  "Choosing question types…",
  "Polishing wording…",
] as const;

export function AISurveyAssistant({ onSurveyGenerated }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AIFormData>({
    defaultValues: {
      numberOfQuestions: 5,
      targetAudience: "general public",
    },
  });

  const generateSurveyMutation = useGenerateAISurvey();

  useEffect(() => {
    if (!generateSurveyMutation.isPending) {
      setStageIndex(0);
      return;
    }
    const id = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGE_MESSAGES.length);
    }, 2800);
    return () => clearInterval(id);
  }, [generateSurveyMutation.isPending]);

  const onSubmit = async (data: AIFormData) => {
    try {
      setApiError(null);

      // Use the hook's built-in toast handling
      const wrappedResult = await generateSurveyMutation.mutateAsync({
        topic: data.topic,
        numberOfQuestions: data.numberOfQuestions,
        targetAudience: data.targetAudience,
        ...(data.additionalContext && {
          additionalContext: data.additionalContext,
        }),
      });

      // Unwrap the result from toast.promise
      const result = await wrappedResult.unwrap();

      // Transform the result to match the expected format
      const transformedSurvey = {
        title: result.title,
        description: result.description,
        questions: result.questions.map((q: any, index: number) => ({
          id: `ai-${index}`,
          type: q.type,
          text: q.text,
          description: q.description,
          isRequired: q.isRequired,
          order: index,
          options: q.options?.map((opt: any, optIndex: number) => ({
            id: `opt-${index}-${optIndex}`,
            text: opt.text,
            order: optIndex,
          })),
        })),
      };

      onSurveyGenerated(transformedSurvey);
      setIsOpen(false);
      reset();
    } catch (error: unknown) {
      console.error("AI generation error:", error);
      setApiError(
        getApiRouteErrorMessage(error, "Failed to generate survey. Try again."),
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setApiError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex justify-center text-2xl font-bold bg-clip-text text-transparent">
            <span className="text-white">AI Survey Assistant</span>
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground text-center">
            Transform your ideas into professional surveys with <br />
            <span className="text-white">AI-powered</span> question generation
          </DialogDescription>
        </DialogHeader>

        {/* API Error Alert */}
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 mb-6 text-destructive"
          >
            <div className="flex gap-3">
              <span className="mt-0.5 shrink-0" aria-hidden="true">
                ⚠️
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Could not generate survey
                </p>
                <p className="text-sm text-muted-foreground">{apiError}</p>
                {apiError.toLowerCase().includes("not configured") && (
                  <p className="text-xs text-muted-foreground pt-1 border-t border-destructive/20 mt-2">
                    Self-hosting? Set OPENAI_API_KEY in your server environment
                    and restart the app.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Form Card */}
          <Card className="border-2 border-dashed">
            <CardContent className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="topic"
                  className="text-sm font-semibold flex items-center"
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Survey Topic *
                </Label>
                <Input
                  id="topic"
                  {...register("topic", { required: "Topic is required" })}
                  placeholder="e.g., Customer satisfaction, Employee engagement, Market research, Product feedback..."
                  className="h-12 text-base border-2 focus:border-purple-400 transition-colors"
                />
                {errors.topic && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.topic.message}
                  </p>
                )}
              </div>

              {/* Grid for Number and Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="numberOfQuestions"
                    className="text-sm font-semibold"
                  >
                    Number of Questions
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("numberOfQuestions", Number.parseInt(value))
                    }
                    defaultValue="5"
                  >
                    <SelectTrigger className="h-12 border-2 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">
                        3 questions (Quick survey)
                      </SelectItem>
                      <SelectItem value="5">5 questions (Standard)</SelectItem>
                      <SelectItem value="8">8 questions (Detailed)</SelectItem>
                      <SelectItem value="10">
                        10 questions (Comprehensive)
                      </SelectItem>
                      <SelectItem value="15">
                        15 questions (In-depth)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="targetAudience"
                    className="text-sm font-semibold flex items-center"
                  >
                    <Users className="mr-1 h-4 w-4" />
                    Target Audience
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("targetAudience", value)}
                    defaultValue="general public"
                  >
                    <SelectTrigger className="h-12 border-2 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general public">
                        General Public
                      </SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="employees">Employees</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="professionals">
                        Professionals
                      </SelectItem>
                      <SelectItem value="teenagers">Teenagers</SelectItem>
                      <SelectItem value="seniors">Seniors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <Label
                  htmlFor="additionalContext"
                  className="text-sm font-semibold flex items-center"
                >
                  <Lightbulb className="mr-1 h-4 w-4" />
                  Additional Context (Optional)
                </Label>
                <Textarea
                  id="additionalContext"
                  {...register("additionalContext")}
                  placeholder="Specific requirements, focus areas, industry context, or any other details that would help generate better questions..."
                  rows={4}
                  className="border-2 focus:border-purple-400 transition-colors resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Tip: More context leads to more relevant and targeted
                  questions
                </p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="pt-6 border-t flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center sm:gap-4">
            {generateSurveyMutation.isPending && (
              <p
                className="text-sm text-muted-foreground text-left sm:mr-auto sm:order-first w-full sm:w-auto"
                aria-live="polite"
              >
                {STAGE_MESSAGES[stageIndex]}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={generateSurveyMutation.isPending}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={generateSurveyMutation.isPending}
              className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {generateSurveyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Survey...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Survey
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
