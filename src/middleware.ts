import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Define route patterns
const publicRoutes = [
	"/",
	"/signin",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/check-email",
	"/email-verified",
];
const protectedRoutes = ["/dashboard", "/surveys", "/responses"];
const respondentRoutes = ["/respondent", "/survey"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
		return NextResponse.next();
	}

	if (pathname.startsWith("/api/")) {
		return NextResponse.next();
	}

	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		// No session found - redirect to signin
		if (!session) {
			const signInUrl = new URL("/signin", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		// // Role-based access control (if needed)
		// // Uncomment and modify based on your role requirements
		if (pathname.startsWith("/dashboard")) {
			if (session.user.role !== "CREATOR") {
				return NextResponse.redirect(new URL("/respondent", request.url));
			}
		}

		if (pathname.startsWith("/respondent")) {
			if (session.user.role !== "RESPONDENT") {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}
		}

		// Allow authenticated users to proceed
		return NextResponse.next();
	} catch (error) {
		// Error getting session - redirect to signin
		console.error("Middleware auth error:", error);
		const signInUrl = new URL("/signin", request.url);
		signInUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(signInUrl);
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public assets (images, etc.)
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
