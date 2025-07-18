import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const artistsTable = sqliteTable("artists", {
  id: text("id").primaryKey().notNull(),
  parentId: text("parentId"),
  name: text("name").notNull(),
  termId: text("termId"),
  contributorId: text("contributorId"),
  fullName: text("fullName"),
  type: text("type"),
  nationalityCode: text("nationalityCode"),
  description: text("description"),
});

export type InsertArtist = typeof artistsTable.$inferInsert;
export type SelectArtist = typeof artistsTable.$inferSelect;
