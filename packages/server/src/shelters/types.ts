export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type Shelter = {
	id: string;
	name: string;
	address: string;
	phone: string;
	registration_number: string;
	user_id: string;
	verification_status: VerificationStatus;
	location: string;
	latitude: number;
	longitude: number;
	deleted_at: Date | null;
	created_at: Date;
	updated_at: Date;
};
