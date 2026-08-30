# fcullmann.com

Personal website, developer-tool collection, and technical publishing platform for Florian Cullmann.

The application combines a bilingual public site with browser-first utilities and a protected editorial dashboard. Tool popularity is derived from recorded usage and controls the order of the featured section.

## Stack

- Next.js 16, React 19, and TypeScript
- PostgreSQL with Prisma ORM
- Auth.js / NextAuth credentials sessions for the single-user admin area
- CSS-first responsive design with generated map-paper texture
- PDF-Lib for local PDF document processing
- Vitest for unit tests

## Local setup

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.
4. Start the application with `npm run dev`.

Generate the admin password hash without storing the plain-text password:

```bash
node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" 'your-password'
```

Without `DATABASE_URL`, public routes use a curated demonstration dataset and the admin area remains read-only. Demo articles are marked visibly and should be replaced or approved before launch.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
```

## Content model

Tools, articles, and projects store English and German content together. English is the default locale. On the first visit, the root route chooses German only when the browser preference indicates German; the explicit language switch is persisted afterward.

Public utility logic lives in `components/tools`. Database-backed editorial data is accessed through `lib/content/repository.ts`, which keeps public pages independent of the administration implementation.

## Tool roadmap

The initial release includes PDF merging, JSON formatting, Base64 conversion, UUID generation, and URL encoding. PDF merging runs locally in the browser; splitting, compression, and conversion remain planned as separate workflows.

Every public tool route provides localized metadata and structured data. Articles consume their editor-managed SEO title and description, and `llms.txt` exposes a concise index for machine readers.

## Deployment

`next.config.ts` produces a standalone server bundle suitable for a container or systemd-managed Node.js process on a KVM host. Production deployment should provide PostgreSQL, TLS termination, backups, runtime secrets, and a migration step before starting the new application version.
