import SignInForm from "@/components/auth/sign-in-form";
import { Suspense } from "react";

function SignInPageContent() {
  return (
    <div className="flex min-h-svh w-full justify-center sm:items-center">
      <div className="size-full max-w-md px-2 py-10 sm:max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInPageContent />
    </Suspense>
  );
}
