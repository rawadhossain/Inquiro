import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: "Inquiro",
	description: "Inquiro Surveys",
};

const bricolage = Bricolage_Grotesque({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-bricolage",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${bricolage.className} antialiased`} suppressHydrationWarning>
				<QueryProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
					>
						<Toaster richColors theme="dark" closeButton position="top-center" />
						{children}
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
