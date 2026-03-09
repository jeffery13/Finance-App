"use client";

import { Card } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Tx = {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: string;
  account: { name: string };
  description: string;
};

export function DashboardClient({ totals, transactions }: { totals: any; transactions: Tx[] }) {
  const spendingByCategory = Object.entries(
    transactions.reduce<Record<string, number>>((acc, tx) => {
      if (tx.type === "expense" || tx.type === "credit_card_payment") acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const spendingByAccount = Object.entries(
    transactions.reduce<Record<string, number>>((acc, tx) => {
      if (tx.type === "expense" || tx.type === "credit_card_payment") acc[tx.account.name] = (acc[tx.account.name] || 0) + Number(tx.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const monthly = Object.values(
    transactions.reduce<Record<string, { month: string; income: number; expenses: number }>>((acc, tx) => {
      const month = tx.date.slice(0, 7);
      acc[month] = acc[month] || { month, income: 0, expenses: 0 };
      if (tx.type === "income") acc[month].income += Number(tx.amount);
      if (tx.type !== "income") acc[month].expenses += Number(tx.amount);
      return acc;
    }, {})
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Income", totals.income],
          ["Total Expenses", totals.expenses],
          ["Total Saved", totals.savings],
          ["Net Cash Flow", totals.netCashFlow]
        ].map(([label, value]) => (
          <Card key={label as string}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold">${Number(value).toFixed(2)}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-medium">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={spendingByCategory} dataKey="value" nameKey="name" outerRadius={90} /><Tooltip /></PieChart></ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-3 font-medium">Spending by Account</h3>
          <ResponsiveContainer width="100%" height={280}><BarChart data={spendingByAccount}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="value" fill="#0f172a" /></BarChart></ResponsiveContainer>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-medium">Monthly Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}><BarChart data={monthly}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="income" fill="#16a34a" /><Bar dataKey="expenses" fill="#dc2626" /></BarChart></ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-3 font-medium">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={280}><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="expenses" stroke="#2563eb" strokeWidth={2} /></LineChart></ResponsiveContainer>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-medium">Recent Transactions</h3>
          <div className="space-y-2 text-sm">{transactions.slice(0, 8).map((tx) => <div key={tx.id} className="flex justify-between"><span>{tx.description}</span><span>${Number(tx.amount).toFixed(2)}</span></div>)}</div>
        </Card>
      </div>
    </div>
  );
}
