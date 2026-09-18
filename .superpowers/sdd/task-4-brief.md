# Task 4 Brief — Client Portal

Read this first. It is the complete requirement for this task.

## Global constraints

- Work only on branch `ui-redesing-gnb-v2`; do not commit, push, install dependencies, modify backend files, or revert other work.
- You are not alone in the repository. Own only the files listed below and preserve concurrent edits.
- The immutable visual source is `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913\src\client.tsx` plus `src\index.css`; port structure/classes directly. Do not reinterpret the design.
- Use only existing real ticket/chat/category APIs and returned data. No runtime mocks or hardcoded domain records, metrics, identities or tracking codes.
- Keep React Router, TanStack Query, React Hook Form, Zod, JWT/roles and `sessionStorage`. TypeScript must contain no `any`.

## Ownership

- Modify `src/components/layout/portal-layout.tsx`.
- Modify `src/features/tickets/pages/client-dashboard-page.tsx`, `client-tickets-page.tsx`, `client-ticket-create-page.tsx`, `client-ticket-detail-page.tsx`.
- Modify `src/features/tickets/components/ticket-list.tsx`, `ticket-form.tsx`, `ticket-detail-meta.tsx`, `ticket-history.tsx`, `ticket-comments.tsx`, `ticket-badges.tsx`.
- Create/modify `src/features/tickets/client-portal.test.tsx` and `src/features/tickets/tickets.test.tsx`.
- Write `.superpowers/sdd/task-4-report.md`.

## Required behavior

1. Follow TDD and capture an actual failing RED before implementation.
2. Port the ZIP's `ClientShell`: desktop sidebar, compact header, account/logout control and accessible mobile drawer. Use `NavLink`; visible state must follow the route.
3. Dashboard statistics and recent items derive solely from `GET /tickets/mine`. Render the four Figma stat tiles without fabricated deltas/trends. Include loading/error/empty/success states and the two action cards.
4. Port ticket list using the Figma table on wide viewports and accessible cards on small screens. Do not implement artificial pagination because the API returns an array without pagination metadata.
5. Preserve current RHF/Zod creation/conversion workflows. Categories come from the real categories query; conversion uses only the real conversation ID from `sessionStorage`. Tracking codes are rendered only from the server response, never generated client-side.
6. Port detail metadata, history timeline and comments to the exact `TicketRead`, `HistoryRead` and `CommentRead` shapes. Do not invent actor names: use available backend fields or neutral labels. Preserve real comment mutation and visible server errors.
7. All controls require correct labels, focus states, keyboard access and 44px touch targets; expose loading via `aria-busy`/live status where appropriate.
8. Validate ticket and conversation identifiers before enabling queries/mutations. A malformed route/query/session ID must cause zero API calls. Cover category-query errors, duplicate-submit prevention and direct query invalidation assertions.

## Verification

- RED then GREEN target: `npm run test -- src/features/tickets/client-portal.test.tsx src/features/tickets/tickets.test.tsx`.
- After GREEN run `npm run lint`, `npm run build`, and `git diff --check`.
- Report status, changed files, RED/GREEN evidence, all command results, and any fidelity limitation. No commit/push.
