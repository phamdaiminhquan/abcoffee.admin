import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";
import { Badge } from "@/ui/badge";

export const frontendNavData: NavProps["data"] = [
	{
		name: "B\u1ea3ng \u0111i\u1ec1u khi\u1ec3n",
		items: [
			{
				title: "B\u00e0n l\u00e0m vi\u1ec7c",
				path: "/workbench",
				icon: <Icon icon="local:ic-workbench" size="24" />,
			},
			{
				title: "Ph\u00e2n t\u00edch",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
			},
		],
	},
	{
		name: "Trang",
		items: [
			{
				title: "Qu\u1ea3n l\u00fd",
				path: "/management",
				icon: <Icon icon="local:ic-management" size="24" />,
				children: [
					{
						title: "Ng\u01b0\u1eddi d\u00f9ng",
						path: "/management/user",
						children: [
							{
								title: "H\u1ed3 s\u01a1",
								path: "/management/user/profile",
							},
							{
								title: "T\u00e0i kho\u1ea3n",
								path: "/management/user/account",
							},
						],
					},
					{
						title: "H\u1ec7 th\u1ed1ng",
						path: "/management/system",
						children: [
							{
								title: "Ph\u00e2n quy\u1ec1n",
								path: "/management/system/permission",
							},
							{
								title: "Vai tr\u00f2",
								path: "/management/system/role",
							},
							{
								title: "Ng\u01b0\u1eddi d\u00f9ng",
								path: "/management/system/user",
							},
						],
					},
				],
			},
			{
				title: "Th\u01b0\u01a1ng m\u1ea1i",
				path: "/commerce",
				icon: <Icon icon="local:ic-commerce" size="24" />,
				children: [
					{ title: "B\u00e1n h\u00e0ng", path: "/commerce/pos" },
					{ title: "Danh m\u1ee5c", path: "/commerce/categories" },
					{ title: "S\u1ea3n ph\u1ea9m", path: "/commerce/products" },
					{ title: "\u0110\u01a1n h\u00e0ng", path: "/commerce/orders" },
					{ title: "Doanh thu", path: "/commerce/revenue" },
				],
			},
			{
				title: "C\u1ea5u tr\u00fac menu",
				path: "/menu_level",
				icon: <Icon icon="local:ic-menulevel" size="24" />,
				children: [
					{
						title: "M\u1ee5c 1A",
						path: "/menu_level/1a",
					},
					{
						title: "M\u1ee5c 1B",
						path: "/menu_level/1b",
						children: [
							{
								title: "M\u1ee5c 2A",
								path: "/menu_level/1b/2a",
							},
							{
								title: "M\u1ee5c 2B",
								path: "/menu_level/1b/2b",
								children: [
									{
										title: "M\u1ee5c 3A",
										path: "/menu_level/1b/2b/3a",
									},
									{
										title: "M\u1ee5c 3B",
										path: "/menu_level/1b/2b/3b",
									},
								],
							},
						],
					},
				],
			},
			{
				title: "Trang l\u1ed7i",
				path: "/error",
				icon: <Icon icon="bxs:error-alt" size="24" />,
				children: [
					{
						title: "L\u1ed7i 403",
						path: "/error/403",
					},
					{
						title: "L\u1ed7i 404",
						path: "/error/404",
					},
					{
						title: "L\u1ed7i 500",
						path: "/error/500",
					},
				],
			},
		],
	},
	{
		name: "Giao di\u1ec7n",
		items: [
			{
				title: "Th\u00e0nh ph\u1ea7n",
				path: "/components",
				icon: <Icon icon="solar:widget-5-bold-duotone" size="24" />,
				caption: "Th\u00e0nh ph\u1ea7n UI t\u00f9y ch\u1ec9nh",
				children: [
					{
						title: "Bi\u1ec3u t\u01b0\u1ee3ng",
						path: "/components/icon",
					},
					{
						title: "Hi\u1ec7u \u1ee9ng",
						path: "/components/animate",
					},
					{
						title: "Cu\u1ed9n",
						path: "/components/scroll",
					},
					{
						title: "T\u1ea3i l\u00ean",
						path: "/components/upload",
					},
					{
						title: "Bi\u1ec3u \u0111\u1ed3",
						path: "/components/chart",
					},
					{
						title: "Toast",
						path: "/components/toast",
					},
				],
			},
			{
				title: "Ch\u1ee9c n\u0103ng",
				path: "/functions",
				icon: <Icon icon="solar:plain-2-bold-duotone" size="24" />,
				children: [
					{
						title: "B\u1ea3ng t\u1ea1m",
						path: "/functions/clipboard",
					},
					{
						title: "H\u1ebft phi\u00ean",
						path: "/functions/token_expired",
					},
				],
			},
		],
	},
	{
		name: "Kh\u00e1c",
		items: [
			{
				title: "Ph\u00e2n quy\u1ec1n",
				path: "/permission",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
			},
			{
				title: "Ki\u1ec3m tra ph\u00e2n quy\u1ec1n",
				path: "/permission/page-test",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
				auth: ["permission:read"],
				hidden: true,
			},
			{
				title: "L\u1ecbch",
				path: "/calendar",
				icon: <Icon icon="solar:calendar-bold-duotone" size="24" />,
				info: <Badge variant="warning">+12</Badge>,
			},
			{
				title: "Kanban",
				path: "/kanban",
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
			},
			{
				title: "B\u1ecb v\u00f4 hi\u1ec7u ho\u00e1",
				path: "/disabled",
				icon: <Icon icon="local:ic-disabled" size="24" />,
				disabled: true,
			},
			{
				title: "Nhãn",
				path: "#label",
				icon: <Icon icon="local:ic-label" size="24" />,
				info: (
					<Badge variant="info">
						<Icon icon="solar:bell-bing-bold-duotone" size={14} />
						M\u1edbi
					</Badge>
				),
			},
			{
				title: "Li\u00ean k\u1ebft",
				path: "/link",
				icon: <Icon icon="local:ic-external" size="24" />,
				children: [
					{
						title: "Li\u00ean k\u1ebft ngo\u00e0i",
						path: "/link/external-link",
					},
					{
						title: "Iframe",
						path: "/link/iframe",
					},
				],
			},
			{
				title: "Trang tr\u1ed1ng",
				path: "/blank",
				icon: <Icon icon="local:ic-blank" size="24" />,
			},
		],
	},
];
