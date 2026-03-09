"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";

export function ImportsClient() {
  const [imports, setImports] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ accountId: "", sourceFileType: "csv", sourceFileName: "", rawContent: "" });

  const load = async () => {
    const [imp, acc] = await Promise.all([fetch("/api/imports"), fetch("/api/accounts")]);
    setImports(await imp.json());
    setAccounts(await acc.json());
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = async () => {
    const res = await fetch("/api/upload/preview", { method: "POST", body: JSON.stringify(form) });
    const data = await res.json();
    if (data.importId) window.location.href = `/imports/${data.importId}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-3 font-medium">Statement Upload (CSV/PDF text extraction placeholder)</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}><option value="">Select account</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
          <Select value={form.sourceFileType} onChange={(e) => setForm({ ...form, sourceFileType: e.target.value })}><option value="csv">CSV</option><option value="pdf">PDF</option></Select>
          <Input placeholder="Source file name" value={form.sourceFileName} onChange={(e) => setForm({ ...form, sourceFileName: e.target.value })} />
          <Button onClick={upload}>Parse & Preview</Button>
          <textarea className="col-span-full min-h-40 rounded-md border p-2 text-sm" placeholder="Paste CSV rows or PDF-extracted pipe-delimited rows" value={form.rawContent} onChange={(e) => setForm({ ...form, rawContent: e.target.value })} />
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 font-medium">Recent Imports</h3>
        <Table>
          <thead><tr className="border-b"><th>File</th><th>Account</th><th>Status</th><th>Period</th><th>Duplicates</th><th></th></tr></thead>
          <tbody>{imports.map((imp) => <tr className="border-b" key={imp.id}><td>{imp.sourceFileName}</td><td>{imp.account?.name}</td><td>{imp.importStatus}</td><td>{imp.statementStartDate?.slice(0,10)} - {imp.statementEndDate?.slice(0,10)}</td><td>{imp.duplicateCount}</td><td><Link className="underline" href={`/imports/${imp.id}`}>Review</Link></td></tr>)}</tbody>
        </Table>
      </Card>
    </div>
  );
}
