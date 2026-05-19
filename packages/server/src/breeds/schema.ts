import * as z from "zod";

export const createBreedSchema = z.object({
	name: z.string().min(1).max(50).trim().toLowerCase(),
	species_id: z.uuid(),
});

export const updateBreedSchema = z.object({
	name: z.string().min(1).max(50).trim().toLowerCase(),
});

export const breedIdSchema = z.object({
	id: z.uuid(),
});

export type CreateBreedInput = z.infer<typeof createBreedSchema>;
