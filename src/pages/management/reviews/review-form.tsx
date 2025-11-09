import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Icon } from "@/components/icon";
import { ImagePickerDialog } from "@/components/media/image-picker-dialog";
import { GLOBAL_CONFIG } from "@/global-config";
import { ALLOWED_REVIEW_RATINGS } from "#/review";
import type { UploadedImage } from "#/coffee";
import { useForm } from "react-hook-form";

type AuthorSelection = "user" | "customer";

type FormValues = {
	comment: string;
	rating: number | string;
	authorType: AuthorSelection;
	authorId: string;
	images: string[];
};

type ReviewFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	loading?: boolean;
	onSubmit: (values: {
		comment: string;
		rating: number;
		userId?: number;
		customerId?: number;
		images: string[];
	}) => Promise<void> | void;
	defaultValues?: {
		comment: string;
		rating: number;
		userId: number | null;
		customerId: number | null;
		images: string[];
	};
};

export function ReviewFormDialog({
	open,
	onOpenChange,
	title,
	loading,
	onSubmit,
	defaultValues,
}: ReviewFormDialogProps) {
	const initialAuthorType = useMemo<AuthorSelection>(() => {
		if (defaultValues?.userId) return "user";
		if (defaultValues?.customerId) return "customer";
		return "user";
	}, [defaultValues?.customerId, defaultValues?.userId]);

	const [authorType, setAuthorType] = useState<AuthorSelection>(initialAuthorType);

	const form = useForm<FormValues>({
		defaultValues: {
			comment: defaultValues?.comment ?? "",
			rating: defaultValues?.rating ?? ALLOWED_REVIEW_RATINGS[ALLOWED_REVIEW_RATINGS.length - 1],
			authorType: initialAuthorType,
			authorId: defaultValues?.userId?.toString() ?? defaultValues?.customerId?.toString() ?? "",
			images: defaultValues?.images ?? [],
		},
	});

	const [imagePickerOpen, setImagePickerOpen] = useState(false);
	const [manualImage, setManualImage] = useState("");
	const images = form.watch("images") ?? [];

	useEffect(() => {
		form.register("authorType");
		form.register("images");
	}, [form]);

	useEffect(() => {
		form.reset({
			comment: defaultValues?.comment ?? "",
			rating: defaultValues?.rating ?? ALLOWED_REVIEW_RATINGS[ALLOWED_REVIEW_RATINGS.length - 1],
			authorType: initialAuthorType,
			authorId: defaultValues?.userId?.toString() ?? defaultValues?.customerId?.toString() ?? "",
			images: defaultValues?.images ?? [],
		});
		setAuthorType(initialAuthorType);
		setManualImage("");
	}, [defaultValues, form, initialAuthorType]);

	const resolveImageUrl = useCallback((image: UploadedImage) => {
		if (image.url) return image.url;
		if (image.filepath) return `${GLOBAL_CONFIG.apiBaseUrl}/${image.filepath}`;
		return "";
	}, []);

	const appendImage = useCallback(
		(url: string) => {
			const trimmed = url.trim();
			if (!trimmed) return;
			const next = Array.from(new Set([...(images as string[]), trimmed]));
			form.setValue("images", next, { shouldDirty: true, shouldTouch: true });
		},
		[form, images],
	);

	const removeImageAt = useCallback(
		(index: number) => {
			const next = (images as string[]).filter((_, idx) => idx !== index);
			form.setValue("images", next, { shouldDirty: true, shouldTouch: true });
		},
		[form, images],
	);

	const handleSubmit = form.handleSubmit(async (values) => {
		const ratingNumber = Number(values.rating);
		const authorIdNumber = values.authorId ? Number(values.authorId) : undefined;
		const uniqueImages = Array.from(new Set((values.images ?? []).map((item) => item.trim()).filter(Boolean)));

		const payload = {
			comment: values.comment.trim(),
			rating: ratingNumber,
			images: uniqueImages,
			userId: authorType === "user" ? authorIdNumber : undefined,
			customerId: authorType === "customer" ? authorIdNumber : undefined,
		};

		await onSubmit(payload);
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<FormField
							control={form.control}
							name="comment"
							rules={{ required: "Nội dung bắt buộc", minLength: { value: 10, message: "Ít nhất 10 ký tự" } }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nội dung đánh giá</FormLabel>
									<FormControl>
										<Textarea rows={4} {...field} placeholder="Nhập đánh giá từ khách hàng" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="rating"
								rules={{ required: "Chọn điểm đánh giá" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Điểm đánh giá</FormLabel>
										<FormControl>
											<Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
												<SelectTrigger>
													<SelectValue placeholder="Chọn điểm" />
												</SelectTrigger>
												<SelectContent>
													{ALLOWED_REVIEW_RATINGS.map((value) => (
														<SelectItem key={value} value={String(value)}>
															{value.toFixed(1)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormItem>
								<FormLabel>Loại tác giả</FormLabel>
								<FormControl>
									<RadioGroup
										value={authorType}
										onValueChange={(value: AuthorSelection) => {
											setAuthorType(value);
											form.setValue("authorType", value);
										}}
										className="flex flex-row gap-4"
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="user" id="review-author-user" />
											<label htmlFor="review-author-user" className="text-sm">
												User đã đăng ký
											</label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="customer" id="review-author-customer" />
											<label htmlFor="review-author-customer" className="text-sm">
												Khách vãng lai
											</label>
										</div>
									</RadioGroup>
								</FormControl>
							</FormItem>
						</div>

						<FormField
							control={form.control}
							name="authorId"
							rules={{
								required: "Bắt buộc nhập ID",
								validate: (value) => (value && Number.isFinite(Number(value)) ? true : "ID phải là số"),
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{authorType === "user" ? "User ID" : "Customer ID"}</FormLabel>
									<FormControl>
										<Input
											placeholder={authorType === "user" ? "Nhập ID người dùng" : "Nhập ID khách vãng lai"}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="images"
							render={() => (
								<FormItem>
									<FormLabel>Hình ảnh đính kèm</FormLabel>
									<div className="space-y-3">
										<div className="flex flex-col gap-2 sm:flex-row">
											<div className="flex flex-1 items-center gap-2">
												<Input
													placeholder="Dán URL ảnh (https://...)"
													value={manualImage}
													onChange={(event) => setManualImage(event.target.value)}
												/>
												<Button
													type="button"
													onClick={() => {
														appendImage(manualImage);
														setManualImage("");
													}}
												>
													Thêm URL
												</Button>
											</div>
											<Button type="button" variant="outline" onClick={() => setImagePickerOpen(true)}>
												<Icon icon="solar:gallery-bold-duotone" size={18} /> Chọn từ thư viện
											</Button>
										</div>
										{images.length === 0 ? (
											<p className="text-sm text-muted-foreground">Chưa có ảnh nào được chọn</p>
										) : (
											<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
												{images.map((url, index) => (
													<div key={`${url}-${index}`} className="flex gap-3 rounded-md border p-2">
														<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
															{/* hiển thị ảnh nếu có thể tải */}
															<img
																src={url}
																alt={url}
																className="h-full w-full object-cover"
																loading="lazy"
																decoding="async"
																onError={(event) => {
																	event.currentTarget.style.display = "none";
																}}
															/>
														</div>
														<div className="flex flex-1 flex-col justify-between text-sm">
															<a
																href={url}
																target="_blank"
																rel="noreferrer"
																className="truncate text-primary underline"
															>
																{url}
															</a>
															<Button type="button" variant="ghost" size="sm" onClick={() => removeImageAt(index)}>
																<Icon icon="solar:trash-bin-trash-bold-duotone" size={16} /> Xóa
															</Button>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Hủy
							</Button>
							<Button type="submit" disabled={loading}>
								{loading ? "Đang lưu..." : "Lưu"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
				<ImagePickerDialog
					open={imagePickerOpen}
					onOpenChange={(openState) => {
						setImagePickerOpen(openState);
					}}
					onSelect={(image) => {
						const url = resolveImageUrl(image);
						appendImage(url);
						setImagePickerOpen(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}

export default ReviewFormDialog;
