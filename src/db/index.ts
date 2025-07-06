import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { artistsTable } from "./schema";

export function createDb(databaseUrl: string, authToken: string) {
  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzle(client, { schema: { artistsTable } });
}

export type DbClient = ReturnType<typeof createDb>;

export { artistsTable };
