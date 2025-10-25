import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import productService from "@/api/services/productService";
import categoryService from "@/api/services/categoryService";
import type { Category, CreateProductDto, Product, ProductStatus } from "#/coffee";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { toast } from "sonner";

export default function ProductsPage() {
	const qc = useQueryClient();
	const { data: categories = [] } = useQuery<Category[]>({
		queryKey: ["categories"],
		queryFn: () => categoryService.getAll(),
	});

	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const categoryId = useMemo(() => (categoryFilter ? Number(categoryFilter) : undefined), [categoryFilter]);

	const { data: products = [], isLoading } = useQuery<Product[]>({
		queryKey: ["products", categoryId ?? "all"],
		queryFn: () => productService.getAll(categoryId),
	});

	const [name, setName] = useState("");
	const [price, setPrice] = useState<string>("");
	const [productCategoryId, setProductCategoryId] = useState<string>("");
	const [status, setStatus] = useState<ProductStatus | "">("");

	const createMutation = useMutation({
		mutationFn: (dto: CreateProductDto) => productService.create(dto),
		onSuccess: () => {
			toast.success("Product created");
			qc.invalidateQueries({ queryKey: ["products"] });
			setName("");
			setPrice("");
			setProductCategoryId("");
			setStatus("");
		},
	});

	return (
		<Card>
			<CardContent>
				<h2 className="text-lg font-semibold mb-4">Products</h2>

				<div className="flex items-center gap-3 mb-4">
					<Label>Filter by category</Label>
					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="w-60">
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{categories.map((c) => (
								<SelectItem key={c.id} value={String(c.id)}>
									{c.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{isLoading ? (
					<div>Loading...</div>
				) : (
					<ul className="space-y-2 mb-6">
						{products.map((p) => (
							<li key={p.id} className="p-2 rounded border">
								<div className="font-medium">{p.name}</div>
								<div className="text-sm text-muted-foreground">
									{p.category?.name} • {p.status} • {p.price.toLocaleString("vi-VN")} VND
								</div>
							</li>
						))}
					</ul>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (!productCategoryId) return toast.error("Select category");
						const dto: CreateProductDto = {
							name,
							price: Number(price),
							categoryId: Number(productCategoryId),
							status: status || undefined,
						};
						createMutation.mutate(dto);
					}}
					className="grid gap-3 max-w-xl"
				>
					<h3 className="text-base font-semibold">Create product</h3>
					<div>
						<Label htmlFor="name">Name</Label>
						<Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
					</div>
					<div>
						<Label htmlFor="price">Price</Label>
						<Input
							id="price"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							type="number"
							min="0"
							step="1000"
							required
						/>
					</div>
					<div>
						<Label>Category</Label>
						<Select value={productCategoryId} onValueChange={setProductCategoryId}>
							<SelectTrigger className="w-60">
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
					</div>
					<div>
						<Label>Status</Label>
						<Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
							<SelectTrigger className="w-60">
								<SelectValue placeholder="Default (active)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">active</SelectItem>
								<SelectItem value="inactive">inactive</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button type="submit" disabled={createMutation.isPending}>
						{createMutation.isPending ? "Creating..." : "Create Product"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
