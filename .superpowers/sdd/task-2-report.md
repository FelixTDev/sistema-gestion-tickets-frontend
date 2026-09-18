# Task 2 Report — Typed HTTP Methods, Knowledge Contracts, and Security Invariants

## Status

`DONE_WITH_CONCERNS`

The HTTP client, verified knowledge contracts, API functions, mutation hooks, and runtime invariant tests are implemented. The API/contract suites, lint, build, and whitespace verification pass. The complete targeted suite intentionally retains one expected failure because seven production files outside this task's Ownership still contain legacy prohibited copy. Its removal is distributed across Tasks 3, 4, and 7; a fully green global invariant is therefore a downstream integration gate, not a prerequisite for completing Task 2.

## Changed files

- `src/lib/api-client.ts`
- `src/lib/api-client.test.ts`
- `src/features/faqs/types/faq-types.ts`
- `src/features/faqs/api/faq-api.ts`
- `src/features/faqs/hooks/use-faqs.ts`
- `src/features/faqs/knowledge-api.test.ts`
- `src/app/runtime-invariants.test.tsx`
- `.superpowers/sdd/task-2-report.md`

No backend file was modified. No dependency was installed. No commit or push was created.

## Implemented behavior

- Added `apiClient.patch<T>(path, body)` through the existing internal `request<T>` function.
- Added the verified `FAQCreate`, `FAQUpdate`, `CategoryCreate`, `CategoryUpdate`, and shared `ActiveStatusUpdate` interfaces. Optional update fields accept `null`, matching OpenAPI.
- Aligned `CategoryRead.description` with the verified non-null backend schema.
- Added real POST/PATCH functions for FAQ and category create, update, and status changes. No DELETE function exists.
- Added TanStack Query mutation hooks that invalidate only `['faqs']` or `['categories']`, as appropriate.
- Added tests for HTTP method, exact URL, JSON payload, content type, bearer token read from `sessionStorage`, and absence of token writes to `localStorage`.
- Added global runtime source invariants for prohibited copy, imported fixture/credential patterns, localStorage token persistence, unsafe DOM injection, dynamic code execution, and `javascript:` URLs. The fixture detector recognizes typed declarations such as `export const TICKETS: Ticket[] = [` and ZIP-style identifiers such as `GNB-24815`, while excluding test files, test directories, stories, and non-TypeScript documentation from the production scan.

## RED evidence

Command:

```text
npm run test -- src/lib/api-client.test.ts src/features/faqs/knowledge-api.test.ts src/app/runtime-invariants.test.tsx
```

Result: exit code `1`; `10 failed | 4 passed`.

Expected missing-behavior failures included:

- `apiClient.patch is not a function`
- `createFaq`, `updateFaq`, `setFaqStatus`, `createCategory`, `updateCategory`, and `setCategoryStatus` were absent.
- All six mutation hooks were absent.
- The global copy invariant identified seven existing production files with prohibited legacy copy.

## GREEN evidence for owned behavior

Command:

```text
npm run test -- src/lib/api-client.test.ts src/features/faqs/knowledge-api.test.ts
```

Result: exit code `0`; `2 passed` test files and `11 passed` tests.

Command:

```text
npm run lint
```

Result: exit code `0`; ESLint reported no errors.

Command:

```text
npm run build
```

Result: exit code `0`; TypeScript and Vite build completed. Rollup printed two third-party annotation warnings from Zod, then built successfully.

Command:

```text
git diff --check
```

Result: exit code `0`; no whitespace errors. Git emitted only existing LF-to-CRLF working-copy warnings.

## Complete target and remaining concern

Command:

```text
npm run test -- src/lib/api-client.test.ts src/features/faqs/knowledge-api.test.ts src/app/runtime-invariants.test.tsx
```

Latest result after strengthening the fixture detector: exit code `1`; `14 passed | 1 failed`.

The sole failure is `no incorpora el copy prohibido del paquete visual`, which identifies these out-of-scope files:

- `src/components/layout/academic-disclaimer.tsx`
- `src/components/layout/footer.tsx`
- `src/features/auth/auth-forms.tsx`
- `src/features/chatbot/components/conversation-panel.tsx`
- `src/features/faqs/pages/faq-page.tsx`
- `src/features/tickets/pages/client-ticket-create-page.tsx`
- `src/pages/base-pages.tsx`

Those files were deliberately not changed because they are outside Task 2 Ownership. Their downstream ownership is:

- Task 3: `src/components/layout/footer.tsx`, `src/features/auth/auth-forms.tsx`, `src/features/chatbot/components/conversation-panel.tsx`, `src/features/faqs/pages/faq-page.tsx`, and `src/pages/base-pages.tsx`.
- Task 4: `src/features/tickets/pages/client-ticket-create-page.tsx`.
- Task 7: removal of the obsolete `src/components/layout/academic-disclaimer.tsx` after its consumers migrate.

The complete target is expected to remain RED during Task 2 and should be rerun as a global integration gate after Tasks 3, 4, and 7 finish. The strengthened fixture/credential detector, its focused detector examples, and the unsafe-runtime invariant already pass.

## Security scan

The prescribed source scan found no unsafe production implementation. Its only textual matches were assertions inside `src/app/runtime-invariants.test.tsx` and `src/features/auth/auth.test.tsx`, which intentionally name the prohibited APIs to verify their absence from runtime code.
