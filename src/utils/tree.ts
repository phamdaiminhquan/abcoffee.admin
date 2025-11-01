import { chain } from "ramda";

/**
 * Trải phẳng mảng chứa cấu trúc cây
 * @param {T[]} trees - Mảng dữ liệu dạng cây
 * @returns {T[]} - Mảng đã được trải phẳng
 */
export function flattenTrees<T extends { children?: T[] }>(trees: T[] = []): T[] {
	return chain((node) => {
		const children = node.children || [];
		return [node, ...flattenTrees(children)];
	}, trees);
}

/**
 * Chuyển một mảng thành cấu trúc cây
 * @param items - Mảng phần tử
 * @returns Cây với thuộc tính children
 */
export function convertToTree<T extends { children?: T[] }>(items: T[]): T[] {
	const tree = items.map((item) => ({ ...item, children: convertToTree(item.children || []) }));

	return tree;
}

/**
 * Chuyển mảng phẳng có parentId thành cấu trúc cây
 * @param items - Mảng phần tử kèm parentId
 * @returns Cây với thuộc tính children
 */
export function convertFlatToTree<T extends { id: string; parentId: string }>(items: T[]): (T & { children: T[] })[] {
	const itemMap = new Map<string, T & { children: T[] }>();
	const result: (T & { children: T[] })[] = [];

	// Vòng lặp đầu: tạo map chứa toàn bộ phần tử
	for (const item of items) {
		itemMap.set(item.id, { ...item, children: [] });
	}

	// Vòng lặp thứ hai: xây dựng cây hoàn chỉnh
	for (const item of items) {
		const node = itemMap.get(item.id);
		if (!node) continue;

		if (item.parentId === "") {
			result.push(node);
		} else {
			const parent = itemMap.get(item.parentId);
			if (parent) {
				parent.children.push(node);
			}
		}
	}

	return result;
}
