import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		name: "B\u00e1n h\u00e0ng",
		items: [
			{
				title: "POS",
				path: "/commerce/pos",
				// Dùng icon Kanban hiện tại
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
			},
			{
				title: "Qu\u1ea3n l\u00fd S\u1ea3n ph\u1ea9m",
				path: "/commerce/products",
				icon: <Icon icon="solar:bag-bold-duotone" size="24" />,
			},
			{
				title: "Qu\u1ea3n l\u00fd Danh m\u1ee5c",
				path: "/commerce/categories",
				icon: <Icon icon="solar:tag-bold-duotone" size="24" />,
			},
			{
				title: "Qu\u1ea3n l\u00fd H\u00ecnh \u1ea3nh",
				path: "/commerce/images",
				icon: <Icon icon="solar:gallery-bold-duotone" size="24" />,
			},
		],
	},
];
