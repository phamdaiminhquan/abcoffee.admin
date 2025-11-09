import type { NavItemDataProps } from "@/components/nav/types";
import type { BasicStatus, PermissionType } from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserInfo {
	id: string | number;
	email: string;
	username?: string;
	fullName?: string;
	phone?: string;
	password?: string;
	avatar?: string;
	roles?: Role[];
	role?: string;
	status?: BasicStatus;
	permissions?: Permission[];
	menu?: MenuTree[];
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string | number | null;
	updatedBy?: string | number | null;
	deletedAt?: string | null;
	rewardPoints?: number;
}

export interface Permission_Old {
	id: string;
	parentId: string;
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order?: number;
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission_Old[];
}

export interface Role_Old {
	id: string;
	name: string;
	code: string;
	status: BasicStatus;
	order?: number;
	desc?: string;
	permission?: Permission_Old[];
}

export interface CommonOptions {
	status?: BasicStatus;
	desc?: string;
	createdAt?: string;
	updatedAt?: string;
}
export interface User extends CommonOptions {
	id: string; // định danh uuid
	username: string;
	password: string;
	email: string;
	phone?: string;
	avatar?: string;
}

export interface Role extends CommonOptions {
	id: string; // định danh uuid
	name: string;
	code: string;
}

export interface Permission extends CommonOptions {
	id: string; // định danh uuid
	name: string;
	code: string; // resource:action, ví dụ "user-management:read"
}

export interface Menu extends CommonOptions, MenuMetaInfo {
	id: string; // định danh uuid
	parentId: string;
	name: string;
	code: string;
	order?: number;
	type: PermissionType;
}

export type MenuMetaInfo = Partial<
	Pick<NavItemDataProps, "path" | "icon" | "caption" | "info" | "disabled" | "auth" | "hidden">
> & {
	externalLink?: URL;
	component?: string;
};

export type MenuTree = Menu & {
	children?: MenuTree[];
};
