import { useTheme } from "@/theme/hooks";
import { type HTMLMotionProps, type MotionValue, m, useSpring } from "motion/react";
import type { CSSProperties } from "react";

/**
 * Giao diện thuộc tính cho thành phần ScrollProgress
 * @interface Props
 * @extends {HTMLMotionProps<"div">} - Kế thừa các thuộc tính của phần tử div trong Framer Motion
 * @property {string} [color] - Màu thanh tiến trình, tùy chọn
 * @property {MotionValue<number>} scrollYProgress - Tiến độ cuộn, phạm vi 0-1
 * @property {number} [height=4] - Chiều cao thanh tiến trình, mặc định 4px
 */
interface Props extends HTMLMotionProps<"div"> {
	color?: string;
	scrollYProgress: MotionValue<number>;
	height?: number;
}

/**
 * Thành phần thanh tiến độ cuộn
 *
 * Thành phần này hiển thị tiến độ cuộn của trang với hiệu ứng chuyển động mượt.
 * Sử dụng spring animation của Framer Motion để tạo cảm giác linh hoạt.
 *
 * @component
 * @param {Props} props - Thuộc tính của thành phần
 * @param {MotionValue<number>} props.scrollYProgress - Tiến độ cuộn
 * @param {number} [props.height=4] - Chiều cao thanh tiến trình
 * @param {string} [props.color] - Màu thanh tiến trình, mặc định lấy từ theme
 *
 * @example
 * ```tsx
 * const scrollYProgress = useScroll().scrollYProgress;
 * <ScrollProgress scrollYProgress={scrollYProgress} />
 * ```
 */
export function ScrollProgress({ scrollYProgress, height = 4, color, ...other }: Props) {
	// Dùng spring animation để tiến độ thay đổi mượt mà hơn
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100, // Độ cứng của lò xo
		damping: 30, // Hệ số giảm chấn
		restDelta: 0.001, // Ngưỡng dừng animation
	});

	const { themeTokens } = useTheme();

	// Thiết lập màu thanh, ưu tiên màu truyền vào, nếu không có sẽ dùng màu theme
	const backgroundColor = color || themeTokens.color.palette.primary.default;

	// Cấu hình kiểu dáng cho thanh tiến trình
	const style: CSSProperties = {
		transformOrigin: "0%", // Đặt gốc biến đổi ở bên trái
		height, // Thiết lập chiều cao
		backgroundColor, // Thiết lập màu nền
	};

	return <m.div style={{ scaleX, ...style }} {...other} />;
}
