import { Hono } from "hono";
import { eq, sql, like, and, SQL } from "drizzle-orm";
import { createDb, galleriesTable } from "./db";
import { canaanLogger } from "./log";
import type { galleryBindings as Bindings } from "./bindings";

const galleries = new Hono<{ Bindings: Bindings }>();

galleries.get("/", async (c) => {
  try {
    // Create db connection using bindings
    const db = createDb(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);

    // Get pagination parameters
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = (page - 1) * limit;

    // Get query parameters for filtering and searching
    const nameSearch = c.req.query("name");
    const addressFilter = c.req.query("address");

    // Build where conditions
    const conditions: SQL[] = [];

    if (nameSearch) {
      conditions.push(like(galleriesTable.name, `%${nameSearch}%`));
    }

    if (addressFilter) {
      conditions.push(eq(galleriesTable.address, addressFilter));
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination info (with filters applied)
    let totalResult;
    if (whereClause) {
      totalResult = await db
        .select({ count: sql`count(*)` })
        .from(galleriesTable)
        .where(whereClause);
    } else {
      totalResult = await db
        .select({ count: sql`count(*)` })
        .from(galleriesTable);
    }
    const total = Number(totalResult[0].count);

    // Query the galleries data with proper pagination
    const galleries = whereClause
      ? await db
          .select()
          .from(galleriesTable)
          .where(whereClause)
          .limit(limit)
          .offset(offset)
      : await db.select().from(galleriesTable).limit(limit).offset(offset);

    return c.json({
      success: true,
      data: galleries,
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
        type: addressFilter,
      },
    });
  } catch (error) {
    canaanLogger(`Error fetching galleries: ${error}`);
    return c.json(
      {
        success: false,
        error: "Failed to fetch galleries",
      },
      500,
    );
  }
});

// Get single gallery by ID
galleries.get("/:id", async (c) => {
  try {
    // Create db connection using bindings
    const db = createDb(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);
    const id = c.req.param("id");
    const gallery = await db
      .select()
      .from(galleriesTable)
      .where(eq(galleriesTable.id, id));

    if (gallery.length === 0) {
      return c.json(
        {
          success: false,
          error: "Gallery not found",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: gallery[0],
    });
  } catch (error) {
    canaanLogger(`Error fetching gallery: ${error}`);
    return c.json(
      {
        success: false,
        error: "Failed to fetch gallery",
      },
      500,
    );
  }
});

export { galleries };
