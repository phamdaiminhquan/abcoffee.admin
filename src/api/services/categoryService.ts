import apiClient from "@/api/coffeeApiClient";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "#/coffee";

const base = "/categories";

export const categoryService = {
	getAll(): Promise<Category[]> {
		return apiClient.get({ url: base });
	},
	getById(id: number): Promise<Category> {
		return apiClient.get({ url: `${base}/${id}` });
	},
	create(data: CreateCategoryDto): Promise<Category> {
		return apiClient.post({ url: base, data });
	},
	update(id: number, data: UpdateCategoryDto): Promise<Category> {
		return apiClient.patch({ url: `${base}/${id}`, data });
	},
	remove(id: number): Promise<Category> {
		return apiClient.delete({ url: `${base}/${id}` });
	},
};

export default categoryService;
