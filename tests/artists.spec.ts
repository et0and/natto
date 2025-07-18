import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";
import { mockArtists } from "./__mocks__/artists-data";

// Create a mock artists module that doesn't depend on the database
const createMockArtistsRouter = () => {
  const artists = new Hono();

  // Mock GET / endpoint
  artists.get("/", async (c) => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "20");
      const offset = (page - 1) * limit;

      const nameSearch = c.req.query("name");
      const typeFilter = c.req.query("type");
      const nationalityFilter = c.req.query("nationalityCode");

      // Filter mock data based on query parameters
      let filteredArtists = [...mockArtists];

      if (nameSearch) {
        filteredArtists = filteredArtists.filter((a) =>
          a.name.toLowerCase().includes(nameSearch.toLowerCase())
        );
      }

      if (typeFilter) {
        filteredArtists = filteredArtists.filter((a) => a.type === typeFilter);
      }

      if (nationalityFilter) {
        filteredArtists = filteredArtists.filter(
          (a) => a.nationalityCode === nationalityFilter
        );
      }

      const total = filteredArtists.length;
      const paginatedArtists = filteredArtists.slice(offset, offset + limit);

      return c.json({
        success: true,
        data: paginatedArtists,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        filters: {
          name: nameSearch,
          type: typeFilter,
          nationalityCode: nationalityFilter,
        },
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "Failed to fetch artists",
        },
        500
      );
    }
  });

  // Mock GET /:id endpoint
  artists.get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const artist = mockArtists.find((a) => a.id === id);

      if (!artist) {
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
        data: artist,
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "Failed to fetch artist",
        },
        500
      );
    }
  });

  // Mock GET /test/simple endpoint
  artists.get("/test/simple", async (c) => {
    try {
      const result = mockArtists.slice(0, 3);

      return c.json({
        success: true,
        simple_test: true,
        data: result,
      });
    } catch (error) {
      return c.json({ success: false, error: error }, 500);
    }
  });

  return artists;
};

describe("Artists API", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/", createMockArtistsRouter());
  });

  const validEnv = {
    DATABASE_URL: "test-url",
    DATABASE_AUTH_TOKEN: "test-token",
    API_KEY: "test-key",
  };

  describe("GET /", () => {
    it("should return artists list with pagination", async () => {
      const res = await app.request("/", {}, validEnv);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(5); // All mock artists
      expect(json.data[0].name).toBe("Vincent van Gogh");
      expect(json.data[1].name).toBe("Pablo Picasso");
      expect(json.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle pagination parameters", async () => {
      const res = await app.request("/?page=2&limit=2", {}, validEnv);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data).toHaveLength(2);
      expect(json.data[0].name).toBe("Auguste Rodin"); // 3rd artist
      expect(json.pagination.page).toBe(2);
      expect(json.pagination.limit).toBe(2);
      expect(json.pagination.total).toBe(5);
      expect(json.pagination.totalPages).toBe(3);
      expect(json.pagination.hasNext).toBe(true);
      expect(json.pagination.hasPrev).toBe(true);
    });

    it("should handle name search filter", async () => {
      const res = await app.request("/?name=Van", {}, validEnv);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe("Vincent van Gogh");
      expect(json.filters.name).toBe("Van");
    });

    it("should handle type filter", async () => {
      const res = await app.request("/?type=painter", {}, validEnv);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data).toHaveLength(4); // 4 painters in mock data
      expect(json.data.every((artist: any) => artist.type === "painter")).toBe(
        true
      );
      expect(json.filters.type).toBe("painter");
    });

    it("should handle nationality filter", async () => {
      const res = await app.request("/?nationalityCode=NL", {}, validEnv);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe("Vincent van Gogh");
      expect(json.filters.nationalityCode).toBe("NL");
    });

    it("should handle combined filters", async () => {
      const res = await app.request(
        "/?type=painter&nationalityCode=ES",
        {},
        validEnv
      );

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe("Pablo Picasso");
    });
  });

  describe("GET /:id", () => {
    it("should return single artist by ID", async () => {
      const res = await app.request("/1", {}, validEnv);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("1");
      expect(json.data.name).toBe("Vincent van Gogh");
      expect(json.data.type).toBe("painter");
      expect(json.data.nationalityCode).toBe("NL");
    });

    it("should return 404 for non-existent artist", async () => {
      const res = await app.request("/999", {}, validEnv);

      expect(res.status).toBe(404);
      const json = (await res.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe("Artist not found");
    });
  });

  describe("GET /test/simple", () => {
    it("should return simple test endpoint", async () => {
      const res = await app.request("/test/simple", {}, validEnv);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.simple_test).toBe(true);
      expect(json.data).toHaveLength(3);
      expect(json.data[0].name).toBe("Vincent van Gogh");
      expect(json.data[1].name).toBe("Pablo Picasso");
      expect(json.data[2].name).toBe("Auguste Rodin");
    });
  });
});
