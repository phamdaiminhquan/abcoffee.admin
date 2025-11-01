import { type MotionProps, m } from "motion/react";
import { varContainer } from "./variants/container";

interface Props extends MotionProps {
	className?: string;
}

/**
 * MotionContainer - thành phần vùng chứa hiệu ứng động
 *
 * Đây là một component chung dựa trên Framer Motion, giúp quản lý trạng thái
 * và chuyển tiếp animation cho các component con.
 *
 * Chức năng chính:
 * 1. Cung cấp cơ chế quản lý trạng thái animation thống nhất (initial, animate, exit)
 * 2. Hỗ trợ hiệu ứng animation theo chuỗi cho component con
 * 3. Cho phép tuỳ chỉnh kiểu dáng của container
 *
 * Mô tả variants:
 * - initial: Trạng thái ban đầu
 * - animate: Trạng thái đang hoạt ảnh
 * - exit: Trạng thái thoát
 *
 * Điều khiển animation cho component con:
 * - Khi container cha cấu hình variants, component con có thể kế thừa các thuộc tính đó
 * - Component con vẫn có thể khai báo variants riêng để tạo hiệu ứng cụ thể
 * - Hỗ trợ nhiều preset: fade, slide, zoom, bounce, flip, scale, rotate...
 *
 * Ví dụ sử dụng:
 * ```tsx
 * <MotionContainer>
 *   <motion.div variants={varFade().in}>
 *     <h1>Animated Content</h1>
 *   </motion.div>
 * </MotionContainer>
 * ```
 *
 * Tuỳ chỉnh tham số animation:
 * Có thể truyền các tham số sau vào hàm varContainer để điều chỉnh hiệu ứng:
 * - staggerIn: Độ trễ khi con bắt đầu animation (mặc định 0.05s)
 * - delayIn: Độ trễ toàn cục (mặc định 0.05s)
 * - staggerOut: Độ trễ khi con thoát (mặc định 0.05s)
 */
export default function MotionContainer({ children, className }: Props) {
	return (
		<m.div
			// Định nghĩa sẵn tên thuộc tính initial/animate/exit để con không phải lặp lại
			initial="initial"
			animate="animate"
			exit="exit"
			variants={varContainer()}
			className={className}
		>
			{children}
		</m.div>
	);
}
