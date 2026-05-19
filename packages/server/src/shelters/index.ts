import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requirePermission } from "../middleware/require-auth";
import { zValidator } from "../middleware/validator-wrapper";
import type { AuthType } from "../types";
import {
	createShelterSchema,
	shelterIdSchema,
	shelterQueryParamsSchema,
	updateShelterSchema,
	verificationStatusSchema,
} from "./schema";
import {
	createShelter,
	deleteShelter,
	getShelter,
	getShelters,
	updateShelter,
	updateVerificationStatus,
} from "./service";

const router = new Hono<{
	Variables: AuthType;
}>();

router.post(
	"/",
	zValidator("json", createShelterSchema),
	requirePermission("shelter", "create"),
	async (c) => {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		const input = c.req.valid("json");
		const shelter = await createShelter({ userId: user.id, input });
		return c.json({ shelter }, 201);
	},
);

router.get("/", zValidator("query", shelterQueryParamsSchema), async (c) => {
	const query = c.req.valid("query");
	const shelters = await getShelters(query);
	return c.json({ shelters }, 200);
});

router.get("/:id", zValidator("param", shelterIdSchema), async (c) => {
	const { id } = c.req.valid("param");
	const shelter = await getShelter(id);
	return c.json({ shelter }, 200);
});

router.patch(
	"/:id",
	zValidator("param", shelterIdSchema),
	zValidator("json", updateShelterSchema),
	requirePermission("shelter", "update"),
	async (c) => {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		const { id } = c.req.valid("param");
		const input = c.req.valid("json");
		const shelter = await updateShelter({
			shelterId: id,
			requesterId: user.id,
			requesterRole: user.role!,
			input,
		});
		return c.json({ shelter }, 200);
	},
);

router.delete(
	"/:id",
	zValidator("param", shelterIdSchema),
	requirePermission("shelter", "delete"),
	async (c) => {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		const { id } = c.req.valid("param");
		const shelter = await deleteShelter({
			shelterId: id,
			requesterId: user.id,
			requesterRole: user.role!,
		});
		return c.json({ shelter }, 200);
	},
);

router.patch(
	"/:id/verification",
	zValidator("param", shelterIdSchema),
	zValidator("json", verificationStatusSchema),
	requirePermission("shelter", "verify"),
	async (c) => {
		const { id } = c.req.valid("param");
		const input = c.req.valid("json");
		const shelter = await updateVerificationStatus({ shelterId: id, input });
		return c.json({ shelter }, 200);
	},
);

export default router;
