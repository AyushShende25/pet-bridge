import { Hono } from "hono";

import { requirePermission } from "../middleware/require-auth";
import { zValidator } from "../middleware/validator-wrapper";
import { speciesIdSchema } from "../species/schema";
import type { AuthType } from "../types";
import { breedIdSchema, createBreedSchema, updateBreedSchema } from "./schema";
import {
	createBreed,
	deleteBreed,
	getBreeds,
	getBreedsBySpecies,
	updateBreed,
} from "./service";

const router = new Hono<{
	Variables: AuthType;
}>();

router.post(
	"/",
	requirePermission("breeds", "create"),
	zValidator("json", createBreedSchema),
	async (c) => {
		const { species_id, name } = c.req.valid("json");
		const breed = await createBreed({ species_id, name });
		return c.json({ breed }, 201);
	},
);

router.get("/", async (c) => {
	const breeds = await getBreeds();
	return c.json({ breeds }, 200);
});

router.get("/species/:id", zValidator("param", speciesIdSchema), async (c) => {
	const { id } = c.req.valid("param");
	const breeds = await getBreedsBySpecies(id);
	return c.json({ breeds }, 200);
});

router.patch(
	"/:id",
	requirePermission("breeds", "update"),
	zValidator("param", breedIdSchema),
	zValidator("json", updateBreedSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const { name } = c.req.valid("json");
		const breed = await updateBreed({ id, name });
		return c.json({ breed }, 200);
	},
);

router.delete(
	"/:id",
	requirePermission("breeds", "delete"),
	zValidator("param", breedIdSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const breed = await deleteBreed(id);
		return c.json({ breed }, 200);
	},
);

export default router;
