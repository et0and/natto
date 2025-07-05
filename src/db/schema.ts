import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const artistsTable = sqliteTable("artists", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  age: integer("age").notNull(),
  country: text("country").notNull(),
  bornOn: text("born_on")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type InsertArtist = typeof artistsTable.$inferInsert;
export type SelectArtist = typeof artistsTable.$inferSelect;
