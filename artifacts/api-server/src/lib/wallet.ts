import { desc, eq, sql } from "drizzle-orm";
import { db, withdrawalRequestsTable } from "@workspace/db";
import { getEarningsSummary } from "./earnings";

export interface WithdrawalHistoryItem {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  history: WithdrawalHistoryItem[];
}

function toHistoryItem(row: typeof withdrawalRequestsTable.$inferSelect): WithdrawalHistoryItem {
  return {
    id: row.id,
    amount: Number(row.amount),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

async function getTotalWithdrawn(): Promise<number> {
  const rows = await db
    .select({ amount: withdrawalRequestsTable.amount })
    .from(withdrawalRequestsTable)
    .where(eq(withdrawalRequestsTable.status, "success"));

  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function getWalletSummary(): Promise<WalletSummary> {
  const earnings = await getEarningsSummary();
  const totalWithdrawn = await getTotalWithdrawn();

  const history = await db
    .select()
    .from(withdrawalRequestsTable)
    .orderBy(desc(withdrawalRequestsTable.createdAt))
    .limit(10);

  return {
    balance: Math.max(earnings.allTime - totalWithdrawn, 0),
    history: history.map(toHistoryItem),
  };
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super("Withdrawal amount exceeds available wallet balance");
  }
}

export async function requestWithdrawal(amount: number): Promise<WalletSummary> {
  // Run the balance check and the insert inside a single serializable
  // transaction so two concurrent withdrawal requests can't both read the
  // same balance and both succeed, overspending the wallet.
  await db.transaction(async (tx) => {
    await tx.execute(sql`set transaction isolation level serializable`);

    const earnings = await getEarningsSummary();
    const withdrawnRows = await tx
      .select({ amount: withdrawalRequestsTable.amount })
      .from(withdrawalRequestsTable)
      .where(eq(withdrawalRequestsTable.status, "success"));
    const totalWithdrawn = withdrawnRows.reduce((sum, row) => sum + Number(row.amount), 0);
    const balance = Math.max(earnings.allTime - totalWithdrawn, 0);

    if (amount > balance) {
      throw new InsufficientBalanceError();
    }

    await tx.insert(withdrawalRequestsTable).values({ amount: amount.toFixed(2), status: "success" });
  });

  return getWalletSummary();
}
