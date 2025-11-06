# ClipForge

ClipForge is a full-stack AI video clipping platform for transforming long-form YouTube videos and podcasts into viral-ready short clips. The monorepo hosts both the Next.js web application and the Node.js worker that executes ingestion, transcription, highlight generation, rendering, and publishing pipelines via BullMQ.

## Monorepo layout

- `apps/web` – Next.js 14 (App Router) app with NextAuth, Prisma, Stripe, shadcn/ui, and REST route handlers
- `apps/worker` – Node.js worker with BullMQ, ffmpeg-static, yt-dlp, OpenAI, and AssemblyAI integrations
- `packages/shared` – Shared zod schemas, queue constants, and utility helpers
- `prisma` – Prisma schema, migrations, and seeding script

## Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database
- Redis instance (Upstash, Redis Stack, etc.)
- S3-compatible storage (AWS S3, MinIO, Supabase Storage)

## Setup

```bash
pnpm install
cp .env.example .env
# populate environment variables

pnpm --filter web prisma generate
pnpm --filter web prisma migrate dev
pnpm --filter web prisma db seed
```

### Run the apps

```bash
# start Next.js web app
pnpm --filter web dev

# in another terminal start background worker
pnpm --filter worker dev
```

Supporting services: run Redis (`docker run -p 6379:6379 redis:7`) and MinIO/S3 locally, or point environment variables at managed services.

## Testing

```bash
pnpm --filter web test              # Jest unit tests
pnpm --filter shared test           # Shared package tests
pnpm --filter web playwright test   # Playwright smoke tests
```

## Key environment variables

- `DATABASE_URL` – PostgreSQL connection string
- `NEXTAUTH_SECRET`, `EMAIL_*`, `GOOGLE_*` – Authentication + email login providers
- `S3_*` – Storage credentials shared by web + worker
- `REDIS_URL` – BullMQ backing store
- `OPENAI_API_KEY`, `ASSEMBLYAI_API_KEY` – AI providers for highlight selection and transcription
- `STRIPE_*` – Subscription billing + webhook secret
- `APP_URL` – Base URL used for server actions and webhooks

Full list available in `.env.example`.

## Worker queues

1. **Ingest** – Downloads sources with `yt-dlp`, probes with `ffprobe`, uploads to S3, and records `Asset`s.
2. **Transcribe** – Requests AssemblyAI transcripts (webhook callback) with Whisper fallback.
3. **Suggest** – Uses GPT-4o-mini to generate highlight JSON, falling back to heuristic scoring.
4. **Render** – Renders clips via ffmpeg (trim, scale, burn subtitles), uploads MP4/SRT/thumbnail, and logs usage minutes.
5. **Publish** – Stub queue for social publishing integrations.

Each processor logs via Pino and persists status back to Prisma models for observability.

## Deployment

- **Web**: Deploy on Vercel or Node host with environment variables and connections to managed DB/Redis/S3.
- **Worker**: Deploy on Fly.io, Render, or Railway using the provided Dockerfile; ensure access to the same DATABASE_URL, REDIS_URL, and S3 credentials.
- **Database**: Supabase/Neon/Postgres; run migrations with `pnpm --filter web prisma migrate deploy`.
- **Redis**: Upstash or managed Redis recommended for durability.

## Legal reminder

ClipForge provides tooling only. You are responsible for ensuring you have rights to ingest, edit, and publish any third-party content processed through the platform.
