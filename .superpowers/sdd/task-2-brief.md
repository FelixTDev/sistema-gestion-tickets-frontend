# Task 2 Brief — Typed HTTP Methods, Knowledge Contracts, and Security Invariants

Read this first. It is the complete requirement for this task.

## Global constraints

- Work only on branch `ui-redesing-gnb-v2`; do not commit, push, install dependencies, modify backend files, or revert other work.
- You are not alone in the repository. Own only the files listed below and preserve concurrent edits.
- Use TypeScript without `any`, real OpenAPI contracts, TanStack Query and the single client `src/lib/api-client.ts`.
- Never add runtime mock data or token persistence in `localStorage`.
- Never use unsafe DOM injection, dynamic code execution, or unvalidated URL navigation.
- Follow TDD and record RED/GREEN evidence.

## Ownership

- Modify `src/lib/api-client.ts` and `src/lib/api-client.test.ts`.
- Modify `src/features/faqs/types/faq-types.ts`, `src/features/faqs/api/faq-api.ts`, and `src/features/faqs/hooks/use-faqs.ts`.
- Create `src/features/faqs/knowledge-api.test.ts`.
- Create `src/app/runtime-invariants.test.tsx`.
- Write the full report to `.superpowers/sdd/task-2-report.md`.

## Verified contracts

- `POST /faqs`: `FAQCreate { category_id, question, answer, keywords }`.
- `PATCH /faqs/{id}`: nullable/optional `FAQUpdate` fields.
- `PATCH /faqs/{id}/status`: `{ is_active: boolean }`.
- `POST /categories`: `CategoryCreate { name, description }`.
- `PATCH /categories/{id}`: nullable/optional `CategoryUpdate` fields.
- `PATCH /categories/{id}/status`: `{ is_active: boolean }`.
- There is no DELETE endpoint; do not implement one.

## Required behavior

1. Add `apiClient.patch<T>(path, body)` through the existing internal request function.
2. Define precise interfaces for all create/update/status payloads.
3. Add API functions and TanStack Query mutation hooks. Invalidate only `['faqs']` and/or `['categories']` after success.
4. Tests assert method, URL, JSON payload, bearer header from `sessionStorage`, and no `localStorage` token writes.
5. Runtime invariant tests inspect production source or render representative routes to reject prohibited copy and unsafe token persistence. Test fixtures may use synthetic values only inside tests.

## Verification

- RED: `npm run test -- src/lib/api-client.test.ts src/features/faqs/knowledge-api.test.ts src/app/runtime-invariants.test.tsx` must fail for missing behavior.
- GREEN: same targeted command, `npm run lint`, `npm run build`, `git diff --check`.
- Report `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`, changed files, RED/GREEN output and concerns. Do not claim success without fresh evidence.
