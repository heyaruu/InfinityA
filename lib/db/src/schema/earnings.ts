import { pgTable, serial, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const earningRecordsTable = pgTable("earning_records", {
  id: serial("id").primaryKey(),
  earningDate: date("earning_date", { mode: "string" }).notNull().unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertEarningRecordSchema = createInsertSchema(earningRecordsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEarningRecord = z.infer<typeof insertEarningRecordSchema>;
export type EarningRecord = typeof earningRecordsTable.$inferSelect;
