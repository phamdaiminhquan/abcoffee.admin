import { Navigate, type RouteObject } from "react-router";
import { authRoutes } from "./auth";
import { dashboardRoutes } from "./dashboard";
import { mainRoutes } from "./main";

export const routesSection: RouteObject[] = [
	// Khu vực Auth
	...authRoutes,
	// Khu vực Dashboard
	...dashboardRoutes,
	// Khu vực Main
	...mainRoutes,
	// Route không khớp
	{ path: "*", element: <Navigate to="/404" replace /> },
];
