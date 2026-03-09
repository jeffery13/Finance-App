import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manualTransactionSchema } from "@/lib/schemas";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";
import { normalizeDescription } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) return NextResponse.json([]);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      accountId: params.get("accountId") || undefined,
      category: params.get("category") || undefined,
      type: (params.get("type") as any) || undefined,
      date: params.get("from")
        ? {
            gte: new Date(params.get("from") as string),
            lte: params.get("to") ? new Date(params.get("to") as string) : undefined
          }
        : undefined,
      description: params.get("q") ? { contains: params.get("q") as string, mode: "insensitive" } : undefined
    },
    include: { account: true },
    orderBy: { date: "desc" },
    take: 300
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const payload = manualTransactionSchema.parse(await req.json());
  const user = await prisma.user.findUniqueOrThrow({ where: { email: DEFAULT_USER_EMAIL } });
  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: payload.accountId,
      date: new Date(payload.date),
      description: payload.description,
      normalizedDescription: normalizeDescription(payload.description),
      amount: Math.abs(payload.amount),
      direction: payload.direction,
      type: payload.type,
      category: payload.category,
      notes: payload.notes,
      isManual: true
    }
  });

  return NextResponse.json(tx, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, ...payload } = await req.json();
  const tx = await prisma.transaction.update({ where: { id }, data: payload });
  return NextResponse.json(tx);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
