import apiClient from "@/api/apiClient";
import type {
	CreateReviewDto,
	PaginatedReviewResponseDto,
	ReviewQueryParams,
	ReviewResponseDto,
	UpdateReviewDto,
} from "#/review";

const baseUrl = "/admin/reviews";

export const reviewService = {
	list(params: ReviewQueryParams): Promise<PaginatedReviewResponseDto> {
		return apiClient.get({ url: baseUrl, params });
	},
	getById(id: number, params?: Pick<ReviewQueryParams, "includeDeleted">): Promise<ReviewResponseDto> {
		return apiClient.get({ url: `${baseUrl}/${id}`, params });
	},
	create(payload: CreateReviewDto): Promise<ReviewResponseDto> {
		return apiClient.post({ url: baseUrl, data: payload });
	},
	update(id: number, payload: UpdateReviewDto): Promise<ReviewResponseDto> {
		return apiClient.request<ReviewResponseDto>({ method: "PATCH", url: `${baseUrl}/${id}`, data: payload });
	},
	remove(id: number): Promise<void> {
		return apiClient.delete<void>({ url: `${baseUrl}/${id}` });
	},
};

export default reviewService;
