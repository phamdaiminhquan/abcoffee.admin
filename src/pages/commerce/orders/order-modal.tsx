import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import productService from "@/api/services/productService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { GLOBAL_CONFIG } from "@/global-config";

import type { CreateOrderDto, Order, Product } from "#/coffee";
import { PaymentMethod } from "#/coffee";

export type OrderModalProps = {
	formValue: Partial<Order>;
	title: string;
	show: boolean;
	onOk: (values: CreateOrderDto) => void;
	onCancel: VoidFunction;
};

type OrderFormValues = {
	customerName: string;
	paymentMethod: PaymentMethod;
	productId: string;
	quantity: number;
};

export function OrderModal({ title, show, formValue, onOk, onCancel }: OrderModalProps) {
	const form = useForm<OrderFormValues>({
		defaultValues: {
			customerName: formValue.customerName || "",
			paymentMethod: formValue.paymentMethod || PaymentMethod.CASH,
			productId: "",
			quantity: 1,
		},
	});

	const { data: products = [] } = useQuery<Product[]>({
		queryKey: ["products", "all"],
		queryFn: () => productService.getAll(),
	});

	const productId = form.watch("productId");
	const selectedProduct = useMemo(() => products.find((p) => String(p.id) === productId), [products, productId]);

	useEffect(() => {
		form.reset({
			customerName: formValue.customerName || "",
			paymentMethod: formValue.paymentMethod || PaymentMethod.CASH,
			productId: "",
			quantity: 1,
		});
	}, [formValue, form]);

	const onSubmit = (values: OrderFormValues) => {
		const unitPrice = selectedProduct?.price ?? 0;
		const dto: CreateOrderDto = {
			customerName: values.customerName || undefined,
			paymentMethod: values.paymentMethod,
			orderDetails: [
				{
					productId: Number(values.productId),
					quantity: values.quantity,
					unitPrice,
				},
			],
		};
		onOk(dto);
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
							name="customerName"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Customer Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} placeholder="Enter customer name (optional)" />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="paymentMethod"
							rules={{ required: "Payment method is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Payment Method</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<RadioGroup onValueChange={field.onChange} value={field.value}>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={PaymentMethod.CASH} id="cash" />
													<Label htmlFor="cash">Cash</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="bank_transfer" />
													<Label htmlFor="bank_transfer">Bank Transfer</Label>
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
							name="productId"
							rules={{ required: "Product is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Product</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Select value={field.value} onValueChange={field.onChange}>
												<SelectTrigger>
													<SelectValue placeholder="Select product" />
												</SelectTrigger>
												<SelectContent>
													{products.map((p) => (
														<SelectItem key={p.id} value={String(p.id)}>
															<div className="flex items-center gap-2">
																<div className="h-6 w-6 overflow-hidden rounded bg-muted shrink-0">
																	{p.image ? (
																		<img
																			src={
																				p.image.startsWith("http") ? p.image : `${GLOBAL_CONFIG.apiBaseUrl}/${p.image}`
																			}
																			alt={p.name}
																			className="h-full w-full object-cover"
																		/>
																	) : null}
																</div>
																<span>
																	{p.name} • {p.price.toLocaleString("vi-VN")} VND
																</span>
															</div>
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
							name="quantity"
							rules={{ required: "Quantity is required", min: { value: 1, message: "Quantity must be at least 1" } }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Quantity</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input
												{...field}
												type="number"
												min="1"
												placeholder="Enter quantity"
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						{selectedProduct && (
							<div className="grid grid-cols-4 items-center gap-4">
								<div className="text-right text-sm font-medium">Total</div>
								<div className="col-span-3 text-sm">
									{(selectedProduct.price * form.watch("quantity")).toLocaleString("vi-VN")} VND
								</div>
							</div>
						)}

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
