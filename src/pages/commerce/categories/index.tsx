import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import categoryService from "@/api/services/categoryService";
import type { Category, CreateCategoryDto } from "#/coffee";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "sonner";

export default function CategoriesPage() {
	const qc = useQueryClient();
	const { data: categories = [], isLoading } = useQuery<Category[]>({
		queryKey: ["categories"],
		queryFn: () => categoryService.getAll(),
	});

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const createMutation = useMutation({
		mutationFn: (dto: CreateCategoryDto) => categoryService.create(dto),
		onSuccess: () => {
			toast.success("Category created");
			qc.invalidateQueries({ queryKey: ["categories"] });
			setName("");
			setDescription("");
		},
	});

	return (
		<Card>
			<CardContent>
				<h2 className="text-lg font-semibold mb-4">Categories</h2>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<ul className="space-y-2 mb-6">
						{categories.map((c) => (
							<li key={c.id} className="p-2 rounded border flex items-center justify-between">
								<span>
									<strong>{c.name}</strong>
									{c.description ? <span className="text-muted-foreground ml-2">- {c.description}</span> : null}
								</span>
							</li>
						))}
					</ul>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						createMutation.mutate({ name, description: description || undefined });
					}}
					className="grid gap-3 max-w-xl"
				>
					<div>
						<Label htmlFor="name">Name</Label>
						<Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
					</div>
					<div>
						<Label htmlFor="desc">Description</Label>
						<Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
					</div>
					<Button type="submit" disabled={createMutation.isPending}>
						{createMutation.isPending ? "Creating..." : "Create Category"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
