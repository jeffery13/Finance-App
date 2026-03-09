import { PrismaClient, AccountType } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Income",
  "Food",
  "Gas / Transportation",
  "Shopping",
  "Subscriptions",
  "Entertainment",
  "Education",
  "Utilities",
  "Savings",
  "Transfer",
  "Credit Card Payment"
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@fintrack.local" },
    update: {},
    create: { email: "demo@fintrack.local", name: "Demo User" }
  });

  const accounts = [
    ["Wells Fargo Checking", "Wells Fargo", AccountType.checking],
    ["Capital One 360 Checking", "Capital One", AccountType.checking],
    ["Apple Card", "Apple", AccountType.credit_card],
    ["Amex Blue Cash Everyday", "American Express", AccountType.credit_card],
    ["Amex Blue Cash Preferred", "American Express", AccountType.credit_card]
  ] as const;

  for (const [name, institution, type] of accounts) {
    await prisma.account.upsert({
      where: { id: `${user.id}-${name}` },
      update: {},
      create: { id: `${user.id}-${name}`, userId: user.id, name, institution, type }
    });
  }

  for (const category of categories) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: `${user.id}-Wells Fargo Checking`,
        date: new Date(),
        description: `Sample ${category}`,
        normalizedDescription: `sample ${category.toLowerCase()}`,
        amount: 0,
        direction: "debit",
        type: category === "Income" ? "income" : "expense",
        category,
        isManual: true
      }
    });
  }
}

main().finally(() => prisma.$disconnect());
