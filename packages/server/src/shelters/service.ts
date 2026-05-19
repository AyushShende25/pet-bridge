import { HTTPException } from "hono/http-exception";
import postgres from "postgres";
import { isAdminRole } from "../lib/permissions";
import * as shelterQueries from "./queries";
import type {
	CreateShelterInput,
	ShelterQueryParamsInput,
	UpdateShelterInput,
	VerificationStatusInput,
} from "./schema";

export const createShelter = async ({
	userId,
	input,
}: {
	userId: string;
	input: CreateShelterInput;
}) => {
	try {
		const shelter = await shelterQueries.create(input, userId);
		// TODO: Send notification to admin for shelter verification
		return shelter;
	} catch (error) {
		console.log(error);
		if (error instanceof postgres.PostgresError) {
			if (
				error.code === "23505" &&
				error.constraint_name === "shelters_registration_number_key"
			) {
				throw new HTTPException(400, {
					message: "Shelter with that registration number already exists",
				});
			}
			if (
				error.code === "23505" &&
				error.constraint_name === "shelters_user_id_key"
			) {
				throw new HTTPException(400, {
					message: "User already has a registered shelter",
				});
			}
		}
		throw error;
	}
};

export const getShelters = async (input: ShelterQueryParamsInput) => {
	return await shelterQueries.find(input);
};

export const getShelter = async (shelterId: string) => {
	const shelter = await shelterQueries.findById(shelterId);
	if (!shelter) {
		throw new HTTPException(404, { message: "Shelter not found" });
	}

	return shelter;
};

export const updateShelter = async ({
	shelterId,
	requesterId,
	requesterRole,
	input,
}: {
	shelterId: string;
	requesterId: string;
	requesterRole: string;
	input: UpdateShelterInput;
}) => {
	const shelter = await getShelter(shelterId);

	const isOwner = shelter.user_id === requesterId;
	const isAdmin = isAdminRole(requesterRole);

	if (!isOwner && !isAdmin) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	return await shelterQueries.update(shelterId, input);
};

export const deleteShelter = async ({
	shelterId,
	requesterId,
	requesterRole,
}: {
	shelterId: string;
	requesterId: string;
	requesterRole: string;
}) => {
	const shelter = await getShelter(shelterId);

	const isOwner = shelter.user_id === requesterId;
	const isAdmin = isAdminRole(requesterRole);

	if (!isOwner && !isAdmin) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	return await shelterQueries.remove(shelterId);
};

export const updateVerificationStatus = async ({
	shelterId,
	input,
}: {
	shelterId: string;
	input: VerificationStatusInput;
}) => {
	await getShelter(shelterId);
	const shelter = await shelterQueries.updateStatus(
		shelterId,
		input.verification_status,
	);
	if (!shelter) {
		throw new HTTPException(500, {
			message: "could not update shelter-status",
		});
	}
	if (shelter.verification_status === "VERIFIED") {
		const user = await shelterQueries.updateRole(shelter.user_id, "shelter");
		console.log("user: ", user);
	}
	return shelter;
};
