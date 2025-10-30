import "dayjs/locale/zh-cn";
import "dayjs/locale/vi";
import en_US from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import type { Locale as AntdLocal } from "antd/es/locale";
import { LocalEnum } from "#/enum";

type Locale = keyof typeof LocalEnum;
type Language = {
	locale: keyof typeof LocalEnum;
	icon: string;
	label: string;
	antdLocal: AntdLocal;
};

export const LANGUAGE_MAP: Record<Locale, Language> = {
	[LocalEnum.en_US]: {
		locale: LocalEnum.en_US,
		label: "English",
		icon: "flag-us",
		antdLocal: en_US,
	},
	[LocalEnum.vi_VN]: {
		locale: LocalEnum.vi_VN,
		label: "Vietnamese",
		icon: "flag-vn",
		antdLocal: viVN,
	},
};

export default function useLocale() {
	const { t, i18n } = useTranslation();

	const locale = (i18n.resolvedLanguage || LocalEnum.en_US) as Locale;
	const language = LANGUAGE_MAP[locale];

	const setLocale = (locale: Locale) => {
		i18n.changeLanguage(locale);
		document.documentElement.lang = locale;
		const dayjsLocaleMap: Record<string, string> = { en_US: "en", vi_VN: "vi" };
		dayjs.locale(dayjsLocaleMap[locale] || "vi");
	};

	return {
		t,
		locale,
		language,
		setLocale,
	};
}
