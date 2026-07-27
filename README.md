# braindump-todo

A todo app with an AI-powered braindump extractor. Paste a wall of messy thoughts — OpenAI turns it into a structured task list you can review, edit, and save in one shot.

Built as a hands-on learning project for the full stack: Next.js × Drizzle × SST × OpenAI.

## Features

- **Todo CRUD** — title, notes, due date, priority (low / med / high), status (open / done)
- **Tags (many-to-many)** — create per-user tags and attach multiple tags to any todo
- **Braindump** — paste freeform text → OpenAI extracts a structured task array → review and edit with Conform's field array → save in bulk
- **Auth** — email + password via Better Auth; each user sees only their own data

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router / Server Actions) |
| Language | TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod v4 |
| ORM | Drizzle ORM (PostgreSQL) |
| Forms | Conform |
| Auth | Better Auth |
| AI | OpenAI API (Structured Outputs) |
| IaC | SST v3 (Lambda + CloudFront + S3) |
| DB (production) | Aurora Serverless v2 (PostgreSQL) |
| DB (local) | Docker Compose (PostgreSQL 16) |

## Getting Started

**Prerequisites:** Node.js 20+, pnpm 11+, Docker Desktop

```bash
pnpm install
```

Start the local database:

```bash
docker compose up -d
```

Create `.env.local`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/braindump_todo
BETTER_AUTH_SECRET=<any secret string>
OPENAI_API_KEY=<your OpenAI API key>
```

Push the schema to the database:

```bash
pnpm drizzle-kit push
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

Unit / integration tests (Vitest):

```bash
pnpm test
```

The test database runs on port 5433 (`db_test` in `compose.yaml`) using tmpfs — fast and ephemeral.

E2E tests (Playwright):

```bash
pnpm exec playwright test
```

## Code Quality

```bash
pnpm lint       # Biome lint
pnpm check      # Biome lint + auto-fix
pnpm typecheck  # TypeScript type check
```

## Database

Generate a migration:

```bash
pnpm drizzle-kit generate
```

Apply migrations:

```bash
pnpm drizzle-kit migrate
```

Open Drizzle Studio:

```bash
pnpm studio
```

## Deploying to AWS

```bash
pnpm deploy
```

Deploys via SST v3 + OpenNext to Lambda + CloudFront + S3. The database is Aurora Serverless v2 (min 0 ACU, auto-pauses on idle). Expect a cold-start delay of several seconds on the first request after a period of inactivity.

Register secrets before the first deploy:

```bash
pnpm sst secret set OpenaiApiKey <value>
pnpm sst secret set BetterAuthSecret <value>
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── todos/        # Todo list and CRUD
│   ├── braindump/    # Braindump input page
│   └── login/        # Auth page
├── features/         # Feature-scoped logic, Server Actions, and forms
│   ├── todos/
│   ├── tags/
│   └── braindump/
├── db/               # Drizzle schema and database connection
├── lib/              # Shared utilities and auth config
└── components/       # shadcn/ui components
```

## Data Model

- `users` — managed by Better Auth
- `todos` — userId FK, title / notes / dueDate / priority / status
- `tags` — userId FK, name (unique per user)
- `todos_to_tags` — junction table with composite primary key (todoId × tagId)
