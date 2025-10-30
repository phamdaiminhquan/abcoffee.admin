import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import productService from "@/api/services/productService";
import categoryService from "@/api/services/categoryService";
import type { Category, CreateProductDto, Product, UpdateProductDto } from "#/coffee";
import { ProductStatus } from "#/coffee";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { toast } from "sonner";
import { ProductModal } from "./product-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const DEFAULT_PRODUCT_VALUE: Partial<Product> = {
	name: "",
	description: "",
	price: 0,
	categoryId: 0,
	status: ProductStatus.ACTIVE,
	image: "",
};

export default function ProductsPage() {
	const qc = useQueryClient();
	const { data: categories = [] } = useQuery<Category[]>({
		queryKey: ["categories"],
		queryFn: () => categoryService.getAll(),
	});

	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const categoryId = useMemo(() => (categoryFilter ? Number(categoryFilter) : undefined), [categoryFilter]);

	const { data: products = [] } = useQuery<Product[]>({
		queryKey: ["products", categoryId ?? "all"],
		queryFn: () => productService.getAll(categoryId),
	});

	const [productModalProps, setProductModalProps] = useState<{
		formValue: Partial<Product>;
		title: string;
		show: boolean;
	}>({
		formValue: { ...DEFAULT_PRODUCT_VALUE },
		title: "New",
		show: false,
	});

	const createMutation = useMutation({
		mutationFn: (dto: CreateProductDto) => productService.create(dto),
		onSuccess: () => {
			toast.success("Product created successfully");
			qc.invalidateQueries({ queryKey: ["products"] });
			setProductModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error("Failed to create product");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) => productService.update(id, data),
		onSuccess: () => {
			toast.success("Product updated successfully");
			qc.invalidateQueries({ queryKey: ["products"] });
			setProductModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error("Failed to update product");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => productService.softDelete(id),
		onSuccess: () => {
			toast.success("Product deleted successfully");
			qc.invalidateQueries({ queryKey: ["products"] });
		},
		onError: () => {
			toast.error("Failed to delete product");
		},
	});

	const columns: ColumnsType<Product> = [
		{
			title: "Name",
			dataIndex: "name",
			width: 200,
			render: (_, record) => (
				<div className="flex flex-col">
					<span className="text-sm font-medium">{record.name}</span>
					{record.description && <span className="text-xs text-text-secondary">{record.description}</span>}
				</div>
			),
		},
		{
			title: "Category",
			dataIndex: "category",
			align: "center",
			width: 150,
			render: (category: Category) => <Badge variant="info">{category?.name}</Badge>,
		},
		{
			title: "Price",
			dataIndex: "price",
			align: "right",
			width: 150,
			render: (price: number) => <span>{price.toLocaleString("vi-VN")} VND</span>,
		},
		{
			title: "Status",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status: string) => (
				<Badge variant={status === "inactive" ? "error" : "success"}>
					{status === "inactive" ? "Inactive" : "Active"}
				</Badge>
			),
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => onDelete(record.id)}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = () => {
		setProductModalProps({
			show: true,
			title: "Create New Product",
			formValue: { ...DEFAULT_PRODUCT_VALUE },
		});
	};

	const onEdit = (formValue: Product) => {
		setProductModalProps({
			show: true,
			title: "Edit Product",
			formValue,
		});
	};

	const onDelete = (id: number) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			deleteMutation.mutate(id);
		}
	};

	const onModalOk = (values: CreateProductDto) => {
		if (productModalProps.formValue.id) {
			// Update existing product
			updateMutation.mutate({
				id: productModalProps.formValue.id,
				data: values,
			});
		} else {
			// Create new product
			createMutation.mutate(values);
		}
	};

	const onModalCancel = () => {
		setProductModalProps((prev) => ({ ...prev, show: false }));
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span>Product List</span>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-48">
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
					<Button onClick={onCreate}>New</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={products}
				/>
			</CardContent>
			<ProductModal {...productModalProps} onOk={onModalOk} onCancel={onModalCancel} />
		</Card>
	);
}
