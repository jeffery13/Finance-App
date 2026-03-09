import { normalizeDescription } from "@/lib/utils";

export type ParsedRow = {
  date: string;
  description: string;
  amount: number;
  direction: "credit" | "debit";
};

const parseDate = (value: string) => {
  const normalized = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  const parts = normalized.split(/[\/\-]/);
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y.length === 2 ? `20${y}` : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return new Date(normalized).toISOString().slice(0, 10);
};

export function parseCsv(content: string): ParsedRow[] {
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const dateIndex = headers.findIndex((h) => ["date", "transaction date"].includes(h));
  const descIndex = headers.findIndex((h) => ["description", "details"].includes(h));
  const amountIndex = headers.findIndex((h) => h === "amount");
  const debitIndex = headers.findIndex((h) => h === "debit");
  const creditIndex = headers.findIndex((h) => h === "credit");

  return lines.slice(1).filter(Boolean).map((line) => {
    const cols = line.split(",");
    let amount = 0;
    let direction: "credit" | "debit" = "debit";

    if (amountIndex >= 0) {
      amount = Math.abs(Number(cols[amountIndex]));
      direction = Number(cols[amountIndex]) >= 0 ? "credit" : "debit";
    } else {
      const debit = Number(cols[debitIndex] || 0);
      const credit = Number(cols[creditIndex] || 0);
      amount = Math.abs(credit || debit);
      direction = credit > 0 ? "credit" : "debit";
    }

    return {
      date: parseDate(cols[dateIndex]),
      description: cols[descIndex]?.trim() ?? "",
      amount,
      direction
    };
  });
}

export function parsePdf(content: string): ParsedRow[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [date, ...rest] = line.split("|");
      const [description, amountToken] = rest.join("|").split("$");
      const amount = Number(amountToken?.replace(/[^0-9.-]/g, "") || 0);
      return {
        date: parseDate(date),
        description: description.trim(),
        amount: Math.abs(amount),
        direction: amount >= 0 ? "credit" : "debit"
      };
    });
}

export const toTransactionPreview = (rows: ParsedRow[]) =>
  rows.map((row) => ({
    ...row,
    normalizedDescription: normalizeDescription(row.description)
  }));
