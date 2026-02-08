# FocusForge: Local Storage Mode

## Goal
Make FocusForge work WITHOUT Supabase by using browser localStorage as the data layer.
This allows immediate deployment and usage without any backend setup.

## What to Change

### 1. Create `src/lib/storage.ts` — Local Storage Adapter
- Implement a simple CRUD API that mirrors the Supabase interface but uses localStorage
- Key: `focusforge_tasks`, `focusforge_profile`, `focusforge_settings`
- Generate UUIDs with `crypto.randomUUID()`
- All data stored as JSON strings in localStorage

### 2. Modify `src/lib/tasks.ts`
- Remove SupabaseClient dependency
- Use localStorage adapter instead
- Keep the same function signatures: `listTasks`, `createTask`, `updateTaskStatus`, `removeTask`
- No userId needed (single user, local)

### 3. Modify `src/lib/profile.ts`
- Store XP, level, streak in localStorage
- Remove Supabase dependency

### 4. Modify `src/lib/gamification.ts`
- Use localStorage for XP tracking
- Keep gamification logic (levels, XP calculation)

### 5. Remove Supabase Auth Dependency
- `src/app/login/page.tsx` → Simple "Get Started" button (no auth needed for local mode)
- `src/app/providers.tsx` → Remove Supabase provider if present
- `src/lib/supabase/client.ts` → Can keep as optional, but not required
- Dashboard should work without login

### 6. Update `src/app/dashboard/page.tsx`
- Remove auth checks (or make them optional)
- Load tasks from localStorage
- Still show all panels: task list, AI breakdown, pomodoro, XP

### 7. Landing Page (`src/app/page.tsx`)
- Keep it as-is but make "Get Started" go directly to dashboard

### 8. AI Decompose API (`src/app/api/ai/decompose/route.ts`)
- Keep mock decomposer for now (no API key needed)
- Later can add real AI integration

## Constraints
- Keep all existing UI components unchanged
- Only change data layer
- Must build successfully (`pnpm build`)
- Must work in browser without any backend

## Testing
- `pnpm build` must pass
- Opening localhost:3001 should show landing page
- Clicking "Get Started" goes to dashboard
- Can add, complete, delete tasks
- Pomodoro timer works
- XP tracking works
