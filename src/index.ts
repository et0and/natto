import { Hono } from "hono";
import { etag } from "hono/etag";
import { Bindings } from "./bindings";
import { prettyJSON } from "hono/pretty-json";
import { canaanLogger } from "./log";
import { artists } from "./artists";
import { galleries } from "./galleries";
import { rateLimiter } from "./rate-limiter";
import { properties } from "./property";

const app = new Hono<{ Bindings: Bindings }>();

app.use(etag(), prettyJSON());

app.use(
  rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
  })
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
app.route("/properties", properties);

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
