import { Hono } from "hono";
import { etag } from "hono/etag";
import { Bindings } from "./bindings";
import { prettyJSON } from "hono/pretty-json";
import { canaanLogger } from "./log";
import { artists } from "./artists";
import { galleries } from "./galleries";
import { schools } from "./schools";
import { createDb, schoolsTable } from "./db";
import { sql } from "drizzle-orm";
import { SchoolRecord, CKANResponse } from "./types/schoolRecord";
import { rateLimiter } from "./rate-limiter";

const app = new Hono<{ Bindings: Bindings }>();

app.use(etag(), prettyJSON());

app.use(
  rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),
);

app.get("/", (c) => {
  return c.redirect("https://tom.so");
});

app.get("/health", (c) => {
  canaanLogger(`Health check initiated on ${new Date().toISOString()}`);
  return c.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.route("/artists", artists);
app.route("/galleries", galleries);
app.route("/schools", schools);

app.notFound((c) => {
  canaanLogger(`Route not found, ${new Date().toISOString()}`);
  return c.json(
    {
      success: false,
      error: "Sorry, route not found",
    },
    404,
  );
});

// Export app instance for testing
export { app };

// Scheduled function for monthly school data snapshots
export default {
  fetch: app.fetch,
  async scheduled(
    event: ScheduledEvent,
    env: Bindings,
    ctx: ExecutionContext,
  ): Promise<void> {
    try {
      canaanLogger(
        `Starting monthly schools snapshot at ${new Date().toISOString()}`,
      );

      const db = createDb(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN);

      // Fetch schools data from the NZ government API
      const response = await fetch(
        "https://catalogue.data.govt.nz/api/3/action/datastore_search?resource_id=4b292323-9fcc-41f8-814b-3c7b19cf14b3&limit=10000",
      );
      const data = (await response.json()) as CKANResponse;

      if (!data.success) {
        throw new Error("Failed to fetch schools data from government API");
      }

      const snapshotDate = new Date();
      const schoolsData = data.result.records.map((record: SchoolRecord) => ({
        id: record.School_Id || `school_${record._id}`,
        name: record.Org_Name || "",
        type: record.Org_Type || "",
        region: record.Education_Region || "",
        address:
          `${record.Add1_Line1 || ""} ${record.Add1_Suburb || ""} ${record.Add1_City || ""}`.trim(),
        website: record.URL || "",
        email: record.Email || "",
        phone: record.Telephone || "",
        principal: record.Contact1_Name || "",
        roll: record.Total || null,
        decile: null, // Decile data not available in this dataset
        latitude: record.Latitude ? String(record.Latitude) : "",
        longitude: record.Longitude ? String(record.Longitude) : "",
        status: record.Status === "Open" ? 1 : 0,
        snapshotDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Clear existing data for this month and insert new snapshot
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      // Delete existing records from this month
      await db
        .delete(schoolsTable)
        .where(
          sql`strftime('%Y-%m', datetime(${schoolsTable.snapshotDate}, 'unixepoch')) = ${currentMonth}`,
        );

      // Insert the new schools data
      await db.insert(schoolsTable).values(schoolsData);

      canaanLogger(
        `Successfully created monthly snapshot with ${schoolsData.length} schools at ${snapshotDate.toISOString()}`,
      );
    } catch (error) {
      canaanLogger(`Error in scheduled schools snapshot: ${error}`);
    }
  },
};
