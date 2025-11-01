import { useSettings } from "@/store/settingStore";
import { useEffect } from "react";
import { HtmlDataAttribute } from "#/enum";
import type { UILibraryAdapter } from "./type";
interface ThemeProviderProps {
	children: React.ReactNode;
	adapters?: UILibraryAdapter[];
}

export function ThemeProvider({ children, adapters = [] }: ThemeProviderProps) {
	const { themeMode, themeColorPresets, fontFamily, fontSize } = useSettings();

	// Cập nhật class HTML để hỗ trợ chế độ tối của Tailwind
	useEffect(() => {
		const root = window.document.documentElement;
		root.setAttribute(HtmlDataAttribute.ThemeMode, themeMode);
	}, [themeMode]);

	// Cập nhật động các biến CSS liên quan tới màu chủ đề
	useEffect(() => {
		const root = window.document.documentElement;
		root.setAttribute(HtmlDataAttribute.ColorPalette, themeColorPresets);
	}, [themeColorPresets]);

	// Cập nhật kích thước chữ và bộ font
	useEffect(() => {
		const root = window.document.documentElement;
		root.style.fontSize = `${fontSize}px`;

		const body = window.document.body;
		body.style.fontFamily = fontFamily;
	}, [fontFamily, fontSize]);

	// Bọc children bằng các adapter
	const wrappedWithAdapters = adapters.reduce(
		(children, Adapter) => (
			<Adapter key={Adapter.name} mode={themeMode}>
				{children}
			</Adapter>
		),
		children,
	);

	return wrappedWithAdapters;
}
