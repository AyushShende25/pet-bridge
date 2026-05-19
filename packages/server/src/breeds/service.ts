import { HTTPException } from "hono/http-exception";
import postgres from "postgres";
import * as breedQueries from "./queries";

export const createBreed = async ({
	species_id,
	name,
}: {
	species_id: string;
	name: string;
}) => {
	try {
		return await breedQueries.create({ species_id, name });
	} catch (error) {
		if (error instanceof postgres.PostgresError) {
			if (error.code === "23505") {
				throw new HTTPException(400, {
					message: "Breed already exists for this species",
				});
			}

			// Foreign-key violation (invalid species-id)
			if (error.code === "23503") {
				throw new HTTPException(404, { message: "Species not found" });
			}
		}
		throw error;
	}
};

export const getBreeds = async () => {
	return await breedQueries.findAll();
};

export const getBreedsBySpecies = async (species_id: string) => {
	return await breedQueries.findBySpeciesId(species_id);
};

export const updateBreed = async ({
	id,
	name,
}: {
	id: string;
	name: string;
}) => {
	try {
		const breed = await breedQueries.update(id, name);

		if (!breed) {
			throw new HTTPException(404, { message: "Breed not found" });
		}

		return breed;
	} catch (error) {
		if (error instanceof postgres.PostgresError) {
			if (error.code === "23505") {
				throw new HTTPException(400, {
					message: "Breed already exists for this species",
				});
			}
		}
		throw error;
	}
};

export const deleteBreed = async (id: string) => {
	const breed = await breedQueries.remove(id);

	if (!breed) {
		throw new HTTPException(404, { message: "Breed not found" });
	}

	return breed;
};
