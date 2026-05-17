import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import { config } from "./config";
import { auth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/session";
import type { AuthType } from "./types";

const app = new Hono<{
	Variables: AuthType;
}>().basePath("/api");

app.use(logger());

app.use("/*", cors());

app.use("*", sessionMiddleware);

app.on(["POST", "GET"], "/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

app.get("/health", (c) => {
	return c.json({ ok: true }, 200);
});

app.notFound((c) => {
	return c.json({ error: "Resource not found" }, 404);
});

app.onError((error, c) => {
	if (error instanceof HTTPException) {
		const cause = error.cause;

		if (cause instanceof ZodError) {
			return c.json(
				{
					errors: cause.issues.map((i) => ({
						message: i.message,
						path: i.path.join("."),
					})),
				},
				error.status,
			);
		}

		return c.json({ message: error.message }, error.status);
	}
	console.error(error);
	return c.json({ message: "Internal server error" }, 500);
});

serve(
	{
		fetch: app.fetch,
		port: config.PORT,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);

export default app;
export type AppType = typeof app;
