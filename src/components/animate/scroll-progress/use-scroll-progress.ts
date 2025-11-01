import type { MotionValue } from "motion/react";
import { useScroll } from "motion/react";
import { useMemo, useRef } from "react";

/**
 * Định nghĩa kiểu trả về, bao gồm tiến độ cuộn và tham chiếu phần tử
 */
export type UseScrollProgressReturn = {
	/** Tiến độ cuộn ngang (0-1) */
	scrollXProgress: MotionValue<number>;
	/** Tiến độ cuộn dọc (0-1) */
	scrollYProgress: MotionValue<number>;
	/** Tham chiếu vùng chứa, dùng cho chế độ cuộn theo container */
	elementRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Kiểu mục tiêu cuộn
 * - "document": Theo dõi cuộn toàn bộ tài liệu
 * - "container": Theo dõi cuộn của vùng chứa được chỉ định
 */
export type UseScrollProgress = "document" | "container";

/**
 * Hook tùy chỉnh để lấy tiến độ cuộn
 *
 * @param target - Kiểu mục tiêu cuộn, nhận "document" hoặc "container", mặc định là "document"
 * @returns Đối tượng chứa tiến độ cuộn và tham chiếu phần tử
 *
 * @example
 * // Theo dõi cuộn toàn bộ tài liệu
 * const { scrollYProgress } = useScrollProgress();
 *
 * @example
 * // Theo dõi cuộn của một vùng chứa
 * const { scrollYProgress, elementRef } = useScrollProgress("container");
 * // Gắn elementRef vào phần tử vùng chứa
 */
export function useScrollProgress(target: UseScrollProgress = "document"): UseScrollProgressReturn {
	const elementRef = useRef<HTMLDivElement>(null);

	const options = { container: elementRef };

	const { scrollYProgress, scrollXProgress } = useScroll(target === "container" ? options : undefined);

	const memoizedValue = useMemo(
		() => ({ elementRef, scrollXProgress, scrollYProgress }),
		[scrollXProgress, scrollYProgress],
	);

	return memoizedValue;
}
