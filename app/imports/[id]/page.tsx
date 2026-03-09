"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

export default function ImportReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);

  const load = async () => {
    const res = await fetch(`/api/imports/${id}`);
    setRecord(await res.json());
  };

  useEffect(() => {
    void load();
  }, [id]);

  const updateStatus = async (importStatus: string) => {
    await fetch("/api/imports", { method: "PATCH", body: JSON.stringify({ id, importStatus }) });
    await load();
  };

  if (!record) return null;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Import Review</h2>
        <p>File: {record.sourceFileName}</p>
        <p>Account: {record.account?.name}</p>
        <p>Statement period: {record.statementStartDate?.slice(0, 10)} - {record.statementEndDate?.slice(0, 10)}</p>
        <p>Transaction count: {record.transactions?.length || 0}</p>
        <p>Possible duplicates: {record.duplicateCount}</p>
        <p>Overlap detected: {record.overlapDetected ? "Yes" : "No"}</p>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => updateStatus("approved")}>Approve Import</Button>
          <Button className="bg-red-600" onClick={() => updateStatus("rejected")}>Reject Import</Button>
          <Button className="bg-amber-600" onClick={() => updateStatus("conflict")}>Review Manually</Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-2 font-medium">Preview Table</h3>
        <Table>
          <thead><tr className="border-b"><th>Date</th><th>Description</th><th>Amount</th><th>Category</th><th>Duplicate</th></tr></thead>
          <tbody>{record.transactions?.map((tx: any) => <tr key={tx.id} className="border-b"><td>{tx.date.slice(0,10)}</td><td>{tx.description}</td><td>${Number(tx.amount).toFixed(2)}</td><td>{tx.category}</td><td>{tx.isDuplicate ? "Yes" : "No"}</td></tr>)}</tbody>
        </Table>
      </Card>
    </div>
  );
}
