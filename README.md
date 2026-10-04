# JobLens

JobLens is a focused job feed for new graduates and early-career software engineers. Phase 1
proves the ingestion pipeline by fetching public job postings from selected Greenhouse boards and
normalizing their provider-specific fields.

## Phase 1 features

- Public Greenhouse Job Board API client with a 15-second request timeout
- Five configured company boards
- Provider-independent normalized job shape
- Cross-company collection with partial-failure handling
- Stable deduplication key: `provider:companySourceToken:externalId`
- `GET /api/jobs` endpoint with per-company filtering
- Fixture-based unit tests

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The normalized API is available at:

```text
GET /api/jobs
GET /api/jobs?company=stripe
```

Unknown company tokens return a `400` response containing the available companies.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Add a Greenhouse company

Add its name and board token to `src/config/companies.ts`. The token is the organization segment in
a Greenhouse-hosted job board URL and must be treated as provider-specific configuration.

## Phase roadmap

1. **Greenhouse proof of concept** — fetch, normalize, deduplicate, and expose jobs (current)
2. Persistent ingestion with PostgreSQL, sync history, upserts, and closed-job detection
3. Transparent early-career relevance scoring
4. Searchable and filterable job feed
5. Production monitoring, retries, admin tools, and additional ATS adapters

