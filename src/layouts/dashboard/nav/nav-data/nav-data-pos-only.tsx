import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		name: "Commerce",
		items: [
			{
				title: "POS",
				path: "/commerce/pos",
				// Use current Kanban icon
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
			},
			{
				title: "Products Management",
				path: "/commerce/products",
				icon: <Icon icon="solar:bag-bold-duotone" size="24" />,
			},
			{
				title: "Categories Management",
				path: "/commerce/categories",
				icon: <Icon icon="solar:tag-bold-duotone" size="24" />,
			},
			{
				title: "Image Management",
				path: "/commerce/images",
				icon: <Icon icon="solar:gallery-bold-duotone" size="24" />,
			},
		],
	},
];
