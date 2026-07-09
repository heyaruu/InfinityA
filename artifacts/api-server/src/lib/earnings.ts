import { eq } from "drizzle-orm";
import { db, earningRecordsTable, earningsAdjustmentsTable } from "@workspace/db";

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface EarningsSummary {
  today: number;
  sevenDay: number;
  thirtyDay: number;
  allTime: number;
}

async function getTodayEarning(): Promise<number> {
  const todayStr = toDateString(new Date());
  const [todayRow] = await db
    .select({ amount: earningRecordsTable.amount })
    .from(earningRecordsTable)
    .where(eq(earningRecordsTable.earningDate, todayStr));

  return todayRow ? Number(todayRow.amount) : 0;
}

// The adjustments table only ever holds one row, fixed at id=1, enforced by
// always upserting on that fixed key so concurrent first-writes can't create
// duplicate rows.
const ADJUSTMENTS_SINGLETON_ID = 1;

async function getOrCreateAdjustments() {
  const [row] = await db
    .insert(earningsAdjustmentsTable)
    .values({ id: ADJUSTMENTS_SINGLETON_ID })
    .onConflictDoNothing({ target: earningsAdjustmentsTable.id })
    .returning();

  if (row) {
    return row;
  }

  const [existing] = await db
    .select()
    .from(earningsAdjustmentsTable)
    .where(eq(earningsAdjustmentsTable.id, ADJUSTMENTS_SINGLETON_ID));

  return existing;
}

/**
 * Builds the full cascade: today -> sevenDay -> thirtyDay -> allTime, where
 * each step is the previous step's value plus a manually-set "extra".
 * Editing a smaller window changes a value every larger window builds on
 * (so it cascades forward), while editing a larger window only changes its
 * own extra (so it never reaches back and changes a smaller window).
 */
export async function getEarningsSummary(): Promise<EarningsSummary> {
  const today = await getTodayEarning();
  const adjustments = await getOrCreateAdjustments();

  const sevenDay = today + Number(adjustments.sevenDayExtra);
  const thirtyDay = sevenDay + Number(adjustments.thirtyDayExtra);
  const allTime = thirtyDay + Number(adjustments.allTimeExtra);

  return { today, sevenDay, thirtyDay, allTime };
}

export async function setTodayEarning(amount: number): Promise<void> {
  const todayStr = toDateString(new Date());

  await db
    .insert(earningRecordsTable)
    .values({ earningDate: todayStr, amount: amount.toFixed(2) })
    .onConflictDoUpdate({
      target: earningRecordsTable.earningDate,
      set: { amount: amount.toFixed(2) },
    });
}

export type EarningMetricField = "today" | "sevenDay" | "thirtyDay" | "allTime";

export async function setEarningMetric(field: EarningMetricField, amount: number): Promise<EarningsSummary> {
  if (field === "today") {
    // Editing today only changes the ledger; sevenDay/thirtyDay/allTime are
    // all built on top of today, so they cascade forward automatically.
    await setTodayEarning(amount);
    return getEarningsSummary();
  }

  const adjustments = await getOrCreateAdjustments();
  const today = await getTodayEarning();

  if (field === "sevenDay") {
    // sevenDay = today + sevenDayExtra -> solve for the new extra.
    // thirtyDay/allTime cascade forward since they build on sevenDay.
    await db
      .update(earningsAdjustmentsTable)
      .set({ sevenDayExtra: (amount - today).toFixed(2) })
      .where(eq(earningsAdjustmentsTable.id, adjustments.id));
  } else if (field === "thirtyDay") {
    // thirtyDay = sevenDay + thirtyDayExtra -> solve for the new extra.
    // allTime cascades forward; today and sevenDay stay untouched.
    const sevenDay = today + Number(adjustments.sevenDayExtra);
    await db
      .update(earningsAdjustmentsTable)
      .set({ thirtyDayExtra: (amount - sevenDay).toFixed(2) })
      .where(eq(earningsAdjustmentsTable.id, adjustments.id));
  } else if (field === "allTime") {
    // allTime = thirtyDay + allTimeExtra -> solve for the new extra.
    // Nothing cascades further; today/sevenDay/thirtyDay stay untouched.
    const sevenDay = today + Number(adjustments.sevenDayExtra);
    const thirtyDay = sevenDay + Number(adjustments.thirtyDayExtra);
    await db
      .update(earningsAdjustmentsTable)
      .set({ allTimeExtra: (amount - thirtyDay).toFixed(2) })
      .where(eq(earningsAdjustmentsTable.id, adjustments.id));
  }

  return getEarningsSummary();
}
