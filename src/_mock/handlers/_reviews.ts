import { faker } from "@faker-js/faker";
import { ResultStatus } from "@/types/enum";
import type {
	CreateReviewDto,
	PaginatedReviewResponseDto,
	ReviewQueryParams,
	ReviewResponseDto,
	UpdateReviewDto,
} from "#/review";
import { ALLOWED_REVIEW_RATINGS } from "#/review";
import { http, HttpResponse } from "msw";
import { DB_REVIEWS } from "../assets_backup";

const httpResponse = <TData>(body: { data: TData; message: string; status: ResultStatus }, status: number) =>
	HttpResponse.json(body, {
		status,
	});

const ok = <TData>(data: TData, status = 200) =>
	httpResponse({ data, message: "", status: ResultStatus.SUCCESS }, status);

const withError = (message: string, status = 400) =>
	httpResponse({ data: null, message, status: ResultStatus.ERROR }, status);

const findReviewById = (id: number) => DB_REVIEWS.find((item) => item.id === id);

const parseQueryParams = (
	requestUrl: string,
): Required<Pick<ReviewQueryParams, "page" | "limit">> & Omit<ReviewQueryParams, "page" | "limit"> => {
	const url = new URL(requestUrl);
	const page = Number(url.searchParams.get("page") ?? 1) || 1;
	const limit = Number(url.searchParams.get("limit") ?? 10) || 10;
	const search = url.searchParams.get("search") ?? undefined;
	const ratingParam = url.searchParams.get("rating");
	const rating = ratingParam ? Number(ratingParam) : undefined;
	const minRatingParam = url.searchParams.get("minRating");
	const minRating = minRatingParam ? Number(minRatingParam) : undefined;
	const maxRatingParam = url.searchParams.get("maxRating");
	const maxRating = maxRatingParam ? Number(maxRatingParam) : undefined;
	const userIdParam = url.searchParams.get("userId");
	const userId = userIdParam ? Number(userIdParam) : undefined;
	const customerIdParam = url.searchParams.get("customerId");
	const customerId = customerIdParam ? Number(customerIdParam) : undefined;
	const sort = url.searchParams.get("sort") ?? undefined;
	const includeDeleted = url.searchParams.get("includeDeleted") === "true";

	return {
		page,
		limit,
		search,
		rating,
		minRating,
		maxRating,
		userId,
		customerId,
		sort,
		includeDeleted,
	};
};

const applySort = (list: ReviewResponseDto[], sort?: string) => {
	const [rawField, rawDirection] = (sort ?? "createdAt:desc").split(":");
	const allowedFields = new Set(["createdAt", "updatedAt", "rating"]);
	const field = allowedFields.has(rawField) ? rawField : "createdAt";
	const direction = rawDirection === "asc" ? 1 : -1;

	return [...list].sort((a, b) => {
		if (field === "rating") {
			return (a.rating - b.rating) * direction;
		}

		const timeA = new Date(a[field as "createdAt" | "updatedAt"]).getTime();
		const timeB = new Date(b[field as "createdAt" | "updatedAt"]).getTime();
		return (timeA - timeB) * direction;
	});
};

const listReviews = http.get("/api/admin/reviews", ({ request }) => {
	const { page, limit, search, rating, minRating, maxRating, userId, customerId, sort, includeDeleted } =
		parseQueryParams(request.url);

	let collection = [...DB_REVIEWS];

	if (!includeDeleted) {
		collection = collection.filter((item) => !item.deletedAt);
	}

	if (typeof rating === "number" && Number.isFinite(rating)) {
		collection = collection.filter((item) => item.rating === rating);
	}

	if (typeof minRating === "number" && Number.isFinite(minRating)) {
		collection = collection.filter((item) => item.rating >= minRating);
	}

	if (typeof maxRating === "number" && Number.isFinite(maxRating)) {
		collection = collection.filter((item) => item.rating <= maxRating);
	}

	if (typeof userId === "number" && Number.isFinite(userId)) {
		collection = collection.filter((item) => item.userId === userId);
	}

	if (typeof customerId === "number" && Number.isFinite(customerId)) {
		collection = collection.filter((item) => item.customerId === customerId);
	}

	if (search) {
		const keyword = search.trim().toLowerCase();
		collection = collection.filter(
			(item) => item.comment.toLowerCase().includes(keyword) || (item.authorName ?? "").toLowerCase().includes(keyword),
		);
	}

	const sorted = applySort(collection, sort);
	const total = sorted.length;
	const start = (page - 1) * limit;
	const end = start + limit;
	const paginated = sorted.slice(start, end);

	const payload: PaginatedReviewResponseDto = {
		data: paginated,
		page,
		limit,
		total,
	};

	return ok(payload);
});

const getReview = http.get("/api/admin/reviews/:id", ({ params }) => {
	const reviewId = Number(params.id);
	const review = findReviewById(reviewId);

	if (!review) {
		return withError("Review not found", 404);
	}

	return ok(review);
});

const createReview = http.post("/api/admin/reviews", async ({ request }) => {
	const payload = (await request.json()) as CreateReviewDto;

	if (!payload.comment || payload.comment.trim().length < 10) {
		return withError("Comment must be at least 10 characters");
	}

	if (!ALLOWED_REVIEW_RATINGS.includes(payload.rating)) {
		return withError("Rating value is invalid");
	}

	const hasUser = typeof payload.userId === "number";
	const hasCustomer = typeof payload.customerId === "number";

	if (hasUser === hasCustomer) {
		return withError("Exactly one of userId or customerId must be provided");
	}

	const now = new Date().toISOString();
	const nextId = DB_REVIEWS.length > 0 ? Math.max(...DB_REVIEWS.map((item) => item.id)) + 1 : 1;
	const review: ReviewResponseDto = {
		id: nextId,
		comment: payload.comment.trim(),
		rating: payload.rating,
		images: payload.images ?? [],
		userId: hasUser ? (payload.userId ?? null) : null,
		customerId: hasCustomer ? (payload.customerId ?? null) : null,
		authorType: hasUser ? "user" : "customer",
		authorName: faker.person.fullName(),
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	};

	DB_REVIEWS.push(review);

	return ok(review, 201);
});

const updateReview = http.patch("/api/admin/reviews/:id", async ({ params, request }) => {
	const reviewId = Number(params.id);
	const review = findReviewById(reviewId);

	if (!review) {
		return withError("Review not found", 404);
	}

	const payload = (await request.json()) as UpdateReviewDto;

	if (payload.comment !== undefined && payload.comment !== null) {
		const trimmed = payload.comment.trim();
		if (trimmed.length > 0 && trimmed.length < 10) {
			return withError("Comment must be at least 10 characters");
		}
		review.comment = trimmed.length > 0 ? trimmed : review.comment;
	}

	if (payload.rating !== undefined) {
		if (!ALLOWED_REVIEW_RATINGS.includes(payload.rating)) {
			return withError("Rating value is invalid");
		}
		review.rating = payload.rating;
	}

	if (payload.images !== undefined) {
		review.images = Array.isArray(payload.images) ? payload.images : [];
	}

	const finalUserId = payload.userId !== undefined ? payload.userId : review.userId;
	const finalCustomerId = payload.customerId !== undefined ? payload.customerId : review.customerId;

	if (payload.userId !== undefined || payload.customerId !== undefined) {
		const hasUser = typeof finalUserId === "number";
		const hasCustomer = typeof finalCustomerId === "number";

		if (hasUser === hasCustomer) {
			return withError("Exactly one of userId or customerId must be provided");
		}

		review.userId = finalUserId ?? null;
		review.customerId = finalCustomerId ?? null;

		const nextAuthorType = hasUser ? "user" : "customer";
		if (review.authorType !== nextAuthorType) {
			review.authorName = faker.person.fullName();
		}
		review.authorType = nextAuthorType;
	}

	review.updatedAt = new Date().toISOString();

	return ok(review);
});

const deleteReview = http.delete("/api/admin/reviews/:id", ({ params }) => {
	const reviewId = Number(params.id);
	const review = findReviewById(reviewId);

	if (!review) {
		return withError("Review not found", 404);
	}

	const timestamp = new Date().toISOString();
	review.deletedAt = timestamp;
	review.updatedAt = timestamp;

	return ok(null);
});

export const reviewHandlers = [listReviews, getReview, createReview, updateReview, deleteReview];
