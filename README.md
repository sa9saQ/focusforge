# FocusForge (Local Storage Mode)

ADHD-friendly task dashboard built with Next.js App Router, mocked AI task decomposition, Pomodoro timer, and XP-based progression.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Browser `localStorage` data layer
- Vitest for unit tests

## Implemented

- Local task CRUD (create, list, complete, delete)
- Local profile progression (XP, level, streak)
- AI decomposition endpoint with mock provider (`/api/ai/decompose`)
- Pomodoro timer (default 25/5, customizable)
- Dashboard page with task list + timer + XP bar
- Responsive layout + dark mode

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Run dev server:

```bash
pnpm dev
```

3. Open:

- `http://localhost:3000/`
- `http://localhost:3000/dashboard`

## Data Storage

FocusForge stores state in browser localStorage:

- `focusforge_tasks`
- `focusforge_profile`
- `focusforge_settings`

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
```
