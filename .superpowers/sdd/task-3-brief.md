# Task 3 Brief — Public Site, Authentication, and Public Chatbot

Read this first. It is the complete requirement for this task.

## Global constraints

- Work only on branch `ui-redesing-gnb-v2`; do not commit, push, install dependencies, modify backend files, or revert other work.
- You are not alone in the repository. Own only the files listed below and preserve all concurrent edits.
- The immutable visual source is `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913\src\public.tsx` plus `src\index.css`; port its JSX structure/classes directly, using the Task 1 primitives and original logo. Do not reinterpret the design.
- Keep React Router, TanStack Query, React Hook Form, Zod, JWT and `sessionStorage`. Consume only current real APIs. Never introduce runtime mocks or hardcoded users, tickets, comments, metrics, FAQs, categories or reports.
- Runtime UI must not contain `prototipo`, `demo`, `simulado`, `académico`, `ficticio` or `no oficial` (case-insensitive). The approved service notice is exactly: `Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.`
- Use TypeScript without `any`, normal escaped JSX, accessible keyboard semantics, responsive mobile-first composition, and explicit loading/error/empty/success states.

## Ownership

- Create `src/components/layout/service-notice.tsx`, `auth-shell.tsx`, `page-header.tsx`.
- Modify `src/components/layout/public-layout.tsx`, `public-navigation.tsx`, `footer.tsx`, `brand-header.tsx`.
- Modify `src/pages/base-pages.tsx` and `src/features/auth/auth-forms.tsx`.
- Modify `src/features/faqs/pages/faq-page.tsx` and `components/faq-accordion.tsx`.
- Modify `src/features/chatbot/components/chatbot-widget.tsx`, `conversation-panel.tsx`, `message-list.tsx`, and `pages/chat-page.tsx`.
- Modify `src/app/router.tsx` only for Task 3 public routes/aliases.
- Create/modify tests: `src/app/public-routes.test.tsx`, `src/features/auth/auth.test.tsx`, `src/features/faqs/faqs.test.tsx`, `src/features/chatbot/chatbot.test.tsx`.
- Write `.superpowers/sdd/task-3-report.md`.

## Required behavior

1. Follow TDD. Add failing tests first, then capture RED using the targeted command below.
2. Port `PublicNav`, `PublicFooter`, `Landing`, `FaqPage`, `ClientLogin`, `RecoverPage`, `Register`, `AuthShell`, and public chatbot visuals from the ZIP source as faithfully as the production architecture allows.
3. Required routes: `/`, `/faq` and `/preguntas-frecuentes`; `/login`; `/register` and `/registro`; `/recuperar-contrasena`; `/chat`; `/personal/login` remains staff login.
4. Landing/FAQ domain content must come from the existing FAQ/category queries. Never copy the ZIP's static domain records. Show real skeleton/error/empty states.
5. Preserve real authentication schemas/submission, backend errors, mismatch logout/redirect logic, and session storage. Never display example/test credentials. Recovery has no endpoint: present the Figma screen with controls correctly disabled and a visible `Funcionalidad no disponible` status; do not simulate a submit.
6. Keep chatbot create/get/send/link/convert behavior and its conversation ID only in `sessionStorage`. Render returned text via JSX. Show conversion CTA only to authenticated clients and login/register CTA to guests. Do not mount or query chatbot for advisor/supervisor roles.
7. Public/mobile navigation must use real `Link`/`NavLink`, have an accessible toggle, Escape/focus behavior where applicable, 44px touch targets, visible focus, correct landmarks and labels.

## Verification

- RED then GREEN target: `npm run test -- src/app/public-routes.test.tsx src/features/auth/auth.test.tsx src/features/faqs/faqs.test.tsx src/features/chatbot/chatbot.test.tsx`.
- After GREEN run `npm run lint`, `npm run build`, and `git diff --check`.
- Report `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`, changed files, RED/GREEN evidence, command results, and any fidelity limitation. Do not claim success without fresh evidence.
