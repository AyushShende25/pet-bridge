import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";
import type { AuthType } from "../types";

export const sessionMiddleware = createMiddleware<{ Variables: AuthType }>(
	async (c, next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		c.set("user", session?.user ?? null);
		c.set("session", session?.session ?? null);
		await next();
	},
);
