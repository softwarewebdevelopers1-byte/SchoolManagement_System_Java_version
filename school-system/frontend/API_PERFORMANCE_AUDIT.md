# API Request Performance Audit Report

## Executive Summary

The frontend codebase contains multiple patterns that cause duplicate or unnecessary API requests. The root cause is **URL fragmentation**: different components call the same logical backend resource through different URL paths (e.g., `/school/subjects` vs. `/getAll/subjects/${schoolId}`), bypassing the GET response cache which keys on exact URL strings. Additionally, child tab components independently fetch data that parent containers already loaded, and several components retain dead/legacy code paths.

The GET cache in `api.ts` (10-second TTL, in-flight deduplication) mitigates most issues *only when the exact same URL is reused*. Cache effectiveness is severely limited by URL divergence.

---

## Architecture Primer

### API Layer (`frontend/src/lib/api.ts`)

| Component | Behavior |
|---|---|
| `GET_CACHE_TTL_MS` | 10,000 ms (10 seconds) |
| Cache key | `${token}:${targetURL}` |
| In-flight dedup | `inflightGetRequests` Map — collapses concurrent identical GETs |
| POST/PUT/PATCH/DELETE | Calls `invalidateApiCache()` on success, clearing all GET cache entries |
| `api.get(path)` | Dispatches `path` to internal fetcher functions that call `request()` with **different backend URLs** than what callers might expect |
| `request(url)` | Direct HTTP call — also subject to GET cache, but bypasses `api.get()` dispatch routing |

### StrictMode

`frontend/src/main.tsx:6` wraps `<App />` in `<React.StrictMode>`. In development, all `useEffect` hooks fire twice. This **doubles every mount-time API call** during development only (no production impact).

---

## Finding 1 — AdminDashboard / StudentsTab URL Fragmentation (Critical)

**Severity**: Critical
**Files**: `frontend/src/components/admin/AdminDashboard.tsx:505-520`, `frontend/src/lib/adminData.ts:469-531`, `frontend/src/components/admin/StudentsTab.tsx:308`

### The Problem

`AdminDashboard` and `StudentsTab`'s `useClassesData()` hook fetch the same logical data through **different backend URLs**:

| Logical Resource | AdminDashboard `request()` URL | `useClassesData` / `api.get()` URL | Cache Match? |
|---|---|---|---|
| Students | `/v1/students/roster?size=100` | `/get/all/students?schoolId=...&page=0&size=20` | **No** |
| Teachers | `/v1/teachers/roster?size=100` | `/users/${schoolId}/teachers` | **No** |
| Subjects | `/getAll/subjects/${schoolId}` | `/getAll/subjects/${schoolId}` (via `fetchSubjectsData`) | Yes |
| Class-subject joints | `/get/all/subject-joints/${schoolId}` | `/get/all/subject-joints/${schoolId}` (via `fetchAssignmentsData`) | Yes |
| Classes | `/all/classes/${schoolId}` | `/all/classes/${schoolId}` | Yes |

**Result**: Students and teachers data are fetched twice on initial AdminDashboard load when the StudentsTab renders — once by `AdminDashboard.loadDashboardData()` and again by `useClassesData()` in `StudentFormModal` (StudentsTab.tsx:308).

### Additional Student Duplication

`StudentsTab` itself has a separate `useEffect` (line 1473) that fetches `/get/all/students?schoolId=...&page=0&size=500` when a class filter is active — yet **another** distinct URL for student data.

### Impact

On a fresh Admin dashboard load with StudentsTab active:
- **Students**: 2–3 separate network requests (3 distinct URLs, zero cache sharing)
- **Teachers**: 2 separate network requests (2 distinct URLs, zero cache sharing)
- **Subjects, classes, assignments**: potentially cached (10s window), but cache invalidation from any mutation clears them

### Recommendation

Standardize `AdminDashboard` to use the same `api.get()` path-based calls as `useClassesData()` (e.g., `api.get("/school/subjects")`, `api.get("/school/assignments")`, `request("/all/classes/${schoolId}")`), or vice-versa. This ensures cache key reuse and reduces 2–3 requests down to 1 per resource.

---

## Finding 2 — PerformanceTab Independent Fetches (Critical)

**Severity**: Critical
**Files**: `frontend/src/components/admin/PerformanceTab.tsx:149,225,294,295,343-348`

### The Problem

`PerformanceTab` fires multiple parallel/sequential requests that overlap with `AdminDashboard`'s data:

1. **`useCbcGradingBands()`** (line 149) — fetches `/create/grading-scale/${schoolId}` on mount
2. **`api.get("/school/class-subjects")`** (line 225) in `loadPerformance()` — fetches subject-class joints. AdminDashboard already fetched this via `request("/get/all/subject-joints/${schoolId}")`, but the URL differs (`/school/class-subjects` vs `/get/all/subject-joints/${schoolId}`), so **no cache hit**.
3. **`loadChartData()`** (line 347, triggered by effect at line 343) — fetches termly mark trend data per class.
4. **`loadTermlyTrend()`** (line 348) — also fetches per-class trend data.

### Impact

When navigating to the Performance tab, 3+ independent request cycles fire:
- One for CBC grading bands
- One for `/school/class-subjects` (cache miss despite parent having same data)
- One for chart data (per-class mark trends)
- One for termly trend (per-class mark trends)

The chart and trend queries may be hitting the same or nearly-same backend endpoints with different or redundant parameters.

### Recommendation

1. Have `AdminDashboard` store the subject joints data and pass it to `PerformanceTab` as props (it already passes `classes`, `students`).
2. Consolidate `loadChartData` and `loadTermlyTrend` into a single batched request or eliminate one if they fetch overlapping data.

---

## Finding 3 — Dead Code: SubjectTeacherDashboard `refreshUser` (High)

**Severity**: High
**Files**: `frontend/src/components/subjectteacher/SubjectTeacherDashboard.tsx:247-250`

### The Problem

```typescript
const refreshUser = useCallback(async () => {
  if (!currentUser?.id) return;
  try {
    return;  // <-- EARLY RETURN: entire function body is dead code
    const freshUser: any = await api.get(`/users/${currentUser.id}`);
    // ...rest never executes
  }
}, [currentUser?.id]);
```

Line 250 contains a bare `return;` that makes the entire `refreshUser` body dead code. If this was intended to be a no-op (e.g., disabled for debugging), it should be removed or properly commented. As written, it's confusing and suggests an incomplete refactor.

### Impact

No runtime impact (the function does nothing). Maintenance hazard — developers may assume user-refresh logic exists and build dependencies on it.

### Recommendation

Remove the function entirely if unused, or remove the `return;` if the refresh logic is needed.

---

## Finding 4 — SuperAdmin Cross-View Duplicate Fetches (Medium)

**Severity**: Medium
**Files**: `frontend/src/components/TopAdmin/SuperAdminOverview.tsx`, `SuperAdminAnalytics.tsx`, `SuperAdminSchools.tsx`, `SuperAdminInvitations.tsx`

### The Problem

| Endpoint | SuperAdminOverview | SuperAdminAnalytics | SuperAdminSchools | SuperAdminInvitations |
|---|---|---|---|---|
| `/stats/platform/overview` | Fetch on mount | Fetch on mount | — | — |
| `/schools` | — | — | Fetch on mount | Fetch on mount (line 53) |

- **Overview vs Analytics**: Both fetch platform statistics on mount. If a user navigates from Overview to Analytics within 10 seconds, the cache hits. Otherwise, the request is duplicated.
- **Schools vs Invitations**: Both fetch the schools list. Same 10-second cache window applies.

### Impact

When switching between Overview and Analytics tabs, or between Schools and Invitations tabs, the same endpoint may be re-fetched if more than 10 seconds have passed. The 10-second cache window is short for admin dashboards where data is relatively static.

### Recommendation

Extract shared data into a React Context or shared query state (e.g., `useQuery` with longer TTL). Alternatively, increase the GET cache TTL for read-only admin endpoints that change infrequently.

---

## Finding 5 — ClassTeacherDashboard `refreshUser` → `loadData` Double-Fire Chain (Medium)

**Severity**: Medium
**Files**: `frontend/src/components/classteacher/ClassTeacherDashboard.tsx`

### The Problem

`ClassTeacherDashboard` has:
1. `refreshUser()` which fetches `/users/${id}` on mount
2. `loadData()` which fetches 3 endpoints in parallel (`/teacher-remarks`, `/school/subjects`, `/school/class-subjects`)
3. `loadData` depends on `currentUser` state
4. `refreshUser` updates `currentUser` state

If `refreshUser` completes and calls `setCurrentUser`, this triggers `loadData` to re-run, causing a **second full fetch cycle** of all 3 endpoints.

### Impact

On initial mount: 4 API requests (1 for user + 3 for dashboard data), and if `refreshUser` triggers `setCurrentUser`, a second batch of 3 requests fires — effectively **doubling** the initial load.

### Recommendation

Decouple `currentUser` updates from `loadData` triggers. Either:
- Skip `loadData` on the refresh-driven update by guarding with a ref, or
- Merge `refreshUser` into `loadData` so user data is fetched as part of the initial batch.

---

## Finding 6 — ClassTeacher Sub-Component Duplicate Remarks Fetches (Medium)

**Severity**: Medium
**Files**: `frontend/src/components/classteacher/ResultsReports.tsx:107`, `frontend/src/components/classteacher/StudentPerformance.tsx:125`

### The Problem

Both `ResultsReports` and `StudentPerformance` fetch `/teacher-remarks` (per subject) on mount. If both components are rendered simultaneously (e.g., in a tabbed interface where both are mounted for comparison), the same teacher-remarks endpoint is fetched twice.

Both also call `useCbcGradingBands()`, fetching `/create/grading-scale/${schoolId}` independently.

### Impact

When both components mount: 2× teacher-remarks requests + 2× CBC grading bands requests (though the latter may hit cache within 10s).

### Recommendation

Memoize or share teacher-remarks data via a parent container or React Context. Deduplicate `useCbcGradingBands` calls by moving the hook to a shared parent or using a query-library cache key.

---

## Finding 7 — StudentDashboard Redundant Fetch (Medium)

**Severity**: Medium
**Files**: `frontend/src/components/students/StudentDashboard.tsx:110`

### The Problem

`StudentDashboard` calls `useCbcGradingBands()` on mount (line 110), fetching `/create/grading-scale/${schoolId}`. If the user previously navigated through a teacher/parent view that also uses `useCbcGradingBands()`, the cache may have expired (10s TTL), causing a redundant fetch.

### Impact

CBC grading bands are fetched on every dashboard view that uses them. With a 10-second cache TTL, rapid navigation between views causes repeated requests.

### Recommendation

Extend the GET cache TTL for `/create/grading-scale/${schoolId}` to at least 60 seconds, or centralize the hook via a shared query/client cache.

---

## Finding 8 — MarksEntry & Multiple `useCbcGradingBands` Consumers (Low-Medium)

**Severity**: Low-Medium
**Files**: `frontend/src/components/shared/MarksEntry.tsx:122` and 7 other files

### The Problem

`useCbcGradingBands` is called in **9 components** across the app:
1. `PerformanceTab.tsx:149`
2. `CbcGradingConfigTab.tsx:93`
3. `StudentDashboard.tsx:110`
4. `MarksEntry.tsx:122`
5. `Analytics.tsx:190` (ClassTeacher)
6. `ResultsReports.tsx:107`
7. `StudentPerformance.tsx:125`
8. `StudentDetails.tsx:34`
9. `TeacherRemarkTab.tsx:16`

All fetch `/create/grading-scale/${schoolId}`. The 10-second cache provides some protection if multiple components mount within the same 10-second window, but any component mounting after 10 seconds triggers a new request.

### Impact

In a typical admin session where a teacher navigates between marks entry, analytics, and student records, CBC bands data is refetched 5–9 times per minute.

### Recommendation

Promote the CBC grading bands fetch to a singleton-level cache (e.g., sessionStorage, or React Query with staleTime > 300s).

---

## Finding 9 — App.tsx DashboardSelector Fetches `/school/subjects` (Low)

**Severity**: Low
**Files**: `frontend/src/App.tsx:69`

### The Problem

On the `/edunex-org/dashboard` route, `DashboardSelector` calls `api.get("/school/subjects")` on mount to determine whether to redirect remarks-teachers. This endpoint routes to `fetchSubjectsData` → `request("/getAll/subjects/${schoolId}")`.

This URL matches what `AdminDashboard` fetches, so it's a **cache hit** — but only if AdminDashboard mounts within 10 seconds. Since `DashboardSelector` runs first (route guard), the cache is warm for AdminDashboard's initial load. ✓

**Status**: Not a bug, but fragile. If the 10-second TTL expires between these two fetches (unlikely since they're milliseconds apart), a redundant request occurs.

---

## Finding 10 — AdminAttendanceInsights Cache-Safe Fetch (Low)

**Severity**: Low
**Files**: `frontend/src/components/admin/attendance-insights/AdminAttendanceInsights.tsx:49`

### The Problem

`AdminAttendanceInsights` fetches `api.get("/all/classes/" + encodeURIComponent(schoolId))`. This falls through `api.get()` to `request("/all/classes/" + encodeURIComponent(schoolId))` — the **same URL** that `AdminDashboard`'s `loadDashboardData` fetches (line 519).

Cache key matches → **cache hit** (within 10s TTL). ✓

**Status**: Not a bug currently, but the URL pattern differs from what `api.get("/school/classes")` would resolve to (`loadClasses()` uses a different endpoint). This is an area of potential future breakage.

---

## Cache Effectiveness Matrix

| Component | Endpoint | Cache Match? | Risk |
|---|---|---|---|
| App.tsx → AdminDashboard | `/getAll/subjects/${schoolId}` | ✓ (same URL) | Low |
| AdminDashboard → StudentsTab | Students/teachers data | ✗ (different URLs) | **Critical** |
| AdminDashboard → PerformanceTab | Subject joints | ✗ (`/get/all/subject-joints/...` vs `/school/class-subjects`) | **Critical** |
| AdminDashboard → AdminAttendanceInsights | `/all/classes/${schoolId}` | ✓ (same URL) | Low |
| SuperAdminOverview ↔ Analytics | Platform stats | ✓ (if <10s apart) | Low-Med |
| SuperAdminSchools ↔ Invitations | Schools list | ✓ (if <10s apart) | Low-Med |
| Any → `useCbcGradingBands` consumers | `/create/grading-scale/${schoolId}` | ✓ (same URL) | Low-Med |
| ClassTeacher `refreshUser` → `loadData` | `/teacher-remarks`, subjects, class-subjects | ✓ (same URLs) | Medium (double-fire) |

---

## Recommendations (Prioritized)

### Immediate (P0)
1. **Unify AdminDashboard and StudentsTab API URLs**: Route AdminDashboard through `api.get()` helpers instead of raw `request()` with `/v1/` URLs. This unlocks cache sharing and eliminates the 2× student + 2× teacher fetches.

### Short-term (P1)
2. **Pass subject-joints data from AdminDashboard to PerformanceTab** as props instead of refetching `/school/class-subjects`.
3. **Remove dead `refreshUser`** in SubjectTeacherDashboard (line 250) or make it functional.
4. **Fix ClassTeacherDashboard double-fetch chain**: guard `loadData` against `refreshUser`-triggered re-fires.

### Medium-term (P2)
5. **Increase GET cache TTL** for static reference data (CBC grading bands, classes list) to 60+ seconds.
6. **Move `useCbcGradingBands` to a shared context** to eliminate 9 redundant fetchers.
7. **Share teacher-remarks data** between ResultsReports and StudentPerformance via context/props.
8. **Consolidate SuperAdmin shared data** (platform stats, schools list) into cached query state.

### Development-only
9. **StrictMode**: Accept dev-only double-render as expected behavior; ensure no production impact. No code change needed.
