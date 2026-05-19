import * as z from "zod";

export const createSpeciesSchema = z.object({
	name: z.string().min(1).max(50).trim().toLowerCase(),
});

export const updateSpeciesSchema = z.object({
	name: z.string().min(1).max(50).trim().toLowerCase(),
});

export const speciesIdSchema = z.object({
	id: z.uuid(),
});

export type CreateSpeciesInput = z.infer<typeof createSpeciesSchema>;
