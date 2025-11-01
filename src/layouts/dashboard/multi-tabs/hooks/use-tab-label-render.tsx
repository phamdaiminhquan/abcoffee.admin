import { USER_LIST } from "@/_mock/assets";
import { useMemo } from "react";
import type { KeepAliveTab } from "../types";

export function useTabLabelRender() {
	const specialTabRenderMap = useMemo<Record<string, (tab: KeepAliveTab) => React.ReactNode>>(
		() => ({
			"sys.nav.system.user_detail": (tab: KeepAliveTab) => {
				const userId = tab.params?.id;
				const defaultLabel = tab.label;
				if (userId) {
					const user = USER_LIST.find((item) => item.id === userId);
					return `${user?.username}-${defaultLabel}`;
				}
				return defaultLabel;
			},
		}),
		[],
	);

	const renderTabLabel = (tab: KeepAliveTab) => {
		const specialRender = specialTabRenderMap[tab.label];
		if (specialRender) {
			return specialRender(tab);
		}
		return tab.label;
	};

	return renderTabLabel;
}
