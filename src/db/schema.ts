import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const artistsTable = sqliteTable("artists", {
  id: integer("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  name: text("name").notNull(),
  termId: integer("term_id").notNull(),
  fullName: text("full_name"),
  contributorId: text("contributor_id").notNull(),
  artistType: text("artist_type"),
  description: text("description"),
  country: text("country").notNull(),
});

export type InsertArtist = typeof artistsTable.$inferInsert;
export type SelectArtist = typeof artistsTable.$inferSelect;
