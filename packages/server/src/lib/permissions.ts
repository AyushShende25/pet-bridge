import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
	...defaultStatements,
	shelter: ["create", "update", "delete", "verify", "list"],
	species: ["create", "update", "delete", "list"],
	breeds: ["create", "update", "delete", "list"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
	shelter: ["list", "create"],
	species: ["list"],
	breeds: ["list"],
});

export const shelter = ac.newRole({
	shelter: ["update", "list", "delete"],
	species: ["list"],
	breeds: ["list"],
});

export const admin = ac.newRole({
	...adminAc.statements,
	shelter: ["create", "update", "delete", "verify", "list"],
	species: ["create", "update", "delete", "list"],
	breeds: ["create", "update", "delete", "list"],
});

export const ADMIN_ROLES = ["admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const isAdminRole = (role: string): boolean =>
	ADMIN_ROLES.includes(role as AdminRole);
