import { GLOBAL_CONFIG } from "@/global-config";
import userStore from "@/store/userStore";
import axios, {
	AxiosHeaders,
	type AxiosError,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// Extend Axios types cho custom config
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

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

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

// Request interceptor: attach token vào header Authorization
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

// Response interceptor: xử lý 401 với refresh token flow
axiosInstance.interceptors.response.use(
	(res: AxiosResponse<any>) => {
		return res.data; // Coffee Shop API returns raw data (no envelope)
	},
	async (error: AxiosError<any>) => {
		const { response, config, message } = error || {};
		const requestConfig = (config ?? {}) as AxiosRequestConfig;

		// Xử lý 401 Unauthorized: thử refresh token
		if (response?.status === 401 && !requestConfig.skipAuth && !requestConfig._retry) {
			const refreshToken = getRefreshToken();
			if (refreshToken) {
				try {
					// Gọi refresh endpoint (giả sử backend có cùng endpoint)
					const API_BASE_URL = GLOBAL_CONFIG.apiBaseUrl.replace(/\/$/, "");
					const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
						method: "POST",
						headers: { "Content-Type": "application/json;charset=utf-8" },
						body: JSON.stringify({ refreshToken }),
					});

					if (refreshRes.ok) {
						const data = (await refreshRes.json()) as { accessToken: string; refreshToken: string };
						// Cập nhật token mới vào store
						const {
							actions: { setUserToken },
						} = userStore.getState();
						setUserToken({ accessToken: data.accessToken, refreshToken: data.refreshToken });

						// Retry request với token mới
						requestConfig._retry = true;
						const headers = toAxiosHeaders(requestConfig.headers);
						headers.set("Authorization", `Bearer ${data.accessToken}`);
						requestConfig.headers = headers;
						return axiosInstance(requestConfig);
					}
				} catch (refreshError) {
					// Refresh thất bại -> clear session
					const {
						actions: { clearUserInfoAndToken },
					} = userStore.getState();
					clearUserInfoAndToken();
				}
			}

			// Không có refresh token hoặc refresh thất bại
			const {
				actions: { clearUserInfoAndToken },
			} = userStore.getState();
			clearUserInfoAndToken();
			if (!requestConfig.skipErrorHandler) {
				toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", { position: "top-center" });
			}
			return Promise.reject(error);
		}

		// Các lỗi khác
		if (!requestConfig.skipErrorHandler) {
			const errMsg = (response?.data as any)?.message || message || "Request failed";
			toast.error(errMsg, { position: "top-center" });
		}
		return Promise.reject(error);
	},
);

class CoffeeAPIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	patch<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PATCH" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new CoffeeAPIClient();
