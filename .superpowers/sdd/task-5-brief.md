# Task 5 Brief — Advisor Portal

Read this first. It is the complete requirement for this task.

## Global constraints

- Work only on branch `ui-redesing-gnb-v2`; do not commit, push, install dependencies, modify backend files, or revert other work.
- You are not alone in the repository. Own only the listed files and preserve concurrent edits.
- The immutable visual source is `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913\src\staff.tsx` plus `src\index.css`; directly port `StaffShell`, `AdvisorDashboard`, `StaffTickets`, and staff detail structure/classes. Do not reinterpret.
- Use only real APIs and returned data. No runtime mocks, hardcoded records/metrics/names, role switcher, artificial pagination or optimistic success.
- Keep React Router, TanStack Query, JWT/roles and `sessionStorage`; backend remains permission authority. TypeScript without `any`.

## Ownership

- Modify `src/components/layout/staff-layout.tsx`.
- Modify `src/features/tickets/pages/staff-tickets-page.tsx`, `staff-ticket-detail-page.tsx`; create `advisor-dashboard-page.tsx`.
- Modify `src/features/tickets/components/ticket-filters.tsx`, `ticket-actions.tsx`, `ticket-assignment.tsx`.
- Modify `src/app/router.tsx` only for advisor/staff routes.
- Create/modify `src/features/tickets/advisor-portal.test.tsx` and `ticket-filters.test.tsx`.
- Write `.superpowers/sdd/task-5-report.md`.

## Required behavior

1. Follow TDD and capture a true failing RED first.
2. Port the ZIP dark desktop sidebar/header and accessible mobile drawer. Build navigation from the authenticated backend role; `NavLink` sets active state. Advisors must not see supervisor routes or chatbot.
3. `/personal` for an advisor renders the Figma advisor dashboard. Every count/recent queue item derives from `GET /tickets`; include loading/error/empty/success states and omit fabricated trends.
4. Port the inbox filters and responsive table/card views. Query parameters must match existing real filters. Omit functional pagination because the response lacks pagination metadata.
5. Port staff detail/actions using real detail/history/comments and status/close/reopen/cancel mutations. Destructive/status transitions use accessible confirmation/reason modals. Server failures remain visible; never present an unconfirmed optimistic success.
6. Assignment controls remain supervisor-only even if the component is reused. UI role guards are UX only; backend errors remain authoritative.
7. Treat backend transitions as the oracle and never expose unsupported advisor self-assignment. Cover mutation 403/409/422, malformed ticket IDs causing zero requests, and report-query invalidation when a status transition changes supervisor metrics.

## Verification

- RED then GREEN target: `npm run test -- src/features/tickets/advisor-portal.test.tsx src/features/tickets/ticket-filters.test.tsx`.
- After GREEN run `npm run lint`, `npm run build`, and `git diff --check`.
- Report status, changed files, RED/GREEN evidence, command results and concerns. No commit/push.
