import { Hono } from "hono";
import { eq, sql, like, and, SQL } from "drizzle-orm";
import { createDb, schoolsTable } from "./db";
import { canaanLogger } from "./log";
import type { Bindings } from "./bindings";
import { SchoolRecord, CKANResponse } from "./types/schoolRecord";

const schools = new Hono<{ Bindings: Bindings }>();

schools.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);

    // Get pagination parameters
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = (page - 1) * limit;

    // Get query parameters for filtering and searching
    const nameSearch = c.req.query("name");
    const typeFilter = c.req.query("type");
    const regionFilter = c.req.query("region");

    // Build where conditions
    const conditions: SQL[] = [];

    if (nameSearch) {
      conditions.push(like(schoolsTable.name, `%${nameSearch}%`));
    }

    if (typeFilter) {
      conditions.push(eq(schoolsTable.type, typeFilter));
    }

    if (regionFilter) {
      conditions.push(eq(schoolsTable.region, regionFilter));
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination info
    let totalResult;
    if (whereClause) {
      totalResult = await db
        .select({ count: sql`count(*)` })
        .from(schoolsTable)
        .where(whereClause);
    } else {
      totalResult = await db
        .select({ count: sql`count(*)` })
        .from(schoolsTable);
    }
    const total = Number(totalResult[0].count);

    // Query the schools data
    const schools = whereClause
      ? await db
          .select()
          .from(schoolsTable)
          .where(whereClause)
          .limit(limit)
          .offset(offset)
      : await db.select().from(schoolsTable).limit(limit).offset(offset);

    return c.json({
      success: true,
      data: schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      filters: {
        name: nameSearch,
        type: typeFilter,
        region: regionFilter,
      },
    });
  } catch (error) {
    canaanLogger(`Error fetching schools: ${error}`);
    return c.json(
      {
        success: false,
        error: "Failed to fetch schools",
      },
      500,
    );
  }
});

// Get single school by ID
schools.get("/:id", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);
    const id = c.req.param("id");
    const school = await db
      .select()
      .from(schoolsTable)
      .where(eq(schoolsTable.id, id));

    if (school.length === 0) {
      return c.json(
        {
          success: false,
          error: "School not found",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: school[0],
    });
  } catch (error) {
    canaanLogger(`Error fetching school: ${error}`);
    return c.json(
      {
        success: false,
        error: "Failed to fetch school",
      },
      500,
    );
  }
});

// Monthly snapshot creation endpoint (for manual triggering)
schools.post("/snapshot", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);

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

    return c.json({
      success: true,
      message: `Successfully created snapshot with ${schoolsData.length} schools`,
      snapshotDate: snapshotDate.toISOString(),
    });
  } catch (error) {
    canaanLogger(`Error creating schools snapshot: ${error}`);
    return c.json(
      {
        success: false,
        error: "Failed to create schools snapshot",
      },
      500,
    );
  }
});

export { schools };
