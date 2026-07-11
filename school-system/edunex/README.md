# EduNex — School Management System (Frontend)

A React 19 + Vite + TypeScript + Tailwind CSS v4 frontend for a school management platform, with six role-based portals (Administrator, Headteacher, Class Teacher, Subject Teacher, Student, Parent).

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL. Sign in at `/login` — pick any role from the grid; any password works since this is a UI-only build with dummy JSON data (no backend).

## What's built (Phase 1)

- Full auth flow: Login (with role picker), Forgot Password, OTP Verification, Reset Password
- Shared dashboard shell: collapsible sidebar (role-aware nav), top bar (search, notifications, theme toggle, profile menu), breadcrumbs
- Light/dark mode
- Administrator: full dashboard (stats, trend/attendance/grade charts, top performers, announcements) + Manage Students (searchable, filterable, paginated table)
- Headteacher, Class Teacher, Subject Teacher, Student, Parent: role-specific dashboards with distinct stats/charts
- Every other nav item (Manage Teachers, Timetable Generator, Marks Entry, Report Cards, Settings, etc.) routes to a placeholder page — the navigation, layout and routing are fully wired for them, ready for the next build phase

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · React Router · Recharts · Lucide React · Radix UI primitives

## Next phases

The remaining feature pages (marks entry spreadsheet, timetable generator, report cards, settings, teacher/parent/subject management tables, analytics deep-dives, etc.) can be built out screen by screen from here — the data models, nav structure, and design system are already in place to support them.
