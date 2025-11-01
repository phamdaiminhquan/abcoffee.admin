import { breakpointsTokens } from "@/theme/tokens/breakpoints";
import { removePx } from "@/utils/theme";
import { useEffect, useMemo, useState } from "react";

type MediaQueryConfig = {
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	orientation?: "portrait" | "landscape";
	prefersColorScheme?: "dark" | "light";
	prefersReducedMotion?: boolean;
	devicePixelRatio?: number;
	pointerType?: "coarse" | "fine";
};

const buildMediaQuery = (config: MediaQueryConfig | string): string => {
	if (typeof config === "string") return config;

	const conditions: string[] = [];

	if (config.minWidth) conditions.push(`(min-width: ${config.minWidth}px)`);
	if (config.maxWidth) conditions.push(`(max-width: ${config.maxWidth}px)`);
	if (config.minHeight) conditions.push(`(min-height: ${config.minHeight}px)`);
	if (config.maxHeight) conditions.push(`(max-height: ${config.maxHeight}px)`);
	if (config.orientation) conditions.push(`(orientation: ${config.orientation})`);
	if (config.prefersColorScheme) conditions.push(`(prefers-color-scheme: ${config.prefersColorScheme})`);
	if (config.prefersReducedMotion) conditions.push("(prefers-reduced-motion: reduce)");
	if (config.devicePixelRatio) conditions.push(`(-webkit-min-device-pixel-ratio: ${config.devicePixelRatio})`);
	if (config.pointerType) conditions.push(`(pointer: ${config.pointerType})`);

	return conditions.join(" and ");
};

/**
 * React hook for handling media queries
 *
 * @param config - Media query configuration object or query string
 * @returns boolean - Returns true if the media query matches
 *
 * @example
 * // Ví dụ cơ bản - phát hiện thiết bị di động
 * const isMobile = useMediaQuery({ maxWidth: 768 });
 *
 * @example
 * // Sử dụng breakpoint có sẵn
 * const isDesktop = useMediaQuery(up('lg'));
 *
 * @example
 * // Truy vấn phức tạp - máy tính bảng chế độ ngang
 * const isTabletLandscape = useMediaQuery({
 *   minWidth: 768,
 *   maxWidth: 1024,
 *   orientation: 'landscape'
 * });
 *
 * @example
 * // Tùy chọn người dùng
 * const isDarkMode = useMediaQuery({ prefersColorScheme: 'dark' });
 * const prefersReducedMotion = useMediaQuery({ prefersReducedMotion: true });
 *
 * @example
 * // Khả năng của thiết bị
 * const isTouchDevice = useMediaQuery({ pointerType: 'coarse' });
 * const isRetina = useMediaQuery({ devicePixelRatio: 2 });
 *
 * @example
 * // Truy vấn khoảng bằng helper
 * const isTablet = useMediaQuery(between('sm', 'md'));
 *
 * @example
 * // Chuỗi media query thô
 * const isPortrait = useMediaQuery('(orientation: portrait)');
 *
 * @see {@link MediaQueryConfig} for all supported configuration options
 */
export const useMediaQuery = (config: MediaQueryConfig | string) => {
	// Khi render phía server, mặc định là false
	const [matches, setMatches] = useState(false);

	// Chuyển config thành chuỗi media query
	const mediaQueryString = useMemo(() => buildMediaQuery(config), [config]);

	useEffect(() => {
		// Kiểm tra trạng thái ngay khi render phía client
		const mediaQuery = window.matchMedia(mediaQueryString);
		setMatches(mediaQuery.matches);

		// Lắng nghe thay đổi
		const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

		// Dùng cả API mới và cũ để tương thích tối đa
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener("change", handler);
		} else {
			// Tương thích trình duyệt cũ
			mediaQuery.addListener(handler);
		}

		// Hàm dọn dẹp
		return () => {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener("change", handler);
			} else {
				// Tương thích trình duyệt cũ
				mediaQuery.removeListener(handler);
			}
		};
	}, [mediaQueryString]);

	return matches;
};

type Breakpoints = typeof breakpointsTokens;
type BreakpointsKeys = keyof Breakpoints;
// Hàm tiện ích
export const up = (key: BreakpointsKeys) => ({
	minWidth: removePx(breakpointsTokens[key]),
});

export const down = (key: BreakpointsKeys) => ({
	maxWidth: removePx(breakpointsTokens[key]) - 0.05, // Trừ 0.05px để tránh chồng lấn breakpoint
});

export const between = (start: BreakpointsKeys, end: BreakpointsKeys) => ({
	minWidth: removePx(breakpointsTokens[start]),
	maxWidth: removePx(breakpointsTokens[end]) - 0.05,
});
