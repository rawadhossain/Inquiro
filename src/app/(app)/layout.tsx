import type React from "react";
import ClientAppLayout from "./client-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientAppLayout>{children}</ClientAppLayout>;
}
