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
  Loader2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateSurvey, useUpdateSurvey } from "@/hooks/use-surveys";
import { useCreateQuestion } from "@/hooks/use-questions";
import {
  CreateSurveyRequest,
  QuestionType,
  CreateQuestionRequest,
  CreateQuestionOptionRequest,
} from "@/types";
import { AISurveyAssistant } from "@/components/ai-survey-assistant";

interface LocalQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  isRequired: boolean;
  order: number;
  options?: { id: string; text: string; order: number }[];
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

export default function CreateSurveyPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // API hooks
  const createSurveyMutation = useCreateSurvey();
  const updateSurveyMutation = useUpdateSurvey();
  const createQuestionMutation = useCreateQuestion();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SurveyForm>({
    defaultValues: {
      isPublic: true,
      allowAnonymous: true,
    },
  });

  const watchedValues = watch();

  // Handle AI-generated survey
  const handleAIGeneratedSurvey = (aiSurvey: {
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
  }) => {
    setValue("title", aiSurvey.title);
    setValue("description", aiSurvey.description);

    // Set questions from AI
    setQuestions(aiSurvey.questions);

    // Switch to questions tab to show generated questions
    setActiveTab("questions");
  };

  const addQuestion = (type: LocalQuestion["type"]) => {
    const newQuestion: LocalQuestion = {
      id: `q-${Date.now()}`,
      type,
      text: `New ${questionTypes.find((qt) => qt.type === type)?.label || "Question"}`,
      description: "",
      isRequired: false,
      order: questions.length,
      options: ["MULTIPLE_CHOICE", "RADIO", "CHECKBOX"].includes(type)
        ? [
            { id: `opt-1-${Date.now()}`, text: "Option 1", order: 0 },
            { id: `opt-2-${Date.now()}`, text: "Option 2", order: 1 },
          ]
        : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<LocalQuestion>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOption = {
        id: `opt-${Date.now()}`,
        text: `Option ${question.options.length + 1}`,
        order: question.options.length,
      };
      updateQuestion(questionId, {
        options: [...question.options, newOption],
      });
    }
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: question.options.map((opt) =>
          opt.id === optionId ? { ...opt, text } : opt
        ),
      });
    }
  };

  const deleteOption = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      updateQuestion(questionId, {
        options: question.options.filter((opt) => opt.id !== optionId),
      });
    }
  };

  // Transform local questions to API format
  const transformQuestionsToAPI = (
    localQuestions: LocalQuestion[]
  ): CreateQuestionRequest[] => {
    return localQuestions.map((q) => ({
      text: q.text,
      description: q.description || undefined,
      type: q.type,
      isRequired: q.isRequired,
      order: q.order,
      options: q.options?.map(
        (opt): CreateQuestionOptionRequest => ({
          text: opt.text,
          order: opt.order,
        })
      ),
    }));
  };

  // Create questions sequentially after survey creation
  const createQuestionsForSurvey = async (
    surveyId: number,
    questions: CreateQuestionRequest[]
  ) => {
    for (const questionData of questions) {
      try {
        createQuestionMutation.mutate({
          surveyId,
          data: questionData,
        });
      } catch (error) {
        console.error("Failed to create question:", error);
        throw error;
      }
    }
  };

  const onSubmit = async (data: SurveyForm) => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsCreating(true);
    try {
      // Prepare survey data
      const surveyData: CreateSurveyRequest = {
        title: data.title,
        description: data.description || undefined,
        isPublic: data.isPublic,
        allowAnonymous: data.allowAnonymous,
        maxResponses: data.maxResponses || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };

      // Create the survey and get the result
      const createdSurvey =
        await createSurveyMutation.mutateAsyncRaw(surveyData);
      toast.success("Survey created successfully!");

      // Transform and create questions
      const apiQuestions = transformQuestionsToAPI(questions);
      await createQuestionsForSurvey(createdSurvey.id, apiQuestions);
      router.push("/surveys");
    } catch (error: any) {
      console.error("Survey creation error:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create survey";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const saveDraft = async () => {
    const formData = watchedValues;
    if (!formData.title?.trim()) {
      toast.error("Please enter a survey title before saving draft");
      return;
    }

    try {
      // Prepare survey data for draft
      const surveyData: CreateSurveyRequest = {
        title: formData.title,
        description: formData.description || undefined,
        isPublic: formData.isPublic,
        allowAnonymous: formData.allowAnonymous,
        maxResponses: formData.maxResponses || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      // Create the survey as draft and get the result
      const createdSurvey =
        await createSurveyMutation.mutateAsyncRaw(surveyData);
      toast.success("Draft saved successfully!");

      // If there are questions, create them too
      if (questions.length > 0) {
        const apiQuestions = transformQuestionsToAPI(questions);
        await createQuestionsForSurvey(createdSurvey.id, apiQuestions);
      }
      router.push("/surveys");
    } catch (error: any) {
      console.error("Draft save error:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save draft";
      toast.error(errorMessage);
    }
  };

  const renderQuestionEditor = (question: LocalQuestion) => {
    const QuestionIcon =
      questionTypes.find((qt) => qt.type === question.type)?.icon || Type;

    return (
      <Card key={question.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <QuestionIcon className="h-4 w-4" />
              <Badge variant="outline">{question.type}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={question.isRequired}
                onCheckedChange={(checked) =>
                  updateQuestion(question.id, { isRequired: checked })
                }
              />
              <Label className="text-sm">Required</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`question-${question.id}`}>Question Text</Label>
            <Input
              id={`question-${question.id}`}
              value={question.text}
              onChange={(e) =>
                updateQuestion(question.id, { text: e.target.value })
              }
              placeholder="Enter your question..."
              className='mt-2'
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
              placeholder="Add additional context or instructions..."
              rows={2}
              className="mt-2"
            />
          </div>

          {/* Options for choice-based questions */}
          {question.options && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-2">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateOption(question.id, option.id, e.target.value)
                      }
                      placeholder="Option text..."
                    />
                    {question.options!.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOption(question.id, option.id)}
                        className="text-red-600 hover:text-red-700"
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create Survey</h2>
            <p className="text-muted-foreground">
              Build your survey with questions and settings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <AISurveyAssistant onSurveyGenerated={handleAIGeneratedSurvey} />
          <Button
            variant="outline"
            onClick={saveDraft}
            disabled={isCreating || createSurveyMutation.isPending}
          >
            {createSurveyMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            disabled={isCreating}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isCreating || createSurveyMutation.isPending}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Survey"
            )}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* AI Assistant Tip */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  ✨ Try the AI Assistant
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  Skip the manual work! Click the "AI Assistant" button above to
                  generate a complete survey with professional questions based
                  on your topic.
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Survey Information</CardTitle>
              <CardDescription>Basic details about your survey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Survey Title *</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter survey title..."
                  className="mt-2"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe the purpose of your survey..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <CardDescription>
                    Add and configure your survey questions
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {questionTypes.map((questionType) => (
                      <DropdownMenuItem
                        key={questionType.type}
                        onClick={() =>
                          addQuestion(
                            questionType.type as LocalQuestion["type"]
                          )
                        }
                      >
                        <questionType.icon className="mr-2 h-4 w-4" />
                        {questionType.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map(renderQuestionEditor)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Type className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No questions yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start building your survey by adding questions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>
                  Control who can access your survey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Survey</Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone with the link can access
                    </p>
                  </div>
                  <Switch
                    checked={watchedValues.isPublic}
                    onCheckedChange={(checked) => setValue("isPublic", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Anonymous</Label>
                    <p className="text-sm text-muted-foreground">
                      Responses without login required
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
                  Set limits on survey responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxResponses">Maximum Responses</Label>
                  <Input
                    id="maxResponses"
                    type="number"
                    {...register("maxResponses", { valueAsNumber: true })}
                    placeholder="No limit"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survey Preview</DialogTitle>
            <DialogDescription>
              This is how your survey will appear to respondents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">
                {watchedValues.title || "Untitled Survey"}
              </h3>
              {watchedValues.description && (
                <p className="text-muted-foreground mt-2">
                  {watchedValues.description}
                </p>
              )}
            </div>

            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Q{index + 1}.</span>
                  <span className="font-medium">{question.text}</span>
                  {question.isRequired && (
                    <span className="text-red-500">*</span>
                  )}
                </div>
                {question.description && (
                  <p className="text-sm text-muted-foreground ml-6">
                    {question.description}
                  </p>
                )}

                <div className="ml-6">
                  {question.type === "TEXT" && (
                    <Input placeholder="Your answer..." disabled />
                  )}
                  {question.type === "EMAIL" && (
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      disabled
                    />
                  )}
                  {question.type === "NUMBER" && (
                    <Input
                      type="number"
                      placeholder="Enter a number..."
                      disabled
                    />
                  )}
                  {question.type === "DATE" && <Input type="date" disabled />}
                  {question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type={
                              question.type === "RADIO" ? "radio" : "checkbox"
                            }
                            disabled
                            className="rounded"
                          />
                          <span className="text-sm">{option.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === "RATING" && (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className="h-6 w-6 text-muted-foreground"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
