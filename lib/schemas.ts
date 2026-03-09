import { z } from "zod";

export const manualTransactionSchema = z.object({
  accountId: z.string().min(1),
  date: z.string(),
  description: z.string().min(2),
  amount: z.coerce.number(),
  direction: z.enum(["credit", "debit"]),
  type: z.enum(["income", "expense", "transfer", "savings", "credit_card_payment"]),
  category: z.string().min(1),
  notes: z.string().optional()
});

export const uploadPreviewSchema = z.object({
  accountId: z.string(),
  sourceFileName: z.string(),
  sourceFileType: z.enum(["csv", "pdf"]),
  rawContent: z.string().min(1)
});
