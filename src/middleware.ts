import { NextRequest, NextResponse } from "next/server";

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

async function getSession(
	request: NextRequest
): Promise<{ user?: { role?: string }; session?: unknown } | null> {
	try {
		const sessionUrl = new URL("/api/auth/session", request.url);
		const res = await fetch(sessionUrl.toString(), {
			headers: {
				cookie: request.headers.get("cookie") ?? "",
			},
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data?.user != null ? data : null;
	} catch {
		return null;
	}
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
		const session = await getSession(request);
		if (session?.user) {
			const redirectPath = getAppRedirectPath(session.user.role);
			return NextResponse.redirect(new URL(redirectPath, request.url));
		}
		return NextResponse.next();
	}

	const session = await getSession(request);

	if (!session?.user) {
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
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
