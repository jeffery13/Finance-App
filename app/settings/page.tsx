import { Card } from "@/components/ui/card";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-slate-600">Categories can be edited transaction-by-transaction and used in filters.</p>
      </Card>
      <Card>
        <h3 className="mb-2 font-medium">Default Categories</h3>
        <ul className="grid gap-2 md:grid-cols-2">{DEFAULT_CATEGORIES.map((c) => <li key={c} className="rounded border p-2 text-sm">{c}</li>)}</ul>
      </Card>
    </div>
  );
}
