import type { NavItemDataProps } from "@/components/nav/types";
import { GLOBAL_CONFIG } from "@/global-config";
import { useUserPermissions } from "@/store/userStore";
import { checkAny } from "@/utils";
import { useMemo } from "react";
import { backendNavData } from "./nav-data-backend";
import { frontendNavData } from "./nav-data-pos-only";

const navData = GLOBAL_CONFIG.routerMode === "backend" ? backendNavData : frontendNavData;

/**
 * Xử lý đệ quy dữ liệu điều hướng, loại bỏ mục không có quyền
 * @param items Danh sách mục điều hướng
 * @param permissions Danh sách quyền
 * @returns Danh sách điều hướng sau khi lọc
 */
const filterItems = (items: NavItemDataProps[], permissions: string[]) => {
	return items.filter((item) => {
		// Kiểm tra mục hiện tại có quyền hay không
		const hasPermission = item.auth ? checkAny(item.auth, permissions) : true;

		// Nếu có mục con thì xử lý đệ quy
		if (item.children?.length) {
			const filteredChildren = filterItems(item.children, permissions);
			// Nếu tất cả mục con bị loại bỏ thì bỏ luôn mục hiện tại
			if (filteredChildren.length === 0) {
				return false;
			}
			// Cập nhật danh sách con
			item.children = filteredChildren;
		}

		return hasPermission;
	});
};

/**
 *
 * Lọc dữ liệu điều hướng dựa trên quyền người dùng
 * @param permissions Danh sách quyền
 * @returns Dữ liệu điều hướng sau khi lọc
 */
const filterNavData = (permissions: string[]) => {
	return navData
		.map((group) => {
			// Lọc các mục trong nhóm
			const filteredItems = filterItems(group.items, permissions);

			// Nếu nhóm không còn mục nào thì trả về null
			if (filteredItems.length === 0) {
				return null;
			}

			// Trả lại nhóm sau khi lọc
			return {
				...group,
				items: filteredItems,
			};
		})
		.filter((group): group is NonNullable<typeof group> => group !== null); // Loại bỏ nhóm trống
};

/**
 * Hook to get filtered navigation data based on user permissions
 * @returns Filtered navigation data
 */
export const useFilteredNavData = () => {
	const permissions = useUserPermissions();
	const permissionCodes = useMemo(() => permissions.map((p) => p.code), [permissions]);
	const filteredNavData = useMemo(() => filterNavData(permissionCodes), [permissionCodes]);
	return filteredNavData;
};
