import { GLOBAL_CONFIG } from "@/global-config";
import userStore from "@/store/userStore";
import axios, {
	AxiosError,
	AxiosHeaders,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import type { Result } from "#/api";
import { ResultStatus } from "#/enum";

declare module "axios" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface AxiosRequestConfig<D = any> {
		skipAuth?: boolean;
		skipErrorHandler?: boolean;
		_retry?: boolean;
	}
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface InternalAxiosRequestConfig<D = any> {
		skipAuth?: boolean;
		skipErrorHandler?: boolean;
		_retry?: boolean;
	}
}

const API_BASE_URL = GLOBAL_CONFIG.apiBaseUrl.replace(/\/$/, "");
const REFRESH_ENDPOINT = `${API_BASE_URL}/auth/refresh-token`;
const DEFAULT_ERROR_MESSAGE = "Thao tác thất bại, hệ thống gặp sự cố!";
const SESSION_EXPIRED_MESSAGE = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

let refreshPromise: Promise<string> | null = null;
let hasNotifiedSessionExpired = false;

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	withCredentials: true,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

const extractErrorMessage = (error: AxiosError<any> | Error | unknown): string => {
	if (error instanceof AxiosError) {
		const data = error.response?.data as any;
		if (data) {
			if (typeof data.message === "string") return data.message;
			if (typeof data.error === "string") return data.error;
			if (data.error && typeof data.error.message === "string") return data.error.message;
			if (typeof data.msg === "string") return data.msg; // fallback for legacy APIs
		}
		if (typeof error.message === "string" && error.message.trim()) {
			return error.message;
		}
	}
	if (error instanceof Error) {
		return error.message || DEFAULT_ERROR_MESSAGE;
	}
	return DEFAULT_ERROR_MESSAGE;
};

const toAxiosHeaders = (headers: AxiosRequestConfig["headers"]): AxiosHeaders => {
	if (headers instanceof AxiosHeaders) {
		return headers;
	}
	const normalized = new AxiosHeaders();
	if (headers && typeof headers === "object") {
		Object.entries(headers as Record<string, unknown>).forEach(([key, value]) => {
			if (typeof value !== "undefined") {
				normalized.set(key, value as any);
			}
		});
	}
	return normalized;
};

const getAccessToken = () => userStore.getState().userToken.accessToken;
const getRefreshToken = () => userStore.getState().userToken.refreshToken;
const setTokens = (accessToken: string, refreshToken: string) => {
	const {
		actions: { setUserToken },
	} = userStore.getState();
	setUserToken({ accessToken, refreshToken });
	// reset session expired toast status after successful refresh
	hasNotifiedSessionExpired = false;
};

const clearSession = () => {
	const {
		actions: { clearUserInfoAndToken },
	} = userStore.getState();
	clearUserInfoAndToken();
	hasNotifiedSessionExpired = false;
};

const parseResponsePayload = <T>(response: AxiosResponse<Result<T> | T>) => {
	const payload = response.data;
	if (payload && typeof payload === "object" && "status" in payload && "data" in payload) {
		const { status, data, message } = payload as Result<T>;
		if (status === ResultStatus.SUCCESS) {
			return data;
		}
		const error = new AxiosError(
			message || DEFAULT_ERROR_MESSAGE,
			undefined,
			response.config,
			response.request,
			response,
		);
		return Promise.reject(error);
	}
	return payload as T;
};

const requestNewTokens = async (): Promise<string> => {
	const refreshToken = getRefreshToken();
	if (!refreshToken) {
		throw new Error(SESSION_EXPIRED_MESSAGE);
	}

	const response = await fetch(REFRESH_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
		credentials: "include",
		body: JSON.stringify({ refreshToken }),
	});

	if (!response.ok) {
		const errorMessage = await response
			.text()
			.then((text) => {
				if (!text) return SESSION_EXPIRED_MESSAGE;
				try {
					const parsed = JSON.parse(text);
					if (typeof parsed === "string") return parsed;
					if (typeof parsed?.message === "string") return parsed.message;
					if (typeof parsed?.error === "string") return parsed.error;
					if (parsed?.error && typeof parsed.error.message === "string") return parsed.error.message;
					return SESSION_EXPIRED_MESSAGE;
				} catch {
					return text;
				}
			})
			.catch(() => SESSION_EXPIRED_MESSAGE);
		throw new Error(errorMessage || SESSION_EXPIRED_MESSAGE);
	}

	const data = (await response.json()) as { accessToken?: string; refreshToken?: string };
	if (!data || typeof data.accessToken !== "string" || typeof data.refreshToken !== "string") {
		throw new Error("Refresh token response không hợp lệ.");
	}
	setTokens(data.accessToken, data.refreshToken);
	return data.accessToken;
};

const queueTokenRefresh = (): Promise<string> => {
	if (!refreshPromise) {
		refreshPromise = requestNewTokens()
			.catch((error) => {
				clearSession();
				throw error;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}
	return refreshPromise;
};

axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		if (!config.skipAuth) {
			const token = getAccessToken();
			if (token) {
				const headers = toAxiosHeaders(config.headers);
				headers.set("Authorization", `Bearer ${token}`);
				config.headers = headers;
			}
		}
		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(response) => parseResponsePayload(response),
	async (error: AxiosError) => {
		const { response, config } = error;
		const requestConfig = (config ?? {}) as AxiosRequestConfig;

		if (!response) {
			if (!requestConfig.skipErrorHandler) {
				toast.error(DEFAULT_ERROR_MESSAGE, { position: "top-center" });
			}
			return Promise.reject(error);
		}

		if (response.status === 401 && !requestConfig.skipAuth) {
			if (!requestConfig._retry && getRefreshToken()) {
				try {
					const newAccessToken = await queueTokenRefresh();
					requestConfig._retry = true;
					const headers = toAxiosHeaders(requestConfig.headers);
					headers.set("Authorization", `Bearer ${newAccessToken}`);
					requestConfig.headers = headers;
					return axiosInstance(requestConfig);
				} catch (refreshError) {
					if (!hasNotifiedSessionExpired && !requestConfig.skipErrorHandler) {
						hasNotifiedSessionExpired = true;
						toast.error(extractErrorMessage(refreshError) || SESSION_EXPIRED_MESSAGE, {
							position: "top-center",
						});
					}
					return Promise.reject(refreshError);
				}
			}

			clearSession();
			if (!hasNotifiedSessionExpired && !requestConfig.skipErrorHandler) {
				hasNotifiedSessionExpired = true;
				toast.error(SESSION_EXPIRED_MESSAGE, { position: "top-center" });
			}
			return Promise.reject(error);
		}

		if (!requestConfig.skipErrorHandler) {
			toast.error(extractErrorMessage(error), { position: "top-center" });
		}
		return Promise.reject(error);
	},
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
