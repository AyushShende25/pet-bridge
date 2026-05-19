import { betterAuth } from "better-auth";
import { admin as adminPlugin, openAPI } from "better-auth/plugins";
import { Pool } from "pg";
import { config } from "../config";
import { ac, admin, shelter, user } from "./permissions";

export const auth = betterAuth({
	database: new Pool({
		connectionString: config.DATABASE_URL,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		adminPlugin({
			ac,
			roles: { user, admin, shelter },
			defaultRole: "user",
		}),
		openAPI(), // access docs at /api/auth/reference
	],
	// TODO: Remove this in prod.
	advanced: {
		disableOriginCheck: true,
	},
});
