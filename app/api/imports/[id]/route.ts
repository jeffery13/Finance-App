import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const record = await prisma.statementImport.findUnique({
    where: { id: params.id },
    include: { account: true, transactions: true }
  });
  return NextResponse.json(record);
}
