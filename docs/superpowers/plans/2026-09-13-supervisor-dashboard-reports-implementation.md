# Supervisor Dashboard, Reports and Ticket Assignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the supervisor dashboard, filtered reports, and safe advisor assignment to the existing frontend ticket workspace using only the backend contracts confirmed in OpenAPI.

**Architecture:** Extend the existing `features/tickets` domain with typed report and advisor API modules, TanStack Query hooks, and focused reusable presentation components. Keep `/personal` supervisor-only, reuse the current staff ticket detail and invalidation keys, and let the backend remain authoritative for permissions and validation.

**Tech Stack:** React, TypeScript, React Router, TanStack Query, Vitest, Testing Library, Vite, CSS tokens already present.

## Global Constraints

- Work exclusively in `C:\dev\sistema-gestion-tickets\frontend`.
- Do not modify the backend or files outside this repository.
- Use exact backend paths under `VITE_API_BASE_URL`: `/reports/summary`, `/reports/by-status`, `/reports/by-category`, `/reports/by-priority`, `/reports/resolution-time`, `/users/advisors`, and `/tickets/{ticket_id}/assignments`.
- Use `from`, `to`, `category_id`, `status`, and `priority` as report query names.
- Use `PublicUser[]` for active advisor candidates and `AssignmentCreate { advisor_id: string }` for assignment.
- Do not add a chart dependency or simulate pagination; the confirmed API has no page, page_size, total, or equivalent contract.
- Preserve authentication, Bearer handling, sessionStorage strategy, chatbot inactivity for staff, client portal, comments, history, academic disclaimer, accessibility, responsive layout, and `/panel/*` replacement redirects.
- Do not store sensitive data in localStorage, expose JWTs, expose raw author UUIDs, or create intermediate commits.

## Exact File Map

Create:

- `src/features/reports/types/report-types.ts`: exact summary, distribution item, resolution-time, and report-filter interfaces.
- `src/features/reports/api/report-api.ts`: typed GET functions for the four reports and summary.
- `src/features/reports/hooks/use-reports.ts`: stable filter query keys and TanStack Query hooks.
- `src/features/reports/components/report-filters.tsx`: accessible reusable filter form.
- `src/features/reports/components/report-distribution.tsx`: accessible CSS bars/table for status, category, and priority.
- `src/features/reports/components/report-state.tsx`: loading, error/retry, and empty state wrapper.
- `src/features/reports/pages/supervisor-dashboard-page.tsx`: `/personal` summary cards and report sections.
- `src/features/tickets/components/ticket-assignment.tsx`: supervisor-only advisor selector and assignment confirmation/status.

Modify:

- `src/features/tickets/types/ticket-types.ts`: retain exact assignment contract and share it with the assignment component.
- `src/features/tickets/api/ticket-api.ts`: add `listAdvisors()` and `assignTicket(ticketId, data)` using the exact endpoints.
- `src/features/tickets/hooks/use-tickets.ts`: add advisor query and assignment mutation with ticket/history/comments/staff-list invalidation.
- `src/features/tickets/pages/staff-ticket-detail-page.tsx`: render assignment only for SUPERVISOR and keep shared detail UI.
- `src/app/router.tsx`: render the real supervisor dashboard at `/personal` and redirect ASESOR to `/personal/tickets`.
- `src/styles/globals.css`: mobile-first cards, report bars, filter controls, and assignment status styling using existing tokens.
- `src/features/reports/reports-api.test.ts`: RED/GREEN API contract tests.
- `src/features/reports/reports.test.tsx`: dashboard/report/filter/state tests.
- `src/features/tickets/tickets-api.test.ts`: advisor and assignment endpoint tests.
- `src/features/tickets/tickets.test.tsx`: assignment role, success, errors, cache refresh, and regression tests.
- `src/app/app.test.tsx`: dashboard role access and ASESOR redirect tests.
- `README.md`: dashboard, reports, advisor assignment, exact filters, and pagination limitation.

## TDD Execution

### Task 1: Typed report and advisor contracts

**RED:** Add API tests before implementation. Mock `fetch` and require `/reports/summary`, all four report paths, `/users/advisors`, and `/tickets/ticket-1/assignments`; assert Bearer is delegated to the central client, query names are exact, methods are GET/POST, and assignment body is exactly `{ advisor_id: 'advisor-1' }`. Assert no page parameters are sent.

**Verify RED:** Run `npm run test -- --run src/features/reports/reports-api.test.ts src/features/tickets/tickets-api.test.ts -t "report|advisor|assign"`. Expected: missing exports/functions.

**GREEN:** Create the interfaces below and minimal functions:

```ts
export interface ReportFilters {
  from: string
  to: string
  category_id: string
  status: TicketStatus | ''
  priority: TicketPriority | ''
}
export interface SummaryReport { total_tickets: number; new_tickets: number; assigned_tickets: number; in_process_tickets: number; pending_client_tickets: number; resolved_tickets: number; closed_tickets: number; cancelled_tickets: number; average_resolution_time_hours: number }
export interface StatusReportItem { status: TicketStatus; count: number }
export interface CategoryReportItem { category_id: string; category_name: string; count: number }
export interface PriorityReportItem { priority: TicketPriority; count: number }
export interface ResolutionTimeReport { resolved_tickets: number; average_resolution_time_hours: number }
export interface Report<T> { items: T[] }
export interface PublicUser { id: string; full_name: string; email: string; role: string }
```

Serialize only nonempty filter values, preserving the exact names and no invented query fields. Use `apiClient.get` and `apiClient.post` so Authorization remains centralized.

**Verify GREEN:** The focused command passes and URL/body assertions are exact.

### Task 2: TanStack Query data layer

**RED:** Add hook-level/component tests requiring stable filter keys, summary loading/error/retry, four report requests sharing one applied filter snapshot, advisor loading/error/empty, and assignment invalidation.

**GREEN:** Add `useSummaryReport`, `useStatusReport`, `useCategoryReport`, `usePriorityReport`, `useResolutionTimeReport`, and `useAdvisors`. Add `useAssignTicketMutation(ticketId)` that updates `ticketQueryKey(ticketId)` with the returned ticket and invalidates `ticketHistoryQueryKey`, `ticketCommentsQueryKey`, `ticketsQueryKey`, and `['operational-tickets']`.

**REFACTOR:** Centralize report query-string construction and reuse the existing ticket invalidation helper without changing existing behavior.

**Verify:** Run report and ticket hook tests; expected all pass with no localStorage writes.

### Task 3: Reusable report filters and distributions

**RED:** Test labeled date/category/status/priority controls, applying one complete snapshot, empty filters, CSS bar/table output, accessible labels, and empty/error/retry messages.

**GREEN:** Create `ReportFilters` using local state and `onApply(filters)`. Do not request while typing. Create `ReportDistribution` with accessible table rows and proportional CSS widths based on the largest count; show a clear empty state for zero items. `ReportState` must expose `role="status"` for loading and `role="alert"` plus `Reintentar` for errors.

**Verify:** Run `npm run test -- --run src/features/reports/reports.test.tsx -t "filtro|distribución|estado"` and expect pass.

### Task 4: Supervisor dashboard `/personal`

**RED:** Add route tests for anonymous redirect to `/personal/login`, CLIENTE denial, ASESOR redirect to `/personal/tickets`, SUPERVISOR dashboard access, summary values, report sections, loading, error/retry, and empty data.

**GREEN:** Implement `SupervisorDashboardPage` with `useSummaryReport` and all four report hooks. Render cards for total, NUEVO, ASIGNADO, EN_PROCESO, PENDIENTE_CLIENTE, RESUELTO, CERRADO, CANCELADO, and average resolution hours. Use one applied `ReportFilters` state for all requests. Preserve `/personal` as SUPERVISOR-only and keep the staff layout/disclaimer.

**REFACTOR:** Extract only repeated card/report markup into the report components; do not implement dashboard actions, reporting exports, or pagination.

**Verify:** Run dashboard, auth, chatbot, client-ticket, and routing suites.

### Task 5: Safe advisor assignment

**RED:** Test that only SUPERVISOR sees the selector, only `role === 'ASESOR'` and active candidates are shown, no manual ID field exists, assignment confirmation sends the exact body, pending disables controls, success refreshes detail/bandeja, and 401/403/404/409/422 show generic safe errors. Test CLIENTE/ASESOR cannot assign.

**GREEN:** Implement `TicketAssignment` with `useAdvisors` and `useAssignTicketMutation`. Render a labeled select of active advisors only, a confirmation dialog before POST, loading/empty/error/retry states, and safe generic error text. Never render an advisor UUID as editable input. Render it in `StaffTicketDetailPage` only for SUPERVISOR.

**Verify:** Run assignment tests and assert POST `/tickets/{id}/assignments`, `Authorization: Bearer`, and cache invalidation.

### Task 6: Styling, docs, regressions, and auto-audit

**RED/GREEN:** Add responsive CSS using existing tokens and update README with exact endpoints, filters, roles, no-pagination limitation, fictitious demo accounts, and no real banking data. Keep `/panel/*` redirects and chatbot staff exclusion unchanged.

**Verify commands:**

```bash
npm run lint
npm run test
npm run build
npm audit --omit=dev
git diff --check
git status
```

Expected results: lint exit 0, all tests pass, build exit 0, audit reports `found 0 vulnerabilities`, diff check has no errors, and status is clean after the single commit.

Auto-audit before commit:

- Confirm all files are inside the frontend repository and backend `git status --short` is empty.
- Confirm `git ls-files '.env*'` contains only `.env.example` and no secrets.
- Confirm no runtime `localStorage` writes, JWT/message/password logging, raw author UUID rendering, invented endpoints, or pagination controls.
- Confirm only `/personal/*` are official internal destinations and `/panel/*` contains redirect behavior only.
- Confirm CLIENTE, ASESOR, SUPERVISOR, and anonymous route access matches the guards.
- Confirm the plan has no `TBD` or `TODO` placeholders and no contract contradictions.

Create exactly one final commit:

```bash
git add README.md docs/superpowers/plans/2026-09-13-supervisor-dashboard-reports-implementation.md src
git commit -m "feat(reports): add supervisor dashboard and ticket assignment"
git status --short
```
