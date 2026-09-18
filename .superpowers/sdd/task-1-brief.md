# Task 1 Brief — Baseline, Product Record, and Visual Foundation

Read this first. It is the complete requirement for this task.

## Global constraints

- Work only in `C:\dev\sistema-gestion-tickets\frontend` on branch `ui-redesing-gnb-v2`.
- Do not commit or push. Do not install dependencies. Do not modify backend files.
- You are not alone in the repository. Do not revert or overwrite edits made by others; stay within the owned files below.
- Visual authority: extracted Figma source at `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913`, especially `src/index.css` and `src/lib.tsx`.
- Use TypeScript without `any`, functional components, kebab-case file names, semantic HTML and accessible keyboard/focus behavior.
- No runtime mocks or domain fixtures. No unsafe HTML injection or dynamic code execution.
- No UI copy containing “prototipo”, “demo”, “simulado”, “académico”, “ficticio” or “no oficial”.
- The only institutional notice is: “Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.”
- JWT remains only in `sessionStorage`.
- Follow TDD: add tests, run them and confirm expected failure, implement, run tests again.

## Ownership

- Create `PRODUCT.md`.
- Create the app surface brief required by Impeccable. If the CLI writes under `.impeccable/`, keep that output scoped to the app surface.
- Create `src/assets/brand/banco-gnb-horizontal.png` and `src/assets/brand/banco-gnb-apilado.png` by copying, without reconstruction, from:
  - `C:\Users\felix\AppData\Local\Temp\codex-clipboard-a8bc4e29-861d-4da6-9127-161cd4cd322d.png`
  - `C:\Users\felix\AppData\Local\Temp\codex-clipboard-85e953d1-0fc1-4a22-b266-8732d68adb70.png`
- Create `src/components/brand/bank-logo.tsx`.
- Create `src/components/ui/icons.tsx`, `button.tsx`, `card.tsx`, `form-controls.tsx`, `modal.tsx`, `tabs.tsx`, `breadcrumbs.tsx`, `skeleton.tsx`, and `toast-provider.tsx`.
- Modify `src/components/ui/states.tsx`, `src/styles/tokens.css`, `src/styles/globals.css`, `tailwind.config.js`, and `src/app/providers.tsx`.
- Add `src/components/ui/visual-primitives.test.tsx`, `src/components/ui/modal.test.tsx`, and `src/components/brand/bank-logo.test.tsx`.
- Write the full task report to `.superpowers/sdd/task-1-report.md`.

## Required implementation

1. Use the approved spec at `docs/superpowers/specs/2026-09-13-figma-make-visual-port-design.md` for product truth and create `PRODUCT.md` with schema comment `<!-- impeccable:product-schema 1 -->`, platform `web`, users/roles, purpose, constraints, supplied assets, real API evidence and accessibility requirements.
2. The visual direction is pinned by the ZIP; do not run a concept tournament. Record a direction contract for the app with THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM and the exact FINISH statement required by Impeccable.
3. Implement primitive → semantic → component tokens with exact ZIP colors: `#06243a`, `#0b4963`, `#102a43`, `#526875`, `#078f98`, `#067179`, `#8bc63e`, `#f4f7f8`, `#e2e9ec`, `#c62828`, `#c47a00`.
4. Extend Tailwind 3 with the exact names used by the ZIP. Port focus, selection, scrollbars, `gnb-fade`, `gnb-pop`, `gnb-shimmer`, `gnb-blink`, and reduced-motion behavior.
5. `BankLogo` renders only the authorized imported PNG assets and provides `horizontal` and `stacked` variants plus light/dark-surface treatment via a white plate; do not create a text/SVG logo.
6. Port typed Figma primitives with exact sizes/radii/shadows/states. Preserve existing public `LoadingState` usage or update consumers only if necessary within owned files.
7. `Button` exposes loading and disabled semantics; `Modal` has dialog semantics, Escape close, focus containment/restoration and background interaction blocking; `Tabs` supports keyboard navigation; form controls associate errors and hints; toasts use live regions.

## Required tests and verification

- Tests must assert authorized logo source, `aria-busy`, disabled click prevention, alert roles, modal Escape close/focus restoration, tabs keyboard operation and accessible form errors.
- RED command: `npm run test -- src/components/ui/visual-primitives.test.tsx src/components/ui/modal.test.tsx src/components/brand/bank-logo.test.tsx` and capture why it fails.
- GREEN commands: the same targeted test command, `npm run lint`, `npm run build`, and `git diff --check`.
- Report status as `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`, list modified files, RED/GREEN evidence, and concerns. Do not claim completion without fresh command output.
