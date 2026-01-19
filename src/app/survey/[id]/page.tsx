"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSurveyForParticipation } from "@/hooks/use-public-surveys";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface SurveyPageProps {
  params: Promise<{ id: string }>;
}

export default function SurveyPage({ params }: SurveyPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const surveyId = resolvedParams?.id ? parseInt(resolvedParams.id) : 0;

  // Get current session
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      return result;
    },
  });

  // Fetch survey data
  const {
    data: survey,
    isLoading,
    error,
  } = useSurveyForParticipation(surveyId);

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: any) => {
      return await apiClient.responses.submitResponse(surveyId, responseData);
    },
  });

  if (!resolvedParams) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-2 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Survey not found</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              The survey you're looking for doesn't exist or is no longer
              available.
            </p>
            <Button onClick={() => router.push("/respondent")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Surveys
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = survey.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Transform answers to API format
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, value]) => {
          const question = questions.find((q) => q.id === parseInt(questionId));
          const answer: any = { questionId: parseInt(questionId) };

          if (!question) return answer;

          switch (question.type) {
            case "TEXT":
            case "EMAIL":
              answer.textValue = value;
              break;
            case "NUMBER":
              answer.numberValue = parseFloat(value) || 0;
              break;
            case "RADIO":
            case "MULTIPLE_CHOICE":
              answer.selectedOptionId = parseInt(value);
              break;
            case "CHECKBOX":
              if (Array.isArray(value)) {
                answer.selectedOptionId = value[0]; // Take first selected for simplicity
              }
              break;
            case "RATING":
              answer.numberValue = parseInt(value) || 1;
              break;
            case "DATE":
              answer.dateValue = new Date(value);
              break;
            default:
              answer.textValue = String(value);
          }

          return answer;
        }
      );

      const responseData = {
        isAnonymous: !session?.data?.session,
        answers: formattedAnswers,
      };

      await toast.promise(submitResponseMutation.mutateAsync(responseData), {
        loading: "📝 Submitting your response...",
        success: "✅ Response submitted successfully!",
        error: (error: any) =>
          "❌ Failed to submit response: " + (error.message || "Unknown error"),
      });

      router.push("/respondent");
    } catch (error) {
      console.error("Submit error:", error);
      // Error toast is handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (question: any) => {
    const value = answers[question.id] || "";

    switch (question.type) {
      case "TEXT":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="min-h-[100px]"
          />
        );

      case "EMAIL":
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your email..."
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter a number..."
          />
        );

      case "DATE":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      case "RADIO":
      case "MULTIPLE_CHOICE":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
          >
            {question.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.id.toString()}
                  id={option.id.toString()}
                />
                <Label
                  htmlFor={option.id.toString()}
                  className="cursor-pointer"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "CHECKBOX":
        return (
          <div className="space-y-3">
            {question.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id.toString()}
                  checked={
                    Array.isArray(value)
                      ? value.includes(option.id.toString())
                      : false
                  }
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = checked
                      ? [...currentValues, option.id.toString()]
                      : currentValues.filter(
                          (v: string) => v !== option.id.toString()
                        );
                    handleAnswerChange(question.id, newValues);
                  }}
                />
                <Label
                  htmlFor={option.id.toString()}
                  className="cursor-pointer"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "RATING":
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={value === rating.toString() ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleAnswerChange(question.id, rating.toString())
                }
                className="w-12 h-12"
              >
                <Star
                  className={`h-4 w-4 ${
                    value >= rating.toString() ? "fill-current" : ""
                  }`}
                />
              </Button>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/respondent")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>
        <Badge variant="secondary">
          Question {currentQuestionIndex + 1} of {questions.length}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{survey.title}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.text}
              {currentQuestion.isRequired && (
                <span className="text-destructive ml-1">*</span>
              )}
            </CardTitle>
            {currentQuestion.description && (
              <CardDescription>{currentQuestion.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {renderQuestionInput(currentQuestion)}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentQuestionIndex + 1} / {questions.length}
        </div>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <Clock className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Survey Info */}
      <Card className="mt-8">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>📝 {questions.length} questions</span>
            <span>👥 {survey._count?.responses || 0} responses</span>
            {survey.endDate && (
              <span>
                ⏰ Ends {format(new Date(survey.endDate), "MMM dd, yyyy")}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Survey by {survey.creator?.name || "Ask Noq"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
