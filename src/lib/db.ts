import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
	// eslint-disable-next-line no-var
	var pool: Pool | undefined;
	// eslint-disable-next-line no-var
	var adapter: PrismaNeon | undefined;
}

const getPrisma = () => {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error("CRITICAL: DATABASE_URL IS MISSING IN ENVIRONMENT");
		throw new Error("DATABASE_URL is not set");
	}

	if (global.prisma) {
		return global.prisma;
	}

	console.log("Creating new DB connection (Pattern 2)...");
	// In Pattern 2, we pass the config object, NOT the Pool instance.
	// This lets adapter-neon use its own internal Pool version.
	const adapter = global.adapter ?? new PrismaNeon({ connectionString: url });
	const client = new PrismaClient({ adapter });

	if (process.env.NODE_ENV !== "production") {
		global.adapter = adapter;
		global.prisma = client;
		// Create a separate pool for other consumers like better-auth
		global.pool = global.pool ?? new Pool({ connectionString: url });
	}

	return client;
};

const prisma = getPrisma();

export { prisma as default, prisma, getPool as pool };

function getPool() {
	if (!global.pool) {
		const url = process.env.DATABASE_URL;
		if (url) {
			global.pool = new Pool({ connectionString: url });
		} else {
			getPrisma();
		}
	}
	return global.pool!;
}
