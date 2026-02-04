import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Lightweight session endpoint for Edge middleware.
 * Keeps auth/database out of the Edge bundle; this route runs in Node.
 */
export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		return NextResponse.json(session ?? { session: null, user: null });
	} catch {
		return NextResponse.json({ session: null, user: null });
	}
}
