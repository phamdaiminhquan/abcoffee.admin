import { faker } from "@faker-js/faker";
import type { Menu, Permission, Role, User } from "#/entity";
import { PermissionType } from "#/enum";
import type { ReviewResponseDto } from "#/review";
import { ALLOWED_REVIEW_RATINGS } from "#/review";

const { GROUP, MENU, CATALOGUE } = PermissionType;

export const DB_MENU: Menu[] = [
	// Nhóm gốc
	{ id: "group_dashboard", name: "Bảng điều khiển", code: "dashboard", parentId: "", type: GROUP },
	{ id: "group_pages", name: "Trang", code: "pages", parentId: "", type: GROUP },
	{ id: "group_ui", name: "Giao diện", code: "ui", parentId: "", type: GROUP },
	{ id: "group_others", name: "Khác", code: "others", parentId: "", type: GROUP },

	// Nhóm dashboard
	{
		id: "workbench",
		parentId: "group_dashboard",
		name: "Bàn làm việc",
		code: "workbench",
		icon: "local:ic-workbench",
		type: MENU,
		path: "/workbench",
		component: "/pages/dashboard/workbench",
	},
	{
		id: "analysis",
		parentId: "group_dashboard",
		name: "Phân tích",
		code: "analysis",
		icon: "local:ic-analysis",
		type: MENU,
		path: "/analysis",
		component: "/pages/dashboard/analysis",
	},

	// Nhóm pages
	// Khu vực quản lý
	{
		id: "management",
		parentId: "group_pages",
		name: "Quản lý",
		code: "management",
		icon: "local:ic-management",
		type: CATALOGUE,
		path: "/management",
	},
	{
		id: "management_user",
		parentId: "management",
		name: "Người dùng",
		code: "management:user",
		type: CATALOGUE,
		path: "/management/user",
	},
	{
		id: "management_user_profile",
		parentId: "management_user",
		name: "Hồ sơ",
		code: "management:user:profile",
		type: MENU,
		path: "management/user/profile",
		component: "/pages/management/user/profile",
	},
	{
		id: "management_user_account",
		parentId: "management_user",
		name: "Tài khoản",
		code: "management:user:account",
		type: MENU,
		path: "management/user/account",
		component: "/pages/management/user/account",
	},
	{
		id: "management_reviews",
		parentId: "management",
		name: "Đánh giá",
		code: "management:reviews",
		type: MENU,
		path: "/management/reviews",
		component: "/pages/management/reviews",
		icon: "solar:star-bold-duotone",
	},
	{
		id: "management_system",
		parentId: "management",
		name: "Hệ thống",
		code: "management:system",
		type: CATALOGUE,
		path: "management/system",
	},
	{
		id: "management_system_user",
		parentId: "management_system",
		name: "Người dùng",
		code: "management:system:user",
		type: MENU,
		path: "/management/system/user",
		component: "/pages/management/system/user",
	},
	{
		id: "management_system_role",
		parentId: "management_system",
		name: "Vai trò",
		code: "management:system:role",
		type: MENU,
		path: "/management/system/role",
		component: "/pages/management/system/role",
	},
	{
		id: "management_system_permission",
		parentId: "management_system",
		name: "Phân quyền",
		code: "management:system:permission",
		type: MENU,
		path: "/management/system/permission",
		component: "/pages/management/system/permission",
	},
	// Cấp menu
	{
		id: "menulevel",
		parentId: "group_pages",
		name: "Cấu trúc menu",
		code: "menulevel",
		icon: "local:ic-menulevel",
		type: CATALOGUE,
		path: "/menu_level",
	},
	{
		id: "menulevel_1a",
		parentId: "menulevel",
		name: "Mục 1A",
		code: "menulevel:1a",
		type: MENU,
		path: "/menu_level/1a",
		component: "/pages/menu-level/menu-level-1a",
	},
	{
		id: "menulevel_1b",
		parentId: "menulevel",
		name: "Mục 1B",
		code: "menulevel:1b",
		type: CATALOGUE,
		path: "/menu_level/1b",
		component: "/pages/menu-level/menu-level-1b",
	},
	{
		id: "menulevel_1b_2a",
		parentId: "menulevel_1b",
		name: "Mục 2A",
		code: "menulevel:1b:2a",
		type: MENU,
		path: "/menu_level/1b/2a",
		component: "/pages/menu-level/menu-level-1b/menu-level-2a",
	},
	{
		id: "menulevel_1b_2b",
		parentId: "menulevel_1b",
		name: "Mục 2B",
		code: "menulevel:1b:2b",
		type: CATALOGUE,
		path: "/menu_level/1b/2b",
	},
	{
		id: "menulevel_1b_2b_3a",
		parentId: "menulevel_1b_2b",
		name: "Mục 3A",
		code: "menulevel:1b:2b:3a",
		type: MENU,
		path: "/menu_level/1b/2b/3a",
		component: "/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3a",
	},
	{
		id: "menulevel_1b_2b_3b",
		parentId: "menulevel_1b_2b",
		name: "Mục 3B",
		code: "menulevel:1b:2b:3b",
		type: MENU,
		path: "/menu_level/1b/2b/3b",
		component: "/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3b",
	},
	// Nhóm lỗi
	{
		id: "error",
		parentId: "group_pages",
		name: "Trang lỗi",
		code: "error",
		icon: "bxs:error-alt",
		type: CATALOGUE,
		path: "/error",
	},
	{
		id: "error_403",
		parentId: "error",
		name: "Lỗi 403",
		code: "error:403",
		type: MENU,
		path: "/error/403",
		component: "/pages/sys/error/Page403",
	},
	{
		id: "error_404",
		parentId: "error",
		name: "Lỗi 404",
		code: "error:404",
		type: MENU,
		path: "/error/404",
		component: "/pages/sys/error/Page404",
	},
	{
		id: "error_500",
		parentId: "error",
		name: "Lỗi 500",
		code: "error:500",
		type: MENU,
		path: "/error/500",
		component: "/pages/sys/error/Page500",
	},

	// Nhóm UI
	// Thành phần
	{
		id: "components",
		parentId: "group_ui",
		name: "Thành phần",
		code: "components",
		icon: "solar:widget-5-bold-duotone",
		type: CATALOGUE,
		path: "/components",
		caption: "Thành phần UI tùy chỉnh",
	},
	{
		id: "components_icon",
		parentId: "components",
		name: "Biểu tượng",
		code: "components:icon",
		type: MENU,
		path: "/components/icon",
		component: "/pages/components/icon",
	},
	{
		id: "components_animate",
		parentId: "components",
		name: "Hiệu ứng",
		code: "components:animate",
		type: MENU,
		path: "/components/animate",
		component: "/pages/components/animate",
	},
	{
		id: "components_scroll",
		parentId: "components",
		name: "Cuộn",
		code: "components:scroll",
		type: MENU,
		path: "/components/scroll",
		component: "/pages/components/scroll",
	},
	{
		id: "components_i18n",
		parentId: "components",
		name: "Đa ngôn ngữ",
		code: "components:i18n",
		type: MENU,
		path: "/components/multi-language",
		component: "/pages/components/multi-language",
	},
	{
		id: "components_upload",
		parentId: "components",
		name: "Tải lên",
		code: "components:upload",
		type: MENU,
		path: "/components/upload",
		component: "/pages/components/upload",
	},
	{
		id: "components_chart",
		parentId: "components",
		name: "Biểu đồ",
		code: "components:chart",
		type: MENU,
		path: "/components/chart",
		component: "/pages/components/chart",
	},
	{
		id: "components_toast",
		parentId: "components",
		name: "Toast",
		code: "components:toast",
		type: MENU,
		path: "/components/toast",
		component: "/pages/components/toast",
	},
	// Chức năng
	{
		id: "functions",
		parentId: "group_ui",
		name: "Chức năng",
		code: "functions",
		icon: "solar:plain-2-bold-duotone",
		type: CATALOGUE,
		path: "/functions",
	},
	{
		id: "functions_clipboard",
		parentId: "functions",
		name: "Bảng tạm",
		code: "functions:clipboard",
		type: MENU,
		path: "/functions/clipboard",
		component: "/pages/functions/clipboard",
	},
	{
		id: "functions_tokenExpired",
		parentId: "functions",
		name: "Hết phiên",
		code: "functions:token_expired",
		type: MENU,
		path: "/functions/token_expired",
		component: "/pages/functions/token-expired",
	},

	// Nhóm khác
	{
		id: "permission",
		parentId: "group_others",
		name: "Phân quyền",
		code: "permission",
		icon: "mingcute:safe-lock-fill",
		type: MENU,
		path: "/permission",
		component: "/pages/sys/others/permission",
	},
	{
		id: "permission_page_test",
		parentId: "group_others",
		name: "Kiểm tra phân quyền",
		code: "permission:page_test",
		icon: "mingcute:safe-lock-fill",
		type: MENU,
		path: "/permission/page-test",
		component: "/pages/sys/others/permission/page-test",
		auth: ["permission:read"],
		hidden: true,
	},
	{
		id: "calendar",
		parentId: "group_others",
		name: "Lịch",
		code: "calendar",
		icon: "solar:calendar-bold-duotone",
		type: MENU,
		path: "/calendar",
		info: "12",
		component: "/pages/sys/others/calendar",
	},
	{
		id: "kanban",
		parentId: "group_others",
		name: "Kanban",
		code: "kanban",
		icon: "solar:clipboard-bold-duotone",
		type: MENU,
		path: "/kanban",
		component: "/pages/sys/others/kanban",
	},
	{
		id: "disabled",
		parentId: "group_others",
		name: "Bị vô hiệu hoá",
		code: "disabled",
		icon: "local:ic-disabled",
		type: MENU,
		path: "/disabled",
		disabled: true,
		component: "/pages/sys/others/disabled",
	},
	{
		id: "label",
		parentId: "group_others",
		name: "Nhãn",
		code: "label",
		icon: "local:ic-label",
		type: MENU,
		path: "#label",
		info: "Mới",
	},
	{
		id: "link",
		parentId: "group_others",
		name: "Liên kết",
		code: "link",
		icon: "local:ic-external",
		type: CATALOGUE,
		path: "/link",
	},
	{
		id: "link_external",
		parentId: "link",
		name: "Liên kết ngoài",
		code: "link:external_link",
		type: MENU,
		path: "/link/external_link",
		component: "/pages/sys/others/link/external-link",
		externalLink: new URL("https://ant.design/index-cn"),
	},
	{
		id: "link_iframe",
		parentId: "link",
		name: "Iframe",
		code: "link:iframe",
		type: MENU,
		path: "/link/iframe",
		externalLink: new URL("https://ant.design/index-cn"),
		component: "/pages/sys/others/link/iframe",
	},
	{
		id: "blank",
		parentId: "group_others",
		name: "Trang trống",
		code: "blank",
		icon: "local:ic-blank",
		type: MENU,
		path: "/blank",
		component: "/pages/sys/others/blank",
	},
];

export const DB_USER: User[] = [
	{
		id: "user_admin_id",
		username: "admin",
		password: "demo1234",
		avatar: faker.image.avatarGitHub(),
		email: "admin@slash.com",
	},
	{
		id: "user_test_id",
		username: "test",
		password: "demo1234",
		avatar: faker.image.avatarGitHub(),
		email: "test@slash.com",
	},
	{
		id: "user_guest_id",
		username: "guest",
		password: "demo1234",
		avatar: faker.image.avatarGitHub(),
		email: "guest@slash.com",
	},
];

export const DB_ROLE: Role[] = [
	{ id: "role_admin_id", name: "admin", code: "SUPER_ADMIN" },
	{ id: "role_test_id", name: "test", code: "TEST" },
];

export const DB_PERMISSION: Permission[] = [
	{ id: "permission_create", name: "permission-create", code: "permission:create" },
	{ id: "permission_read", name: "permission-read", code: "permission:read" },
	{ id: "permission_update", name: "permission-update", code: "permission:update" },
	{ id: "permission_delete", name: "permission-delete", code: "permission:delete" },
];

export const DB_USER_ROLE = [
	{ id: "user_admin_role_admin", userId: "user_admin_id", roleId: "role_admin_id" },
	{ id: "user_test_role_test", userId: "user_test_id", roleId: "role_test_id" },
];

export const DB_ROLE_PERMISSION = [
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_create" },
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_read" },
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_update" },
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_delete" },

	{ id: faker.string.uuid(), roleId: "role_test_id", permissionId: "permission_read" },
	{ id: faker.string.uuid(), roleId: "role_test_id", permissionId: "permission_update" },
];

const buildReviewDataset = (): ReviewResponseDto[] => {
	const items: ReviewResponseDto[] = [];
	for (let index = 0; index < 24; index += 1) {
		const rating = faker.helpers.arrayElement(ALLOWED_REVIEW_RATINGS);
		const authorType = faker.helpers.arrayElement<ReviewResponseDto["authorType"]>(["user", "customer"]);
		const createdAt = faker.date.past({ years: 1 });
		const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
		const isDeleted = faker.datatype.boolean({ probability: 0.15 });
		const deletedAt = isDeleted ? faker.date.between({ from: updatedAt, to: new Date() }) : null;
		const imageCount = faker.datatype.boolean({ probability: 0.4 }) ? faker.number.int({ min: 1, max: 3 }) : 0;
		const images = Array.from({ length: imageCount }, () => faker.image.urlPicsumPhotos({ width: 640, height: 480 }));
		items.push({
			id: 1000 + index,
			comment: faker.lorem.sentences({ min: 1, max: 3 }),
			rating,
			images,
			userId: authorType === "user" ? faker.number.int({ min: 1, max: 50 }) : null,
			customerId: authorType === "customer" ? faker.number.int({ min: 1, max: 50 }) : null,
			authorType,
			authorName: faker.person.fullName(),
			createdAt: createdAt.toISOString(),
			updatedAt: updatedAt.toISOString(),
			deletedAt: deletedAt ? deletedAt.toISOString() : null,
		});
	}
	return items;
};

export const DB_REVIEWS: ReviewResponseDto[] = buildReviewDataset();
