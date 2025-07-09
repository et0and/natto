import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const artistsTable = sqliteTable("artists", {
  id: text(),
  parentId: text(),
  name: text(),
  termId: text(),
  contributorId: text(),
  fullName: text(),
  type: text(),
  nationalityCode: text(),
  description: text(),
});

export type InsertArtist = typeof artistsTable.$inferInsert;
export type SelectArtist = typeof artistsTable.$inferSelect;
