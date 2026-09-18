# Task 7 Brief — Design System, Routing Completion, and Legacy Compatibility

Read this first. It is the complete requirement for this task.

## Global constraints

- Work only on branch `ui-redesing-gnb-v2`; no commit, push, dependency install or backend edit.
- You are not alone in the repository. Preserve all prior work and own only the files below.
- Visual source: `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913\src\system.tsx`, `src\App.tsx` (visual route inventory only; never copy its artificial router), and `src\index.css`.
- Use production React Router and existing real architecture. No runtime mocks/hardcoded domain records. Neutral component documentation examples are allowed only on the Design System page.
- TypeScript without `any`; keep JWT/sessionStorage/role guards/TanStack Query/RHF/Zod.

## Ownership

- Create `src/features/design-system/pages/design-system-page.tsx` and `src/features/design-system/design-system.test.tsx`.
- Modify `src/app/router.tsx`, `src/app/app-shell.tsx`, `src/app/app.test.tsx`.
- Remove `src/components/layout/academic-disclaimer.tsx` only after `rg` proves zero consumers.
- Remove/adjust only obsolete visual files/styles proven unused, and document the evidence.
- Write `.superpowers/sdd/task-7-report.md`.

## Required behavior

1. Follow TDD and capture a true RED before implementation.
2. Port the ZIP Design System page sections: authorized logo, colors/tokens, typography, spacing, buttons, forms, badges, cards, alerts, toasts, modals, tabs, breadcrumbs, tables, timeline, comments, states, chatbot shell, navbar, sidebars and pagination documentation. Use neutral non-domain sample labels; do not add business fixtures.
3. Complete every approved route and alias. Required legacy mappings include `/panel/tickets`, `/panel/reportes`, `/panel/asignacion`, `/panel/conocimiento`; preserve intended destination path/query where applicable.
4. `/personal` resolves by authenticated role: advisor dashboard for advisor; supervisor dashboard for supervisor. Public/client mismatches follow existing safe redirect/logout behavior.
5. Keep `/faq` + `/preguntas-frecuentes`, `/register` + `/registro`, recovery unavailable route, client portal, staff login, supervisor routes and `/design-system`.
6. Delete the old disclaimer only after all imports are gone. Production source must contain none of the prohibited runtime words (`prototipo`, `demo`, `simulado`, `académico`, `ficticio`, `no oficial`, case-insensitive).

## Verification

- RED then GREEN target: `npm run test -- src/features/design-system/design-system.test.tsx src/app/app.test.tsx`.
- Then run the full `npm run test`, `npm run lint`, `npm run build`, and `git diff --check`.
- Run `rg` evidence for zero disclaimer consumers and prohibited runtime copy before removing obsolete code.
- Report status, changed files, RED/GREEN/full-suite evidence and concerns. No commit/push.
