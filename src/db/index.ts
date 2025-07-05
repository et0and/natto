import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

config({ path: ".env" });

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
});
