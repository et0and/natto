import { Hono } from "hono";
import { renderer } from "./renderer";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.use(logger(), etag(), renderer);

app.get("/", (c) => {
  return c.render(
    <>
    <h1>henlo</h1>
    <img src="./aleph.svg" alt="" />
    </>
  );
});

app.get("/health", (c) => {
  return c.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Sorry, route not found",
    },
    404
  );
});

app.get("/artists");

export default app;
