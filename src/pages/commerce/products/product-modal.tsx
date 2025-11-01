import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import categoryService from "@/api/services/categoryService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import type { Category, CreateProductDto, Product } from "#/coffee";
import { ProductStatus } from "#/coffee";

import { Upload as AntUpload } from "antd";
import type { UploadProps as AntUploadProps } from "antd";
import { UploadBox } from "@/components/upload";
import uploadService from "@/api/services/uploadService";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { ImagePickerDialog } from "@/components/media/image-picker-dialog";

export type ProductModalProps = {
	formValue: Partial<Product>;
	title: string;
	show: boolean;
	onOk: (values: CreateProductDto) => void;
	onCancel: VoidFunction;
};

export function ProductModal({ title, show, formValue, onOk, onCancel }: ProductModalProps) {
	const form = useForm<CreateProductDto>({
		defaultValues: {
			name: formValue.name || "",
			description: formValue.description || "",
			price: formValue.price || 0,
			categoryId: formValue.categoryId || 0,
			status: formValue.status || ProductStatus.ACTIVE,
			image: formValue.image || "",
		},
	});

	const { data: categories = [] } = useQuery<Category[]>({
		queryKey: ["categories"],
		queryFn: () => categoryService.getAll(),
	});

	useEffect(() => {
		form.reset({
			name: formValue.name || "",
			description: formValue.description || "",
			price: formValue.price || 0,
			categoryId: formValue.categoryId || 0,
			status: formValue.status || ProductStatus.ACTIVE,
			image: formValue.image || "",
		});
	}, [formValue, form]);

	const [imagePreview, setImagePreview] = useState("");

	function makePreviewUrl(v: string) {
		const s = (v || "").trim();
		if (!s) return "";
		if (/^https?:\/\//i.test(s) || s.startsWith("//")) return s;
		if (s.startsWith("/")) return s;
		return `/${s}`;
	}

	// Initialize preview from form value when modal opens or formValue changes
	useEffect(() => {
		const current = form.getValues("image");
		setImagePreview(current ? makePreviewUrl(current) : "");
	}, [formValue, show]);

	const [uploading, setUploading] = useState(false);
	const [showImagePicker, setShowImagePicker] = useState(false);

	const beforeUpload: AntUploadProps["beforeUpload"] = (file) => {
		const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
		if (!allowed.includes(file.type)) {
			toast.error("Định dạng không hợp lệ. Cho phép: JPG, JPEG, PNG, GIF, WEBP", { position: "top-center" });
			return AntUpload.LIST_IGNORE;
		}
		const isLt5M = file.size / 1024 / 1024 <= 5;
		if (!isLt5M) {
			toast.error("Ảnh phải có kích thước tối đa 5MB", { position: "top-center" });
			return AntUpload.LIST_IGNORE;
		}
		return true;
	};

	const customRequest: AntUploadProps["customRequest"] = async (options) => {
		const { file, onError, onProgress, onSuccess } = options;
		try {
			setUploading(true);
			const res = await uploadService.uploadImage(file as File, {
				onUploadProgress: (e) => {
					if (!e.total) return;
					const percent = Math.round((e.loaded * 100) / e.total);
					onProgress?.({ percent }, file as any);
				},
			});
			form.setValue("image", res.filepath, { shouldDirty: true, shouldValidate: true });
			setImagePreview(res.url || makePreviewUrl(res.filepath));
			onSuccess?.(res as any, new XMLHttpRequest());
			toast.success("Tải ảnh thành công");
		} catch (err) {
			onError?.(err as any);
		} finally {
			setUploading(false);
		}
	};

	const onSubmit = (values: CreateProductDto) => {
		onOk(values);
	};

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							rules={{ required: "Vui l\u00f2ng nh\u1eadp t\u00ean s\u1ea3n ph\u1ea9m" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">T\u00ean s\u1ea3n ph\u1ea9m</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} placeholder={"Nh\u1eadp t\u00ean s\u1ea3n ph\u1ea9m"} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">M\u00f4 t\u1ea3</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Textarea {...field} placeholder={"Nh\u1eadp m\u00f4 t\u1ea3 s\u1ea3n ph\u1ea9m"} rows={3} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="price"
							rules={{
								required: "Vui l\u00f2ng nh\u1eadp gi\u00e1",
								min: { value: 0, message: "Gi\u00e1 ph\u1ea3i l\u00e0 s\u1ed1 kh\u00f4ng \u00e2m" },
							}}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Gi\u00e1</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input
												{...field}
												type="number"
												min="0"
												step="1000"
												placeholder={"Nh\u1eadp gi\u00e1"}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="categoryId"
							rules={{ required: "Vui l\u00f2ng ch\u1ecdn danh m\u1ee5c" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Danh m\u1ee5c</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
												<SelectTrigger>
													<SelectValue placeholder={"Chn danh me5c"} />
												</SelectTrigger>
												<SelectContent>
													{categories.map((c) => (
														<SelectItem key={c.id} value={String(c.id)}>
															{c.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Tr\u1ea1ng th\u00e1i</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<RadioGroup onValueChange={field.onChange} value={field.value}>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={ProductStatus.ACTIVE} id="active" />
													<Label htmlFor="active">Ho\u1ea1t \u0111\u1ed9ng</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={ProductStatus.INACTIVE} id="inactive" />
													<Label htmlFor="inactive">Kh\u00f4ng ho\u1ea1t \u0111\u1ed9ng</Label>
												</div>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormItem className="grid grid-cols-4 items-center gap-4">
							<FormLabel className="text-right">T\u1ea3i \u1ea3nh</FormLabel>
							<div className="col-span-3">
								<div className="flex items-start gap-2">
									<div className="w-40 shrink-0">
										<UploadBox
											height={100}
											className="h-40 w-40 overflow-hidden p-0 rounded-md ring-1 ring-border"
											name="file"
											accept="image/*"
											maxCount={1}
											multiple={false}
											beforeUpload={beforeUpload}
											customRequest={customRequest}
											placeholder={
												imagePreview ? (
													<div key={imagePreview || "empty"} className="relative w-full">
														<img
															src={imagePreview}
															alt={"Xem tr\u01b0\u1edbc"}
															className="absolute inset-0 w-full object-cover"
														/>
														<button
															type="button"
															className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow ring-1 ring-border hover:bg-background"
															onClick={(e) => {
																e.stopPropagation();
																form.setValue("image", "");
																setImagePreview("");
															}}
														>
															<Icon icon="mingcute:close-line" size={16} />
														</button>
													</div>
												) : undefined
											}
											disabled={uploading}
										/>
									</div>
									<Button
										type="button"
										variant="secondary"
										className="self-start"
										onClick={() => setShowImagePicker(true)}
									>
										{"Ch\u1ecdn t\u1eeb th\u01b0 vi\u1ec7n"}
									</Button>
								</div>
								<div className="mt-2">
									<p className="mt-1 text-xs text-text-secondary">
										H\u1ed7 tr\u1ee3 .jpg, .jpeg, .png, .gif, .webp t\u1ed1i \u0111a 5MB
									</p>
								</div>
							</div>
						</FormItem>

						<FormField
							control={form.control}
							name="image"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">URL \u1ea3nh</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input
												{...field}
												placeholder={
													"Nh\u1eadp \u0111\u01b0\u1eddng d\u1eabn ho\u1eb7c URL \u1ea3nh (kh\u00f4ng b\u1eaft bu\u1ed9c)"
												}
											/>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<ImagePickerDialog
								open={showImagePicker}
								onOpenChange={setShowImagePicker}
								onSelect={(img) => {
									form.setValue("image", img.filepath, { shouldDirty: true, shouldValidate: true });
									setImagePreview(img.url || makePreviewUrl(img.filepath));
									setShowImagePicker(false);
									toast.success("\u0110\u00e3 ch\u1ecdn \u1ea3nh");
								}}
							/>

							<Button type="button" variant="outline" onClick={onCancel}>
								H\u1ee7y
							</Button>
							<Button type="submit">L\u01b0u</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
