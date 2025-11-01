import color from "color";
import { type AddChannelToLeaf, themeTokens } from "../theme/type";

/**
 * @example
 * const rgb = rgbAlpha("#000000", 0.24);
 * console.log(rgb); // "rgba(0, 0, 0, 0.24)"
 *
 * const rgb = rgbAlpha("var(--colors-palette-primary-main)", 0.24);
 * console.log(rgb); // "rgba(var(--colors-palette-primary-main) / 0.24)"
 *
 * const rgb = rgbAlpha("rgb(var(--colors-palette-primary-main))", 0.24);
 * console.log(rgb); // "rgba(rgb(var(--colors-palette-primary-main)) / 0.24)"
 *
 * const rgb = rgbAlpha([200, 250, 214], 0.24);
 * console.log(rgb); // "rgba(200, 250, 214, 0.24)"
 *
 * const rgb = rgbAlpha("200 250 214", 0.24);
 * console.log(rgb); // "rgba(200, 250, 214, 0.24)"
 */
export function rgbAlpha(colorVal: string | string[] | number[], alpha: number): string {
	// Đảm bảo giá trị alpha nằm trong khoảng 0-1
	const safeAlpha = Math.max(0, Math.min(1, alpha));

	// Nếu màu là biến CSS
	if (typeof colorVal === "string") {
		if (colorVal.startsWith("#")) {
			return color(colorVal).alpha(safeAlpha).toString();
		}
		if (colorVal.includes("var(")) {
			return `rgba(${colorVal} / ${safeAlpha})`;
		}
		if (colorVal.startsWith("--")) {
			return `rgba(var(${colorVal}) / ${safeAlpha})`;
		}

		// Xử lý chuỗi dạng "200, 250, 214" hoặc "200 250 214"
		if (colorVal.includes(",") || colorVal.includes(" ")) {
			const rgb = colorVal
				.split(/[,\s]+/)
				.map((n) => n.trim())
				.filter(Boolean);
			return `rgba(${rgb.join(", ")}, ${safeAlpha})`;
		}
	}

	// Xử lý mảng dạng [200, 250, 214]
	if (Array.isArray(colorVal)) {
		return `rgba(${colorVal.join(", ")}, ${safeAlpha})`;
	}

	throw new Error("Invalid color format");
}

/**
 * Chuyển property sang biến CSS
 * @param propertyPath ví dụ: `colors.palette.primary`
 * @returns ví dụ: `--colors-palette-primary`
 */
export const toCssVar = (propertyPath: string) => {
	return `--${propertyPath.split(".").join("-")}`;
};

/**
 * Chuyển các biến thành đối tượng dùng cho Tailwind
 */
export const createTailwinConfg = (propertyPath: string) => {
	const variants = getThemeTokenVariants(propertyPath);
	const result = variants.reduce(
		(acc, variant) => {
			acc[variant] = `var(${toCssVar(`${propertyPath}-${variant}`)})`;
			return acc;
		},
		{} as Record<string, string>,
	);
	return result;
};

/**
 * Lấy giá trị RGB từ các channel màu
 * @param propertyPath ví dụ: `colors.palette.primary`
 * @returns ví dụ: `{ DEFAULT: "rgb(var(--colors-palette-primary-defaultChannel))" }`
 */
export const creatColorChannel = (propertyPath: string) => {
	const variants = getThemeTokenVariants(propertyPath);
	const result = variants.reduce(
		(acc, variant) => {
			const variantKey = variant === "default" ? "DEFAULT" : variant;
			acc[variantKey] = `rgb(var(${toCssVar(`${propertyPath}-${variant}Channel`)}))`;
			return acc;
		},
		{} as Record<string, string>,
	);
	return result;
};

/**
 * Lấy danh sách variant trong {@link themeTokens}
 * @param propertyPath ví dụ: `colors.palette.primary`
 * @returns ví dụ: `["lighter", "light", "main", "dark", "darker"]`
 */
export const getThemeTokenVariants = (propertyPath: string) => {
	const keys = propertyPath.split(".");
	const val = keys.reduce((obj: any, key) => {
		if (obj && typeof obj === "object") {
			return obj[key];
		}
		return;
	}, themeTokens);

	return val ? Object.keys(val) : [];
};

/**
 * Loại bỏ đơn vị px khỏi chuỗi
 * @param value ví dụ: "16px"
 * @returns ví dụ: 16
 */
/**
 * Loại bỏ đơn vị px và chuyển sang số
 * @param value ví dụ: "16px", "16.5px", "-16px", "16", 16
 * @returns ví dụ: 16, 16.5, -16, 16, 16
 * @throws Lỗi nếu giá trị không hợp lệ
 */
export const removePx = (value: string | number): number => {
	// Nếu đã là số thì trả về ngay
	if (typeof value === "number") return value;

	// Nếu là chuỗi rỗng thì báo lỗi
	if (!value) {
		throw new Error("Invalid value: empty string");
	}

	// Loại bỏ toàn bộ khoảng trắng
	const trimmed = value.trim();

	// Kiểm tra có kết thúc bằng px hay không (không phân biệt hoa thường)
	const hasPx = /px$/i.test(trimmed);

	// Lấy phần số
	const num = hasPx ? trimmed.slice(0, -2) : trimmed;

	// Chuyển thành số
	const result = Number.parseFloat(num);

	// Kiểm tra kết quả có hợp lệ không
	if (Number.isNaN(result)) {
		throw new Error(`Invalid value: ${value}`);
	}

	return result;
};

/**
 * Thêm các channel màu vào token {@link themeTokens}
 * @param obj ví dụ: `{ palette: { primary: "#000000" } }`
 * @returns ví dụ: `{ palette: { primary: "#000000", primaryChannel: "0, 0, 0" } }`
 */
export const addColorChannels = <T extends Record<string, any>>(obj: T): AddChannelToLeaf<T> => {
	const result: Record<string, any> = {};

	// Kiểm tra object hiện tại có phải là node lá hay không
	const isLeafObject = Object.values(obj).every((v) => v === null || typeof v === "string");

	if (isLeafObject) {
		// Thêm channel cho object lá
		for (const [key, value] of Object.entries(obj)) {
			result[key] = value;
			result[`${key}Channel`] = color(value).rgb().array().join(" ");
		}
	} else {
		// Đệ quy xử lý các object con
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === "object" && value !== null) {
				result[key] = addColorChannels(value);
			} else {
				result[key] = value;
			}
		}
	}

	return result as AddChannelToLeaf<T>;
};
