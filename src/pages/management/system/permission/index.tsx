import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import Table, { type ColumnsType } from "antd/es/table";
import { isNil } from "ramda";
import { useState } from "react";
import type { Permission_Old } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";
import PermissionModal, { type PermissionModalProps } from "./permission-modal";

const defaultPermissionValue: Permission_Old = {
	id: "",
	parentId: "",
	name: "",
	label: "",
	route: "",
	component: "",
	icon: "",
	hide: false,
	status: BasicStatus.ENABLE,
	type: PermissionType.CATALOGUE,
};

const PERMISSION_TYPE_LABEL: Record<PermissionType, string> = {
	[PermissionType.GROUP]: "Nhóm",
	[PermissionType.CATALOGUE]: "Danh mục",
	[PermissionType.MENU]: "Menu",
	[PermissionType.COMPONENT]: "Thành phần",
};

export default function PermissionPage() {
	// const permissions = useUserPermission();

	const [permissionModalProps, setPermissionModalProps] = useState<PermissionModalProps>({
		formValue: { ...defaultPermissionValue },
		title: "Tạo mới",
		show: false,
		onOk: () => {
			setPermissionModalProps((prev) => ({ ...prev, show: false }));
		},
		onCancel: () => {
			setPermissionModalProps((prev) => ({ ...prev, show: false }));
		},
	});
	const columns: ColumnsType<Permission_Old> = [
		{
			title: "Tên",
			dataIndex: "name",
			width: 300,
			render: (_, record) => <div>{record.label}</div>,
		},
		{
			title: "Loại",
			dataIndex: "type",
			width: 60,
			render: (_, record) => <Badge variant="info">{PERMISSION_TYPE_LABEL[record.type]}</Badge>,
		},
		{
			title: "Biểu tượng",
			dataIndex: "icon",
			width: 60,
			render: (icon: string) => {
				if (isNil(icon)) return "";
				if (icon.startsWith("ic")) {
					return <Icon icon={`local:${icon}`} size={18} className="ant-menu-item-icon" />;
				}
				return <Icon icon={icon} size={18} className="ant-menu-item-icon" />;
			},
		},
		{
			title: "Thành phần",
			dataIndex: "component",
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => (
				<Badge variant={status === BasicStatus.DISABLE ? "error" : "success"}>
					{status === BasicStatus.DISABLE ? "Tắt" : "Bật"}
				</Badge>
			),
		},
		{ title: "Thứ tự", dataIndex: "order", width: 60 },
		{
			title: "Hành động",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-end text-gray">
					{record?.type === PermissionType.CATALOGUE && (
						<Button variant="ghost" size="icon" onClick={() => onCreate(record.id)}>
							<Icon icon="gridicons:add-outline" size={18} />
						</Button>
					)}
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon">
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = (parentId?: string) => {
		setPermissionModalProps((prev) => ({
			...prev,
			show: true,
			...defaultPermissionValue,
			title: "Tạo mới",
			formValue: { ...defaultPermissionValue, parentId: parentId ?? "" },
		}));
	};

	const onEdit = (formValue: Permission_Old) => {
		setPermissionModalProps((prev) => ({
			...prev,
			show: true,
			title: "Chỉnh sửa",
			formValue,
		}));
	};
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Danh sách quyền</div>
					<Button onClick={() => onCreate()}>Tạo mới</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={[]}
				/>
			</CardContent>
			<PermissionModal {...permissionModalProps} />
		</Card>
	);
}
