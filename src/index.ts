import { Hono } from "hono";
import { renderer } from "./renderer";
import { etag } from "hono/etag";
import { Bindings } from "./bindings";
import { prettyJSON } from "hono/pretty-json";
import { canaanLogger } from "./log";
import { createDb, artistsTable } from "./db";
import { eq, sql, like, and, asc, desc, SQL } from "drizzle-orm";

const app = new Hono<{ Bindings: Bindings }>();

app.use(etag(), prettyJSON(), renderer);

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

app.notFound((c) => {
  canaanLogger(`Route not found, ${new Date().toISOString()}`);
  return c.json(
    {
      success: false,
      error: "Sorry, route not found",
    },
    404
  );
});

app.get("/artists", async (c) => {
  try {
    // Create db connection using bindings
    const db = createDb(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);

    // Get pagination parameters
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = (page - 1) * limit;

    // Get query parameters for filtering and searching
    const nameSearch = c.req.query("name");
    const typeFilter = c.req.query("type");
    const nationalityFilter = c.req.query("nationalityCode");
    const sortBy = c.req.query("sort") || "name"; // default sort by name
    const sortOrder = c.req.query("order") || "asc"; // default ascending

    // Build where conditions
    const conditions: SQL[] = [];
    
    if (nameSearch) {
      conditions.push(
        like(artistsTable.name, `%${nameSearch}%`)
      );
    }
    
    if (typeFilter) {
      conditions.push(eq(artistsTable.type, typeFilter));
    }
    
    if (nationalityFilter) {
      conditions.push(eq(artistsTable.nationalityCode, nationalityFilter));
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build order by clause
    const validSortFields = ["name", "type", "nationalityCode", "fullName"] as const;
    type ValidSortField = typeof validSortFields[number];
    const sortField: ValidSortField = validSortFields.includes(sortBy as ValidSortField) ? sortBy as ValidSortField : "name";
    
    const getSortColumn = (field: ValidSortField) => {
      switch (field) {
        case "name": return artistsTable.name;
        case "type": return artistsTable.type;
        case "nationalityCode": return artistsTable.nationalityCode;
        case "fullName": return artistsTable.fullName;
        default: return artistsTable.name;
      }
    };
    
    const sortColumn = getSortColumn(sortField);
    const orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

    // Get total count for pagination info (with filters applied)
    const totalQuery = db.select({ count: sql`count(*)` }).from(artistsTable);
    if (whereClause) {
      totalQuery.where(whereClause);
    }
    const totalResult = await totalQuery;
    const total = Number(totalResult[0].count);

    // Get paginated and filtered artists
    const artistsQuery = db.select().from(artistsTable);
    if (whereClause) {
      artistsQuery.where(whereClause);
    }
    const artists = await artistsQuery
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: artists,
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
        nationalityCode: nationalityFilter,
        sort: sortField,
        order: sortOrder,
      },
    });
  } catch (error) {
    canaanLogger(`Error fetching artists: ${error}`);
    return c.json(
      {
        success: false,
        error: "Failed to fetch artists",
      },
      500
    );
  }
});

// Get single artist by ID
app.get("/artists/:id", async (c) => {
  try {
    // Create db connection using bindings
    const db = createDb(c.env.DATABASE_URL, c.env.DATABASE_AUTH_TOKEN);
    const id = c.req.param("id");
    const artist = await db
      .select()
      .from(artistsTable)
      .where(eq(artistsTable.id, id));

    if (artist.length === 0) {
      return c.json(
        {
          success: false,
          error: "Artist not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: artist[0],
    });
  } catch (error) {
    canaanLogger(`Error fetching artist: ${error}`);
    return c.json(
      {
        success: false,
        error: "Failed to fetch artist",
      },
      500
    );
  }
});

export default app;
