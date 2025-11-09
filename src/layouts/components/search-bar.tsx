import { Icon } from "@/components/icon";
import { useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from "@/ui/command";
import { ScrollArea } from "@/ui/scroll-area";
import { Text } from "@/ui/typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useBoolean } from "react-use";
import { useFilteredNavData } from "../dashboard/nav";

interface SearchItem {
	key: string;
	label: string;
	path: string;
}

// Component tô sáng văn bản
const HighlightText = ({ text, query }: { text: string; query: string }) => {
	if (!query) return <>{text}</>;

	const parts = text.split(new RegExp(`(${query})`, "gi"));

	return (
		<>
			{parts.map((part, i) =>
				part.toLowerCase() === query.toLowerCase() ? (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<span key={i} className="text-primary">
						{part}
					</span>
				) : (
					part
				),
			)}
		</>
	);
};

const SearchBar = () => {
	const { replace } = useRouter();
	const [open, setOpen] = useBoolean(false);
	const [searchQuery, setSearchQuery] = useState("");
	const navData = useFilteredNavData();

	// Trải phẳng dữ liệu điều hướng thành danh sách có thể tìm kiếm
	const flattenedItems = useMemo(() => {
		const items: SearchItem[] = [];

		const flattenItems = (navItems: typeof navData) => {
			for (const section of navItems) {
				for (const item of section.items) {
					if (item.path) {
						items.push({
							key: item.path,
							label: item.title,
							path: item.path,
						});
					}
					if (item.children) {
						flattenItems([{ items: item.children }]);
					}
				}
			}
		};

		flattenItems(navData);
		return items;
	}, [navData]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open: boolean) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, [setOpen]);

	const handleSelect = useCallback(
		(path: string) => {
			replace(path);
			setOpen(false);
		},
		[replace, setOpen],
	);

	return (
		<>
			<Button variant="ghost" className="bg-action-selected px-2 rounded-lg" size="sm" onClick={() => setOpen(true)}>
				<div className="flex items-center justify-center gap-4">
					<Icon icon="local:ic-search" size="20" />
				</div>
			</Button>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Gõ lệnh hoặc tìm kiếm..." value={searchQuery} onValueChange={setSearchQuery} />
				<ScrollArea className="h-[400px]">
					<CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
					<CommandGroup heading="Điều hướng">
						{flattenedItems.map(({ key, label }) => (
							<CommandItem key={key} onSelect={() => handleSelect(key)} className="flex flex-col items-start">
								<div className="font-medium">
									<HighlightText text={label} query={searchQuery} />
								</div>
								<div className="text-xs text-muted-foreground">
									<HighlightText text={key} query={searchQuery} />
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				</ScrollArea>
				<CommandSeparator />
				<div className="flex flex-wrap text-text-primary p-2 justify-end gap-2">
					<div className="flex items-center gap-1">
						<Badge variant="info">↑</Badge>
						<Badge variant="info">↓</Badge>
						<Text variant="caption">di chuyển</Text>
					</div>
					<div className="flex items-center gap-1">
						<Badge variant="info">↵</Badge>
						<Text variant="caption">chọn</Text>
					</div>
					<div className="flex items-center gap-1">
						<Badge variant="info">ESC</Badge>
						<Text variant="caption">đóng</Text>
					</div>
				</div>
			</CommandDialog>
		</>
	);
};

export default SearchBar;
