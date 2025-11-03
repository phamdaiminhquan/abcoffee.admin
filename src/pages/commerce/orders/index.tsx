import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import orderService from "@/api/services/orderService";
import type { CreateOrderDto, Order } from "#/coffee";
import { OrderStatus } from "#/coffee";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { toast } from "sonner";
import { OrderModal } from "./order-modal";

const DEFAULT_ORDER_VALUE: Partial<Order> = {
	customerName: "",
	paymentMethod: undefined,
	status: OrderStatus.PENDING_PAYMENT,
	orderDetails: [],
};

export default function OrdersPage() {
	const qc = useQueryClient();
	const { data: orders = [] } = useQuery<Order[]>({
		queryKey: ["orders"],
		queryFn: () => orderService.getAll(),
	});

	const [orderModalProps, setOrderModalProps] = useState<{
		formValue: Partial<Order>;
		title: string;
		show: boolean;
	}>({
		formValue: { ...DEFAULT_ORDER_VALUE },
		title: "T\u1ea1o m\u1edbi",
		show: false,
	});

	const createMutation = useMutation({
		mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
		onSuccess: () => {
			toast.success("T\u1ea1o \u0111\u01a1n h\u00e0ng th\u00e0nh c\u00f4ng");
			qc.invalidateQueries({ queryKey: ["orders"] });
			setOrderModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error("T\u1ea1o \u0111\u01a1n h\u00e0ng th\u1ea5t b\u1ea1i");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => orderService.remove(id),
		onSuccess: () => {
			toast.success("X\u00f3a \u0111\u01a1n h\u00e0ng th\u00e0nh c\u00f4ng");
			qc.invalidateQueries({ queryKey: ["orders"] });
		},
		onError: () => {
			toast.error("X\u00f3a \u0111\u01a1n h\u00e0ng th\u1ea5t b\u1ea1i");
		},
	});

	const columns: ColumnsType<Order> = [
		{
			title: "M\u00e3 \u0111\u01a1n",
			dataIndex: "id",
			width: 100,
			render: (id: number) => <span className="font-medium">#{id}</span>,
		},
		{
			title: "Kh\u00e1ch h\u00e0ng",
			dataIndex: "customerName",
			width: 200,
			render: (name: string) => <span>{name || "Kh\u00e1ch l\u1ebb"}</span>,
		},
		{
			title: "Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n",
			dataIndex: "paymentMethod",
			align: "center",
			width: 150,
			responsive: ["md"],
			render: (method: string) => (
				<Badge variant="info">{method === "cash" ? "Ti\u1ec1n m\u1eb7t" : "Chuy\u1ec3n kho\u1ea3n"}</Badge>
			),
		},
		{
			title: "Tr\u1ea1ng th\u00e1i",
			dataIndex: "status",
			align: "center",
			width: 150,
			render: (status: string) => {
				const variant = status === "cancelled" ? "error" : status === "paid" ? "success" : "warning";
				const label =
					status === "pending_payment"
						? "Ch\u1edd thanh to\u00e1n"
						: status === "paid"
							? "\u0110\u00e3 thanh to\u00e1n"
							: "\u0110\u00e3 h\u1ee7y";
				return <Badge variant={variant}>{label}</Badge>;
			},
		},
		{
			title: "S\u1ed1 m\u1eb7t h\u00e0ng",
			dataIndex: "orderDetails",
			align: "center",
			width: 120,
			responsive: ["md"],
			render: (details: any[]) => <span>{details?.length || 0}</span>,
		},
		{
			title: "Th\u1eddi gian t\u1ea1o",
			dataIndex: "createdAt",
			width: 180,
			responsive: ["md"],
			render: (date: string) => <span>{new Date(date).toLocaleString("vi-VN")}</span>,
		},
		{
			title: "Thao t\u00e1c",
			key: "operation",
			align: "center",
			width: 80,
			render: (_, record) => (
				<div className="flex w-full justify-center">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-11 w-11">
								<Icon icon="solar:menu-dots-bold" size={20} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-40">
							<DropdownMenuItem variant="destructive" onClick={() => onDelete(record.id)}>
								<Icon icon="mingcute:delete-2-fill" /> X\u00f3a
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			),
		},
	];

	const onCreate = () => {
		setOrderModalProps({
			show: true,
			title: "T\u1ea1o \u0111\u01a1n h\u00e0ng",
			formValue: { ...DEFAULT_ORDER_VALUE },
		});
	};

	const onDelete = (id: number) => {
		if (window.confirm("B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u0111\u01a1n h\u00e0ng n\u00e0y?")) {
			deleteMutation.mutate(id);
		}
	};

	const onModalOk = (values: CreateOrderDto) => {
		// Orders are only created, not edited in this implementation
		createMutation.mutate(values);
	};

	const onModalCancel = () => {
		setOrderModalProps((prev) => ({ ...prev, show: false }));
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Danh s\u00e1ch \u0111\u01a1n h\u00e0ng</div>
					<Button onClick={onCreate}>T\u1ea1o m\u1edbi</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					expandable={{
						expandedRowRender: (record: Order) => (
							<div className="space-y-1">
								{record.orderDetails?.map((d) => {
									const src = d.product?.image
										? d.product.image.startsWith("http")
											? d.product.image
											: `${GLOBAL_CONFIG.apiBaseUrl}/${d.product.image}`
										: "";
									return (
										<div key={d.productId} className="flex items-center gap-2 py-1">
											<div className="h-10 w-10 overflow-hidden rounded-md bg-muted shrink-0">
												{src ? (
													<img
														src={src}
														alt={d.product?.name ?? `#${d.productId}`}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-muted-foreground">
														<Icon icon="solar:image-bold-duotone" size={16} />
													</div>
												)}
											</div>
											<div className="flex-1">
												<div className="text-sm font-medium">{d.product?.name ?? `#${d.productId}`}</div>
												<div className="text-xs text-muted-foreground">
													x{d.quantity} @ {d.unitPrice.toLocaleString()}
												</div>
											</div>
											<div className="text-sm font-semibold">{(d.quantity * d.unitPrice).toLocaleString()}</div>
										</div>
									);
								})}
								{!record.orderDetails?.length && <div className="py-2 text-sm text-muted-foreground">No items</div>}
							</div>
						),
					}}
					columns={columns}
					dataSource={orders}
				/>
			</CardContent>
			<OrderModal {...orderModalProps} onOk={onModalOk} onCancel={onModalCancel} />
		</Card>
	);
}
