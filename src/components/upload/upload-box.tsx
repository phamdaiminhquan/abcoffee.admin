import { Icon } from "@/components/icon";
import type { UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import type { ReactElement } from "react";
import { StyledUploadBox } from "./styles";

interface Props extends UploadProps {
	placeholder?: ReactElement;
	height?: number | string;
}
export function UploadBox({ placeholder, className, height, ...other }: Props) {
	return (
		<StyledUploadBox className={className} $height={height}>
			<Dragger {...other} showUploadList={false} className="!h-full !w-full">
				<div className="h-full w-full opacity-100 hover:opacity-80">
					{placeholder || (
						<div className="mx-auto flex h-16 w-16 items-center justify-center">
							<Icon icon="eva:cloud-upload-fill" size={28} />
						</div>
					)}
				</div>
			</Dragger>
		</StyledUploadBox>
	);
}
