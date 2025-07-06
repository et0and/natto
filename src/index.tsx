import { Hono } from "hono";
import { renderer } from "./renderer";
import { etag } from "hono/etag";
import { Bindings } from "./bindings";
import { prettyJSON } from "hono/pretty-json";
import { canaanLogger } from "./log";

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

app.get("/artists", (c) => {
  return c.json({
    description: "list of artists to go here",
    timestamp: new Date().toISOString(),
  });
});

export default app;
