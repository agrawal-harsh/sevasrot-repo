import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const sevaDriversTable = pgTable("seva_drives", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  images: text("images").array().notNull().default([]),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSevaDriveSchema = createInsertSchema(sevaDriversTable).omit({ id: true, createdAt: true });
export type InsertSevaDrive = z.infer<typeof insertSevaDriveSchema>;
export type SevaDrive = typeof sevaDriversTable.$inferSelect;
