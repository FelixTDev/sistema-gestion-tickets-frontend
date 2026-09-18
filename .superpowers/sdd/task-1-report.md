# Task 1 Report — Baseline, Product Record, and Visual Foundation

## Status

`DONE_WITH_CONCERNS`

Task 1 is implemented in the assigned frontend files. No dependency was installed, no commit or push was created, and no backend file was touched.

## Files created

- `PRODUCT.md`
- `.impeccable/surfaces/app.md`
- `src/assets/brand/banco-gnb-horizontal.png`
- `src/assets/brand/banco-gnb-apilado.png`
- `src/components/brand/bank-logo.tsx`
- `src/components/brand/bank-logo.test.tsx`
- `src/components/ui/icons.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/form-controls.tsx`
- `src/components/ui/modal.tsx`
- `src/components/ui/modal.test.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/breadcrumbs.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/toast-provider.tsx`
- `src/components/ui/visual-primitives.test.tsx`
- `.superpowers/sdd/task-1-report.md`

## Files modified

- `src/components/ui/states.tsx`
- `src/styles/tokens.css`
- `src/styles/globals.css`
- `tailwind.config.js`
- `src/app/providers.tsx`

## Implementation summary

- Captured product truth with the required schema marker, `web` platform, roles, purpose, real API evidence, supplied assets, constraints, approved notice, and accessibility requirements.
- Wrote and verified the CLI-managed `app` surface brief. It contains THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM with the pinned-authority seed disposition, and the exact FINISH sentence.
- Copied both authorized PNG files without reconstruction. SHA-256 hashes match their respective sources:
  - Horizontal: `EBA19715FA846B3650A0E394716D44C8215D356C3CD9A3321A2766BE30576FC9`
  - Stacked: `70FF4C48D10EB52CD1852EC74E1427A8723EE58E4288063F687809DE8C32FC00`
- Added `BankLogo` with horizontal/stacked variants and a white plate treatment for dark surfaces; it renders only imported authorized PNG assets.
- Added typed ZIP-derived icons, buttons, cards, form controls, modal, tabs, breadcrumbs, skeletons, and toast primitives.
- Preserved `LoadingState` call compatibility while restyling loading, empty, error, retry, and denied states.
- Added modal Escape close, initial focus, focus containment, focus restoration, body scroll lock, and `inert`/`aria-hidden` background blocking.
- Added roving keyboard operation to tabs, accessible form hint/error association, disabled/loading button semantics, and polite/assertive toast live regions.
- Added primitive → semantic → component CSS tokens and Tailwind 3 names for the exact approved palette. Ported fonts/fallbacks, focus, selection, scrollbar behavior, `gnb-fade`, `gnb-pop`, `gnb-shimmer`, `gnb-blink`, and reduced-motion handling.
- Wired `ToastProvider` into the existing application provider tree.

## TDD evidence

### Baseline before production changes

Command sequence: `npm run lint`, `npm run test`, `npm run build`.

- Lint: exit `0`.
- Tests: exit `0`, 12 files and 107 tests passed.
- Build: exit `0`.

### RED

Command: `npm run test -- src/components/ui/visual-primitives.test.tsx src/components/ui/modal.test.tsx src/components/brand/bank-logo.test.tsx`

- Exit `1`.
- All three suites failed for the intended reason: the new `button`, `modal`, and `bank-logo` modules did not yet exist.

### GREEN and final verification

- Targeted command: exit `0`, 3 files and 9 tests passed.
- `npm run lint`: exit `0`, no lint findings.
- Full `npm run test`: exit `0`, 15 files and 116 tests passed.
- `npm run build`: exit `0`.
- `git diff --check`: exit `0`.

## Impeccable evidence

- `impeccable context` was run once before UI work.
- `surface-brief write app` and the required read-back both exited `0`.
- The one required hookless detector pass completed successfully and reported four warnings in `src/styles/globals.css`: three pre-existing side-border patterns and the explicitly required Inter font import.

## Concerns and deferred gates

- The detector warnings were intentionally not changed: the side-border patterns are incumbent/pinned compositions outside the new primitive code, and Inter is explicitly required by the approved Figma source.
- Vite build exits `0` but prints two Rollup annotation warnings from installed `zod` files under `node_modules`; the same warning class was present at baseline and no dependency changes were authorized.
- The app-wide FINISH contract remains a gate for the complete multi-task visual port: full-surface desktop/mobile capture, finish-review verdict, `DESIGN.md`, and raster provenance are not Task 1-owned artifacts and were not claimed here.
- Initial untracked planning/specification files under `docs/superpowers/` and `.superpowers/` were preserved; no unrelated edits were reverted.

## Review follow-up — controlled lifecycle and resilient primitives

### Fixes applied

- `src/components/ui/modal.tsx`: decoupled the open/close lifecycle effect from `onClose` identity by reading the latest callback through a ref. Controlled parent re-renders no longer tear down inert state, restore the opener prematurely, or reset dialog focus.
- `src/components/ui/modal.tsx`: constrained the dialog to `calc(100dvh - 2rem)`, changed it to a bounded flex column, made the content document internally scrollable, and kept the footer outside that scroll region so actions remain reachable while body scrolling is locked.
- `src/components/ui/states.tsx`: removed the legacy `state`, `state-error`, and `spinner` class coupling and expressed the approved state presentation directly, while preserving all existing public props and aliases.
- `src/components/ui/tabs.tsx`: namespaced every tab/list ID per component instance with `useId`, added an optional explicit group ID, and made `panelId` the explicit consumer contract for `aria-controls`; no dangling panel reference is emitted when it is absent.
- `src/components/ui/toast-provider.tsx`: moved expiration into keyed toast items so each toast owns one stable timer; adding or removing another toast no longer restarts existing lifetimes.
- Regression coverage was added in `src/components/ui/modal.test.tsx` and `src/components/ui/visual-primitives.test.tsx`.

### Review RED evidence

- Controlled-modal command: `npm run test -- src/components/ui/modal.test.tsx`.
- Exit `1`; 1 of 3 tests failed for the expected reason: after a controlled parent re-render with a fresh callback, focus moved from “Actualizar 1” back to “Primero”.
- Expanded review-regression command: `npm run test -- src/components/ui/visual-primitives.test.tsx src/components/ui/modal.test.tsx`.
- Exit `1`; five expected failures captured controlled focus reset, missing viewport/scroll constraints, legacy state classes, duplicate tab IDs/dangling panel linkage, and reset toast timers.

### Review GREEN evidence

- Targeted command: exit `0`, 3 files and 13 tests passed.
- Full `npm run test`: exit `0`, 15 files and 120 tests passed.
- `npm run lint`: exit `0`, no lint findings.
- `npm run build`: exit `0` with the same two dependency-owned Zod/Rollup annotation warnings recorded above.
- `git diff --check`: exit `0`; Git printed only the repository's LF-to-CRLF working-copy notices.
- Per instruction, the Impeccable detector was not rerun.

### Files changed in this follow-up

- `src/components/ui/modal.tsx`
- `src/components/ui/modal.test.tsx`
- `src/components/ui/states.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/toast-provider.tsx`
- `src/components/ui/visual-primitives.test.tsx`
- `.superpowers/sdd/task-1-report.md`

## Re-review follow-up — state line height isolation

- Added a focused regression asserting that ported state headings and descriptions carry the ZIP's `1.5` line height rather than inheriting the legacy global `h1–h4` (`1.12`) and `p` (`1.7`) rules.
- RED: `npm run test -- src/components/ui/visual-primitives.test.tsx` exited `1`; 1 of 8 tests failed because the state heading lacked `leading-normal`.
- Applied the narrowest override in `src/components/ui/states.tsx`: `leading-normal` is local to `LoadingState`, `ErrorState`, and `EmptyState`. `src/styles/globals.css` and legacy screen typography remain unchanged.
- GREEN targeted result: 3 files and 14 tests passed.
- Files changed for this finding: `src/components/ui/states.tsx`, `src/components/ui/visual-primitives.test.tsx`, and this report.
