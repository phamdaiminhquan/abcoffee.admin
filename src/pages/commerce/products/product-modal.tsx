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
			toast.error("Invalid file type. Allowed: JPG, JPEG, PNG, GIF, WEBP", { position: "top-center" });
			return AntUpload.LIST_IGNORE;
		}
		const isLt5M = file.size / 1024 / 1024 <= 5;
		if (!isLt5M) {
			toast.error("Image must be 5MB or smaller", { position: "top-center" });
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
			toast.success("Image uploaded");
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
							rules={{ required: "Product name is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} placeholder="Enter product name" />
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
									<FormLabel className="text-right">Description</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Textarea {...field} placeholder="Enter product description" rows={3} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="price"
							rules={{ required: "Price is required", min: { value: 0, message: "Price must be positive" } }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Price</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input
												{...field}
												type="number"
												min="0"
												step="1000"
												placeholder="Enter price"
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
							rules={{ required: "Category is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Category</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
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
									<FormLabel className="text-right">Status</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<RadioGroup onValueChange={field.onChange} value={field.value}>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={ProductStatus.ACTIVE} id="active" />
													<Label htmlFor="active">Active</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={ProductStatus.INACTIVE} id="inactive" />
													<Label htmlFor="inactive">Inactive</Label>
												</div>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormItem className="grid grid-cols-4 items-center gap-4">
							<FormLabel className="text-right">Image Upload</FormLabel>
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
														<img src={imagePreview} alt="preview" className="absolute inset-0 w-full object-cover" />
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
										Choose from Library
									</Button>
								</div>
								<div className="mt-2">
									<p className="mt-1 text-xs text-text-secondary">Allowed .jpg, .jpeg, .png, .gif, .webp up to 5MB</p>
								</div>
							</div>
						</FormItem>

						<FormField
							control={form.control}
							name="image"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Image URL</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} placeholder="Enter image path or URL (optional)" />
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
									toast.success("Image selected");
								}}
							/>

							<Button type="button" variant="outline" onClick={onCancel}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
