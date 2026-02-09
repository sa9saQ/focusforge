# FocusForge UI/UX Redesign Spec

## Goal
Make FocusForge's UI/UX competitive with top ADHD task management apps.
Target: English-speaking market. Mobile-first design.

## Current Stack
- Next.js 16.1.6 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui components
- localStorage for data persistence
- PWA enabled

## Priority 1: Visual Polish & Mobile UX

### 1.1 Task Completion Celebration
- When a task is checked complete, show a brief confetti/sparkle animation
- Use CSS keyframes (no heavy library). A simple scale + fade + checkmark animation
- Play a subtle "ding" sound (optional, respect user preference)

### 1.2 Streak Calendar (GitHub-style contribution graph)
- Show a 4-week grid (28 days) of small squares
- Each day colored based on tasks completed that day (0=empty, 1-2=light green, 3+=dark green)
- Store daily completion counts in localStorage key `focusforge_streaks`
- Display below the XP card on dashboard
- Format: `{ "2026-02-09": 3, "2026-02-08": 1, ... }`

### 1.3 Better Empty States
- When no tasks: show a friendly illustration/emoji + encouraging message
- "Ready to start? Add your first task above 🚀"
- When AI breakdown has no results: "Type a task and hit Generate to break it down ✨"

### 1.4 Task Input UX
- Enter key should submit the task (not just the Add button)
- Auto-focus the input field on page load
- After adding a task, re-focus the input for rapid entry
- Show a brief "Added!" toast/flash near the input

## Priority 2: ADHD-Friendly Design

### 2.1 Color & Typography
- Keep the warm earth-tone theme (it's good)
- Add subtle color-coding for task priority (optional user choice)
- Increase touch targets: minimum 44px height for all interactive elements
- Font size: body at least 16px on mobile (prevents iOS zoom)

### 2.2 Simplified Layout
- On mobile, show ONLY Tasks + Pomodoro on the main view
- Move Progress/XP and AI Breakdown to a collapsible section or second tab
- Reduce cognitive load: less visible at once = better for ADHD

### 2.3 Focus Mode
- When Pomodoro is running, dim everything except the timer and current task
- Full-screen timer option (tap timer to expand)
- Pulsing animation on the timer when running

## Priority 3: Smart Features

### 3.1 Forgotten Task Nudge (inspired by competitor)
- If a task is older than 3 days and not completed, show a gentle badge: "Still here! 👋"
- Option to snooze (push to tomorrow) or delete

### 3.2 Quick Add from anywhere
- Floating "+" button (FAB) on mobile, always visible
- Tapping opens a quick-add modal with just the task input

### 3.3 Task Categories (simple)
- Allow optional emoji prefix for visual categorization
- e.g., "🏠 Clean kitchen" "💻 Fix bug" "📚 Read chapter 3"
- No complex category system - just visual scanning

## Priority 4: Onboarding

### 4.1 First Visit Experience
- If localStorage has no tasks, show a brief onboarding overlay:
  1. "Welcome to FocusForge! 👋"
  2. "Add a task → Break it down → Focus → Earn XP"
  3. "Let's start with one task"
- Auto-dismiss after user adds first task
- Store `focusforge_onboarded: true` in localStorage

## Priority 5: Competitive Features (inspired by competitor analysis)

### 5.1 Time Estimation Chips
- When adding a task, show quick-select chips: 5min, 10min, 15min, 25min, 45min
- Stored as `estimated_minutes` on the task
- Displayed as a small badge on each task item (e.g., "15m")
- Default: no estimate (optional)

### 5.2 "Later" / Snooze System
- Each task can be marked "Later" instead of just pending/completed
- "Later" tasks go to a collapsible section at the bottom
- Gentle nudge after 3 days: "Still here! Ready to tackle this? 👋"

### 5.3 Floating Action Button (FAB)
- Fixed "+" button at bottom-right on mobile
- Opens a quick-add modal (just title + optional time estimate)
- Always accessible regardless of scroll position

### 5.4 Task Reordering
- Drag handle (≡) on each task for manual reordering
- Pin important tasks to the top (star icon)
- Pinned tasks visually separated from regular tasks

### 5.5 Visual Design Upgrade
- Clean monochrome base + single accent color (green for FocusForge brand)
- Larger touch targets (minimum 48px)
- Card-based task items with subtle shadows
- Progress bar on individual tasks (when pomodoro is running for that task)

## Implementation Notes
- NO new npm dependencies for animations (use CSS @keyframes + Tailwind animate)
- Streak data stored in localStorage alongside existing keys
- All changes must pass `pnpm build` (strict TypeScript)
- Mobile-first: design at 390px width, then adapt up
- Test dark mode for ALL changes
- Keep bundle size minimal

## File Structure (existing)
- `src/app/page.tsx` - Landing page
- `src/app/dashboard/page.tsx` - Dashboard page
- `src/components/dashboard/dashboard-shell.tsx` - Main dashboard layout
- `src/components/dashboard/task-panel.tsx` - Task list
- `src/components/dashboard/pomodoro-panel.tsx` - Pomodoro timer
- `src/components/dashboard/xp-card.tsx` - XP/Progress display
- `src/components/dashboard/ai-breakdown-panel.tsx` - AI task decomposition
- `src/lib/storage.ts` - localStorage CRUD
- `src/lib/tasks.ts` - Task operations
- `src/lib/profile.ts` - Profile/XP operations
- `src/lib/gamification.ts` - XP/level calculations
- `src/lib/types.ts` - TypeScript types

## Acceptance Criteria
1. `pnpm build` passes with zero errors
2. Mobile (390px) layout looks polished
3. Dark mode works for all new UI
4. Task completion has visible celebration
5. Streak calendar renders correctly
6. Enter key submits new task
7. Empty states are friendly, not blank
