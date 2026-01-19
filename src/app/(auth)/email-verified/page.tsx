import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EmailVerifiedPage() {
  return (
    <div className="flex flex-col min-h-[100vh] h-full w-full items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Email Verified!
          </CardTitle>
          <CardDescription>
            Your email has been successfully verified. You can now access all
            features of your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:underline"
            >
              Return to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
