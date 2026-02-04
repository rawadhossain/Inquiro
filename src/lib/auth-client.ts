import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

/**
 * Client must use the same origin as the page so cookies are sent/cleared correctly.
 * BETTER_AUTH_URL is server-only; in the browser we use current origin so it works
 * both locally (localhost:3000) and in production (e.g. inquiro.rawad.space).
 */
function getAuthBaseURL(): string | undefined {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;
}

export const authClient = createAuthClient({
	baseURL: getAuthBaseURL(),
	plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, useSession } = authClient;
