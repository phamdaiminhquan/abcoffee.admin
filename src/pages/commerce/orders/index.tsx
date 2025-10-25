import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import orderService from "@/api/services/orderService";
import productService from "@/api/services/productService";
import type { CreateOrderDto, Order, PaymentMethod, Product } from "#/coffee";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { toast } from "sonner";

export default function OrdersPage() {
	const qc = useQueryClient();
	const { data: products = [] } = useQuery<Product[]>({
		queryKey: ["products", "all"],
		queryFn: () => productService.getAll(),
	});
	const { data: orders = [], isLoading } = useQuery<Order[]>({
		queryKey: ["orders"],
		queryFn: () => orderService.getAll(),
	});

	const [customerName, setCustomerName] = useState("");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
	const [productId, setProductId] = useState<string>("");
	const [quantity, setQuantity] = useState<string>("1");

	const createMutation = useMutation({
		mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
		onSuccess: () => {
			toast.success("Order created");
			qc.invalidateQueries({ queryKey: ["orders"] });
			setCustomerName("");
			setPaymentMethod("");
			setProductId("");
			setQuantity("1");
		},
	});

	const selectedProduct = useMemo(() => products.find((p) => String(p.id) === productId), [products, productId]);

	return (
		<Card>
			<CardContent>
				<h2 className="text-lg font-semibold mb-4">Orders</h2>

				{isLoading ? (
					<div>Loading...</div>
				) : (
					<ul className="space-y-2 mb-6">
						{orders.map((o) => (
							<li key={o.id} className="p-2 rounded border">
								<div className="font-medium">
									#{o.id} • {o.customerName} • {o.status}
								</div>
								<div className="text-sm text-muted-foreground">
									{new Date(o.createdAt).toLocaleString()} • {o.paymentMethod}
								</div>
							</li>
						))}
					</ul>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (!productId || !paymentMethod) return toast.error("Select product and payment method");
						const unitPrice = selectedProduct?.price ?? 0;
						const dto: CreateOrderDto = {
							customerName: customerName || undefined,
							paymentMethod: paymentMethod as PaymentMethod,
							orderDetails: [{ productId: Number(productId), quantity: Number(quantity), unitPrice }],
						};
						createMutation.mutate(dto);
					}}
					className="grid gap-3 max-w-xl"
				>
					<h3 className="text-base font-semibold">Create order</h3>
					<div>
						<Label htmlFor="customer">Customer</Label>
						<Input
							id="customer"
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Optional"
						/>
					</div>
					<div>
						<Label>Payment method</Label>
						<Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
							<SelectTrigger className="w-60">
								<SelectValue placeholder="Select method" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="cash">cash</SelectItem>
								<SelectItem value="bank_transfer">bank_transfer</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label>Product</Label>
						<Select value={productId} onValueChange={setProductId}>
							<SelectTrigger className="w-80">
								<SelectValue placeholder="Select product" />
							</SelectTrigger>
							<SelectContent>
								{products.map((p) => (
									<SelectItem key={p.id} value={String(p.id)}>
										{p.name} • {p.price.toLocaleString("vi-VN")} VND
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="qty">Quantity</Label>
						<Input id="qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="1" />
					</div>
					<Button type="submit" disabled={createMutation.isPending}>
						{createMutation.isPending ? "Creating..." : "Create Order"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
