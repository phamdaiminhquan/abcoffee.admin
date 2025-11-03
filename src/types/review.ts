export type ReviewAuthorType = "user" | "customer" | null;

export interface ReviewResponseDto {
	id: number;
	comment: string;
	rating: number;
	images: string[];
	userId: number | null;
	customerId: number | null;
	authorType: ReviewAuthorType;
	authorName: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface PaginatedReviewResponseDto {
	data: ReviewResponseDto[];
	page: number;
	limit: number;
	total: number;
}

export interface ReviewQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	rating?: number;
	minRating?: number;
	maxRating?: number;
	userId?: number;
	customerId?: number;
	sort?: string;
	includeDeleted?: boolean;
}

export interface CreateReviewDto {
	userId?: number;
	customerId?: number;
	comment: string;
	rating: number;
	images?: string[];
}

export interface UpdateReviewDto {
	userId?: number | null;
	customerId?: number | null;
	comment?: string;
	rating?: number;
	images?: string[];
}

export const ALLOWED_REVIEW_RATINGS: number[] = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
