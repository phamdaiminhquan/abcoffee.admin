import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Badge } from "@/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Slider } from "@/ui/slider";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import reviewService from "@/api/services/reviewService";
import type { CreateReviewDto, ReviewResponseDto, UpdateReviewDto } from "#/review";
import { ALLOWED_REVIEW_RATINGS } from "#/review";
import ReviewFormDialog from "./review-form";
import ReviewDetailDialog from "./review-detail";

const DEFAULT_PAGE_SIZE = 20;
const MIN_RATING = Math.min(...ALLOWED_REVIEW_RATINGS);
const MAX_RATING = Math.max(...ALLOWED_REVIEW_RATINGS);

const formatDateTime = (input?: string | null) => (input ? new Date(input).toLocaleString("vi-VN") : "-");
const truncate = (value: string, max = 96) => (value.length > max ? `${value.slice(0, max)}...` : value);

export default function ReviewsPage() {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [search, setSearch] = useState("");
	const [ratingFilter, setRatingFilter] = useState<number | undefined>();
	const [ratingRange, setRatingRange] = useState<[number, number] | null>(null);
	const [includeDeleted, setIncludeDeleted] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [editingReview, setEditingReview] = useState<ReviewResponseDto | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [detailReview, setDetailReview] = useState<ReviewResponseDto | null>(null);

	const queryParams = useMemo(() => {
		const normalizedRange =
			ratingRange && (ratingRange[0] > MIN_RATING || ratingRange[1] < MAX_RATING) ? ratingRange : null;
		return {
			page,
			limit: pageSize,
			search: search || undefined,
			rating: ratingFilter,
			minRating: normalizedRange ? normalizedRange[0] : undefined,
			maxRating: normalizedRange ? normalizedRange[1] : undefined,
			includeDeleted: includeDeleted || undefined,
			sort: "createdAt:desc",
		};
	}, [includeDeleted, page, pageSize, ratingFilter, ratingRange, search]);

	const reviewQuery = useQuery({
		queryKey: ["admin-reviews", queryParams],
		queryFn: () => reviewService.list(queryParams),
		placeholderData: (previous) => previous,
	});

	const createMutation = useMutation({
		mutationFn: (payload: CreateReviewDto) => reviewService.create(payload),
		onSuccess: () => {
			toast.success("Tạo đánh giá thành công");
			queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
		},
		onError: () => toast.error("Không thể tạo đánh giá"),
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateReviewDto }) => reviewService.update(id, data),
		onSuccess: () => {
			toast.success("Cập nhật đánh giá thành công");
			queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
		},
		onError: () => toast.error("Không thể cập nhật đánh giá"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => reviewService.remove(id),
		onSuccess: () => {
			toast.success("Đã xóa đánh giá");
			queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
		},
		onError: () => toast.error("Không thể xóa đánh giá"),
	});

	const tableData = reviewQuery.data?.data ?? [];
	const total = reviewQuery.data?.total ?? 0;

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const columns: ColumnsType<ReviewResponseDto> = [
		{
			title: "Đánh giá",
			dataIndex: "comment",
			render: (_: unknown, record) => (
				<div className="space-y-1">
					<div className="text-sm font-medium">{truncate(record.comment)}</div>
					<div className="text-xs text-muted-foreground">ID #{record.id}</div>
				</div>
			),
		},
		{
			title: "Điểm",
			dataIndex: "rating",
			width: 100,
			render: (rating: number) => <Badge variant="info">{rating.toFixed(1)}</Badge>,
		},
		{
			title: "Tác giả",
			dataIndex: "authorName",
			render: (_: unknown, record) => (
				<div className="text-sm">
					<div>{record.authorName || "Không rõ"}</div>
					<div className="text-xs text-muted-foreground">
						{record.authorType ?? "không xác định"} • UID {record.userId ?? "-"} • CID {record.customerId ?? "-"}
					</div>
				</div>
			),
		},
		{
			title: "Trạng thái",
			dataIndex: "deletedAt",
			align: "center",
			width: 120,
			render: (deletedAt: string | null) => (
				<Badge variant={deletedAt ? "destructive" : "success"}>{deletedAt ? "Đã xóa" : "Hoạt động"}</Badge>
			),
		},
		{
			title: "Ngày tạo",
			dataIndex: "createdAt",
			width: 160,
			render: (value: string) => <span className="text-sm">{formatDateTime(value)}</span>,
		},
		{
			title: "Cập nhật",
			dataIndex: "updatedAt",
			width: 160,
			render: (value: string) => <span className="text-sm">{formatDateTime(value)}</span>,
		},
		{
			title: "Thao tác",
			key: "actions",
			width: 80,
			align: "center",
			render: (_: unknown, record) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<Icon icon="solar:menu-dots-bold" size={18} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							onClick={() => {
								setDetailReview(record);
								setDetailOpen(true);
							}}
						>
							<Icon icon="solar:eye-bold-duotone" size={16} /> Xem chi tiết
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setEditingReview(record);
								setFormOpen(true);
							}}
						>
							<Icon icon="solar:pen-bold-duotone" size={16} /> Chỉnh sửa
						</DropdownMenuItem>
						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								if (window.confirm("Xóa mềm đánh giá này?")) deleteMutation.mutate(record.id);
							}}
						>
							<Icon icon="mingcute:delete-2-fill" size={16} /> Xóa
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const handleReviewSubmit = async (values: {
		comment: string;
		rating: number;
		images: string[];
		userId?: number;
		customerId?: number;
	}) => {
		try {
			if (editingReview) {
				const updatePayload: UpdateReviewDto = {
					comment: values.comment,
					rating: values.rating,
					images: values.images,
					userId: values.userId ?? null,
					customerId: values.customerId ?? null,
				};
				await updateMutation.mutateAsync({ id: editingReview.id, data: updatePayload });
			} else {
				await createMutation.mutateAsync(values as CreateReviewDto);
			}
			setFormOpen(false);
			setEditingReview(null);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<h2 className="text-lg font-semibold">Quản lý đánh giá</h2>
							<p className="text-sm text-muted-foreground">Danh sách review của khách hàng trong hệ thống</p>
						</div>
						<Button
							onClick={() => {
								setEditingReview(null);
								setFormOpen(true);
							}}
						>
							<Icon icon="solar:add-circle-bold-duotone" size={18} /> Thêm đánh giá
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-wrap items-center gap-3">
							<Input
								className="w-64"
								placeholder="Tìm theo nội dung hoặc tác giả"
								value={search}
								onChange={(event) => {
									setSearch(event.target.value);
									setPage(1);
								}}
							/>
							<Select
								value={ratingFilter ? String(ratingFilter) : ""}
								onValueChange={(value) => {
									setRatingFilter(value ? Number(value) : undefined);
									setRatingRange(null);
									setPage(1);
								}}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Lọc theo điểm" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Tất cả điểm</SelectItem>
									{ALLOWED_REVIEW_RATINGS.map((value) => (
										<SelectItem key={value} value={String(value)}>
											{value.toFixed(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<span className="text-sm font-medium text-muted-foreground">Khoảng điểm</span>
							<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
								<div className="flex items-center gap-2">
									<span className="w-12 text-sm text-muted-foreground">
										{(ratingRange?.[0] ?? MIN_RATING).toFixed(1)}
									</span>
									<div className="w-48 sm:w-64">
										<Slider
											min={MIN_RATING}
											max={MAX_RATING}
											step={0.5}
											value={ratingRange ?? [MIN_RATING, MAX_RATING]}
											onValueChange={(value) => {
												if (Array.isArray(value) && value.length === 2) {
													setRatingRange([value[0], value[1]]);
													setRatingFilter(undefined);
													setPage(1);
												}
											}}
										/>
									</div>
									<span className="w-12 text-right text-sm text-muted-foreground">
										{(ratingRange?.[1] ?? MAX_RATING).toFixed(1)}
									</span>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setRatingRange(null);
										setPage(1);
									}}
									disabled={!ratingRange}
								>
									Xóa khoảng
								</Button>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Hiển thị đã xóa</span>
							<Switch
								checked={includeDeleted}
								onCheckedChange={(checked) => {
									setIncludeDeleted(checked);
									setPage(1);
								}}
							/>
						</div>
					</div>

					<Table<ReviewResponseDto>
						rowKey="id"
						loading={reviewQuery.isLoading}
						columns={columns}
						dataSource={tableData}
						pagination={{
							current: page,
							size: "default",
							pageSize,
							total,
							showSizeChanger: true,
							pageSizeOptions: [10, 20, 50, 100],
							onChange: (nextPage, nextSize) => {
								setPage(nextPage);
								setPageSize(nextSize);
							},
						}}
					/>
				</CardContent>
			</Card>

			<ReviewFormDialog
				open={formOpen}
				onOpenChange={(open) => {
					setFormOpen(open);
					if (!open) setEditingReview(null);
				}}
				title={editingReview ? "Chỉnh sửa đánh giá" : "Thêm đánh giá"}
				defaultValues={
					editingReview
						? {
								comment: editingReview.comment,
								rating: editingReview.rating,
								userId: editingReview.userId,
								customerId: editingReview.customerId,
								images: editingReview.images,
							}
						: undefined
				}
				onSubmit={handleReviewSubmit}
				loading={isSubmitting}
			/>

			<ReviewDetailDialog
				open={detailOpen}
				onOpenChange={(open) => {
					setDetailOpen(open);
					if (!open) setDetailReview(null);
				}}
				review={detailReview}
			/>
		</>
	);
}
