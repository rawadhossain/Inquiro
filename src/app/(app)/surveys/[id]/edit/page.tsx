"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Settings,
  FileText,
  Eye,
  Save,
  Trash2,
  GripVertical,
  Type,
  CheckSquare,
  RadioIcon,
  Calendar,
  Hash,
  Mail,
  Star,
  MoreHorizontal,
  Globe,
  Lock,
  Users,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSurvey, useUpdateSurvey } from "@/hooks/use-surveys";
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/use-questions";
import {
  UpdateSurveyRequest,
  QuestionType,
  CreateQuestionRequest,
  CreateQuestionOptionRequest,
  Question,
} from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface LocalQuestion {
  id: string | number;
  type: QuestionType;
  text: string;
  description?: string;
  isRequired: boolean;
  order: number;
  options?: { id: string | number; text: string; order: number }[];
  isNew?: boolean;
}

interface SurveyForm {
  title: string;
  description: string;
  isPublic: boolean;
  allowAnonymous: boolean;
  maxResponses?: number;
  startDate?: Date;
  endDate?: Date;
}

const questionTypes = [
  { type: "TEXT", label: "Text", icon: Type },
  { type: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: CheckSquare },
  { type: "RADIO", label: "Single Choice", icon: RadioIcon },
  { type: "CHECKBOX", label: "Checkbox", icon: CheckSquare },
  { type: "RATING", label: "Rating", icon: Star },
  { type: "DATE", label: "Date", icon: Calendar },
  { type: "EMAIL", label: "Email", icon: Mail },
  { type: "NUMBER", label: "Number", icon: Hash },
];

export default function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const surveyId = resolvedParams ? parseInt(resolvedParams.id) : null;

  // API hooks
  const {
    data: survey,
    isLoading: surveyLoading,
    error: surveyError,
  } = useSurvey(surveyId || 0);
  const { data: existingQuestions, isLoading: questionsLoading } = useQuestions(
    surveyId || 0
  );
  const updateSurveyMutation = useUpdateSurvey();
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SurveyForm>({
    defaultValues: {
      isPublic: true,
      allowAnonymous: true,
    },
  });

  const watchedValues = watch();

  // Populate form when survey data loads
  useEffect(() => {
    if (survey) {
      reset({
        title: survey.title,
        description: survey.description || "",
        isPublic: survey.isPublic,
        allowAnonymous: survey.allowAnonymous,
        maxResponses: survey.maxResponses || undefined,
        startDate: survey.startDate ? new Date(survey.startDate) : undefined,
        endDate: survey.endDate ? new Date(survey.endDate) : undefined,
      });
    }
  }, [survey, reset]);

  // Populate questions when they load
  useEffect(() => {
    if (existingQuestions) {
      const localQuestions: LocalQuestion[] = existingQuestions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        description: q.description || undefined,
        isRequired: q.isRequired,
        order: q.order,
        options: q.options?.map((opt) => ({
          id: opt.id,
          text: opt.text,
          order: opt.order,
        })),
        isNew: false,
      }));
      setQuestions(localQuestions);
    }
  }, [existingQuestions]);

  if (!resolvedParams) {
    return <div>Loading...</div>;
  }

  if (surveyError) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading survey</div>
          <Button onClick={() => router.push("/surveys")}>
            Back to Surveys
          </Button>
        </div>
      </div>
    );
  }

  if (surveyLoading || questionsLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const addQuestion = (type: LocalQuestion["type"]) => {
    const newQuestion: LocalQuestion = {
      id: `new-${Date.now()}`,
      type,
      text: `New ${questionTypes.find((qt) => qt.type === type)?.label || "Question"}`,
      description: "",
      isRequired: false,
      order: questions.length,
      options: ["MULTIPLE_CHOICE", "RADIO", "CHECKBOX"].includes(type)
        ? [
            { id: `new-opt-1-${Date.now()}`, text: "Option 1", order: 0 },
            { id: `new-opt-2-${Date.now()}`, text: "Option 2", order: 1 },
          ]
        : undefined,
      isNew: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (
    id: string | number,
    updates: Partial<LocalQuestion>
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string | number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string | number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOption = {
        id: `new-opt-${Date.now()}`,
        text: `Option ${question.options.length + 1}`,
        order: question.options.length,
      };
      updateQuestion(questionId, {
        options: [...question.options, newOption],
      });
    }
  };

  const updateOption = (
    questionId: string | number,
    optionId: string | number,
    text: string
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: question.options.map((opt) =>
          opt.id === optionId ? { ...opt, text } : opt
        ),
      });
    }
  };

  const deleteOption = (
    questionId: string | number,
    optionId: string | number
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      updateQuestion(questionId, {
        options: question.options.filter((opt) => opt.id !== optionId),
      });
    }
  };

  const onSubmit = async (data: SurveyForm) => {
    if (!survey) return;

    setIsSaving(true);

    try {
      const savePromise = async () => {
        // Update survey basic info
        await updateSurveyMutation.mutateAsync({
          id: survey.id,
          data: {
            title: data.title,
            description: data.description,
            isPublic: data.isPublic,
            allowAnonymous: data.allowAnonymous,
            maxResponses: data.maxResponses,
            startDate: data.startDate,
            endDate: data.endDate,
          },
        });

        // Handle questions
        for (const question of questions) {
          if (question.isNew) {
            // Create new question
            await createQuestionMutation.mutateAsync({
              surveyId: survey.id,
              data: {
                type: question.type,
                text: question.text,
                description: question.description,
                isRequired: question.isRequired,
                order: question.order,
                options:
                  question.options?.map((opt) => ({
                    text: opt.text,
                    order: opt.order,
                  })) || [],
              },
            });
          } else if (typeof question.id === "number") {
            // Update existing question
            await updateQuestionMutation.mutateAsync({
              id: question.id,
              data: {
                type: question.type,
                text: question.text,
                description: question.description,
                isRequired: question.isRequired,
                order: question.order,
                options:
                  question.options?.map((opt) => ({
                    text: opt.text,
                    order: opt.order,
                  })) || [],
              },
            });
          }
        }

        // Handle deleted questions
        const currentQuestionIds = questions
          .filter((q) => typeof q.id === "number")
          .map((q) => q.id as number);
        const existingQuestionIds =
          survey.questions
            ?.filter((q) => q.id !== undefined)
            .map((q) => q.id as number) || [];
        const deletedQuestionIds = existingQuestionIds.filter(
          (id) => !currentQuestionIds.includes(id)
        );

        for (const questionId of deletedQuestionIds) {
          await deleteQuestionMutation.mutateAsync(questionId);
        }
      };

      await toast.promise(savePromise(), {
        loading: "💾 Saving survey changes...",
        success: "✅ Survey updated successfully!",
        error: "❌ Failed to update survey",
      });

      router.push("/surveys");
    } catch (error) {
      console.error("Error updating survey:", error);
      // Error toast is handled by toast.promise
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestionEditor = (question: LocalQuestion) => {
    const QuestionIcon =
      questionTypes.find((qt) => qt.type === question.type)?.icon || Type;

    return (
      <Card key={question.id} className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            <QuestionIcon className="h-4 w-4 text-blue-600" />
            <Badge variant="outline">
              {questionTypes.find((qt) => qt.type === question.type)?.label}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`question-${question.id}`}>Question Text</Label>
            <Input
              id={`question-${question.id}`}
              value={question.text}
              onChange={(e) =>
                updateQuestion(question.id, { text: e.target.value })
              }
              placeholder="Enter your question"
            />
          </div>

          <div>
            <Label htmlFor={`description-${question.id}`}>
              Description (Optional)
            </Label>
            <Textarea
              id={`description-${question.id}`}
              value={question.description || ""}
              onChange={(e) =>
                updateQuestion(question.id, { description: e.target.value })
              }
              placeholder="Add additional context or instructions"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`required-${question.id}`}
              checked={question.isRequired}
              onCheckedChange={(checked) =>
                updateQuestion(question.id, { isRequired: checked })
              }
            />
            <Label htmlFor={`required-${question.id}`}>Required</Label>
          </div>

          {/* Options for choice-based questions */}
          {question.options && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-2">
                {question.options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateOption(question.id, option.id, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                    />
                    {question.options && question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOption(question.id, option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(question.id)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (!survey) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/surveys")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Survey</h1>
            <p className="text-muted-foreground">
              Update your survey settings and questions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Information</CardTitle>
              <CardDescription>Basic details about your survey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter survey title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe what this survey is about"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Survey Questions</h3>
              <p className="text-sm text-muted-foreground">
                Add and organize your survey questions
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {questionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <DropdownMenuItem
                      key={type.type}
                      onClick={() => addQuestion(type.type as QuestionType)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {type.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                  <p className="text-sm">
                    Add your first question to get started
                  </p>
                </div>
              </Card>
            ) : (
              questions.map((question) => renderQuestionEditor(question))
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can access and respond to your survey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Survey</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone to find and respond to this survey
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.isPublic}
                    onCheckedChange={(checked) => setValue("isPublic", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Anonymous Responses</Label>
                    <p className="text-sm text-muted-foreground">
                      Let people respond without creating an account
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.allowAnonymous}
                    onCheckedChange={(checked) =>
                      setValue("allowAnonymous", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Limits</CardTitle>
                <CardDescription>
                  Set limits on how many responses you want to collect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="maxResponses">
                    Maximum Responses (Optional)
                  </Label>
                  <Input
                    id="maxResponses"
                    type="number"
                    {...register("maxResponses", { valueAsNumber: true })}
                    placeholder="Unlimited"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
