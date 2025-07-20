import { Context, Next } from "hono";
import { Bindings } from "./bindings";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}

export function rateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator = (c) => c.req.header("cf-connecting-ip") || "unknown" } = options;

  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const kvKey = `rate_limit:${key}:${windowStart}`;

    try {
      const currentCount = await c.env.RATE_LIMITER.get(kvKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      if (count >= maxRequests) {
        return c.json(
          {
            success: false,
            error: "Rate limit exceeded",
            retryAfter: Math.ceil((windowStart + windowMs - now) / 1000),
          },
          429
        );
      }

      await c.env.RATE_LIMITER.put(kvKey, (count + 1).toString(), {
        expirationTtl: Math.ceil(windowMs / 1000) + 60,
      });

      c.res.headers.set("X-RateLimit-Limit", maxRequests.toString());
      c.res.headers.set("X-RateLimit-Remaining", (maxRequests - count - 1).toString());
      c.res.headers.set("X-RateLimit-Reset", Math.ceil((windowStart + windowMs) / 1000).toString());

      await next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      await next();
    }
  };
}