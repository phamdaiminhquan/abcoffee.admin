import apiClient from "@/api/coffeeApiClient";
import type { AxiosRequestConfig } from "axios";
import type { UploadedImage, Paginated } from "#/coffee";

const base = "/upload";

export type UploadImageOptions = {
	onUploadProgress?: AxiosRequestConfig["onUploadProgress"];
	/** Optional override field name; backend expects `file` by default */
	fieldName?: string;
};

export type ListImagesQuery = {
	page?: number;
	limit?: number;
	search?: string;
	dateFrom?: string; // ISO string
	dateTo?: string; // ISO string
	sort?: string; // e.g., 'createdAt:desc'
};

export const uploadService = {
	async uploadImage(file: File, options?: UploadImageOptions): Promise<UploadedImage> {
		const formData = new FormData();
		formData.append(options?.fieldName ?? "file", file);

		return apiClient.post<UploadedImage>({
			url: `${base}/image`,
			data: formData,
			headers: {
				// Let the browser/axios set the correct multipart boundary
				"Content-Type": "multipart/form-data",
			},
			onUploadProgress: options?.onUploadProgress,
		});
	},

	async listImages(params?: ListImagesQuery): Promise<Paginated<UploadedImage>> {
		return apiClient.get({ url: `${base}/images`, params });
	},

	async getImageById(id: number): Promise<UploadedImage> {
		return apiClient.get({ url: `${base}/image/${id}` });
	},

	async listUnusedImages(params?: ListImagesQuery): Promise<Paginated<UploadedImage>> {
		return apiClient.get({ url: `${base}/images/unused`, params });
	},

	async updateImageMetadata(id: number, dto: { originalFilename?: string }): Promise<UploadedImage> {
		return apiClient.patch({ url: `${base}/image/${id}`, data: dto });
	},

	async deleteImage(id: number): Promise<{ message: string }> {
		return apiClient.delete({ url: `${base}/image/${id}` });
	},
};

export default uploadService;
