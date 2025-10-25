import { GLOBAL_CONFIG } from "@/global-config";
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

axiosInstance.interceptors.request.use(
	(config) => config,
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(res: AxiosResponse<any>) => {
		return res.data; // Coffee Shop API returns raw data (no envelope)
	},
	(error: AxiosError<any>) => {
		const { response, message } = error || {};
		const errMsg = (response?.data as any)?.message || message || "Request failed";
		toast.error(errMsg, { position: "top-center" });
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
