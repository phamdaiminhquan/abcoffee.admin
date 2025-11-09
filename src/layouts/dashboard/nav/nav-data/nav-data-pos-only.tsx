import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		name: "Bán hàng",
		items: [
			{
				title: "POS",
				path: "/commerce/pos",
				// Dùng icon Kanban hiện tại
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
			},
			{
				title: "Quản lý Sản phẩm",
				path: "/commerce/products",
				icon: <Icon icon="solar:bag-bold-duotone" size="24" />,
			},
			{
				title: "Quản lý Danh mục",
				path: "/commerce/categories",
				icon: <Icon icon="solar:tag-bold-duotone" size="24" />,
			},
			{
				title: "Quản lý Hình ảnh",
				path: "/commerce/images",
				icon: <Icon icon="solar:gallery-bold-duotone" size="24" />,
			},
		],
	},
];
