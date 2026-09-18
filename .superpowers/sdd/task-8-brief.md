# Task 8 Brief — Browser QA, Accessibility, Security, and Final Review

This is the final gate. Read the approved spec, implementation plan, all task reports and this brief before acting.

## Global constraints

- Work only on current `ui-redesing-gnb-v2`; do not commit, push, install dependencies or modify backend.
- Use only the real backend and existing data/accounts. Do not seed or create mock/runtime fixture data.
- ZIP source is immutable at `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913`; original ZIP is `C:\Users\felix\Downloads\Create App.zip`.
- The Impeccable detector was already invoked once prematurely during Task 1. Its contract forbids a second invocation, so do **not** run it again. Record this limitation and use independent human/diff/browser reviews for later changes.
- No completion claim while any screen is materially different or any required gate fails.

## Required work

1. Verify backend health at `http://localhost:8000/api/v1/health`; start Vite locally without changing backend.
2. Browser QA round one at 1440 and 390, then inspect 1280, 1024, 768 and 375. Cover landing, FAQ, chatbot, client login/register/recovery, client dashboard/list/create/detail, staff login, advisor dashboard/inbox/detail, supervisor dashboard/reports/assignment/knowledge and Design System. Compare DOM/layout/classes/content states to ZIP source. Never use ZIP fake records as runtime data.
3. Save evidence under `.impeccable/review/` including at least `desktop.png` and `mobile.png`. Any screenshots must exclude exposed credentials/tokens.
4. Accessibility QA: keyboard-only, skip link, visible focus, nav/drawer/modal focus and Escape, labels/descriptions, live regions, 200% zoom, 44px targets, contrast, responsive table/card transitions and reduced motion.
5. Console/network QA: no unexpected console errors, mock handlers, artificial delays, fabricated results or role-inappropriate calls. Advisor/supervisor sessions must never call chatbot APIs.
6. Apply all material fixes in one batch. Then browser QA round two and re-open every evidence image. If authenticated staff/client pages cannot be exercised because no real credentials/data are available, state the exact blocked surfaces and do not call the entire work complete.
7. Request independent accessibility/testing, security, whole-diff code review and Impeccable finish review using available generic subagents if specialized roles remain unavailable. Fix every Critical/Important issue and obtain clean re-reviews.
8. Final production scans: no prohibited copy in `src` production, no runtime mock/domain fixtures, no JWT/localStorage, no unsafe DOM injection/eval/javascript URLs, no API credentials or secrets, no missing role guards.
9. Fresh final commands in order:

   - `npm run lint`
   - `npm run test`
   - `npm run build`
   - `npm audit --omit=dev`
   - `git diff --check`
   - backend health check

10. Write final QA/review reports under `.superpowers/sdd/`. Do not commit/push.
