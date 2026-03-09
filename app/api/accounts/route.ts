import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";

export async function GET() {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) return NextResponse.json([]);
  const accounts = await prisma.account.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(accounts);
}
