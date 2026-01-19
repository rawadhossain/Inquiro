import { ReactNode } from "react";

export default function SurveyLayout({ children }: { children: ReactNode }) {
  return <div className="dark min-h-screen bg-background">{children}</div>;
}
