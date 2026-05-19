import { sql } from "../db/client";
import type { CreateBreedInput } from "./schema";
import type { Breed } from "./types";

export const create = async (input: CreateBreedInput): Promise<Breed> => {
	const [breed]: [Breed?] = await sql`
    INSERT INTO breeds (
      species_id,
      name
    )
    VALUES (
      ${input.species_id},
      ${input.name}
    )
    RETURNING *
  `;

	if (!breed) {
		throw new Error("Failed to create new breed");
	}

	return breed;
};

export const findAll = async (): Promise<Breed[]> => {
	return await sql<Breed[]>`
    SELECT *
    FROM breeds
    ORDER BY name ASC
  `;
};

export const findBySpeciesId = async (species_id: string): Promise<Breed[]> => {
	return await sql<Breed[]>`
    SELECT *
    FROM breeds
    WHERE species_id = ${species_id}
    ORDER BY name ASC
  `;
};

export const findById = async (id: string): Promise<Breed | undefined> => {
	const [breed]: [Breed?] = await sql`
    SELECT *
    FROM breeds
    WHERE id = ${id}
  `;

	return breed;
};

export const update = async (
	id: string,
	name: string,
): Promise<Breed | undefined> => {
	const [breed]: [Breed?] = await sql`
    UPDATE breeds
    SET name = ${name}
    WHERE id = ${id}
    RETURNING *
  `;

	return breed;
};

export const remove = async (id: string): Promise<Breed | undefined> => {
	const [breed]: [Breed?] = await sql`
    DELETE FROM breeds
    WHERE id = ${id}
    RETURNING *
  `;

	return breed;
};
