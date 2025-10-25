import apiClient from "@/api/coffeeApiClient";
import type { RevenueReportDto } from "#/coffee";

const base = "/revenue";

export const revenueService = {
	getDailyRevenue(date?: string): Promise<RevenueReportDto> {
		const params = date ? { date } : undefined;
		return apiClient.get({ url: `${base}/daily`, params });
	},
	getRevenueRange(startDate: string, endDate: string): Promise<RevenueReportDto[]> {
		return apiClient.get({ url: `${base}/range`, params: { startDate, endDate } });
	},
};

export default revenueService;
