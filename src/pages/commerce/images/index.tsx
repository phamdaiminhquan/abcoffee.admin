import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

import { uploadService } from "@/api/services/uploadService";
import type { UploadedImage, Paginated } from "#/coffee";

export default function ImagesPage() {
	const qc = useQueryClient();

	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(24);
	const [detail, setDetail] = useState<UploadedImage | null>(null);

	const [unusedOnly, setUnusedOnly] = useState(false);

	const { data: resp, isLoading } = useQuery<Paginated<UploadedImage>>({
		queryKey: ["images", { page, limit: pageSize, search, sort: "createdAt:desc", unusedOnly }],
		queryFn: () =>
			unusedOnly
				? uploadService.listUnusedImages({ page, limit: pageSize, search, sort: "createdAt:desc" })
				: uploadService.listImages({ page, limit: pageSize, search, sort: "createdAt:desc" }),
		placeholderData: (prev) => prev,
	});

	const images = resp?.data ?? [];
	const total = resp?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Math.min(page, totalPages);

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await uploadService.deleteImage(id);
			return id;
		},
		onMutate: async (id: number) => {
			await qc.cancelQueries({ queryKey: ["images"] });
			const prev = qc.getQueriesData({ queryKey: ["images"] });
			qc.setQueriesData({ queryKey: ["images"] }, (old: any) => {
				if (!old) return old;
				if (Array.isArray(old)) return old.filter((img: any) => img.id !== id);
				if (old.data && Array.isArray(old.data)) {
					return {
						...old,
						data: old.data.filter((img: any) => img.id !== id),
						total: Math.max(0, (old.total ?? 0) - 1),
					};
				}
				return old;
			});
			return { prev };
		},
		onError: (err: any, _id, ctx) => {
			if (ctx?.prev) {
				for (const [key, data] of ctx.prev as any[]) {
					qc.setQueryData(key as any, data);
				}
			}
			const status = err?.response?.status;
			if (status === 409) {
				const message = err?.response?.data?.message || "Ảnh đang được sử dụng";
				const productIds = err?.response?.data?.details?.productIds;
				toast.error(productIds?.length ? `${message} (sản phẩm: ${productIds.join(", ")})` : message);
			}
		},
		onSuccess: () => {
			toast.success("Đã xóa ảnh");
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["images"] });
		},
	});

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-2">
				<CardTitle className="text-base">Quản lý Hình ảnh</CardTitle>
				<div className="flex items-center gap-2">
					<Input
						placeholder="Tìm theo tên tệp..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className="w-60"
					/>
					<div className="flex items-center gap-2">
						<span className="text-sm">Chỉ ảnh chưa dùng</span>
						<Switch
							checked={unusedOnly}
							onCheckedChange={(v) => {
								setUnusedOnly(!!v);
								setPage(1);
							}}
						/>
					</div>

					<div className="flex items-center gap-1 text-sm">
						<span>Mỗi trang</span>
						<select
							className="h-9 rounded-md border bg-background px-2"
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
								setPage(1);
							}}
						>
							{[12, 24, 48, 96].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{Array.from({ length: 12 }).map((_, idx) => (
						<div key={idx} className="h-36 animate-pulse rounded-md bg-muted" />
					))}
				</div>
			) : (
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{images.map((img) => {
						const src = img.url || (img.filepath ? `${GLOBAL_CONFIG.apiBaseUrl}/${img.filepath}` : "");
						return (
							<Card key={img.id} className="group relative overflow-hidden">
								<CardContent className="p-0">
									<div className="aspect-square w-full bg-muted">
										{src ? (
											<img src={src} alt={img.originalFilename} className="h-full w-full object-cover" />
										) : (
											<div className="flex h-full w-full items-center justify-center text-muted-foreground">
												<Icon icon="solar:image-bold-duotone" />
											</div>
										)}
									</div>
								</CardContent>
								<div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/60 p-2 text-xs text-white group-hover:block">
									<div className="line-clamp-1">{img.originalFilename || img.savedFilename}</div>
									<div className="opacity-90">{(img.filesize / 1024).toFixed(0)} KB</div>
								</div>
								<div className="absolute right-1 top-1">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button size="icon" variant="secondary" className="h-11 w-11">
												<Icon icon="solar:menu-dots-bold" size={18} />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-44">
											<DropdownMenuItem
												onClick={() => {
													setDetail(img);
												}}
											>
												<Icon icon="solar:alt-arrow-right-bold-duotone" /> Xem chi tiết
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												onClick={() => {
													if (window.confirm("Xóa ảnh này? Không thể hoàn tác.")) deleteMutation.mutate(img.id);
												}}
											>
												<Icon icon="mingcute:delete-2-fill" /> Xóa
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</Card>
						);
					})}
					{images.length === 0 && (
						<div className="col-span-full py-8 text-center text-sm text-muted-foreground">Không có ảnh</div>
					)}
				</div>
			)}

			{/* Pagination */}
			<div className="flex items-center justify-between text-sm">
				<div>
					Trang {currentPage} / {totalPages} • {total} ảnh
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="secondary" onClick={() => setPage(1)} disabled={currentPage === 1}>
						Đầu
					</Button>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
					>
						Trước
					</Button>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
					>
						Sau
					</Button>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => setPage(totalPages)}
						disabled={currentPage === totalPages}
					>
						Cuối
					</Button>
				</div>
			</div>

			{/* Details dialog */}
			<Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Chi tiết ảnh</DialogTitle>
					</DialogHeader>
					{detail && (
						<div className="space-y-3">
							<div className="aspect-video overflow-hidden rounded-md bg-muted">
								<img
									src={detail.url || `${GLOBAL_CONFIG.apiBaseUrl}/${detail.filepath}`}
									alt={detail.originalFilename}
									className="h-full w-full object-contain"
								/>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<Label className="text-muted-foreground">Tên tệp gốc</Label>
									<div>{detail.originalFilename}</div>
								</div>
								<div>
									<Label className="text-muted-foreground">Tên tệp lưu</Label>
									<div>{detail.savedFilename}</div>
								</div>
								<div>
									<Label className="text-muted-foreground">Kích thước</Label>
									<div>{(detail.filesize / 1024).toFixed(0)} KB</div>
								</div>
								<div>
									<Label className="text-muted-foreground">Thời điểm tải lên</Label>
									<div>{new Date(detail.createdAt as any).toLocaleString()}</div>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
