import { and, eq, gte, sql } from "drizzle-orm";
import { db, earningRecordsTable } from "@workspace/db";

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgoDateString(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return toDateString(d);
}

export interface EarningsSummary {
  today: number;
  sevenDay: number;
  thirtyDay: number;
  allTime: number;
}

export async function getEarningsSummary(): Promise<EarningsSummary> {
  const todayStr = toDateString(new Date());
  const sevenDayStart = daysAgoDateString(7);
  const thirtyDayStart = daysAgoDateString(30);

  const [todayRow] = await db
    .select({ amount: earningRecordsTable.amount })
    .from(earningRecordsTable)
    .where(eq(earningRecordsTable.earningDate, todayStr));

  const [sevenDayRow] = await db
    .select({ total: sql<string>`coalesce(sum(${earningRecordsTable.amount}), 0)` })
    .from(earningRecordsTable)
    .where(
      and(
        gte(earningRecordsTable.earningDate, sevenDayStart),
        sql`${earningRecordsTable.earningDate} <= ${todayStr}`,
      ),
    );

  const [thirtyDayRow] = await db
    .select({ total: sql<string>`coalesce(sum(${earningRecordsTable.amount}), 0)` })
    .from(earningRecordsTable)
    .where(
      and(
        gte(earningRecordsTable.earningDate, thirtyDayStart),
        sql`${earningRecordsTable.earningDate} <= ${todayStr}`,
      ),
    );

  const [allTimeRow] = await db
    .select({ total: sql<string>`coalesce(sum(${earningRecordsTable.amount}), 0)` })
    .from(earningRecordsTable);

  return {
    today: todayRow ? Number(todayRow.amount) : 0,
    sevenDay: sevenDayRow ? Number(sevenDayRow.total) : 0,
    thirtyDay: thirtyDayRow ? Number(thirtyDayRow.total) : 0,
    allTime: allTimeRow ? Number(allTimeRow.total) : 0,
  };
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
    await setTodayEarning(amount);
    return getEarningsSummary();
  }

  const summary = await getEarningsSummary();
  const delta = amount - summary[field];
  const newToday = Math.max(0, summary.today + delta);
  await setTodayEarning(newToday);
  return getEarningsSummary();
}
