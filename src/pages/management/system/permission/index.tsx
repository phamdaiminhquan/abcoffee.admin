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
	[PermissionType.GROUP]: "Nh\u00f3m",
	[PermissionType.CATALOGUE]: "Danh m\u1ee5c",
	[PermissionType.MENU]: "Menu",
	[PermissionType.COMPONENT]: "Th\u00e0nh ph\u1ea7n",
};

export default function PermissionPage() {
	// const permissions = useUserPermission();

	const [permissionModalProps, setPermissionModalProps] = useState<PermissionModalProps>({
		formValue: { ...defaultPermissionValue },
		title: "T\u1ea1o m\u1edbi",
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
			title: "T\u00ean",
			dataIndex: "name",
			width: 300,
			render: (_, record) => <div>{record.label}</div>,
		},
		{
			title: "Lo\u1ea1i",
			dataIndex: "type",
			width: 60,
			render: (_, record) => <Badge variant="info">{PERMISSION_TYPE_LABEL[record.type]}</Badge>,
		},
		{
			title: "Bi\u1ec3u t\u01b0\u1ee3ng",
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
			title: "Th\u00e0nh ph\u1ea7n",
			dataIndex: "component",
		},
		{
			title: "Tr\u1ea1ng th\u00e1i",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => (
				<Badge variant={status === BasicStatus.DISABLE ? "error" : "success"}>
					{status === BasicStatus.DISABLE ? "T\u1eaft" : "B\u1eadt"}
				</Badge>
			),
		},
		{ title: "Th\u1ee9 t\u1ef1", dataIndex: "order", width: 60 },
		{
			title: "H\u00e0nh \u0111\u1ed9ng",
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
			title: "T\u1ea1o m\u1edbi",
			formValue: { ...defaultPermissionValue, parentId: parentId ?? "" },
		}));
	};

	const onEdit = (formValue: Permission_Old) => {
		setPermissionModalProps((prev) => ({
			...prev,
			show: true,
			title: "Ch\u1ec9nh s\u1eeda",
			formValue,
		}));
	};
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Danh s\u00e1ch quy\u1ec1n</div>
					<Button onClick={() => onCreate()}>T\u1ea1o m\u1edbi</Button>
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
