import apiClient from "@/api/coffeeApiClient";
import type { Product, CreateProductDto, UpdateProductDto } from "#/coffee";

const base = "/products";

export const productService = {
	getAll(categoryId?: number): Promise<Product[]> {
		const params = categoryId ? { categoryId } : undefined;
		return apiClient.get({ url: base, params });
	},
	getById(id: number): Promise<Product> {
		return apiClient.get({ url: `${base}/${id}` });
	},
	create(data: CreateProductDto): Promise<Product> {
		return apiClient.post({ url: base, data });
	},
	update(id: number, data: UpdateProductDto): Promise<Product> {
		return apiClient.patch({ url: `${base}/${id}`, data });
	},
	softDelete(id: number): Promise<Product> {
		return apiClient.delete({ url: `${base}/${id}` });
	},
};

export default productService;
