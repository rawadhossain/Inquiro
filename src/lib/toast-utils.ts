import { toast } from "sonner";

export const toastMessages = {
  survey: {
    creating: "Creating survey...",
    created: "Survey created successfully!",
    updating: "Updating survey...",
    updated: "Survey updated successfully!",
    deleting: "Deleting survey...",
    deleted: "Survey deleted successfully!",
    publishing: "Publishing survey...",
    published: "Survey published successfully!",
    duplicating: "Duplicating survey...",
    duplicated: "Survey duplicated successfully!",
    createError: "Failed to create survey",
    updateError: "Failed to update survey",
    deleteError: "Failed to delete survey",
    publishError: "Failed to publish survey",
    duplicateError: "Failed to duplicate survey",
  },
  question: {
    creating: "Adding question...",
    created: "Question added successfully!",
    updating: "Updating question...",
    updated: "Question updated successfully!",
    deleting: "Deleting question...",
    deleted: "Question deleted successfully!",
    reordering: "Reordering questions...",
    reordered: "Questions reordered successfully!",
    addingOption: "Adding option...",
    optionAdded: "Option added successfully!",
    createError: "Failed to add question",
    updateError: "Failed to update question",
    deleteError: "Failed to delete question",
    reorderError: "Failed to reorder questions",
    addOptionError: "Failed to add option",
  },
  response: {
    submitting: "Submitting response...",
    submitted: "Response submitted successfully!",
    exporting: "Exporting responses...",
    exported: "Responses exported successfully!",
    deleting: "Deleting response...",
    deleted: "Response deleted successfully!",
    analyzing: "Analyzing responses...",
    analyzed: "Analysis completed successfully!",
    submitError: "Failed to submit response",
    exportError: "Failed to export responses",
    deleteError: "Failed to delete response",
    analyzeError: "Failed to analyze responses",
  },
  auth: {
    signingIn: "Signing in...",
    signedIn: "Signed in successfully!",
    signingUp: "Creating account...",
    signedUp: "Account created successfully!",
    signingOut: "Signing out...",
    signedOut: "Signed out successfully!",
    sendingResetEmail: "Sending reset email...",
    resetEmailSent: "Reset email sent successfully!",
    resettingPassword: "Resetting password...",
    passwordReset: "Password reset successfully!",
    verifyingEmail: "Verifying email...",
    emailVerified: "Email verified successfully!",
    signInError: "Failed to sign in",
    signUpError: "Failed to create account",
    resetError: "Failed to reset password",
    verifyError: "Failed to verify email",
  },
  ai: {
    generating: "AI is crafting your survey...",
    generated: "AI survey generated successfully!",
    optimizing: "AI is optimizing questions...",
    optimized: "Questions optimized successfully!",
    analyzing: "AI is analyzing responses...",
    analyzed: "Analysis completed successfully!",
    generatingError: "Failed to generate AI survey",
    optimizeError: "Failed to optimize questions",
    analyzeError: "Failed to analyze responses",
  },
  file: {
    uploading: "Uploading file...",
    uploaded: "File uploaded successfully!",
    downloading: "Downloading file...",
    downloaded: "File downloaded successfully!",
    processing: "Processing file...",
    processed: "File processed successfully!",
    uploadError: "Failed to upload file",
    downloadError: "Failed to download file",
    processError: "Failed to process file",
  },
  general: {
    saving: "Saving...",
    saved: "Saved successfully!",
    loading: "Loading...",
    loaded: "Loaded successfully!",
    copying: "Copying to clipboard...",
    copied: "Copied to clipboard!",
    sharing: "Sharing...",
    shared: "Shared successfully!",
    importing: "Importing...",
    imported: "Imported successfully!",
    validating: "Validating...",
    validated: "Validation completed!",
    saveError: "Failed to save",
    loadError: "Failed to load",
    copyError: "Failed to copy to clipboard",
    shareError: "Failed to share",
    importError: "Failed to import",
    validateError: "Validation failed",
  },
};

// Pre-configured toast functions for common operations
export const toastActions = {
  survey: {
    create: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.survey.creating,
        success: toastMessages.survey.created,
        error: toastMessages.survey.createError,
      }),
    update: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.survey.updating,
        success: toastMessages.survey.updated,
        error: toastMessages.survey.updateError,
      }),
    delete: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.survey.deleting,
        success: toastMessages.survey.deleted,
        error: toastMessages.survey.deleteError,
      }),
    publish: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.survey.publishing,
        success: toastMessages.survey.published,
        error: toastMessages.survey.publishError,
      }),
    duplicate: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.survey.duplicating,
        success: toastMessages.survey.duplicated,
        error: toastMessages.survey.duplicateError,
      }),
  },
  question: {
    create: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.question.creating,
        success: toastMessages.question.created,
        error: toastMessages.question.createError,
      }),
    update: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.question.updating,
        success: toastMessages.question.updated,
        error: toastMessages.question.updateError,
      }),
    delete: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.question.deleting,
        success: toastMessages.question.deleted,
        error: toastMessages.question.deleteError,
      }),
    addOption: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.question.addingOption,
        success: toastMessages.question.optionAdded,
        error: toastMessages.question.addOptionError,
      }),
  },
  response: {
    submit: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.response.submitting,
        success: toastMessages.response.submitted,
        error: toastMessages.response.submitError,
      }),
    export: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.response.exporting,
        success: toastMessages.response.exported,
        error: toastMessages.response.exportError,
      }),
    delete: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.response.deleting,
        success: toastMessages.response.deleted,
        error: toastMessages.response.deleteError,
      }),
    analyze: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.response.analyzing,
        success: toastMessages.response.analyzed,
        error: toastMessages.response.analyzeError,
      }),
  },
  auth: {
    signIn: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.auth.signingIn,
        success: toastMessages.auth.signedIn,
        error: toastMessages.auth.signInError,
      }),
    signUp: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.auth.signingUp,
        success: toastMessages.auth.signedUp,
        error: toastMessages.auth.signUpError,
      }),
    signOut: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.auth.signingOut,
        success: toastMessages.auth.signedOut,
        error: "Failed to sign out",
      }),
    resetPassword: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.auth.resettingPassword,
        success: toastMessages.auth.passwordReset,
        error: toastMessages.auth.resetError,
      }),
    verifyEmail: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.auth.verifyingEmail,
        success: toastMessages.auth.emailVerified,
        error: toastMessages.auth.verifyError,
      }),
  },
  ai: {
    generate: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.ai.generating,
        success: toastMessages.ai.generated,
        error: toastMessages.ai.generatingError,
      }),
    optimize: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.ai.optimizing,
        success: toastMessages.ai.optimized,
        error: toastMessages.ai.optimizeError,
      }),
    analyze: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.ai.analyzing,
        success: toastMessages.ai.analyzed,
        error: toastMessages.ai.analyzeError,
      }),
  },
  file: {
    upload: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.file.uploading,
        success: toastMessages.file.uploaded,
        error: toastMessages.file.uploadError,
      }),
    download: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.file.downloading,
        success: toastMessages.file.downloaded,
        error: toastMessages.file.downloadError,
      }),
    process: (promise: Promise<any>) =>
      toast.promise(promise, {
        loading: toastMessages.file.processing,
        success: toastMessages.file.processed,
        error: toastMessages.file.processError,
      }),
  },
};

// Simple toast helpers
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showInfo = (message: string) => toast.info(message);
export const showLoading = (message: string) => toast.loading(message);

// Generic toast promise wrapper
export const toastPromise = <T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) => {
  return toast.promise(promise, options);
}; 