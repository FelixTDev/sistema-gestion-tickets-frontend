# Security and accessibility fixes

## Scope completed

- Added shared RFC 4122 UUID validation in `src/lib/identifiers.ts` and reused it for conversation persistence/API calls, client and staff ticket detail route IDs, and `conversationId` conversion query parameters.
- Ticket and conversation API path functions reject unsafe identifiers before `fetch`; invalid identifiers therefore produce no network request.
- Centralized authenticated 401 handling in the HTTP client clears the token/session, emits an auth event, and performs a single SPA redirect to `/login` or `/personal/login` based on the current route. Public auth routes are excluded to prevent redirect loops.
- Replaced the new-conversation confirmation implementation with the existing focus-trapping `Modal` (including alertdialog semantics), focus restoration, inert background, Escape handling, and 44px actions.
- Added `AccessibleDrawer` with portal rendering, `role="dialog"`, `aria-modal`, focus containment/restoration, Escape and overlay close, background `inert`/`aria-hidden`, body scroll lock, overscroll containment, and safe-area padding. Client and staff mobile navigation use it.
- Added visible-on-focus skip links and stable main landmarks to public, client, staff, and authentication layouts.
- Updated warning text token to a darker contrast-safe color and raised compact/legacy touch controls to at least 44px where applicable.
- Added names and `autocomplete="off"` to report filter controls.

## Verification

- Passing: `npm run lint`
- Passing: `npm run build`
- Passing targeted accessibility/security tests: identifier, HTTP 401, drawer, modal, public navigation, chatbot, and portal tests (23 tests).
- Passing full suite: 26 test files, 175 tests.
- Full suite passes after migrating the ticket fixtures in `src/features/tickets/tickets.test.tsx` to valid, stable UUIDs and updating route assertions to use those fixture IDs.

## Notes

No dependencies, backend contracts, runtime mocks, or visual design foundations were changed. No commit or push was performed.
