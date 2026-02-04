import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes that require redirect to app when user is already authenticated
const redirectIfAuthenticatedRoutes = [
	"/",
	"/signin",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/check-email",
	"/email-verified",
];

function getAppRedirectPath(role: string | undefined): string {
	if (role === "RESPONDENT") return "/respondent";
	return "/dashboard";
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith("/api/")) {
		return NextResponse.next();
	}

	const isRedirectIfAuthRoute = redirectIfAuthenticatedRoutes.some(
		(route) => pathname === route || pathname.startsWith(route + "/")
	);

	if (isRedirectIfAuthRoute) {
		try {
			const session = await auth.api.getSession({
				headers: request.headers,
			});
			// Authenticated user on landing or auth pages → send to app
			if (session?.user) {
				const redirectPath = getAppRedirectPath(session.user.role as string);
				return NextResponse.redirect(new URL(redirectPath, request.url));
			}
		} catch {
			// Ignore session errors; allow request to continue
		}
		return NextResponse.next();
	}

	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			const signInUrl = new URL("/signin", request.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

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

		return NextResponse.next();
	} catch (error) {
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
