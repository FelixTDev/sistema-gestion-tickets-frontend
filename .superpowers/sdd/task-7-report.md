# Task 7 report — Design System and legacy compatibility

## Scope

Implemented the standalone Design System page at `src/features/design-system/pages/design-system-page.tsx` using the existing typed primitives and the supplied Banco GNB logo assets. The page mirrors the supplied visual structure and documents logo variants, tokens, typography, spacing, controls, forms, badges, cards, feedback, navigation patterns, responsive tables, pagination, timeline/comments, states, and chatbot shell. Examples are neutral component documentation content and do not call an API or define business records.

The router was intentionally not edited because Task 5 owns `src/app/router.tsx` in the concurrent worktree. The root integration must add the following exact import and routes:

```tsx
import { DesignSystemPage } from '../features/design-system/pages/design-system-page'
```

Add `/design-system` as a standalone route (outside authenticated layouts). Add supervisor-protected `/personal/reportes` and `/personal/asignacion` routes within the staff layout, importing the report and assignment pages owned by Task 6. Preserve the existing role-aware `/personal` resolver. Keep `/faq` and `/preguntas-frecuentes`, `/register` and `/registro`, `/recuperar-contrasena`, client routes, staff login, and supervisor routes. Keep the scoped `/panel/*` redirect and ensure these mappings preserve `location.search` and `location.hash`:

| Legacy path | Destination |
| --- | --- |
| `/panel` | `/personal` |
| `/panel/tickets` and descendants | `/personal/tickets` and descendants |
| `/panel/reportes` and descendants | `/personal/reportes` and descendants |
| `/panel/asignacion` and descendants | `/personal/asignacion` and descendants |
| `/panel/conocimiento` and descendants | `/personal/conocimiento` and descendants |

## TDD evidence

- RED: `npm run test -- src/features/design-system/design-system.test.tsx` failed before implementation because `./pages/design-system-page` did not exist.
- GREEN: the same command passes with 2 tests.
- The test asserts all required documentation categories, both logo variants/surfaces, neutral examples, and absence of prohibited runtime copy/domain-style identifiers.

## Verification

- `npm run lint` — pass.
- `npm run build` — pass (`BUILD_EXIT=0`). Vite reports existing dependency annotation and chunk-size warnings only.
- Full suite and `git diff --check` remain root integration gates because concurrent Tasks 3–6 are still modifying shared files.

## Legacy disclaimer evidence

The disclaimer cannot be removed in this isolated task without changing another task's owned file. `rg` currently shows a live consumer in `src/components/layout/staff-layout.tsx` plus the component and CSS definitions. Do not delete `academic-disclaimer.tsx` until that consumer is removed and a fresh production-only `rg` scan confirms zero consumers and no prohibited runtime copy.

## Changed files

- `src/features/design-system/pages/design-system-page.tsx`
- `src/features/design-system/design-system.test.tsx`
- `.superpowers/sdd/task-7-report.md`

No commit or push was performed.
