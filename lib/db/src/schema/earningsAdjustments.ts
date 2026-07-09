import { pgTable, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Singleton row storing the manually-set "extra" earned on top of the
 * previous bucket in the cascade: today -> sevenDay -> thirtyDay -> allTime.
 *
 * sevenDay  = today     + sevenDayExtra
 * thirtyDay = sevenDay  + thirtyDayExtra
 * allTime   = thirtyDay + allTimeExtra
 *
 * Editing a smaller window (e.g. today or sevenDay) changes a value that
 * every larger window is built on top of, so it cascades forward
 * automatically. Editing a larger window only changes its own extra, so it
 * never reaches back and changes a smaller window.
 */
export const earningsAdjustmentsTable = pgTable("earnings_adjustments", {
  id: serial("id").primaryKey(),
  sevenDayExtra: numeric("seven_day_extra", { precision: 12, scale: 2 }).notNull().default("0"),
  thirtyDayExtra: numeric("thirty_day_extra", { precision: 12, scale: 2 }).notNull().default("0"),
  allTimeExtra: numeric("all_time_extra", { precision: 12, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertEarningsAdjustmentsSchema = createInsertSchema(earningsAdjustmentsTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertEarningsAdjustments = z.infer<typeof insertEarningsAdjustmentsSchema>;
export type EarningsAdjustments = typeof earningsAdjustmentsTable.$inferSelect;
