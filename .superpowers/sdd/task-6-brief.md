# Task 6 Brief — Supervisor Reports, Assignment, and Knowledge Management

Read this first. It is the complete requirement for this task.

## Global constraints

- Work only on branch `ui-redesing-gnb-v2`; do not commit, push, install dependencies, modify backend files, or revert other work.
- You are not alone in the repository. Own only the listed files and preserve concurrent edits.
- The immutable visual source is `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913\src\staff.tsx` plus `src\index.css`; port `SupDashboard`, `Reports`, `Assign`, and `Knowledge` structure/classes directly.
- Use only the verified real report, ticket, advisor, FAQ and category APIs. No runtime mocks, invented trends/rates/results, fake export, fake delete or artificial pagination.
- Keep React Router, TanStack Query, React Hook Form, Zod, JWT/roles and `sessionStorage`. TypeScript without `any`; backend remains authorization authority.

## Ownership

- Modify `src/features/reports/pages/supervisor-dashboard-page.tsx`; create `reports-page.tsx`.
- Create `src/features/tickets/pages/ticket-assignment-page.tsx`.
- Create `src/features/faqs/pages/knowledge-page.tsx`, `components/faq-form.tsx`, `components/category-form.tsx`, `knowledge-schemas.ts`.
- Modify `src/features/reports/components/report-distribution.tsx`, `report-filters.tsx`, `report-state.tsx`.
- Modify `src/app/router.tsx` only for supervisor/report/assignment/knowledge routes.
- Create/modify `src/features/reports/supervisor-pages.test.tsx`, `src/features/faqs/knowledge-page.test.tsx`, `src/features/reports/reports-api.test.ts`.
- Write `.superpowers/sdd/task-6-report.md`.

## Verified capabilities

- Reports: consume the five existing GET endpoints via existing report hooks/contracts.
- Assignment: use real unassigned tickets, `GET /users/advisors`, and existing assignment mutation with `advisor_id`.
- Knowledge: use Task 2 real create/update/status mutations. There is no DELETE endpoint.
- Export has no endpoint. It must be visibly disabled and described as `Funcionalidad no disponible`; it must not fabricate/download anything.

## Required behavior

1. Follow TDD and capture a true failing RED first.
2. Port the supervisor dashboard/reports. Populate every number/bar/table from query responses; distributions must be zero-safe. Do not render invented comparisons, deltas or SLA trends.
3. Report filters must map to real query keys/parameters and retain loading/error/empty/success states.
4. Port assignment with only real unassigned ticket/advisor IDs, accessible confirmation, visible server failures and precise invalidation/refetch after success.
5. Port knowledge tabs/cards/table/modals. RHF/Zod schemas must match OpenAPI bounds. Replace ZIP delete interactions with activate/deactivate; never expose a functional delete action.
6. Routes are supervisor-only in UI. Do not show chatbot in any internal role.
7. Knowledge API listing returns active records only. After deactivation a record can disappear and cannot be rediscovered/reactivated after refresh; expose this real limitation honestly and do not retain fabricated runtime records. Cover partial report failures and report invalidation after ticket status/assignment changes.

## Verification

- RED then GREEN target: `npm run test -- src/features/reports/supervisor-pages.test.tsx src/features/faqs/knowledge-page.test.tsx src/features/reports/reports-api.test.ts`.
- After GREEN run `npm run lint`, `npm run build`, and `git diff --check`.
- Report status, changed files, RED/GREEN evidence, command results and fidelity limitations. No commit/push.
