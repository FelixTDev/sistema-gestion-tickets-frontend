# Figma Make Visual Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `subagent-driven-development` where tasks are independently owned and `executing-plans` for controller-led integration. Every behavior change follows `test-driven-development`. Do not commit or push; the user's explicit instruction replaces commit steps with verified checkpoints.

**Goal:** Reproduce the approved Figma Make interface across every public, client, advisor, supervisor, and Design System screen while preserving the existing real API, authentication, role, routing, query, form, and storage behavior.

**Architecture:** Port the ZIP's visual primitives and JSX composition into typed local React components, then feed them exclusively through the existing feature hooks and real backend contracts. React Router remains the navigation authority, TanStack Query remains the server-state authority, and `src/lib/api-client.ts` remains the only network client. The ZIP's mock provider, arrays, timers, role selector, router, and simulated outcomes are never imported.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, React Router 7, TanStack Query 5, React Hook Form 7, Zod 4, Tailwind CSS 3, Vitest, Testing Library.

## Global Constraints

- Work only in `C:\dev\sistema-gestion-tickets\frontend` on branch `ui-redesing-gnb-v2`; never modify `main`.
- Visual authority is `C:\Users\felix\Downloads\Create App.zip`; port its JSX composition and exact visual values without reinterpretation.
- Use only real API data. Never ship hardcoded users, tickets, comments, metrics, assignments, reports, FAQs, or categories; never ship runtime mocks.
- Keep the JWT only in `sessionStorage`; never persist tokens in `localStorage`.
- Preserve real backend roles and server authorization; frontend guards are UX reinforcement only.
- Preserve React Router, TanStack Query, React Hook Form, Zod, and `src/lib/api-client.ts`.
- Use only the two user-supplied Banco GNB logo PNGs; never recreate the mark with text or approximate SVG.
- The only institutional notice is: “Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.”
- Runtime UI must not contain “prototipo”, “demo”, “simulado”, “académico”, “ficticio” or “no oficial”, including inflected/plural forms.
- Functions without a real endpoint are visibly unavailable or disabled; do not fabricate results.
- Do not add dependencies, modify the backend, create commits, or push.
- TypeScript must contain no `any`; files and folders use kebab-case; components are functional.
- Each remote surface renders loading, error, empty, and success states.
- Responsive acceptance widths are 1440, 1280, 1024, 768, 390×844, and 375×812 with no global horizontal scroll, clipping, obstructed actions, or uncloseable drawers.
- Follow safe JSX rendering: no `dangerouslySetInnerHTML`, raw DOM injection, dynamic code execution, unvalidated redirects, or client-side secrets.

---

### Task 1: Baseline, Product Record, and Visual Foundation

**Files:**
- Create: `PRODUCT.md`
- Create: `.impeccable/surfaces/app.md` through the Impeccable surface-brief command
- Create: `src/assets/brand/banco-gnb-horizontal.png`
- Create: `src/assets/brand/banco-gnb-apilado.png`
- Create: `src/components/brand/bank-logo.tsx`
- Create: `src/components/ui/icons.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/form-controls.tsx`
- Create: `src/components/ui/modal.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/breadcrumbs.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/toast-provider.tsx`
- Modify: `src/components/ui/states.tsx`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/globals.css`
- Modify: `tailwind.config.js`
- Modify: `src/app/providers.tsx`
- Test: `src/components/ui/visual-primitives.test.tsx`
- Test: `src/components/ui/modal.test.tsx`
- Test: `src/components/brand/bank-logo.test.tsx`

**Interfaces:**
- Produces: `BankLogo`, `Icon`, `Button`, `Card`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Modal`, `Tabs`, `Breadcrumbs`, `Skeleton`, `EmptyState`, `ErrorState`, `ToastProvider`, `useToast`.
- Consumes: approved spec and exact values from ZIP `src/index.css` and `src/lib.tsx`.

- [ ] **Step 1: Record the existing baseline**

  Run `npm run lint`, `npm run test`, and `npm run build` before changing production code. Record exact exit codes in the task report. Expected: each exits `0`; any failure is a pre-existing blocker to document before continuing.

- [ ] **Step 2: Write failing primitive tests**

  Add tests that assert the supplied logo image is rendered, button loading uses `aria-busy`, disabled controls cannot fire, error states expose `role="alert"`, and the modal exposes `role="dialog"`, closes with Escape, and restores focus.

  ```tsx
  it('renders only the authorized horizontal logo asset', () => {
    render(<BankLogo variant="horizontal" />)
    expect(screen.getByRole('img', { name: /banco gnb/i })).toHaveAttribute(
      'src',
      expect.stringContaining('banco-gnb-horizontal.png'),
    )
  })
  ```

- [ ] **Step 3: Verify RED**

  Run `npm run test -- src/components/ui/visual-primitives.test.tsx src/components/ui/modal.test.tsx src/components/brand/bank-logo.test.tsx`. Expected: FAIL because the new modules do not exist.

- [ ] **Step 4: Capture durable product truth and direction contract**

  Create `PRODUCT.md` from the approved specification with platform `web`, confirmed users/roles, product purpose, constraints, supplied brand assets, real API evidence, and accessibility requirements. Write an Impeccable direction contract for the app surface: pinned Figma Make world, exact first viewport/composition, no concept invention, and the required FINISH line.

- [ ] **Step 5: Port tokens and primitives**

  Map ZIP colors `#06243a`, `#0b4963`, `#102a43`, `#526875`, `#078f98`, `#067179`, `#8bc63e`, `#f4f7f8`, `#e2e9ec`, `#c62828`, and `#c47a00` into primitive → semantic → component CSS variables. Extend Tailwind 3 names used verbatim by the ZIP. Port focus, selection, scrollbars, animations and reduced-motion behavior. Implement typed primitives with exact radii, sizes, shadows and states.

- [ ] **Step 6: Copy authorized logos**

  Copy the two supplied PNGs into `src/assets/brand/` without image reconstruction. Wrap them in `BankLogo` and use a white plate for dark backgrounds because the supplied images have white canvases.

- [ ] **Step 7: Verify GREEN and checkpoint**

  Run the targeted tests, `npm run lint`, and `npm run build`. Expected: all exit `0`. Run `git diff --check`. Do not commit.

---

### Task 2: Typed HTTP Methods, Knowledge Contracts, and Security Invariants

**Files:**
- Modify: `src/lib/api-client.ts`
- Modify: `src/lib/api-client.test.ts`
- Modify: `src/features/faqs/types/faq-types.ts`
- Modify: `src/features/faqs/api/faq-api.ts`
- Modify: `src/features/faqs/hooks/use-faqs.ts`
- Create: `src/features/faqs/knowledge-api.test.ts`
- Create: `src/app/runtime-invariants.test.tsx`

**Interfaces:**
- Produces: `apiClient.patch<T>()`, `FAQCreate`, `FAQUpdate`, `CategoryCreate`, `CategoryUpdate`, `ActiveStatusUpdate`, query/mutation hooks for real FAQ/category management.
- Consumes: OpenAPI schemas `FAQCreate`, `FAQUpdate`, `CategoryCreate`, `CategoryUpdate`, `ActiveStatusUpdate`.

- [ ] **Step 1: Write failing API tests**

  Test exact `PATCH` requests and payloads, including `Content-Type`, bearer token from `sessionStorage`, and no `localStorage` writes.

  ```ts
  it('updates an FAQ using the verified PATCH contract', async () => {
    await updateFaq('faq-1', { question: 'Pregunta actualizada' })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/faqs/faq-1'),
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
  ```

- [ ] **Step 2: Verify RED**

  Run `npm run test -- src/lib/api-client.test.ts src/features/faqs/knowledge-api.test.ts`. Expected: FAIL because PATCH and mutations are absent.

- [ ] **Step 3: Implement verified API methods**

  Add only OpenAPI-confirmed methods: POST/PATCH FAQ, PATCH FAQ status, POST/PATCH category, PATCH category status. Invalidate `['faqs']` and `['categories']` after successful mutations. Do not implement DELETE.

- [ ] **Step 4: Add runtime invariant tests**

  Assert the app source/DOM does not expose forbidden copy, credential values, ZIP mock identifiers, or token persistence in `localStorage`. Allow test fixtures to use synthetic data only inside test files.

- [ ] **Step 5: Security scan of touched code**

  Run `rg -n "dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function|localStorage\.(setItem|getItem).*token|javascript:" src`. Expected: no unsafe production matches. Treat URL params and storage values as untrusted and validate IDs before API calls.

- [ ] **Step 6: Verify GREEN and checkpoint**

  Run targeted tests, `npm run lint`, `npm run build`, and `git diff --check`. Expected: exit `0`; no commit.

---

### Task 3: Public Site, Authentication, and Public Chatbot

**Files:**
- Create: `src/components/layout/service-notice.tsx`
- Create: `src/components/layout/auth-shell.tsx`
- Create: `src/components/layout/page-header.tsx`
- Modify: `src/components/layout/public-layout.tsx`
- Modify: `src/components/layout/public-navigation.tsx`
- Modify: `src/components/layout/footer.tsx`
- Modify: `src/components/layout/brand-header.tsx`
- Modify: `src/pages/base-pages.tsx`
- Modify: `src/features/auth/auth-forms.tsx`
- Modify: `src/features/faqs/pages/faq-page.tsx`
- Modify: `src/features/faqs/components/faq-accordion.tsx`
- Modify: `src/features/chatbot/components/chatbot-widget.tsx`
- Modify: `src/features/chatbot/components/conversation-panel.tsx`
- Modify: `src/features/chatbot/components/message-list.tsx`
- Modify: `src/features/chatbot/pages/chat-page.tsx`
- Modify: `src/app/router.tsx`
- Test: `src/app/public-routes.test.tsx`
- Test: `src/features/auth/auth.test.tsx`
- Test: `src/features/faqs/faqs.test.tsx`
- Test: `src/features/chatbot/chatbot.test.tsx`

**Interfaces:**
- Produces: Figma-faithful public shell, landing, FAQ, login, registration, unavailable recovery screen, public chat page, and floating widget.
- Consumes: Task 1 primitives; existing auth/FAQ/chat providers and real APIs.

- [ ] **Step 1: Write failing route and content tests**

  Cover `/faq`, `/preguntas-frecuentes`, `/register`, `/registro`, `/recuperar-contrasena`, mobile navigation semantics, approved notice copy, role-aware chatbot visibility, and absence of forbidden runtime text.

- [ ] **Step 2: Verify RED**

  Run `npm run test -- src/app/public-routes.test.tsx src/features/auth/auth.test.tsx src/features/faqs/faqs.test.tsx src/features/chatbot/chatbot.test.tsx`. Expected: FAIL on missing aliases, unavailable screen, new composition, or copy.

- [ ] **Step 3: Port public composition verbatim**

  Translate `PublicNav`, `PublicFooter`, `Landing`, `FaqPage`, `ClientLogin`, `RecoverPage`, `Register`, `AuthShell`, and `Chatbot` from ZIP JSX to real `Link`, hooks and data. Preserve the exact class values and responsive structure. Replace static landing FAQ/category content with data returned by queries; use `Skeleton`, `ErrorState`, or `EmptyState` when unavailable.

- [ ] **Step 4: Preserve real authentication and form validation**

  Keep existing schemas and submit handlers. Remove precursors and placeholders that imply test credentials. Keep portal mismatch logout and redirects. Recovery remains disabled with “Funcionalidad no disponible”.

- [ ] **Step 5: Connect chatbot visuals to existing provider**

  Preserve create/get/send/link behavior and conversation ID in `sessionStorage`. Render API messages through normal JSX. Keep conversion CTA for authenticated clients and login/register CTA for guests. Do not mount or query chatbot for advisor/supervisor roles.

- [ ] **Step 6: Verify GREEN and checkpoint**

  Run the four targeted suites, lint, build, and `git diff --check`. Expected: exit `0`; no commit.

---

### Task 4: Client Portal

**Files:**
- Modify: `src/components/layout/portal-layout.tsx`
- Modify: `src/features/tickets/pages/client-dashboard-page.tsx`
- Modify: `src/features/tickets/pages/client-tickets-page.tsx`
- Modify: `src/features/tickets/pages/client-ticket-create-page.tsx`
- Modify: `src/features/tickets/pages/client-ticket-detail-page.tsx`
- Modify: `src/features/tickets/components/ticket-list.tsx`
- Modify: `src/features/tickets/components/ticket-form.tsx`
- Modify: `src/features/tickets/components/ticket-detail-meta.tsx`
- Modify: `src/features/tickets/components/ticket-history.tsx`
- Modify: `src/features/tickets/components/ticket-comments.tsx`
- Modify: `src/features/tickets/components/ticket-badges.tsx`
- Test: `src/features/tickets/client-portal.test.tsx`
- Test: `src/features/tickets/tickets.test.tsx`

**Interfaces:**
- Produces: responsive `ClientShell`, real dashboard, list, creation/conversion, detail, history and comments.
- Consumes: Task 1 primitives, Task 3 full chat route, existing ticket hooks/API.

- [ ] **Step 1: Write failing client workflow tests**

  Test loading/error/empty/success dashboard states, real ticket counts, responsive navigation controls, conversion using the stored conversation ID, real tracking code confirmation, comment submission, and no domain fixture rendered outside tests.

- [ ] **Step 2: Verify RED**

  Run `npm run test -- src/features/tickets/client-portal.test.tsx src/features/tickets/tickets.test.tsx`. Expected: FAIL on Figma composition and new accessible controls.

- [ ] **Step 3: Port `ClientShell` and dashboard**

  Use the ZIP's desktop sidebar, compact header, account control and mobile drawer. Render four stat tiles only from `GET /tickets/mine`, recent real tickets, and the two action cards.

- [ ] **Step 4: Port tickets list and creation/conversion**

  Use the ZIP's table at larger widths and legible cards on small screens. Port `CreateTicket` and `ConvertTicket` while keeping React Hook Form/Zod and existing mutation. Never create tracking codes client-side.

- [ ] **Step 5: Port detail, history and comments**

  Adapt `ClientTicketDetail`, tabs, metadata, timeline and comments to `TicketRead`, `HistoryRead`, and `CommentRead`. Unknown actor display uses neutral labels derived from available fields; do not invent names.

- [ ] **Step 6: Verify GREEN and checkpoint**

  Run targeted suites, lint, build, and `git diff --check`. Expected: exit `0`; no commit.

---

### Task 5: Advisor Portal

**Files:**
- Modify: `src/components/layout/staff-layout.tsx`
- Modify: `src/features/tickets/pages/staff-tickets-page.tsx`
- Modify: `src/features/tickets/pages/staff-ticket-detail-page.tsx`
- Modify: `src/features/tickets/components/ticket-filters.tsx`
- Modify: `src/features/tickets/components/ticket-actions.tsx`
- Modify: `src/features/tickets/components/ticket-assignment.tsx`
- Create: `src/features/tickets/pages/advisor-dashboard-page.tsx`
- Modify: `src/app/router.tsx`
- Test: `src/features/tickets/advisor-portal.test.tsx`
- Test: `src/features/tickets/ticket-filters.test.tsx`

**Interfaces:**
- Produces: role-aware internal shell, advisor dashboard at `/personal`, operational inbox and ticket detail.
- Consumes: existing `GET /tickets`, ticket detail/history/comments APIs and status mutations.

- [ ] **Step 1: Write failing advisor tests**

  Cover advisor `/personal` dashboard, derived counts, filter payloads, empty/error/loading states, allowed status actions, confirmation modal, comments, and absence of supervisor links/chatbot.

- [ ] **Step 2: Verify RED**

  Run `npm run test -- src/features/tickets/advisor-portal.test.tsx src/features/tickets/ticket-filters.test.tsx`. Expected: FAIL because advisor dashboard and Figma shell do not exist.

- [ ] **Step 3: Port `StaffShell` for real roles**

  Reproduce the dark desktop sidebar and mobile drawer. Navigation items derive from backend role; route state uses `NavLink`. Keep logout real and never show a role switcher.

- [ ] **Step 4: Port advisor dashboard and inbox**

  Derive dashboard metrics and recent queue solely from `GET /tickets`. Port the ZIP filter bar and table/card views. Omit functional pagination because the API response is an array without metadata.

- [ ] **Step 5: Port operational detail and actions**

  Reuse detail/history/comments components with internal variants. Use actual status/close/reopen/cancel mutations and confirmation/reason modals. Server failures remain visible and never update UI optimistically as success.

- [ ] **Step 6: Verify GREEN and checkpoint**

  Run targeted suites, lint, build, and `git diff --check`. Expected: exit `0`; no commit.

---

### Task 6: Supervisor Reports, Assignment, and Knowledge Management

**Files:**
- Modify: `src/features/reports/pages/supervisor-dashboard-page.tsx`
- Create: `src/features/reports/pages/reports-page.tsx`
- Create: `src/features/tickets/pages/ticket-assignment-page.tsx`
- Create: `src/features/faqs/pages/knowledge-page.tsx`
- Create: `src/features/faqs/components/faq-form.tsx`
- Create: `src/features/faqs/components/category-form.tsx`
- Create: `src/features/faqs/knowledge-schemas.ts`
- Modify: `src/features/reports/components/report-distribution.tsx`
- Modify: `src/features/reports/components/report-filters.tsx`
- Modify: `src/features/reports/components/report-state.tsx`
- Modify: `src/app/router.tsx`
- Test: `src/features/reports/supervisor-pages.test.tsx`
- Test: `src/features/faqs/knowledge-page.test.tsx`
- Test: `src/features/reports/reports-api.test.ts`

**Interfaces:**
- Produces: `/personal/reportes`, `/personal/asignacion`, `/personal/conocimiento`, and the supervisor dashboard.
- Consumes: five real report endpoints, `GET /tickets`, `GET /users/advisors`, assignment mutation, and Task 2 knowledge mutations.

- [ ] **Step 1: Write failing supervisor tests**

  Cover supervisor-only routing, report filters/query keys, zero-safe distributions, disabled export, assignment confirmation with real IDs, FAQ/category create/update/status flows, and query invalidation.

- [ ] **Step 2: Verify RED**

  Run `npm run test -- src/features/reports/supervisor-pages.test.tsx src/features/faqs/knowledge-page.test.tsx src/features/reports/reports-api.test.ts`. Expected: FAIL on missing pages/mutations.

- [ ] **Step 3: Port supervisor dashboard and reports**

  Translate `SupDashboard`, `Reports`, `Stat`, and `Bar` from ZIP. Populate every value from report responses. Do not show invented trends, rates, or comparison copy. Export is disabled and described as unavailable.

- [ ] **Step 4: Port assignment page**

  Translate `Assign` composition using only real unassigned tickets and advisors. Submit `advisor_id` through the existing assignment mutation and refresh affected queries after success.

- [ ] **Step 5: Port knowledge management**

  Translate `Knowledge`, FAQ cards, category table, tabs and modals. Implement Zod schemas matching OpenAPI bounds. Replace destructive-delete wording with activate/deactivate because no DELETE endpoint exists.

- [ ] **Step 6: Verify GREEN and checkpoint**

  Run targeted suites, lint, build, and `git diff --check`. Expected: exit `0`; no commit.

---

### Task 7: Design System, Routing Completion, and Legacy Compatibility

**Files:**
- Create: `src/features/design-system/pages/design-system-page.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/app/app-shell.tsx`
- Modify: `src/app/app.test.tsx`
- Remove only after consumers migrate: `src/components/layout/academic-disclaimer.tsx`
- Remove only after consumers migrate: obsolete styles/components proven unused by `rg`
- Test: `src/features/design-system/design-system.test.tsx`
- Test: `src/app/app.test.tsx`

**Interfaces:**
- Produces: `/design-system`, complete route aliases, role-aware `/personal`, and legacy `/panel/*` mappings.
- Consumes: all shared primitives and layouts.

- [ ] **Step 1: Write failing routing and Design System tests**

  Assert every required route resolves, `/panel/reportes`, `/panel/asignacion`, `/panel/conocimiento`, `/panel/tickets` preserve destination paths, and the Design System exposes every requested component category without domain records.

- [ ] **Step 2: Verify RED**

  Run `npm run test -- src/features/design-system/design-system.test.tsx src/app/app.test.tsx`. Expected: FAIL because Design System and complete legacy mappings are absent.

- [ ] **Step 3: Port Design System**

  Translate `system.tsx` sections for logo, colors, variables, typography, spacing, buttons, forms, badges, cards, alerts, toasts, modals, tabs, breadcrumbs, tables, timeline, comments, states, chatbot, navbar, sidebar and pagination. Use neutral documentation examples, not fake business data.

- [ ] **Step 4: Complete router and remove obsolete UI**

  Implement all routes from the approved spec. Choose `/personal` content from authenticated role. Keep aliases and scoped legacy redirects. Remove old disclaimer/component code only after `rg` proves zero consumers.

- [ ] **Step 5: Verify GREEN and checkpoint**

  Run targeted suites, the entire test suite, lint, build, and `git diff --check`. Expected: exit `0`; no commit.

---

### Task 8: Browser QA, Accessibility, Security, and Final Review

**Files:**
- Create/update only if fixes require: touched frontend source and tests
- Create: `.impeccable/review/desktop.png`
- Create: `.impeccable/review/mobile.png`
- Create: additional viewport captures needed for QA
- Create: task/review reports under `.superpowers/sdd/`

**Interfaces:**
- Produces: validated implementation and evidence packet; does not commit or push.
- Consumes: running frontend, running backend, approved spec, ZIP source, full diff.

- [ ] **Step 1: Start real services and verify health**

  Confirm `GET http://localhost:8000/api/v1/health` returns HTTP 200. Start Vite without modifying backend. Use only accounts/data already present in the real backend; never add seeded or runtime mock data.

- [ ] **Step 2: Batched visual QA round one**

  Inspect landing, FAQ, chatbot, client login, registration, client dashboard/list/create/detail, staff login, advisor dashboard/inbox/detail, supervisor dashboard/reports/assignment/knowledge, Design System, mobile navigation and desktop navigation. Capture 1440 and 390 first, then inspect 1280, 1024, 768 and 375. Compare against the ZIP JSX/tokens and correct all material differences in one batch.

- [ ] **Step 3: Accessibility QA**

  Test keyboard-only navigation, skip link, visible focus, drawer/modal focus behavior, Escape closing, labels, error descriptions, live regions, 200% zoom, touch targets, contrast, table/card transitions and reduced motion.

- [ ] **Step 4: Network and console QA**

  Verify there are no unexpected console errors, failed requests, artificial delays, mock handlers, fabricated results, or role-inappropriate requests. Confirm advisor/supervisor sessions never call chatbot APIs.

- [ ] **Step 5: Run Impeccable detector once**

  Execute `C:\Users\felix\.agents\skills\impeccable\scripts\impeccable.cmd detect --json src`. Fix mechanical findings in one batch. Do not run the detector a second time.

- [ ] **Step 6: Batched visual QA round two**

  Recapture the same desktop/mobile evidence, open each image, and confirm the fixes. If any screen still differs materially, report it as incomplete rather than claiming completion.

- [ ] **Step 7: Independent reviews**

  Request an accessibility/testing review and a whole-diff code review. Fix every Critical or Important issue, rerun covering tests, and obtain a clean re-review. Request the Impeccable finish review with screenshots and direction contract.

- [ ] **Step 8: Final verification**

  Run fresh, in this order:

  ```powershell
  npm run lint
  npm run test
  npm run build
  npm audit --omit=dev
  git diff --check
  git status --short --branch
  ```

  Expected: lint/test/build/diff-check exit `0`; audit result reported exactly; branch remains `ui-redesing-gnb-v2`; no commit/push; backend files unchanged.

- [ ] **Step 9: Final invariant scans**

  Run production-only scans for forbidden UI copy, runtime mock arrays, exposed credentials, `localStorage` token usage, unsafe DOM sinks, and generated tracking codes. Test files may contain fixtures; production files may not.

- [ ] **Step 10: Delivery report**

  Report changed screens, real APIs, reused components, any remaining differences, exact test/build/audit results, responsive QA, Git status, backend unchanged confirmation, runtime-data confirmation, and forbidden-copy confirmation. Do not declare complete if any material mismatch or failing command remains.

## Plan Self-Review

- Every approved screen is owned by one task.
- Shared interfaces are created before feature tasks consume them.
- Every behavior task includes an explicit RED and GREEN command.
- OpenAPI-confirmed methods are used; no DELETE, export, password recovery, or paginated-data contract is invented.
- No task authorizes a commit, push, dependency install, backend change, runtime mock, or hardcoded domain record.
- Final QA includes all requested viewports, security invariants, browser inspection, independent review, and fresh verification.
