import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { auth } from "../lib/auth";
import type { statement } from "../lib/permissions";
import type { AuthType } from "../types";

export const requireAuth = createMiddleware<{ Variables: AuthType }>(
	async (c, next) => {
		const user = c.get("user");
		const session = c.get("session");

		if (!user || !session) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		await next();
	},
);

type Resource = keyof typeof statement;
type Action<R extends Resource> = (typeof statement)[R][number];

export const requirePermission = <R extends Resource>(
	resource: R,
	action: Action<R>,
) =>
	createMiddleware<{ Variables: AuthType }>(async (c, next) => {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		console.log(resource, action);

		const result = await auth.api.userHasPermission({
			body: {
				userId: user.id,
				permissions: { [resource]: [action] },
			},
		});
		if (!result.success) {
			throw new HTTPException(403, { message: "Forbidden" });
		}

		await next();
	});
