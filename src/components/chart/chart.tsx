import ApexChart from "react-apexcharts";
import { chartWrapper } from "./styles.css";

import type { Props as ApexChartProps } from "react-apexcharts";

export function Chart(props: ApexChartProps) {
	return (
		<div className={chartWrapper}>
			<ApexChart
				{...props}
				options={{
					...props.options,
					chart: {
						...props.options?.chart,
						// Tối ưu hiệu năng khi thay đổi kích thước
						animations: {
							...props.options?.chart?.animations,
							enabled: true,
							speed: 200, // Giảm thời gian hoạt ảnh
							animateGradually: {
								enabled: false, // Tắt hoạt ảnh từng bước
							},
							dynamicAnimation: {
								enabled: true,
								speed: 200, // Giảm thời gian hoạt ảnh động
							},
						},
						// Cho phép tái vẽ khi kích thước thay đổi để giữ cảm giác mượt
						redrawOnParentResize: true,
						redrawOnWindowResize: true,
					},
				}}
			/>
		</div>
	);
}
