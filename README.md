# FocusForge (MVP Week 1)

ADHD-friendly task dashboard built with Next.js App Router, Supabase Auth, mocked AI task decomposition, Pomodoro timer, and XP-based progression.

## Tech Stack

- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui components
- Supabase client SDK (`@supabase/supabase-js`)
- Vitest for unit tests

## Implemented (MVP Week 1)

- Next.js 16 project structure with App Router
- Supabase auth UI (Google, GitHub, Email magic link)
- Task CRUD (create, list, complete, delete)
- AI decomposition endpoint with mock provider (`/api/ai/decompose`)
- Pomodoro timer (default 25/5, customizable)
- Dashboard page with task list + timer + XP bar
- Basic gamification (XP gain + level progression)
- Responsive layout + dark mode
- English UI

## Setup

1. Install dependencies (pnpm):

```bash
pnpm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Run dev server:

```bash
pnpm dev
```

4. Open:

- `http://localhost:3000/`
- `http://localhost:3000/login`
- `http://localhost:3000/dashboard`

## Supabase Notes

Create at least these tables in your Supabase project:

- `profiles`
- `tasks`

The app expects the schema fields defined in `spec.md`.

Enable providers in Supabase Auth settings:

- Google
- GitHub
- Email

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
```

## AI Mock Structure

- `src/lib/ai/types.ts`: decomposition interface
- `src/lib/ai/mock-decomposer.ts`: mock implementation
- `src/lib/ai/index.ts`: provider factory

Replace the factory output to switch to real OpenAI integration later.
