import { useEffect, useMemo, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ALLOWED_REVIEW_RATINGS } from "#/review";
import { useForm } from "react-hook-form";

type AuthorSelection = "user" | "customer";

type FormValues = {
	comment: string;
	rating: number | string;
	authorType: AuthorSelection;
	authorId: string;
	imagesText: string;
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

const parseImages = (value: string) =>
	value
		.split(/\n|,/) // split by newline or comma
		.map((item) => item.trim())
		.filter(Boolean);

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
			imagesText: defaultValues?.images.join("\n") ?? "",
		},
	});

	useEffect(() => {
		form.register("authorType");
	}, [form]);

	useEffect(() => {
		form.reset({
			comment: defaultValues?.comment ?? "",
			rating: defaultValues?.rating ?? ALLOWED_REVIEW_RATINGS[ALLOWED_REVIEW_RATINGS.length - 1],
			authorType: initialAuthorType,
			authorId: defaultValues?.userId?.toString() ?? defaultValues?.customerId?.toString() ?? "",
			imagesText: defaultValues?.images.join("\n") ?? "",
		});
		setAuthorType(initialAuthorType);
	}, [defaultValues, form, initialAuthorType]);

	const handleSubmit = form.handleSubmit(async (values) => {
		const ratingNumber = Number(values.rating);
		const authorIdNumber = values.authorId ? Number(values.authorId) : undefined;

		const payload = {
			comment: values.comment.trim(),
			rating: ratingNumber,
			images: parseImages(values.imagesText),
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
							name="imagesText"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Danh sách ảnh (mỗi dòng một URL)</FormLabel>
									<FormControl>
										<Textarea rows={3} placeholder="https://..." {...field} />
									</FormControl>
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
			</DialogContent>
		</Dialog>
	);
}

export default ReviewFormDialog;
