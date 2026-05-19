import { Hono } from "hono";
import { requirePermission } from "../middleware/require-auth";
import { zValidator } from "../middleware/validator-wrapper";
import type { AuthType } from "../types";
import {
	createSpeciesSchema,
	speciesIdSchema,
	updateSpeciesSchema,
} from "./schema";
import {
	createSpecies,
	deleteSpecies,
	getSpecies,
	updateSpecies,
} from "./service";

const router = new Hono<{
	Variables: AuthType;
}>();

router.post(
	"/",
	requirePermission("species", "create"),
	zValidator("json", createSpeciesSchema),
	async (c) => {
		const { name } = c.req.valid("json");
		const species = await createSpecies(name);
		return c.json({ species }, 201);
	},
);

router.get("/", async (c) => {
	const species = await getSpecies();
	return c.json({ species }, 200);
});

router.patch(
	"/:id",
	requirePermission("species", "update"),
	zValidator("param", speciesIdSchema),
	zValidator("json", updateSpeciesSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const { name } = c.req.valid("json");
		const species = await updateSpecies({ id, name });
		return c.json({ species }, 200);
	},
);

router.delete(
	"/:id",
	requirePermission("species", "delete"),
	zValidator("param", speciesIdSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const species = await deleteSpecies(id);
		return c.json({ species }, 200);
	},
);

export default router;
