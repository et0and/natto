![Natto hero](natto.png)

# 🫘 Natto - a hobby API service

**Natto** is a multi-purpose hobby API service that provides access to various personal interests and collections. It mainly focuses on Asian artists from the [Getty Research Institute's Union List of Artist Names® (ULAN) database](https://www.getty.edu/research/tools/vocabularies/ulan), but also includes multiple API endpoints covering different personal interests including a directory of art galleries in Aotearoa, my books, Tomica car collections et al.

I'm using this project to learn more about [Hono](https://hono.dev/) and what it is capable of just as a bit of fun!

## About the data

Natto contains multiple datasets across different domains:

### Artists from Asia
The artist data is derived from the ULAN database, which contains authoritative information about artists and their biographical details. The data includes:

- Artist names and full names
- Nationality codes and geographic origins
- Artist types and classifications
- Biographical descriptions
- Hierarchical relationships between artists
- Information on submitter

Currently it contains over a million records stored in a single SQLite database, with more being added over time.

### Galleries
Gallery data includes information about art galleries and exhibition spaces:

- Gallery names and descriptions
- Physical addresses and contact information
- Geographic coordinates (latitude/longitude)
- Associated artists
- Opening year and operational status
- Website and email contact details

### Planned Collections
Additional datasets are planned for:

- **Books**: Personal book collection with titles, authors, genres, and descriptions
- **Cars**: Tomica die-cast car collection with models, brands, years, and colours

### Attribution and thanks

This project contains information from the J. Paul Getty Trust, Getty Research Institute, the Union List of Artist Names, which is made available under the ODC Attribution License. The Getty Vocabulary data is compiled from various contributors using published sources; the contributor and sources are available as part of each record.

For more information about the Getty Vocabularies and their licensing, visit the [Getty Research Institute Download Center](https://www.getty.edu/research/tools/vocabularies/obtain.html).

Besides the data, the source code of this project is [GPLv3 licensed](/LICENSE).

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

### Galleries

#### Get all galleries (paginated response)

- **GET** `/galleries` - Retrieve a paginated list of galleries with optional filtering

**Query parameters:**

- `page` (integer, default: 1) - Page number for pagination
- `limit` (integer, default: 20) - Number of results per page
- `name` (string) - Search galleries by name (partial match)
- `address` (string) - Filter by exact address match

**Example requests:**

```bash
# Get first page of galleries
GET /galleries

# Search for galleries with "modern" in their name
GET /galleries?name=modern

# Get galleries at a specific address
GET /galleries?address=123 Art Street

# Combined filters with pagination
GET /galleries?name=gallery&page=2&limit=5
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "gallery_id",
      "name": "Gallery Name",
      "description": "Gallery description",
      "address": "123 Art Street, City",
      "website": "https://gallery.com",
      "email": "info@gallery.com",
      "artists": "associated_artists",
      "latitude": "40.7128",
      "longitude": "-74.0060",
      "status": 1,
      "opened": 1995,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "name": "search_term",
    "type": "address_filter"
  }
}
```

#### Get single gallery

- **GET** `/galleries/:id` - Retrieve a specific gallery by ID

**Example request:**

```bash
GET /galleries/gallery_123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "gallery_123",
    "name": "Modern Art Gallery",
    "description": "Contemporary art space featuring emerging artists",
    "address": "456 Culture Ave, Art District",
    "website": "https://modernartgallery.com",
    "email": "contact@modernartgallery.com",
    "artists": "artist1,artist2,artist3",
    "latitude": "40.7589",
    "longitude": "-73.9851",
    "status": 1,
    "opened": 2010,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Planned API Routes

The following API endpoints are planned for future implementation:

#### Books
- **GET** `/books` - Retrieve paginated book collection
- **GET** `/books/:id` - Get specific book details
- Query parameters: `title`, `author`, `genre`, `year`

#### Cars (Personal Tomica collection)
- **GET** `/cars` - Retrieve paginated car collection
- **GET** `/cars/:id` - Get specific car details
- Query parameters: `model`, `brand`, `year`, `colour`

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
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token for deployment (if not using `wrangler login`)
