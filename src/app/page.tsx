"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features";
import FAQs from "@/components/landing/faq";

export default function Home() {
  const router = useRouter();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      return result;
    },
  });

  const user = session?.data?.user as any;
  const isAuthenticated = !!session?.data?.session;

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "CREATOR") {
        router.push("/dashboard");
      } else if (user.role === "RESPONDENT") {
        router.push("/respondent");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (!isAuthenticated) {
    return (
      <main>
        <HeroSection />
        <FeaturesSection />
        <FAQs />
      </main>
    );
  }

  return null;
}
