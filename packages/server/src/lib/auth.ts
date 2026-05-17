import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { Pool } from "pg";
import { config } from "../config";

export const auth = betterAuth({
	database: new Pool({
		connectionString: config.DATABASE_URL,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		openAPI(), // access docs at /api/auth/reference
	],
	// TODO: Remove this in prod.
	advanced: {
		disableOriginCheck: true,
	},
});
