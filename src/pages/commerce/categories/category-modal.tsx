import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import type { Category, CreateCategoryDto } from "#/coffee";

export type CategoryModalProps = {
	formValue: Partial<Category>;
	title: string;
	show: boolean;
	onOk: (values: CreateCategoryDto) => void;
	onCancel: VoidFunction;
};

export function CategoryModal({ title, show, formValue, onOk, onCancel }: CategoryModalProps) {
	const form = useForm<CreateCategoryDto>({
		defaultValues: {
			name: formValue.name || "",
			description: formValue.description || "",
		},
	});

	useEffect(() => {
		form.reset({
			name: formValue.name || "",
			description: formValue.description || "",
		});
	}, [formValue, form]);

	const onSubmit = (values: CreateCategoryDto) => {
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
							rules={{ required: "Category name is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} placeholder="Enter category name" />
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
											<Textarea {...field} placeholder="Enter category description (optional)" rows={3} />
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
