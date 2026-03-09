import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";

export async function GET() {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) return NextResponse.json([]);
  const imports = await prisma.statementImport.findMany({
    where: { userId: user.id },
    include: { account: true },
    orderBy: { uploadedAt: "desc" }
  });

  return NextResponse.json(imports);
}

export async function PATCH(req: NextRequest) {
  const { id, importStatus } = await req.json();
  const updated = await prisma.statementImport.update({ where: { id }, data: { importStatus } });
  return NextResponse.json(updated);
}
