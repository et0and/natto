import { Hono } from "hono";
import { renderer } from "./renderer";
import { etag } from "hono/etag";
import { Bindings } from "./bindings";
import { prettyJSON } from "hono/pretty-json";
import { canaanLogger } from "./log";
import { createDb, artistsTable } from "./db";
import { eq } from "drizzle-orm";

const app = new Hono<{ Bindings: Bindings }>();

app.use(etag(), prettyJSON(), renderer);

app.get("/", (c) => {
  return c.render(
    <>
      <body>
        <h1>services</h1>
        <a href="/health">health</a>
        <br />
        <a href="/artists">artists</a>
      </body>
      <footer>
        <p>canaan API version 0.0.1</p>
      </footer>
    </>
  );
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
    const artists = await db.select().from(artistsTable);

    return c.json({
      success: true,
      data: artists,
      count: artists.length,
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
