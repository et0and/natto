import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

export const canaanLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

app.use(logger(canaanLogger));
