import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gộp các className
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Kiểm tra một phần tử có nằm trong resourcePool hay không
 */
export const check = (item: string, resourcePool: string[]) => {
	return resourcePool.some((p) => p === item);
};

/**
 * Kiểm tra có ít nhất một phần tử nằm trong resourcePool hay không
 */
export const checkAny = (items: string[], resourcePool: string[]) => items.some((item) => check(item, resourcePool));

/**
 * Kiểm tra toàn bộ phần tử có nằm trong resourcePool hay không
 */
export const checkAll = (items: string[], resourcePool: string[]) => items.every((item) => check(item, resourcePool));

/**
 * Nối các phần của URL
 * @example
 * urlJoin('/admin/', '/api/', '/user/') // '/admin/api/user'
 * urlJoin('/admin', 'api', 'user/')     // '/admin/api/user'
 * urlJoin('/admin/', '', '/user/')      // '/admin/user'
 */
export const urlJoin = (...parts: string[]) => {
	const result = parts
		.map((part) => {
			return part.replace(/^\/+|\/+$/g, ""); // Loại bỏ dấu / ở hai đầu
		})
		.filter(Boolean);
	return `/${result.join("/")}`;
};
