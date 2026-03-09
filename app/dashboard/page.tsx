import { DashboardClient } from "@/components/dashboard/dashboard-client";

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/dashboard`, { cache: "no-store" });
  return res.json();
}

export default async function DashboardPage() {
  const data = await getData();
  return <DashboardClient totals={data.totals || { income: 0, expenses: 0, savings: 0, netCashFlow: 0 }} transactions={data.transactions || []} />;
}
