export enum ProductStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
}

export enum OrderStatus {
	PENDING_PAYMENT = "pending_payment",
	PAID = "paid",
	CANCELLED = "cancelled",
}

export enum PaymentMethod {
	CASH = "cash",
	BANK_TRANSFER = "bank_transfer",
}

export interface BaseEntity {
	id: number;
	createdAt: string | Date;
	updatedAt: string | Date;
	createdBy?: number | null;
	updatedBy?: number | null;
	deletedAt?: string | Date | null;
}

export interface Category extends BaseEntity {
	name: string;
	description?: string | null;
}

export interface CreateCategoryDto {
	name: string;
	description?: string;
}

export interface UpdateCategoryDto {
	name?: string;
	description?: string;
}

export interface Product extends BaseEntity {
	name: string;
	description?: string | null;
	price: number;
	image?: string | null;
	status: ProductStatus;
	categoryId: number;
	category: Category;
}

export interface CreateProductDto {
	name: string;
	description?: string;
	price: number;
	image?: string;
	categoryId: number;
	status?: ProductStatus;
}

export interface UpdateProductDto {
	name?: string;
	description?: string;
	price?: number;
	image?: string;
	categoryId?: number;
	status?: ProductStatus;
}

export interface OrderDetail extends BaseEntity {
	orderId: number;
	productId: number;
	product: Product;
	quantity: number;
	unitPrice: number;
	subtotal: number;
}

export interface Order extends BaseEntity {
	customerName: string;
	userId?: number;
	paymentMethod: PaymentMethod;
	status: OrderStatus;
	cancellationReason?: string;
	orderDetails: OrderDetail[];
}

export interface CreateOrderDetailDto {
	productId: number;
	quantity: number;
	unitPrice: number;
}

export interface CreateOrderDto {
	customerName?: string;
	userId?: number;
	paymentMethod: PaymentMethod;
	orderDetails: CreateOrderDetailDto[];
}

export interface UpdateOrderDto {
	status?: OrderStatus;
	cancellationReason?: string;
}

export interface PaymentMethodBreakdown {
	cash: number;
	bank_transfer: number;
}

export interface RevenueReportDto {
	date: string; // YYYY-MM-DD
	totalOrders: number;
	totalRevenue: number;
	paymentMethodBreakdown: PaymentMethodBreakdown;
}
