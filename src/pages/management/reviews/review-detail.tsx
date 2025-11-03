import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import type { ReviewResponseDto } from "#/review";

interface ReviewDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	review: ReviewResponseDto | null;
}

const formatDateTime = (input?: string | null) => (input ? new Date(input).toLocaleString("vi-VN") : "-");

export function ReviewDetailDialog({ open, onOpenChange, review }: ReviewDetailDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Chi tiết đánh giá</DialogTitle>
				</DialogHeader>
				{review ? (
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-2">
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">ID #{review.id}</p>
								<div className="flex items-center gap-2">
									<span className="text-lg font-semibold">{review.rating.toFixed(1)} / 5.0</span>
									<Badge variant={review.deletedAt ? "destructive" : "success"}>
										{review.deletedAt ? "Đã xóa" : "Hoạt động"}
									</Badge>
								</div>
							</div>
						</div>

						<div className="space-y-1">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Nội dung</h4>
							<p className="whitespace-pre-wrap text-sm leading-6">{review.comment}</p>
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div className="space-y-1">
								<h4 className="text-xs font-semibold uppercase text-muted-foreground">Tác giả</h4>
								<p className="text-sm">
									{review.authorName || "Không rõ"} ({review.authorType ?? "không xác định"})
								</p>
								<p className="text-xs text-muted-foreground">
									User ID: {review.userId ?? "-"} • Customer ID: {review.customerId ?? "-"}
								</p>
							</div>
							<div className="space-y-1 text-sm">
								<p>
									<span className="text-muted-foreground">Tạo lúc:</span> {formatDateTime(review.createdAt)}
								</p>
								<p>
									<span className="text-muted-foreground">Cập nhật:</span> {formatDateTime(review.updatedAt)}
								</p>
								<p>
									<span className="text-muted-foreground">Xóa mềm:</span>{" "}
									{review.deletedAt ? formatDateTime(review.deletedAt) : "-"}
								</p>
							</div>
						</div>

						<div className="space-y-1">
							<h4 className="text-xs font-semibold uppercase text-muted-foreground">Danh sách ảnh</h4>
							{review.images.length === 0 ? (
								<p className="text-sm text-muted-foreground">Không có ảnh</p>
							) : (
								<ul className="space-y-1 text-sm">
									{review.images.map((url, index) => (
										<li key={`${url}-${index}`}>
											<a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
												{url}
											</a>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">Không có dữ liệu</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default ReviewDetailDialog;
