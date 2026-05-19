import { HTTPException } from "hono/http-exception";
import postgres from "postgres";
import * as speciesQueries from "./queries";

export const createSpecies = async (name: string) => {
	try {
		return await speciesQueries.create({ name });
	} catch (error) {
		if (error instanceof postgres.PostgresError) {
			if (error.code === "23505")
				throw new HTTPException(400, { message: "Species already exists" });
		}
		throw error;
	}
};

export const getSpecies = async () => {
	return await speciesQueries.findAll();
};

export const updateSpecies = async ({
	id,
	name,
}: {
	id: string;
	name: string;
}) => {
	try {
		const species = await speciesQueries.update(id, name);

		if (!species) {
			throw new HTTPException(404, { message: "Species not found" });
		}

		return species;
	} catch (error) {
		if (error instanceof postgres.PostgresError) {
			if (error.code === "23505")
				throw new HTTPException(400, { message: "Species already exists" });
		}
		throw error;
	}
};

export const deleteSpecies = async (id: string) => {
	const species = await speciesQueries.remove(id);

	if (!species) {
		throw new HTTPException(404, { message: "Species not found" });
	}

	return species;
};
