import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";

export async function GET() {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) return NextResponse.json({});

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { account: true },
    orderBy: { date: "desc" }
  });

  const totals = transactions.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount);
      if (tx.type === "income") acc.income += amount;
      if (["expense", "credit_card_payment"].includes(tx.type)) acc.expenses += amount;
      if (tx.type === "savings") acc.savings += amount;
      return acc;
    },
    { income: 0, expenses: 0, savings: 0 }
  );

  return NextResponse.json({
    totals: { ...totals, netCashFlow: totals.income - totals.expenses - totals.savings },
    transactions
  });
}
