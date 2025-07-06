import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const artistsTable = sqliteTable("artists", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  name: text("name"),
  termId: text("term_id"),
  contributorId: text("contributor_id"),
  fullName: text("full_name"),
  type: text("type"),
  nationalityCode: text("nationality_code"),
  description: text("description"),
});

export type InsertArtist = typeof artistsTable.$inferInsert;
export type SelectArtist = typeof artistsTable.$inferSelect;
