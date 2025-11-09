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
		title: "Tạo mới",
		show: false,
	});

	const createMutation = useMutation({
		mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
		onSuccess: () => {
			toast.success("Tạo đơn hàng thành công");
			qc.invalidateQueries({ queryKey: ["orders"] });
			setOrderModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error("Tạo đơn hàng thất bại");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => orderService.remove(id),
		onSuccess: () => {
			toast.success("Xóa đơn hàng thành công");
			qc.invalidateQueries({ queryKey: ["orders"] });
		},
		onError: () => {
			toast.error("Xóa đơn hàng thất bại");
		},
	});

	const columns: ColumnsType<Order> = [
		{
			title: "Mã đơn",
			dataIndex: "id",
			width: 100,
			render: (id: number) => <span className="font-medium">#{id}</span>,
		},
		{
			title: "Khách hàng",
			dataIndex: "customerName",
			width: 200,
			render: (name: string) => <span>{name || "Khách lẻ"}</span>,
		},
		{
			title: "Phương thức thanh toán",
			dataIndex: "paymentMethod",
			align: "center",
			width: 150,
			responsive: ["md"],
			render: (method: string) => <Badge variant="info">{method === "cash" ? "Tiền mặt" : "Chuyển khoản"}</Badge>,
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			align: "center",
			width: 150,
			render: (status: string) => {
				const variant = status === "cancelled" ? "error" : status === "paid" ? "success" : "warning";
				const label = status === "pending_payment" ? "Chờ thanh toán" : status === "paid" ? "Đã thanh toán" : "Đã hủy";
				return <Badge variant={variant}>{label}</Badge>;
			},
		},
		{
			title: "Số mặt hàng",
			dataIndex: "orderDetails",
			align: "center",
			width: 120,
			responsive: ["md"],
			render: (details: any[]) => <span>{details?.length || 0}</span>,
		},
		{
			title: "Thời gian tạo",
			dataIndex: "createdAt",
			width: 180,
			responsive: ["md"],
			render: (date: string) => <span>{new Date(date).toLocaleString("vi-VN")}</span>,
		},
		{
			title: "Thao tác",
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
								<Icon icon="mingcute:delete-2-fill" /> Xóa
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
			title: "Tạo đơn hàng",
			formValue: { ...DEFAULT_ORDER_VALUE },
		});
	};

	const onDelete = (id: number) => {
		if (window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
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
					<div>Danh sách đơn hàng</div>
					<Button onClick={onCreate}>Tạo mới</Button>
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
