import { type MotionProps, m } from "motion/react";

import { varContainer } from "./variants";

interface Props extends MotionProps {
	className?: string;
}

/**
 * MotionViewport - tạo hiệu ứng dựa trên việc phần tử đi vào tầm nhìn
 *
 * Đặc điểm chính:
 * - Kích hoạt animation khi phần tử xuất hiện trong viewport
 * - Hỗ trợ tuỳ chỉnh variants cho animation
 * - Có thể cấu hình điều kiện kích hoạt viewport
 *
 * Cấu hình viewport:
 * - once: Animation chỉ chạy một lần hay lặp lại
 * - amount: Ngưỡng tỷ lệ phần tử xuất hiện trong viewport (0-1)
 *
 * Trạng thái animation:
 * - initial: Trạng thái ban đầu
 * - animate: Trạng thái khi phần tử đã vào viewport
 *
 * @see https://www.framer.com/motion/scroll-animations/#scroll-triggered-animations
 */
export default function MotionViewport({ children, className, ...other }: Props) {
	return (
		<m.div
			initial="initial"
			whileInView="animate"
			viewport={{ once: true, amount: 0.3 }}
			variants={varContainer()}
			className={className}
			{...other}
		>
			{children}
		</m.div>
	);
}
