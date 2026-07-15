# EduNex — School Management System (Frontend)

React + Vite, **vanilla CSS only** (no Tailwind/Bootstrap/UI kits). Green design
system, six role-based dashboards, centralized API layer, and dummy data that's
structured to swap for a real backend with minimal changes.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. From the landing page, click **Log in** and use
any of the demo role buttons (password is ignored in mock mode):

| Role             | Email                          |
|------------------|---------------------------------|
| Administrator    | admin@edunex.io                |
| Headteacher      | head@edunex.io                 |
| Class Teacher    | classteacher@edunex.io         |
| Subject Teacher  | subjectteacher@edunex.io       |
| Student          | student@edunex.io              |
| Parent           | parent@edunex.io               |

## Architecture

```
src/
 ├── api/              # Centralized HTTP layer — every request goes through here
 │    ├── axios.js      # axios instance, env-aware base URL, auth/error interceptors
 │    ├── endpoints.js   # every REST path as a constant
 │    ├── mock.js        # simulated-latency resolver used while USE_MOCK_DATA = true
 │    └── *.api.js       # one file per resource (auth, student, teacher, marks, …)
 ├── data/             # Dummy data, one file per entity (students, teachers, …)
 ├── context/          # Theme, Auth, Toast providers
 ├── components/       # common/ (DataTable, Modal, Tabs…) and layout/ (Sidebar, Navbar)
 ├── pages/            # public, auth, admin, headteacher, classteacher,
 │                        subjectteacher, student, parent, and shared/ (reusable
 │                        modules like Attendance, Analytics, Results, Timetable)
 ├── routes/            # navConfig.js (sidebar+routes single source), AppRoutes.jsx
 └── styles/            # variables.css (design tokens), global.css, layout.css
```

### Going live with a real backend

1. Set `USE_MOCK_DATA = false` in `src/api/axios.js`.
2. Point `BASE_URLS` (same file) at your API for each environment.
3. Every `*.api.js` function already has its real-call branch written — no
   component code changes needed, since pages only ever import from `api/`
   or `data/`, never call `fetch`/`axios` directly.

### Design tokens

All colors are CSS custom properties in `src/styles/variables.css` (green
primary `#16A34A`, hover `#15803D`, light `#DCFCE7`, dark-mode primary
`#22C55E`). Change them there and the whole app — buttons, charts, badges,
sidebar, focus states — updates automatically.

### Known simplification

To keep ~150 requested screens maintainable, closely related admin bullet
points (e.g. Core/Elective Subjects, Registration, Allocation, Dropping) are
implemented as tabs within one page rather than five near-duplicate routes.
Every dashboard, role, and feature area from the spec is present.
