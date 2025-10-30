import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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

	const onSubmit = (values: CreateProductDto) => {
		onOk(values);
	};

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="max-w-2xl">
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

						<FormField
							control={form.control}
							name="image"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Image URL</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} placeholder="Enter image URL (optional)" />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<DialogFooter>
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
