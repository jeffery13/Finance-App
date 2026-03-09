"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manualTransactionSchema } from "@/lib/schemas";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";

export function TransactionsClient() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filters, setFilters] = useState({ q: "", accountId: "", category: "", type: "" });

  const form = useForm({
    resolver: zodResolver(manualTransactionSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), direction: "debit", type: "expense", category: "Food", amount: 0 }
  });

  const load = async () => {
    const qs = new URLSearchParams(filters as Record<string, string>).toString();
    const [txRes, accRes] = await Promise.all([fetch(`/api/transactions?${qs}`), fetch("/api/accounts")]);
    setTransactions(await txRes.json());
    setAccounts(await accRes.json());
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    await fetch("/api/transactions", { method: "POST", body: JSON.stringify(values) });
    form.reset();
    await load();
  });

  const bulkSetCategory = async (category: string) => {
    await Promise.all(transactions.slice(0, 5).map((t) => fetch("/api/transactions", { method: "PATCH", body: JSON.stringify({ id: t.id, category }) })));
    await load();
  };

  return (
    <div className="space-y-4">
      <Card className="grid gap-3 md:grid-cols-4">
        <Input placeholder="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <Select value={filters.accountId} onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}><option value="">All Accounts</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
        <Select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All Categories</option>{DEFAULT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Button onClick={() => load()}>Apply Filters</Button>
      </Card>

      <Card>
        <h3 className="mb-3 font-medium">Add Manual Transaction</h3>
        <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-4">
          <Select {...form.register("accountId")}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
          <Input type="date" {...form.register("date")} />
          <Input placeholder="Description" {...form.register("description")} />
          <Input type="number" step="0.01" {...form.register("amount", { valueAsNumber: true })} />
          <Select {...form.register("direction")}><option value="debit">Debit</option><option value="credit">Credit</option></Select>
          <Select {...form.register("type")}><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option><option value="savings">Savings</option><option value="credit_card_payment">Credit Card Payment</option></Select>
          <Select {...form.register("category")}>{DEFAULT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <Card>
        <div className="mb-2 flex justify-between"><h3 className="font-medium">Transactions</h3><Button onClick={() => bulkSetCategory("Shopping")}>Bulk Set Category (Top 5)</Button></div>
        <Table>
          <thead><tr className="border-b"><th>Date</th><th>Description</th><th>Account</th><th>Type</th><th>Category</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b">
                <td>{new Date(t.date).toISOString().slice(0, 10)}</td><td>{t.description}</td><td>{t.account?.name}</td><td>{t.type}</td><td>{t.category}</td><td>${Number(t.amount).toFixed(2)}</td>
                <td><button onClick={async () => { await fetch("/api/transactions", { method: "DELETE", body: JSON.stringify({ id: t.id }) }); await load(); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
