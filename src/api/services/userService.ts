import apiClient from "../apiClient";

import type { UserInfo } from "#/entity";

export interface SignInReq {
	email: string;
	password: string;
}

export interface SignUpReq {
	fullName: string;
	email: string;
	password: string;
	phone?: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface SignInRes {
	user: UserInfo;
	tokens: AuthTokens;
}

export interface RefreshTokenReq {
	refreshToken: string;
}

export type RefreshTokenRes = AuthTokens;

export interface UpdateProfileReq {
	fullName?: string;
	phone?: string;
	currentPassword?: string;
	newPassword?: string;
}

export enum UserApi {
	Login = "/auth/login",
	Register = "/auth/register",
	Refresh = "/auth/refresh-token",
	Logout = "/auth/logout",
	Profile = "/auth/profile",
}

const signin = (data: SignInReq) =>
	apiClient.post<SignInRes>({ url: UserApi.Login, data, skipAuth: true, skipErrorHandler: true });
const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.Register, data, skipAuth: true });
const logout = () => apiClient.post<{ message: string }>({ url: UserApi.Logout });
const refreshToken = (data: RefreshTokenReq) =>
	apiClient.post<RefreshTokenRes>({ url: UserApi.Refresh, data, skipAuth: true, skipErrorHandler: true });
const getProfile = () => apiClient.get<UserInfo>({ url: UserApi.Profile });
const updateProfile = (data: UpdateProfileReq) => apiClient.put<UserInfo>({ url: UserApi.Profile, data });

export default {
	signin,
	signup,
	logout,
	refreshToken,
	getProfile,
	updateProfile,
};
