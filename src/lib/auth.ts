import { betterAuth, BetterAuthOptions } from "better-auth";
import { pool } from "./db";

export const auth = betterAuth({
	database: pool(),

	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
	},

	emailAndPassword: {
		enabled: true,
	},

	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				input: true,
			},
		},
	},
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
