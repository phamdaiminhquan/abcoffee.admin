import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import categoryService from "@/api/services/categoryService";
import productService from "@/api/services/productService";
import orderService from "@/api/services/orderService";

import type { Category, CreateOrderDto, Order, Product, UpdateOrderDto } from "#/coffee";
import { OrderStatus, PaymentMethod } from "#/coffee";

import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/ui/drawer";
import { GLOBAL_CONFIG } from "@/global-config";
import { Icon } from "@/components/icon";

// Responsive helper: bottom sheet on mobile, dialog on desktop
function useIsDesktop() {
	const [isDesktop, setIsDesktop] = useState<boolean>(() =>
		typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true,
	);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const m = window.matchMedia("(min-width: 768px)");
		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		m.addEventListener("change", handler);
		return () => m.removeEventListener("change", handler);
	}, []);
	return isDesktop;
}

export default function POSPage() {
	const qc = useQueryClient();

	// UI state
	const [showPicker, setShowPicker] = useState(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
	const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [payMethod, setPayMethod] = useState<PaymentMethod | undefined>(undefined);
	const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);
	// POS responsive mode
	const isDesktop = useIsDesktop();

	// Pending order details state
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [orderItemsDraft, setOrderItemsDraft] = useState<
		{ productId: number; product?: Product; quantity: number; unitPrice: number }[]
	>([]);
	const [orderCustomerName, setOrderCustomerName] = useState<string>("");

	// Data
	const { data: categories = [] } = useQuery<Category[]>({
		queryKey: ["categories", "all"],
		queryFn: () => categoryService.getAll(),
	});

	const { data: products = [] } = useQuery<Product[]>({
		queryKey: ["products", selectedCategoryId ?? "all"],

		queryFn: () => (selectedCategoryId ? productService.getAll(selectedCategoryId) : productService.getAll()),
	});

	const { data: orders = [] } = useQuery<Order[]>({
		queryKey: ["orders"],
		queryFn: () => orderService.getAll(),
	});

	const pendingOrders = useMemo(() => orders.filter((o) => o.status === OrderStatus.PENDING_PAYMENT), [orders]);

	// Mutations
	const createMutation = useMutation({
		mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] });
			setCart([]);
			setShowPicker(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateOrderDto }) => orderService.update(id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] });
			setShowPaymentDialog(false);
		},
	});

	// Derived
	const total = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);
	const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

	// Handlers
	const onStart = () => {
		setCart([]);
		setPayMethod(undefined);
		setShowPicker(true);
	};

	const inc = (p: Product) => {
		setCart((prev) => {
			const idx = prev.findIndex((i) => i.product.id === p.id);
			if (idx >= 0) {
				const next = [...prev];
				next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
				return next;
			}
			return [...prev, { product: p, quantity: 1 }];
		});
	};
	const dec = (p: Product) => {
		setCart((prev) => {
			const idx = prev.findIndex((i) => i.product.id === p.id);
			if (idx === -1) return prev;
			const nextQty = prev[idx].quantity - 1;
			if (nextQty <= 0) return prev.filter((i) => i.product.id !== p.id);
			const next = [...prev];
			next[idx] = { ...next[idx], quantity: nextQty };
			return next;
		});
	};

	const toCreateDto = (): CreateOrderDto =>
		({
			// customerName can be attached at payment time
			orderDetails: cart.map((i) => ({
				productId: i.product.id,
				quantity: i.quantity,
				unitPrice: i.product.price ?? 0,
			})),
			// paymentMethod intentionally omitted for pending orders
		}) as CreateOrderDto;

	const onSavePending = () => {
		if (cart.length === 0) return;
		createMutation.mutate(toCreateDto());
	};

	const onCreatePaid = () => {
		if (cart.length === 0 || !payMethod) return;
		const dto: CreateOrderDto = { ...toCreateDto(), paymentMethod: payMethod };
		createMutation.mutate(dto, {
			onSuccess: (created) => {
				// Mark as PAID (server may already set status based on payment method)
				if (created?.id) {
					updateMutation.mutate({ id: created.id, data: { status: OrderStatus.PAID } });
				}
			},
		});
	};

	// Pending order details helpers
	const openOrderDetails = (order: Order) => {
		setSelectedOrder(order);
		setOrderCustomerName(order.customerName || "");
		setOrderItemsDraft(
			order.orderDetails?.map((d) => ({
				productId: d.productId,
				product: d.product,
				quantity: d.quantity,
				unitPrice: d.unitPrice,
			})) ?? [],
		);
	};
	const closeOrderDetails = () => {
		setSelectedOrder(null);
		setOrderItemsDraft([]);
		setOrderCustomerName("");
		setDetailCategoryId(null);
	};
	const addItemToDraft = (p: Product) => {
		setOrderItemsDraft((prev) => {
			const idx = prev.findIndex((i) => i.productId === p.id);
			if (idx >= 0) {
				const next = [...prev];
				next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
				return next;
			}
			return [...prev, { productId: p.id, product: p, quantity: 1, unitPrice: p.price ?? 0 }];
		});
	};
	const decItemInDraft = (pid: number) => {
		setOrderItemsDraft((prev) => {
			const idx = prev.findIndex((i) => i.productId === pid);
			if (idx === -1) return prev;
			const q = prev[idx].quantity - 1;
			if (q <= 0) return prev.filter((i) => i.productId !== pid);
			const next = [...prev];
			next[idx] = { ...prev[idx], quantity: q };
			return next;
		});
	};
	const removeItemFromDraft = (pid: number) => {
		setOrderItemsDraft((prev) => prev.filter((i) => i.productId !== pid));
	};

	const detailsTotal = useMemo(
		() => orderItemsDraft.reduce((s, i) => s + i.quantity * (i.unitPrice ?? 0), 0),
		[orderItemsDraft],
	);

	const saveCustomerName = () => {
		if (!selectedOrder) return;
		updateMutation.mutate(
			{ id: selectedOrder.id, data: { customerName: orderCustomerName || undefined } },
			{
				onSuccess: () => {
					qc.invalidateQueries({ queryKey: ["orders"] });
				},
			},
		);
	};

	const saveOrderItems = () => {
		if (!selectedOrder) return;
		const details = orderItemsDraft.map((i) => ({
			productId: i.productId,
			quantity: i.quantity,
			unitPrice: i.unitPrice ?? 0,
		}));
		updateMutation.mutate(
			{ id: selectedOrder.id, data: { orderDetails: details } },
			{ onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }) },
		);
	};

	return (
		<div className="p-3 sm:p-4">
			<div className="flex items-center justify-between gap-2">
				<h1 className="text-lg font-semibold">POS</h1>
				<Button size="sm" onClick={onStart}>
					Create Order
				</Button>
			</div>

			{/* Pending Orders */}
			<div className="mt-3">
				<div className="mb-2 flex items-center justify-between">
					<h2 className="text-base font-medium">Pending Orders</h2>
					<Badge variant="warning">{pendingOrders.length}</Badge>
				</div>
				{pendingOrders.length === 0 ? (
					<div className="text-sm text-muted-foreground">No pending orders</div>
				) : (
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
						{pendingOrders.map((o) => {
							const items = o.orderDetails?.length || 0;
							const amount = o.orderDetails?.reduce((s, d) => s + d.quantity * d.unitPrice, 0) || 0;
							return (
								<Card key={o.id} className="shadow-sm cursor-pointer" onClick={() => openOrderDetails(o)}>
									<CardHeader className="p-3 pb-1">
										<div className="flex items-center justify-between text-sm">
											<span className="font-medium">Order #{o.id}</span>
											<Badge variant="warning">Pending</Badge>
										</div>
									</CardHeader>
									<CardContent className="p-3 pt-1">
										<div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString()}</div>
										<div className="mt-1 text-sm">Items: {items}</div>
										<div className="text-sm font-semibold">Total: {amount.toLocaleString()}</div>
										<div className="mt-2 flex gap-2">
											<Button
												size="sm"
												className="flex-1"
												onClick={(e) => {
													e.stopPropagation();
													setOrderToComplete(o);
													setPayMethod(undefined);
													setShowPaymentDialog(true);
												}}
											>
												Complete
											</Button>
											{/* Future: Resume adding items to this order */}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>

			{/* Product Picker */}
			{false && (
				<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
					{/* Categories: mobile horizontal scroll, desktop sidebar */}
					<div className="sm:col-span-3">
						<div className="flex gap-2 overflow-x-auto sm:block sm:space-y-2">
							<Button
								size="sm"
								variant={selectedCategoryId === null ? "default" : "secondary"}
								onClick={() => setSelectedCategoryId(null)}
							>
								All
							</Button>
							{categories.map((c) => (
								<Button
									key={c.id}
									size="sm"
									variant={selectedCategoryId === c.id ? "default" : "secondary"}
									onClick={() => setSelectedCategoryId(c.id)}
									className="whitespace-nowrap"
								>
									{c.name}
								</Button>
							))}
						</div>
					</div>

					{/* Products */}
					<div className="sm:col-span-9">
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
							{products.map((p) => {
								const cartItem = cart.find((i) => i.product.id === p.id);
								const qty = cartItem?.quantity || 0;
								return (
									<Card key={p.id} className="active:scale-[.99] transition">
										<CardContent className="p-3">
											<div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
												{p.image ? (
													<img
														src={p.image.startsWith("http") ? p.image : `${GLOBAL_CONFIG.apiBaseUrl}/${p.image}`}
														alt={p.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-muted-foreground">
														<Icon icon="solar:image-bold-duotone" size={24} />
													</div>
												)}
											</div>
											<div className="text-sm font-medium line-clamp-2">{p.name}</div>
											<div className="text-xs text-muted-foreground">{p.category?.name}</div>
											<div className="mt-1 text-sm font-semibold">{p.price.toLocaleString()}</div>
											{qty > 0 && <div className="mt-1 text-xs">In cart: {qty}</div>}
											<div className="mt-2 flex gap-2">
												<Button size="sm" className="flex-1" onClick={() => inc(p)}>
													+1
												</Button>
												{qty > 0 && (
													<Button size="sm" variant="secondary" onClick={() => dec(p)}>
														-1
													</Button>
												)}
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Sticky cart bar */}
			{false && (
				<div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="mx-auto flex max-w-5xl items-center gap-2">
						<div className="flex-1 text-sm">
							<div className="font-medium">Items: {totalItems}</div>
							<div>Total: {total.toLocaleString()}</div>
						</div>
						<Button variant="secondary" disabled={cart.length === 0} onClick={() => setCart([])}>
							Clear
						</Button>
						<Button disabled={cart.length === 0} onClick={onSavePending}>
							Save as Pending
						</Button>
						<Button disabled={cart.length === 0} onClick={() => setShowPaymentDialog(true)}>
							Complete Payment
						</Button>
					</div>
				</div>
			)}

			{/* Create Order modal (Drawer on mobile, Dialog on desktop) */}
			{!isDesktop ? (
				<Drawer open={showPicker} onOpenChange={setShowPicker}>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Create Order</DrawerTitle>
						</DrawerHeader>
						<div className="p-3 space-y-3">
							<div className="flex gap-2 overflow-x-auto">
								<Button
									size="sm"
									variant={selectedCategoryId === null ? "default" : "secondary"}
									onClick={() => setSelectedCategoryId(null)}
								>
									All
								</Button>
								{categories.map((c) => (
									<Button
										key={c.id}
										size="sm"
										variant={selectedCategoryId === c.id ? "default" : "secondary"}
										onClick={() => setSelectedCategoryId(c.id)}
										className="whitespace-nowrap"
									>
										{c.name}
									</Button>
								))}
							</div>
							<div className="grid grid-cols-2 gap-2">
								{products.map((p) => {
									const cartItem = cart.find((i) => i.product.id === p.id);
									const qty = cartItem?.quantity || 0;
									return (
										<Card key={p.id} className="active:scale-[.99] transition">
											<CardContent className="p-3">
												<div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
													{p.image ? (
														<img
															src={p.image.startsWith("http") ? p.image : `${GLOBAL_CONFIG.apiBaseUrl}/${p.image}`}
															alt={p.name}
															className="h-full w-full object-cover"
														/>
													) : (
														<div className="flex h-full w-full items-center justify-center text-muted-foreground">
															<Icon icon="solar:image-bold-duotone" size={24} />
														</div>
													)}
												</div>
												<div className="text-sm font-medium line-clamp-2">{p.name}</div>
												<div className="text-xs text-muted-foreground">{p.category?.name}</div>
												<div className="mt-1 text-sm font-semibold">{p.price.toLocaleString()}</div>
												{qty > 0 && <div className="mt-1 text-xs">In cart: {qty}</div>}
												<div className="mt-2 flex gap-2">
													<Button size="sm" className="flex-1" onClick={() => inc(p)}>
														+1
													</Button>
													{qty > 0 && (
														<Button size="sm" variant="secondary" onClick={() => dec(p)}>
															-1
														</Button>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>
						<DrawerFooter>
							<div className="flex items-center justify-between">
								<div className="text-sm">
									Items: {totalItems} • Total: {total.toLocaleString()}
								</div>
								<div className="flex gap-2">
									<Button variant="secondary" disabled={cart.length === 0} onClick={() => setCart([])}>
										Clear
									</Button>
									<Button disabled={cart.length === 0} onClick={onSavePending}>
										Save as Pending
									</Button>
									<Button disabled={cart.length === 0} onClick={() => setShowPaymentDialog(true)}>
										Complete Payment
									</Button>
								</div>
							</div>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			) : (
				<Dialog open={showPicker} onOpenChange={setShowPicker}>
					<DialogContent className="max-w-3xl">
						<DialogHeader>
							<DialogTitle>Create Order</DialogTitle>
						</DialogHeader>
						<div className="space-y-3">
							<div className="flex flex-wrap gap-2">
								<Button
									size="sm"
									variant={selectedCategoryId === null ? "default" : "secondary"}
									onClick={() => setSelectedCategoryId(null)}
								>
									All
								</Button>
								{categories.map((c) => (
									<Button
										key={c.id}
										size="sm"
										variant={selectedCategoryId === c.id ? "default" : "secondary"}
										onClick={() => setSelectedCategoryId(c.id)}
										className="whitespace-nowrap"
									>
										{c.name}
									</Button>
								))}
							</div>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
								{products.map((p) => {
									const cartItem = cart.find((i) => i.product.id === p.id);
									const qty = cartItem?.quantity || 0;
									return (
										<Card key={p.id} className="active:scale-[.99] transition">
											<CardContent className="p-3">
												<div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
													{p.image ? (
														<img
															src={p.image.startsWith("http") ? p.image : `${GLOBAL_CONFIG.apiBaseUrl}/${p.image}`}
															alt={p.name}
															className="h-full w-full object-cover"
														/>
													) : (
														<div className="flex h-full w-full items-center justify-center text-muted-foreground">
															<Icon icon="solar:image-bold-duotone" size={24} />
														</div>
													)}
												</div>
												<div className="text-sm font-medium line-clamp-2">{p.name}</div>
												<div className="text-xs text-muted-foreground">{p.category?.name}</div>
												<div className="mt-1 text-sm font-semibold">{p.price.toLocaleString()}</div>
												{qty > 0 && <div className="mt-1 text-xs">In cart: {qty}</div>}
												<div className="mt-2 flex gap-2">
													<Button size="sm" className="flex-1" onClick={() => inc(p)}>
														+1
													</Button>
													{qty > 0 && (
														<Button size="sm" variant="secondary" onClick={() => dec(p)}>
															-1
														</Button>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>
						<DialogFooter>
							<div className="flex w-full items-center justify-between">
								<div className="text-sm">
									Items: {totalItems} • Total: {total.toLocaleString()}
								</div>
								<div className="flex gap-2">
									<Button variant="secondary" disabled={cart.length === 0} onClick={() => setCart([])}>
										Clear
									</Button>
									<Button disabled={cart.length === 0} onClick={onSavePending}>
										Save as Pending
									</Button>
									<Button disabled={cart.length === 0} onClick={() => setShowPaymentDialog(true)}>
										Complete Payment
									</Button>
								</div>
							</div>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Pending Order details dialog */}
			<Dialog
				open={!!selectedOrder}
				onOpenChange={(open) => {
					if (!open) closeOrderDetails();
				}}
			>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
					</DialogHeader>
					<div className="space-y-3">
						<div className="text-sm text-muted-foreground">
							Created: {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ""}
						</div>
						<div className="flex items-center gap-2">
							<Label className="w-28">Customer</Label>
							<Input
								value={orderCustomerName}
								onChange={(e) => setOrderCustomerName(e.target.value)}
								placeholder="Enter name"
							/>
							<Button size="sm" onClick={saveCustomerName} disabled={!selectedOrder}>
								Save
							</Button>
						</div>
						<div>
							<div className="mb-2 text-sm font-medium">Items</div>
							<div className="divide-y">
								{orderItemsDraft.map((i) => (
									<div key={i.productId} className="flex items-center justify-between py-2">
										<div className="flex items-center gap-2 flex-1">
											<div className="h-10 w-10 overflow-hidden rounded-md bg-muted shrink-0">
												{i.product?.image ? (
													<img
														src={
															i.product.image.startsWith("http")
																? i.product.image
																: `${GLOBAL_CONFIG.apiBaseUrl}/${i.product.image}`
														}
														alt={i.product?.name ?? `#${i.productId}`}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-muted-foreground">
														<Icon icon="solar:image-bold-duotone" size={16} />
													</div>
												)}
											</div>
											<div>
												<div className="text-sm font-medium">{i.product?.name ?? `#${i.productId}`}</div>
												<div className="text-xs text-muted-foreground">@ {(i.unitPrice ?? 0).toLocaleString()}</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button size="icon" variant="secondary" onClick={() => decItemInDraft(i.productId)}>
												-
											</Button>
											<div className="w-6 text-center text-sm">{i.quantity}</div>
											{i.product && (
												<Button size="icon" variant="secondary" onClick={() => addItemToDraft(i.product!)}>
													+
												</Button>
											)}
											<div className="w-20 text-right text-sm font-medium">
												{(i.quantity * (i.unitPrice ?? 0)).toLocaleString()}
											</div>
											<Button size="icon" variant="ghost" onClick={() => removeItemFromDraft(i.productId)}>
												✕
											</Button>
										</div>
									</div>
								))}
								{orderItemsDraft.length === 0 && <div className="py-2 text-sm text-muted-foreground">No items yet</div>}
							</div>
						</div>
						<div className="flex items-center justify-between">
							<div className="text-sm">
								Status: <Badge variant="warning">{selectedOrder?.status}</Badge>
							</div>
							<div className="text-sm font-semibold">Total: {detailsTotal.toLocaleString()}</div>
						</div>
						<div className="space-y-2">
							<div className="text-sm font-medium">Add items</div>
							<div className="flex flex-wrap gap-2">
								<Button
									size="sm"
									variant={selectedCategoryId === null ? "default" : "secondary"}
									onClick={() => setSelectedCategoryId(null)}
								>
									All
								</Button>
								{categories.map((c) => (
									<Button
										key={c.id}
										size="sm"
										variant={selectedCategoryId === c.id ? "default" : "secondary"}
										onClick={() => setSelectedCategoryId(c.id)}
										className="whitespace-nowrap"
									>
										{c.name}
									</Button>
								))}
							</div>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
								{products.map((p) => (
									<Card key={p.id} className="active:scale-[.99] transition">
										<CardContent className="p-3">
											<div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
												{p.image ? (
													<img
														src={p.image.startsWith("http") ? p.image : `${GLOBAL_CONFIG.apiBaseUrl}/${p.image}`}
														alt={p.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-muted-foreground">
														<Icon icon="solar:image-bold-duotone" size={24} />
													</div>
												)}
											</div>
											<div className="text-sm font-medium line-clamp-2">{p.name}</div>
											<div className="text-xs text-muted-foreground">{p.category?.name}</div>
											<div className="mt-1 text-sm font-semibold">{p.price.toLocaleString()}</div>
											<div className="mt-2">
												<Button size="sm" className="w-full" onClick={() => addItemToDraft(p)}>
													Add
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="secondary" onClick={closeOrderDetails}>
							Close
						</Button>
						<Button onClick={saveOrderItems} disabled={!selectedOrder}>
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Payment dialog */}
			<Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Select payment method</DialogTitle>
					</DialogHeader>
					<RadioGroup value={payMethod} onValueChange={(v) => setPayMethod(v as PaymentMethod)}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value={PaymentMethod.CASH} id="cash" />
							<Label htmlFor="cash">Cash</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="bank_transfer" />
							<Label htmlFor="bank_transfer">Bank Transfer</Label>
						</div>
					</RadioGroup>
					<DialogFooter>
						{orderToComplete ? (
							<Button
								disabled={!payMethod}
								onClick={() => {
									if (!orderToComplete || !payMethod) return;
									updateMutation.mutate(
										{ id: orderToComplete.id, data: { status: OrderStatus.PAID, paymentMethod: payMethod } },
										{
											onSuccess: () => {
												setOrderToComplete(null);
												setPayMethod(undefined);
												setShowPaymentDialog(false);
											},
										},
									);
								}}
							>
								Confirm Payment
							</Button>
						) : (
							<Button disabled={!payMethod || cart.length === 0} onClick={onCreatePaid}>
								Pay & Create
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
