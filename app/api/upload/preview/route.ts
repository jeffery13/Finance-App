import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadPreviewSchema } from "@/lib/schemas";
import { parseCsv, parsePdf, toTransactionPreview } from "@/lib/parser";
import { detectDuplicates, detectOverlap } from "@/lib/import-detection";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = uploadPreviewSchema.parse(await req.json());
  const user = await prisma.user.findUniqueOrThrow({ where: { email: DEFAULT_USER_EMAIL } });
  const rows = body.sourceFileType === "csv" ? parseCsv(body.rawContent) : parsePdf(body.rawContent);
  const preview = toTransactionPreview(rows);

  const dates = rows.map((r) => new Date(r.date));
  const start = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  const end = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;

  const duplicateFlags = await detectDuplicates(body.accountId, rows);
  const overlapDetected = await detectOverlap(body.accountId, start, end);

  const imported = await prisma.statementImport.create({
    data: {
      userId: user.id,
      accountId: body.accountId,
      sourceFileName: body.sourceFileName,
      sourceFileType: body.sourceFileType,
      statementStartDate: start,
      statementEndDate: end,
      importStatus: overlapDetected ? "conflict" : "parsed",
      overlapDetected,
      duplicateCount: duplicateFlags.filter(Boolean).length
    }
  });


  await prisma.transaction.createMany({
    data: preview.map((row, idx) => ({
      userId: user.id,
      accountId: body.accountId,
      statementImportId: imported.id,
      date: new Date(row.date),
      description: row.description,
      normalizedDescription: row.normalizedDescription,
      amount: row.amount,
      direction: row.direction,
      type: row.direction === "credit" ? "income" : "expense",
      category: row.direction === "credit" ? "Income" : "Shopping",
      isDuplicate: duplicateFlags[idx],
      isManual: false,
      sourceFileName: body.sourceFileName
    }))
  });

  return NextResponse.json({ importId: imported.id, preview, duplicateFlags, overlapDetected });
}
