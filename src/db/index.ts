import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { artistsTable } from "./schema";

const DATABASE_URL: string | undefined = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN: string | undefined = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL)
  throw new Error("DATABASE_URL is not defined. Did you load your env file?");
if (!DATABASE_AUTH_TOKEN)
  throw new Error(
    "DATABASE_AUTH_TOKEN is not defined. Did you load your env file?"
  );

const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client);
export { artistsTable };
