import { cn } from "@/utils";
import { NavLink } from "react-router";

interface Props {
	size?: number | string;
	className?: string;
}

const resolveFontSize = (size?: number | string) => {
	if (typeof size === "number") {
		return `${size}px`;
	}
	if (typeof size === "string" && size.trim().length > 0) {
		return size;
	}
	return undefined;
};

function Logo({ size = 36, className }: Props) {
	return (
		<NavLink
			to="/"
			className={cn("inline-flex items-center font-semibold uppercase tracking-wide", className)}
			style={{ fontSize: resolveFontSize(size), color: "var(--colors-palette-primary-default)" }}
		>
			<span>ab</span>
		</NavLink>
	);
}

export default Logo;
