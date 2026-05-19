import { sql } from "../db/client";
import type { CreateSpeciesInput } from "./schema";
import type { Species } from "./types";

export const create = async (input: CreateSpeciesInput): Promise<Species> => {
	const [species]: [Species?] = await sql`
    INSERT INTO species (
      name
    )
    VALUES (
      ${input.name}
    )
    RETURNING *
  `;

	if (!species) {
		throw new Error("Failed to create species");
	}

	return species;
};

export const findAll = async (): Promise<Species[]> => {
	return await sql<Species[]>`
    SELECT * 
    FROM species 
    ORDER BY name ASC
  `;
};

export const findById = async (id: string): Promise<Species | undefined> => {
	const [species]: [Species?] = await sql`
    SELECT *
    FROM species
    WHERE id = ${id}
  `;

	return species;
};

export const findByName = async (
	name: string,
): Promise<Species | undefined> => {
	const [species]: [Species?] = await sql`
    SELECT *
    FROM species
    WHERE name = ${name}
  `;

	return species;
};

export const update = async (
	id: string,
	name: string,
): Promise<Species | undefined> => {
	const [species]: [Species?] = await sql`
      UPDATE species 
      SET name = ${name} 
      WHERE id = ${id} 
      RETURNING *
    `;
	return species;
};

export const remove = async (id: string): Promise<Species | undefined> => {
	const [species]: [Species?] = await sql`
    DELETE FROM species
    WHERE id = ${id}
    RETURNING *
  `;

	return species;
};
