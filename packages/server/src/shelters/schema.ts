import * as z from "zod";

export const createShelterSchema = z.object({
	name: z.string().min(1).max(50),
	address: z.string().min(1),
	phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
	registration_number: z.string().min(5).max(50),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});

export const updateShelterSchema = z
	.object({
		name: z.string().min(1).max(50).optional(),
		address: z.string().min(1).optional(),
		phone: z
			.string()
			.regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
			.optional(),
		latitude: z.coerce.number().min(-90).max(90).optional(),
		longitude: z.coerce.number().min(-180).max(180).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided",
	})
	.refine(
		(data) => (data.latitude !== undefined) === (data.longitude !== undefined),
		{
			error: "Both latitude and longitude are required to set a location",
		},
	);

const verification_status_enum = z.enum(["PENDING", "VERIFIED", "REJECTED"]);

export const verificationStatusSchema = z.object({
	verification_status: verification_status_enum,
});

export const shelterIdSchema = z.object({
	id: z.uuid(),
});

export const shelterQueryParamsSchema = z
	.object({
		name: z.string().optional(),
		status: verification_status_enum.optional(),
		lat: z.coerce.number().min(-90).max(90).optional(),
		lng: z.coerce.number().min(-180).max(180).optional(),
		radius_km: z.coerce.number().min(1).max(500).default(10),
		limit: z.coerce.number().min(1).max(100).default(20),
		page: z.coerce.number().min(1).default(1),
	})
	.refine((data) => (data.lat !== undefined) === (data.lng !== undefined), {
		error: "Both latitude and longitude are required to query by location",
	});

export type CreateShelterInput = z.infer<typeof createShelterSchema>;
export type UpdateShelterInput = z.infer<typeof updateShelterSchema>;
export type ShelterQueryParamsInput = z.infer<typeof shelterQueryParamsSchema>;
export type VerificationStatusInput = z.infer<typeof verificationStatusSchema>;
