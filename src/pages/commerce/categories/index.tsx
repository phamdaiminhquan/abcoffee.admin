import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import categoryService from "@/api/services/categoryService";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "#/coffee";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { toast } from "sonner";
import { CategoryModal } from "./category-modal";

const DEFAULT_CATEGORY_VALUE: Partial<Category> = {
	name: "",
	description: "",
};

export default function CategoriesPage() {
	const qc = useQueryClient();
	const { data: categories = [] } = useQuery<Category[]>({
		queryKey: ["categories"],
		queryFn: () => categoryService.getAll(),
	});

	const [categoryModalProps, setCategoryModalProps] = useState<{
		formValue: Partial<Category>;
		title: string;
		show: boolean;
	}>({
		formValue: { ...DEFAULT_CATEGORY_VALUE },
		title: "New",
		show: false,
	});

	const createMutation = useMutation({
		mutationFn: (dto: CreateCategoryDto) => categoryService.create(dto),
		onSuccess: () => {
			toast.success("Category created successfully");
			qc.invalidateQueries({ queryKey: ["categories"] });
			setCategoryModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error("Failed to create category");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) => categoryService.update(id, data),
		onSuccess: () => {
			toast.success("Category updated successfully");
			qc.invalidateQueries({ queryKey: ["categories"] });
			setCategoryModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error("Failed to update category");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => categoryService.remove(id),
		onSuccess: () => {
			toast.success("Category deleted successfully");
			qc.invalidateQueries({ queryKey: ["categories"] });
		},
		onError: () => {
			toast.error("Failed to delete category");
		},
	});

	const columns: ColumnsType<Category> = [
		{
			title: "Name",
			dataIndex: "name",
			width: 200,
			render: (name: string) => <span className="font-medium">{name}</span>,
		},
		{
			title: "Description",
			dataIndex: "description",
			render: (description: string | null) => <span className="text-text-secondary">{description || "-"}</span>,
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
		setCategoryModalProps({
			show: true,
			title: "Create New Category",
			formValue: { ...DEFAULT_CATEGORY_VALUE },
		});
	};

	const onEdit = (formValue: Category) => {
		setCategoryModalProps({
			show: true,
			title: "Edit Category",
			formValue,
		});
	};

	const onDelete = (id: number) => {
		if (window.confirm("Are you sure you want to delete this category?")) {
			deleteMutation.mutate(id);
		}
	};

	const onModalOk = (values: CreateCategoryDto) => {
		if (categoryModalProps.formValue.id) {
			// Update existing category
			updateMutation.mutate({
				id: categoryModalProps.formValue.id,
				data: values,
			});
		} else {
			// Create new category
			createMutation.mutate(values);
		}
	};

	const onModalCancel = () => {
		setCategoryModalProps((prev) => ({ ...prev, show: false }));
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Category List</div>
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
					dataSource={categories}
				/>
			</CardContent>
			<CategoryModal {...categoryModalProps} onOk={onModalOk} onCancel={onModalCancel} />
		</Card>
	);
}
