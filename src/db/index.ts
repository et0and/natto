import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { artistsTable, galleriesTable, bookTable, tomicaTable } from "./schema";

export function createDb(databaseUrl: string, authToken: string) {
  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzle(client);
}

export type DbClient = ReturnType<typeof createDb>;

export { artistsTable, galleriesTable, bookTable, tomicaTable };
