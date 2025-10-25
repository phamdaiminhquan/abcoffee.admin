import { useQuery } from "@tanstack/react-query";
import revenueService from "@/api/services/revenueService";
import type { RevenueReportDto } from "#/coffee";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { useState } from "react";

export default function RevenuePage() {
	const [date, setDate] = useState<string>("");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	const { data: daily } = useQuery<RevenueReportDto>({
		queryKey: ["revenue", "daily", date || "today"],
		queryFn: () => revenueService.getDailyRevenue(date || undefined),
	});

	const { data: range } = useQuery<RevenueReportDto[]>({
		queryKey: ["revenue", "range", startDate, endDate],
		queryFn: () => revenueService.getRevenueRange(startDate, endDate),
		enabled: Boolean(startDate && endDate),
	});

	return (
		<Card>
			<CardContent>
				<h2 className="text-lg font-semibold mb-4">Revenue</h2>

				<div className="grid gap-4 md:grid-cols-2">
					<section className="space-y-3">
						<h3 className="font-semibold">Daily revenue</h3>
						<div>
							<Label htmlFor="date">Date (YYYY-MM-DD)</Label>
							<Input
								id="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								placeholder="Leave empty for today"
							/>
						</div>
						{daily && (
							<div className="rounded border p-3 text-sm">
								<div>Date: {daily.date}</div>
								<div>Total orders: {daily.totalOrders}</div>
								<div>Total revenue: {daily.totalRevenue.toLocaleString("vi-VN")} VND</div>
								<div>
									Breakdown: cash {daily.paymentMethodBreakdown.cash.toLocaleString("vi-VN")} • bank_transfer{" "}
									{daily.paymentMethodBreakdown.bank_transfer.toLocaleString("vi-VN")}
								</div>
							</div>
						)}
					</section>

					<section className="space-y-3">
						<h3 className="font-semibold">Revenue range</h3>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label htmlFor="start">Start date</Label>
								<Input
									id="start"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									placeholder="YYYY-MM-DD"
								/>
							</div>
							<div>
								<Label htmlFor="end">End date</Label>
								<Input id="end" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="YYYY-MM-DD" />
							</div>
						</div>
						{range && (
							<ul className="space-y-2">
								{range.map((r) => (
									<li key={r.date} className="rounded border p-3 text-sm">
										<div className="font-medium">{r.date}</div>
										<div>Total orders: {r.totalOrders}</div>
										<div>Total revenue: {r.totalRevenue.toLocaleString("vi-VN")} VND</div>
										<div>
											Breakdown: cash {r.paymentMethodBreakdown.cash.toLocaleString("vi-VN")} • bank_transfer{" "}
											{r.paymentMethodBreakdown.bank_transfer.toLocaleString("vi-VN")}
										</div>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>
			</CardContent>
		</Card>
	);
}
