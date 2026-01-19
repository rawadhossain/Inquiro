import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";
import path from "path";
// Explicitly load .env.local for Prisma CLI
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
export default defineConfig({
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
