import { Hono } from "hono";
import { renderer } from "./renderer";
import { etag } from "hono/etag";
import { Bindings } from "./bindings";
import { prettyJSON } from "hono/pretty-json";
import { canaanLogger } from "./log";
import { artists } from "./artists";

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

app.route("/artists", artists);

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

export default app;
