import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";
import { Badge } from "@/ui/badge";

export const frontendNavData: NavProps["data"] = [
	{
		name: "Bảng điều khiển",
		items: [
			{
				title: "Bàn làm việc",
				path: "/workbench",
				icon: <Icon icon="local:ic-workbench" size="24" />,
			},
			{
				title: "Phân tích",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
			},
		],
	},
	{
		name: "Trang",
		items: [
			{
				title: "Quản lý",
				path: "/management",
				icon: <Icon icon="local:ic-management" size="24" />,
				children: [
					{
						title: "Người dùng",
						path: "/management/user",
						children: [
							{
								title: "Hồ sơ",
								path: "/management/user/profile",
							},
							{
								title: "Tài khoản",
								path: "/management/user/account",
							},
						],
					},
					{
						title: "Hệ thống",
						path: "/management/system",
						children: [
							{
								title: "Phân quyền",
								path: "/management/system/permission",
							},
							{
								title: "Vai trò",
								path: "/management/system/role",
							},
							{
								title: "Người dùng",
								path: "/management/system/user",
							},
						],
					},
					{
						title: "Đánh giá",
						path: "/management/reviews",
						icon: <Icon icon="solar:star-bold-duotone" size="24" />,
					},
				],
			},
			{
				title: "Thương mại",
				path: "/commerce",
				icon: <Icon icon="local:ic-commerce" size="24" />,
				children: [
					{ title: "Bán hàng", path: "/commerce/pos" },
					{ title: "Danh mục", path: "/commerce/categories" },
					{ title: "Sản phẩm", path: "/commerce/products" },
					{ title: "Đơn hàng", path: "/commerce/orders" },
					{ title: "Doanh thu", path: "/commerce/revenue" },
				],
			},
			{
				title: "Cấu trúc menu",
				path: "/menu_level",
				icon: <Icon icon="local:ic-menulevel" size="24" />,
				children: [
					{
						title: "Mục 1A",
						path: "/menu_level/1a",
					},
					{
						title: "Mục 1B",
						path: "/menu_level/1b",
						children: [
							{
								title: "Mục 2A",
								path: "/menu_level/1b/2a",
							},
							{
								title: "Mục 2B",
								path: "/menu_level/1b/2b",
								children: [
									{
										title: "Mục 3A",
										path: "/menu_level/1b/2b/3a",
									},
									{
										title: "Mục 3B",
										path: "/menu_level/1b/2b/3b",
									},
								],
							},
						],
					},
				],
			},
			{
				title: "Trang lỗi",
				path: "/error",
				icon: <Icon icon="bxs:error-alt" size="24" />,
				children: [
					{
						title: "Lỗi 403",
						path: "/error/403",
					},
					{
						title: "Lỗi 404",
						path: "/error/404",
					},
					{
						title: "Lỗi 500",
						path: "/error/500",
					},
				],
			},
		],
	},
	{
		name: "Giao diện",
		items: [
			{
				title: "Thành phần",
				path: "/components",
				icon: <Icon icon="solar:widget-5-bold-duotone" size="24" />,
				caption: "Thành phần UI tùy chỉnh",
				children: [
					{
						title: "Biểu tượng",
						path: "/components/icon",
					},
					{
						title: "Hiệu ứng",
						path: "/components/animate",
					},
					{
						title: "Cuộn",
						path: "/components/scroll",
					},
					{
						title: "Tải lên",
						path: "/components/upload",
					},
					{
						title: "Biểu đồ",
						path: "/components/chart",
					},
					{
						title: "Toast",
						path: "/components/toast",
					},
				],
			},
			{
				title: "Chức năng",
				path: "/functions",
				icon: <Icon icon="solar:plain-2-bold-duotone" size="24" />,
				children: [
					{
						title: "Bảng tạm",
						path: "/functions/clipboard",
					},
					{
						title: "Hết phiên",
						path: "/functions/token_expired",
					},
				],
			},
		],
	},
	{
		name: "Khác",
		items: [
			{
				title: "Phân quyền",
				path: "/permission",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
			},
			{
				title: "Kiểm tra phân quyền",
				path: "/permission/page-test",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
				auth: ["permission:read"],
				hidden: true,
			},
			{
				title: "Lịch",
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
				title: "Bị vô hiệu hoá",
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
						Mới
					</Badge>
				),
			},
			{
				title: "Liên kết",
				path: "/link",
				icon: <Icon icon="local:ic-external" size="24" />,
				children: [
					{
						title: "Liên kết ngoài",
						path: "/link/external-link",
					},
					{
						title: "Iframe",
						path: "/link/iframe",
					},
				],
			},
			{
				title: "Trang trống",
				path: "/blank",
				icon: <Icon icon="local:ic-blank" size="24" />,
			},
		],
	},
];
