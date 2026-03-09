import { prisma } from "@/lib/prisma";
import { normalizeDescription } from "@/lib/utils";

type Candidate = {
  date: string;
  amount: number;
  description: string;
};

const similarity = (a: string, b: string) => {
  const aa = normalizeDescription(a);
  const bb = normalizeDescription(b);
  if (aa === bb) return 1;
  const hit = aa.split(" ").filter((w) => bb.includes(w)).length;
  return hit / Math.max(aa.split(" ").length, 1);
};

export async function detectOverlap(accountId: string, start?: Date | null, end?: Date | null) {
  if (!start || !end) return false;
  const overlapping = await prisma.statementImport.findFirst({
    where: {
      accountId,
      importStatus: { in: ["approved", "parsed", "draft", "conflict"] },
      statementStartDate: { lte: end },
      statementEndDate: { gte: start }
    }
  });
  return Boolean(overlapping);
}

export async function detectDuplicates(accountId: string, rows: Candidate[]) {
  const dates = rows.map((r) => new Date(r.date));
  const existing = await prisma.transaction.findMany({
    where: {
      accountId,
      date: { gte: new Date(Math.min(...dates.map((d) => d.getTime()))), lte: new Date(Math.max(...dates.map((d) => d.getTime()))) }
    }
  });

  return rows.map((row) => {
    const match = existing.find((tx) => {
      const sameDate = tx.date.toISOString().slice(0, 10) === row.date;
      const sameAmount = Number(tx.amount) === row.amount;
      const descScore = similarity(tx.description, row.description);
      return sameDate && sameAmount && descScore >= 0.6;
    });
    return Boolean(match);
  });
}
