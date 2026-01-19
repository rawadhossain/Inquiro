import SignUpForm from "@/components/auth/sign-up-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-svh w-full justify-center sm:items-center">
      <div className="size-full max-w-md px-2 py-10 sm:max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
