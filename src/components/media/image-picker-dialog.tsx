import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { uploadService } from "@/api/services/uploadService";
import type { UploadedImage, Paginated } from "#/coffee";

export function ImagePickerDialog({
	open,
	onOpenChange,
	onSelect,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (image: UploadedImage) => void;
}) {
	// listImages returns a Paginated<UploadedImage>; normalize to an array for UI use
	const { data: paginated, isLoading } = useQuery<Paginated<UploadedImage>>({
		queryKey: ["images"],
		queryFn: () => uploadService.listImages(),
	});
	const images: UploadedImage[] = useMemo(() => {
		// Be defensive in case API shape changes
		const maybe = paginated as unknown as { data?: UploadedImage[] } | UploadedImage[] | undefined;
		if (Array.isArray(maybe)) return maybe;
		return maybe?.data ?? [];
	}, [paginated]);

	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<number | null>(null);

	const list = useMemo<UploadedImage[]>(() => {
		const s = search.trim().toLowerCase();
		if (!Array.isArray(images) || images.length === 0) return [];
		return s
			? images.filter((i) =>
					[i.originalFilename, i.savedFilename, i.filepath].some((t) => t?.toLowerCase().includes(s)),
				)
			: images;
	}, [images, search]);

	const selected =
		(Array.isArray(list) ? list.find((i) => i.id === selectedId) : undefined) ||
		(Array.isArray(images) ? images.find((i) => i.id === selectedId) : undefined) ||
		null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Select Image</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<div className="flex items-center justify-between gap-2">
						<Input
							placeholder="Search images..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-64"
						/>
					</div>
					{isLoading ? (
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
							{Array.from({ length: 8 }).map((_, idx) => (
								<div key={idx} className="h-28 animate-pulse rounded-md bg-muted" />
							))}
						</div>
					) : (
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
							{list.map((img) => {
								const src = img.url || (img.filepath ? `${GLOBAL_CONFIG.apiBaseUrl}/${img.filepath}` : "");
								const active = img.id === selectedId;
								return (
									<Card
										key={img.id}
										className={`cursor-pointer overflow-hidden ${active ? "ring-2 ring-primary" : ""}`}
										onClick={() => setSelectedId(img.id)}
									>
										<CardContent className="p-0">
											<div className="aspect-square w-full bg-muted">
												{src ? (
													<img src={src} alt={img.originalFilename} className="h-full w-full object-cover" />
												) : (
													<div className="flex h-full w-full items-center justify-center text-muted-foreground">
														<Icon icon="solar:image-bold-duotone" />
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								);
							})}
							{list.length === 0 && (
								<div className="col-span-full py-6 text-center text-sm text-muted-foreground">No images</div>
							)}
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button disabled={!selected} onClick={() => selected && onSelect(selected)}>
						Select
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
