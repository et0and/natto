![Natto hero](/natto.png)

# Natto (formerly Artists from Asia)

**Natto** is a specialised API service that provides comprehensive access to Asian artists from around the world, sourced from the [Getty Research Institute's Union List of Artist Names® (ULAN) database](https://www.getty.edu/research/tools/vocabularies/ulan). Rather than mirroring the existing database, this service focuses exclusively on artists from all regions of Asia, including Central, North, South, West, East, and Southeast Asia over fewer data fields for simplicity.

## About the data

The artist data in Natto is derived from the ULAN database, which contains authoritative information about artists and their biographical details. The data includes:

- Artist names and full names
- Nationality codes and geographic origins
- Artist types and classifications
- Biographical descriptions
- Hierarchical relationships between artists
- Information on submitter

Currently it contains over a million records stored in a single SQLite database, with more being added over time.

### Attribution and thanks

This project contains information from the J. Paul Getty Trust, Getty Research Institute, the Union List of Artist Names, which is made available under the ODC Attribution License. The Getty Vocabulary data is compiled from various contributors using published sources; the contributor and sources are available as part of each record.

For more information about the Getty Vocabularies and their licensing, visit the [Getty Research Institute Download Center](https://www.getty.edu/research/tools/vocabularies/obtain.html).

## API endpoints

### Health check

- **GET** `/health` - Returns service health status

### Artists

#### Get all artists (paginated response)

- **GET** `/artists` - Retrieve a paginated list of artists with optional filtering

**Query parameters:**

- `page` (integer, default: 1) - Page number for pagination
- `limit` (integer, default: 20) - Number of results per page
- `name` (string) - Search artists by name (partial match)
- `type` (string) - Filter by artist type
- `nationalityCode` (string) - Filter by nationality code

**Example requests:**

```bash
# Get first page of artists
GET /artists

# Search for artists with "zhang" in their name
GET /artists?name=zhang

# Get Chinese artists (note: we will be cleaning the data in the future to not include the numeric code as part of this in the future)
GET /artists?nationalityCode=936010/Chinese

# Get photographers with pagination
GET /artists?type=31407/photographer&page=2&limit=10

# Combined filters
GET /artists?name=li&nationalityCode=936010/Chinese&type=31407/photographer&page=1&limit=5
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "artist_id",
      "parentId": "parent_artist_id",
      "name": "Artist Name",
      "termId": "term_identifier",
      "contributorId": "contributor_id",
      "fullName": "Full Artist Name",
      "type": "artist_type",
      "nationalityCode": "nationality_code",
      "description": "Artist description"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "totalPages": 75,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "name": "search_term",
    "type": "filter_value",
    "nationalityCode": "nationality_filter"
  }
}
```

#### Get single artist

- **GET** `/artists/:id` - Retrieve a specific artist by ID

**Example request:**

```bash
GET /artists/500115493
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "500115493",
    "parentId": null,
    "name": "Artist Name",
    "termId": "term_id",
    "contributorId": "contributor_id",
    "fullName": "Full Artist Name",
    "type": "painter",
    "nationalityCode": "JP",
    "description": "Artist biographical information"
  }
}
```

## Schema

The artists are stored with the following structure:

- `id` (primary key) - Unique artist identifier
- `parentId` - Reference to parent artist (for hierarchical relationships)
- `name` - Artist's primary name
- `termId` - Getty vocabulary term identifier
- `contributorId` - Data contributor identifier
- `fullName` - Complete artist name
- `type` - Artist classification (painter, sculptor, etc.)
- `nationalityCode` - ISO country/nationality code
- `description` - Biographical description

## Stack

Natto uses the following awesome technologies:

- **Framework**: [Hono](https://hono.dev/) - Fast web framework by [Yusuke Wada](https://github.com/yusukebe)
- **Database**: SQLite/LibSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Tests**: [Vitest](https://vitest.dev/)
- **Linter**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) - Incredibly fast linter
- **Runtime**: Cloudflare Workers (although Hono and everything else here will happily run anywhere!)

## Development

### Prerequisites

- Node.js 18+
- npm or bun

### Setup

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Run tests
bun test

# Lint code
bun run lint
```

### Deployment

```bash
# Build and deploy to Cloudflare Workers
bun run deploy

# Generate Cloudflare types
bun run cf-typegen
```

### Configuration

The application uses Cloudflare Workers bindings for database configuration:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

Required environment variables:

- `DATABASE_URL` - LibSQL database connection URL
- `DATABASE_AUTH_TOKEN` - Database authentication token
