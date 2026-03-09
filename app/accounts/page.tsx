"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then(setAccounts);
  }, []);

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Accounts</h2>
      <ul className="space-y-2 text-sm">{accounts.map((a) => <li key={a.id} className="flex justify-between border-b pb-2"><span>{a.name}</span><span>{a.institution} · {a.type}</span></li>)}</ul>
    </Card>
  );
}
