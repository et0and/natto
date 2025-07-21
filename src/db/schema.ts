import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

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

export const tomicaTable = sqliteTable("cars", {
  id: text("id").primaryKey().notNull(),
  number: text("number"),
  model: text("model"),
  brand: text("brand"),
  year: text("date"),
  colour: text("colour"),
  description: text("description"),
});

export const bookTable = sqliteTable("books", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  year: text("year"),
  genre: text("genre"),
  description: text("description"),
});

export const galleriesTable = sqliteTable("galleries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  website: text("website").notNull(),
  email: text("email").notNull(),
  artists: text("artists"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  status: integer("status").notNull().default(1), // 0 = inactive, 1 = active
  opened: integer("opened"), // Year as number (YYYY)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type InsertArtist = typeof artistsTable.$inferInsert;
export type SelectArtist = typeof artistsTable.$inferSelect;

export type InsertCar = typeof tomicaTable.$inferInsert;
export type SelectCar = typeof tomicaTable.$inferSelect;

export type Gallery = typeof galleriesTable.$inferSelect;
export type NewGallery = typeof galleriesTable.$inferInsert;

export const schoolsTable = sqliteTable("schools", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  type: text("type"),
  region: text("region"),
  address: text("address"),
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  principal: text("principal"),
  roll: integer("roll"),
  decile: integer("decile"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  status: integer("status").notNull().default(1),
  snapshotDate: integer("snapshot_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type InsertBook = typeof bookTable.$inferInsert;
export type SelectBook = typeof bookTable.$inferSelect;

export type School = typeof schoolsTable.$inferSelect;
export type NewSchool = typeof schoolsTable.$inferInsert;
