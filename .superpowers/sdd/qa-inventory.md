# QA inventory — Figma Make visual port

## Claims to sign off

- Authorized Banco GNB logo assets and pinned ZIP palette/type/layout are used.
- Public, client, advisor and supervisor route families render their ZIP composition with real API states only.
- JWT remains in `sessionStorage`; role guards and chatbot suppression work.
- Unsupported recovery/export/delete/pagination behavior is disabled or unavailable, never simulated.
- Desktop/mobile layouts have no unintended horizontal overflow or obscured primary controls.

## Functional route checks

| Surface | Routes | Controls/state changes | Evidence |
| --- | --- | --- | --- |
| Public | `/`, `/faq`, `/preguntas-frecuentes`, `/chat` | nav/mobile menu, FAQ search/category/disclosure, chatbot open/create/send/close | role/heading checks, request log, desktop/mobile captures |
| Auth | `/login`, `/register`, `/registro`, `/recuperar-contrasena`, `/personal/login` | submit validation/pending/errors, mismatch, disabled recovery | normal user input, no example credentials, capture |
| Client | `/cliente`, `/cliente/tickets`, `/cliente/tickets/nuevo`, `/cliente/tickets/:id` | drawer/nav, filters/cards/table, create/convert, tabs/comments | existing real account/data or explicit blocked record |
| Advisor | `/personal`, `/personal/tickets`, `/personal/tickets/:id` | drawer/nav, filters, transition dialogs/comments | existing real account/data or explicit blocked record |
| Supervisor | `/personal`, `/personal/reportes`, `/personal/asignacion`, `/personal/conocimiento` | filters, disabled export, assignment confirmation, knowledge tabs/forms/status | existing real account/data or explicit blocked record |
| Reference | `/design-system` | primitives, modal/tabs/toast/state samples | capture, zero API requests |
| Legacy | `/panel/*` | path/query/hash redirects | location verification |

## Visual viewport checks

- 1440×900 and 390×844: primary screenshots and whole-page inspection.
- 1280×800, 1024×768, 768×1024 and 375×812: breakpoint/overflow inspection.
- Validate 30px+ service notice wrapping, 64px public nav, 264px desktop sidebars, 288px drawers, table→card breakpoint, detail 1fr/320px layout, 60px chatbot and bottom-nav clearance.
- Inspect computed Manrope/Inter/JetBrains Mono and exact pinned colors.

## Accessibility checks

- Skip link/main landmark/H1; visible focus; `aria-current`.
- Keyboard menu/drawer/modal/tab/disclosure operation; Escape and focus restoration.
- Labels/descriptions/errors/pending/live feedback; 44px project touch targets.
- 200% zoom, reduced motion, contrast adjustments for normal text, no overlay collisions.

## Exploratory scenarios

1. Resize from 390 to 1024 while a public/client/staff drawer is open; focus must not remain hidden and page must not overflow.
2. Open chatbot above mobile client bottom navigation, trigger an API error, close and reopen; composer/focus and error feedback must remain usable without fabricated messages.
3. Navigate directly with malformed ticket/conversation IDs; no API request may be emitted.
