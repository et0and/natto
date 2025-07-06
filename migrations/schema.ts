import { sqliteTable, AnySQLiteColumn, text } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const artists = sqliteTable("artists", {
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

