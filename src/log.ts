import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// Simple structured logger for Cloudflare Workers
export interface LogData {
  [key: string]: unknown;
}

export const canaanLogger = (message: string, data?: LogData) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: "info",
    message,
    ...(data && { data }),
  };

  console.log(JSON.stringify(logEntry));
};

// Separate function for Hono logger compatibility
const honoLoggerFunc = (message: string, ...rest: string[]) => {
  canaanLogger(message, rest.length > 0 ? { details: rest } : undefined);
};

app.use(logger(honoLoggerFunc));
