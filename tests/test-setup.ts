import { vi } from "vitest";

// Mock the logger
vi.mock("../src/log", () => ({
  canaanLogger: vi.fn(),
}));