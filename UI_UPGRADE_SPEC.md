# FocusForge UI Upgrade Spec

## Goal
Make FocusForge's UI best-in-class for ADHD task management apps. Inspired by competitor analysis of PoStock (6万+ users) and top ADHD apps (TickTick, Numo, Forest).

## Priority: HIGH — All changes in this spec

---

## 1. Landing Page Overhaul

### Hero Section
- Add a **hero illustration/mockup** — use a simple SVG or CSS-based phone mockup showing the dashboard
- Add **social proof**: "Built for ADHD minds" badge, "Free forever" badge
- Add a **"How it works"** section with 3-step visual flow (icons + short text):
  1. "Add your task" (📝)
  2. "AI breaks it down" (🤖)
  3. "Focus & earn XP" (🎮)

### Visual Polish
- Add subtle **gradient background** (e.g., primary/5 to background)
- Add **animated entrance** for hero text (CSS animation, no JS library)
- Feature cards should have **hover effect** (slight scale + shadow)
- Add **"Loved by ADHD minds"** testimonial section (3 hardcoded testimonials)

### Navigation
- Add **sticky header** with blur backdrop on scroll
- Add "Features" and "How it works" anchor links in header

---

## 2. Dashboard UI Improvements

### Task Panel
- Add **drag handle icon** on left side of each task (visual only, no DnD yet)
- Add **task priority badges** — color dots (🔴 high, 🟡 medium, 🟢 low) selectable on create
- Add **swipe-to-complete animation** on mobile (CSS transition)
- **Empty state** improvement: more engaging illustration, motivational random quote
- Add **task count badge** in header ("3 tasks left today")

### XP & Progress Card
- Add **level-up celebration animation** (confetti burst CSS)
- Show **progress ring** instead of plain progress bar
- Add **daily XP goal indicator** (e.g., "50 XP to daily goal")

### Streak Calendar (GitHub-grass style)
- Make it **full-width** instead of side card
- Add **color intensity** based on completion count (1=light, 2=medium, 3+=dark)
- Show **current streak count** prominently ("🔥 5 day streak!")
- Add **tooltip on hover** showing date and count

### Pomodoro Timer
- **Circular timer visualization** — SVG circle that counts down visually
- Add **ambient sound options** dropdown (Rain, Lo-fi, Forest, None) — play from free CDN audio
- Show **session count** for today ("Session 3 of 4")
- Add **auto-start next session** toggle

### AI Breakdown Panel
- Show **loading skeleton** while generating
- Add **step numbering** (Step 1, Step 2, ...)
- Each step should be a **mini-card** with checkbox, title, time estimate, and tip
- Add **"Regenerate"** button

---

## 3. Global UI Enhancements

### Typography & Color
- Use **Inter** for body, **Space Grotesk** (or similar) for headings — import via next/font
- Add **accent color picker** in settings (purple default, blue, green, orange options)
- Ensure **WCAG AA contrast** on all text

### Animations & Micro-interactions
- **Page transitions**: fade-in on route change (CSS only)
- **Button press**: scale(0.97) on active
- **Checkbox**: satisfying bounce animation on check
- **Card hover**: subtle lift (translateY -2px + shadow)
- **Toast notifications** for actions: "Task added!", "Level up! 🎉", "+10 XP"

### Responsive
- All grids: **1 col mobile, 2 col tablet, 3 col desktop**
- **Bottom navigation bar** on mobile (Tasks, Timer, Progress, Settings)
- Touch targets **minimum 44px**

### Accessibility
- All interactive elements have **aria-labels**
- **Focus ring** visible on keyboard navigation
- **prefers-reduced-motion** respected (disable animations)
- **prefers-color-scheme** auto dark/light

---

## 4. New: Settings Page (`/dashboard/settings`)
- Display name edit
- Accent color picker (saves to localStorage)
- Daily XP goal (default 100)
- Pomodoro defaults (work/break minutes)
- Data management: Export JSON, Import JSON, Reset all data
- About section with version number

---

## 5. Security Review Fixes

### API Route (`/api/ai/decompose`)
- Add **rate limiting** — max 20 requests per minute per IP (in-memory Map)
- Add **input sanitization** — strip HTML tags from taskTitle
- Add **response size limit** — max 10 subtasks returned
- Add **error message sanitization** — never expose internal error details

### Client-side
- **XSS prevention**: All user-input rendered text must use React's default escaping (already handled by React JSX, but audit dangerouslySetInnerHTML usage — should be NONE)
- **localStorage**: Add **data integrity check** — validate JSON schema on read, fallback to defaults if corrupted
- **CSP headers**: Add Content-Security-Policy in next.config

### General
- Add **`X-Content-Type-Options: nosniff`** header
- Add **`X-Frame-Options: DENY`** header  
- Add **`Referrer-Policy: strict-origin-when-cross-origin`** header
- Remove **`X-Powered-By`** header (Next.js default)
- Ensure no **secrets in client bundle** — audit all `process.env` usage (GOOGLE_AI_API_KEY must only be in server-side code)

---

## Technical Notes
- Use **shadcn/ui** components where possible
- Use **Tailwind CSS** for all styling (no CSS modules)
- Use **lucide-react** for icons
- No new dependencies except fonts (next/font)
- For ambient sounds, use free CDN URLs (freesound.org or similar royalty-free)
- Toast: implement lightweight custom toast (no library) or use shadcn toast

## File Structure
- New: `src/app/dashboard/settings/page.tsx`
- New: `src/components/dashboard/settings-panel.tsx`
- New: `src/components/ui/toast.tsx` (if needed)
- Modified: `src/app/page.tsx` (landing)
- Modified: `src/components/dashboard/*` (all panels)
- Modified: `next.config.ts` (security headers)
- Modified: `src/app/layout.tsx` (fonts)
