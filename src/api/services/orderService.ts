import apiClient from "@/api/coffeeApiClient";
import type { Order, CreateOrderDto, UpdateOrderDto } from "#/coffee";

const base = "/orders";

export const orderService = {
	getAll(customerName?: string): Promise<Order[]> {
		const params = customerName ? { customerName } : undefined;
		return apiClient.get({ url: base, params });
	},
	getById(id: number): Promise<Order> {
		return apiClient.get({ url: `${base}/${id}` });
	},
	create(data: CreateOrderDto): Promise<Order> {
		return apiClient.post({ url: base, data });
	},
	update(id: number, data: UpdateOrderDto): Promise<Order> {
		return apiClient.patch({ url: `${base}/${id}`, data });
	},
	remove(id: number): Promise<void> {
		return apiClient.delete({ url: `${base}/${id}` });
	},
};

export default orderService;
