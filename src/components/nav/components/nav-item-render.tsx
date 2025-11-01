import { RouterLink } from "@/routes/components/router-link";
import type { NavItemProps } from "../types";

type NavItemRendererProps = {
	item: NavItemProps;
	className: string;
	children: React.ReactNode;
};

/**
 * Renderer for Navigation Items.
 * Handles disabled, external link, clickable child container, and internal link logic.
 */
export const NavItemRenderer: React.FC<NavItemRendererProps> = ({ item, className, children }) => {
	const { disabled, hasChild, path, onClick } = item;

	if (disabled) {
		return <div className={className}>{children}</div>;
	}

	if (hasChild) {
		// Mục menu dọc có con sẽ đóng vai trò là vùng bấm mở rộng
		return (
			<div className={className} onClick={onClick}>
				{children}
			</div>
		);
	}

	// Mặc định: liên kết nội bộ
	return (
		<RouterLink href={path} className={className}>
			{children}
		</RouterLink>
	);
};
