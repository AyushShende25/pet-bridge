import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
	...defaultStatements,
	shelter: ["create", "update", "delete", "verify", "list"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
	shelter: ["list", "create"],
});

export const shelter = ac.newRole({
	shelter: ["update", "list", "delete"],
});

export const admin = ac.newRole({
	...adminAc.statements,
	shelter: ["create", "update", "delete", "verify", "list"],
});

export const ADMIN_ROLES = ["admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const isAdminRole = (role: string): boolean =>
	ADMIN_ROLES.includes(role as AdminRole);
