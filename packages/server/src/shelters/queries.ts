import type { User } from "better-auth";
import { sql } from "../db/client";
import type {
	CreateShelterInput,
	ShelterQueryParamsInput,
	UpdateShelterInput,
} from "./schema";
import type { Shelter } from "./types";

export const create = async (
	input: CreateShelterInput,
	userId: string,
): Promise<Shelter> => {
	const [shelter]: [Shelter?] = await sql`
  INSERT INTO shelters (
    name,
    address,
    phone,
    registration_number,
    user_id,
    location
    )
    VALUES (
      ${input.name},
      ${input.address},
      ${input.phone},
      ${input.registration_number},
      ${userId},
      ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
    ) 
    RETURNING 
      *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude
  `;
	if (!shelter) {
		throw new Error("Failed to create shelter");
	}
	return shelter;
};

export const findById = async (id: string): Promise<Shelter | undefined> => {
	const [shelter]: [Shelter?] = await sql`
    SELECT 
      *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude 
    FROM shelters 
    WHERE id = ${id} AND deleted_at IS NULL
  `;
	return shelter;
};

export const findByUserId = async (
	id: string,
): Promise<Shelter | undefined> => {
	const [shelter]: [Shelter?] = await sql`
    SELECT 
      *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude 
    FROM shelters 
    WHERE user_id = ${id} AND deleted_at IS NULL
  `;
	return shelter;
};

export const find = async (input: ShelterQueryParamsInput) => {
	const hasLocation = input.lat !== undefined && input.lng !== undefined;
	const lat = input.lat!;
	const lng = input.lng!;
	const radiusMeters = (input.radius_km ?? 50) * 1000;
	const offset = (input.page - 1) * input.limit;

	const point = hasLocation
		? sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`
		: null;

	const statusFilter =
		input.status !== undefined
			? sql`AND verification_status = ${input.status}`
			: sql`AND verification_status = 'VERIFIED'`;

	const nameFilter = input.name
		? sql`AND name ILIKE ${`%${input.name}%`}`
		: sql``;

	const locationFilter = hasLocation
		? sql`AND ST_DWithin(location, ST_MakePoint(${lng}, ${lat})::geography, ${radiusMeters})`
		: sql``;

	return await sql`
    SELECT 
      *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude
      ${
				point
					? sql`, ST_Distance(location, ${point}) AS distance_meters`
					: sql``
			} 
    FROM shelters
    WHERE 
      deleted_at IS NULL
      ${statusFilter}
      ${nameFilter}
      ${locationFilter}
    ORDER BY ${point ? sql`distance_meters ASC` : sql`name ASC`}
    LIMIT ${input.limit}
    OFFSET ${offset}
  `;
};

export const update = async (
	id: string,
	input: UpdateShelterInput,
): Promise<Shelter | undefined> => {
	const { latitude, longitude, ...fields } = input;

	const filteredFields = Object.fromEntries(
		Object.entries(fields).filter(([_, v]) => v !== undefined),
	);

	const hasLocation = latitude !== undefined && longitude !== undefined;
	const hasFields = Object.keys(filteredFields).length > 0;

	if (!hasFields && !hasLocation) {
		return undefined;
	}

	const [shelter] = await sql<[Shelter?]>`
    UPDATE shelters
    SET 
      ${hasFields ? sql(filteredFields) : sql``}
      ${hasFields && hasLocation ? sql`,` : sql``}
      ${
				hasLocation
					? sql`
              location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography`
					: sql``
			}
    WHERE 
      id = ${id} 
      AND deleted_at IS NULL
    RETURNING 
      *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude
  `;

	return shelter;
};

export const remove = async (id: string): Promise<Shelter | undefined> => {
	const [shelter]: [Shelter?] = await sql`
    UPDATE shelters
    SET deleted_at = NOW()
    WHERE 
      id = ${id} 
      AND deleted_at IS NULL
    RETURNING *
 `;
	return shelter;
};

export const updateStatus = async (
	id: string,
	status: "PENDING" | "VERIFIED" | "REJECTED",
): Promise<Shelter | undefined> => {
	const [shelter]: [Shelter?] = await sql`
    UPDATE shelters
    SET verification_status = ${status}
    WHERE 
      id = ${id} 
      AND deleted_at IS NULL
    RETURNING 
      *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude
 `;
	return shelter;
};

export const updateRole = async (
	id: string,
	role: "shelter" | "user",
): Promise<User | undefined> => {
	const [user]: [User?] = await sql`
    UPDATE "user"
    SET role = ${role}
    WHERE id = ${id}
    RETURNING *
  `;
	return user;
};
