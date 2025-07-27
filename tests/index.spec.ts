import { describe, it, expect } from "vitest";
import { app } from "../src/index";

interface HealthResponse {
  success: boolean;
  status: string;
  timestamp: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
}

describe("App", () => {
  it("should redirect root path to main website", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://tom.so");
  });

  it("should return health check", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const json = (await res.json()) as HealthResponse;
    expect(json.success).toBe(true);
    expect(json.status).toBe("healthy");
    expect(json.timestamp).toBeDefined();
  });

  it("should return 404 for unknown routes", async () => {
    const res = await app.request("/unknown");
    expect(res.status).toBe(404);

    const json = (await res.json()) as ErrorResponse;
    expect(json.success).toBe(false);
    expect(json.error).toBe("Sorry, route not found");
  });
});
