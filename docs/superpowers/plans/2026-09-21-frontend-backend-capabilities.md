# Frontend–Backend Capabilities Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the React/TypeScript frontend with every capability exposed by the live FastAPI OpenAPI contract while preserving the approved GNB public, client, advisor, and supervisor experiences.

**Architecture:** Keep `src/lib/api-client.ts` as the only HTTP boundary, use feature-local typed services and TanStack Query hooks, and keep role-specific pages behind router guards. Build shared request/response types from the live OpenAPI contract, with explicit pagination, error, file-download, and abort handling. Preserve the current navy/turquoise/lime GNB token system and extend it only through reusable accessible UI primitives.

**Tech Stack:** React 19, TypeScript 5.9, Vite, React Router 7, TanStack Query 5, React Hook Form 7, Zod 4, Tailwind CSS 3, Vitest, Testing Library, Playwright.

## Global Constraints

- Work exclusively in `C:\dev\sistema-gestion-tickets\frontend`.
- Work on branch `feat/frontend-backend-capabilities`.
- Do not modify the backend or migrations.
- Consume only endpoints confirmed by `http://127.0.0.1:8000/openapi.json`.
- Use `VITE_API_BASE_URL`; keep JWT only in `sessionStorage`; never use `localStorage` for tokens.
- Do not add runtime mocks, fabricated arrays, hardcoded responses, prototype/demo/academic copy, or sensitive metadata.
- Keep client and staff portals separated; the backend remains the authority for authorization.
- Do not commit or push until the requested validation is complete; final state must remain uncommitted unless the user explicitly chooses otherwise.
- Every remote surface exposes honest loading, error, empty, and success states; destructive actions require confirmation.
- Use TypeScript without `any`, functional components, kebab-case files/directories, React Hook Form + Zod for forms, and mobile-first accessible markup.

---

## Fase 0 — Inventario de pantallas y contrato real

### Pantalla matrix

| Pantalla | Ruta | Rol | Endpoint / método real | Carga | Vacío | Error | Acción disponible | Componente reutilizable | Estado actual |
|---|---|---|---|---|---|---|---|---|---|
| Inicio público | `/` | Visitante | `GET /faqs`, `GET /categories` | Skeleton de categorías/FAQ | EmptyState público | ErrorState + reintentar | Abrir FAQ/chat/login | PublicLayout, Card, Skeleton | Parcial |
| FAQ pública | `/faq`, `/preguntas-frecuentes` | Visitante | `GET /faqs`, `GET /categories`; `POST /faqs/{id}/feedback` | LoadingState | Sin FAQs publicadas | ErrorState + reintentar | Buscar, filtrar, acordeón, útil/no útil | FaqAccordion, Card, Tabs, Pagination | Incompleta: sin paginación/feedback |
| Chat público | `/chat` | Visitante | `POST /chat/conversations`, `GET /chat/conversations/{id}`, `POST /chat/conversations/{id}/messages`, `/escalate`, `/reset`, `/feedback`, `/convert-to-ticket` | Panel y estados de envío/restauración | Conversación nueva honesta | ApiError contextual + reintento | Mensaje, aclarar, escalar, feedback, nueva conversación | ChatbotProvider, ConversationPanel, Modal | Parcial |
| Sitio institucional | `/nosotros` | Visitante | Ninguno | N/A | N/A | N/A | Navegar a FAQ/chat | PublicLayout | Implementada |
| Login cliente | `/login` | Visitante/CLIENTE | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` | Botón/formulario ocupado | N/A | 401/422/409 traducidos | Iniciar sesión, recuperación | AuthShell, Field, Button | Parcial |
| Registro | `/register`, `/registro` | Visitante | `POST /auth/register` | Formulario ocupado | N/A | 409/422/network | Crear cuenta | AuthShell, RHF, Zod | Parcial |
| Recuperación | `/forgot-password` | Visitante | `POST /auth/forgot-password` | Formulario ocupado | Confirmación genérica | 422/network | Solicitar enlace | AuthShell, RHF, Feedback | Bloqueada por UI |
| Restablecimiento | `/reset-password` | Visitante | `POST /auth/reset-password` | Formulario ocupado | Token ausente | 422/400/network | Definir contraseña | AuthShell, RHF, Zod | No existe |
| Login personal | `/personal/login` | Visitante/ASESOR/SUPERVISOR | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` | Botón/formulario ocupado | N/A | 401/403/422/network | Iniciar sesión interna | AuthShell, RoleBadge | Parcial |
| Dashboard cliente | `/cliente` | CLIENTE | `GET /tickets/mine`, `GET /categories`, `GET /notifications/unread-count` | LoadingState | Sin tickets | ErrorState por recurso | Crear ticket, abrir chat, ver tickets/notificaciones | PortalLayout, StatTile, TicketList | Parcial |
| Tickets cliente | `/cliente/tickets` | CLIENTE | `GET /tickets/mine` paginado + filtros | Tabla/lista loading | Sin tickets / sin resultados | ErrorState + reintentar | Buscar, filtros, paginar, abrir detalle | TicketList, TicketFilters, Pagination | Incompleta: cliente filtra local |
| Crear ticket | `/cliente/tickets/nuevo` | CLIENTE | `GET /categories`, `POST /tickets` o `POST /chat/conversations/{id}/convert-to-ticket` | Categorías + submit | N/A | 401/403/409/422/413/415/network | Crear/conversion con prevención doble | TicketForm, RHF, Zod, Modal | Parcial |
| Detalle cliente | `/cliente/tickets/:ticketId` | CLIENTE | `GET /tickets/{id}`, `/comments`, `/history`, `/sla`, `/attachments`; `POST /comments`, `/attachments`; `GET download`; `DELETE attachment` | Cada bloque independiente | Sin comentarios/adjuntos/historial | 403/404/409/413/415/422 | Comentar, adjuntar, descargar, eliminar lógico, consultar SLA | TicketDetailMeta, TicketComments, TicketHistory, AttachmentList, SlaCard | Parcial |
| Perfil cliente | `/cliente/perfil` | CLIENTE | `GET/PATCH /users/me/profile`, `GET/PATCH /users/me/preferences`, `POST /auth/change-password`, `POST /auth/verify-email` | Secciones independientes | Preferencias del backend | 401/422/network | Nombre, teléfono, preferencias, cambio password, verificación | ProfileForm, PreferencesForm, PasswordForm, Field | No existe |
| Notificaciones cliente | `/cliente/notificaciones` | CLIENTE | `GET /notifications`, `/unread-count`, `PATCH /notifications/{id}/read`, `POST /notifications/read-all` | Lista + contador loading | Bandeja vacía | ErrorState + reintentar | Filtrar tipo, marcar una/todas, paginar | NotificationList, Badge, Pagination | No existe |
| Dashboard asesor | `/personal` | ASESOR | `GET /tickets/operations` por colas | LoadingState | Cola vacía | ErrorState | Abrir bandeja | StaffLayout, StatTile, TicketList | Incompleta: usa listado equivocado |
| Bandeja asesor | `/personal/tickets` | ASESOR | `GET /tickets/operations` (`assigned_to_me`, `unassigned`, `sla_soon`, `sla_overdue`, `pending_first_response`, `recently_updated`) | Tabla loading | Cola sin tickets | ErrorState | Buscar, filtros, tomar/liberar | OperationalQueueTabs, TicketFilters, Pagination | Parcial |
| Detalle personal | `/personal/tickets/:ticketId` | ASESOR/SUPERVISOR | Ticket, comentarios, historial, SLA, adjuntos + acciones `/status`, `/take`, `/release`, `/close`, `/reopen`, `/assignments` | Bloques y mutaciones ocupados | Sin comentarios/adjuntos | 401/403/404/409/413/415/422 | Operar solo lo autorizado | TicketActions, Assignment, AttachmentList, SlaCard | Parcial |
| Asignación | `/personal/asignacion` | SUPERVISOR | `GET /tickets`, `GET /users/advisors`, `POST /tickets/{id}/assignments`, `/release` | Listado/asesores loading | Sin tickets/asesores | ErrorState | Asignar/reasignar/liberar con confirmación | TicketList, AdvisorSelect, Modal | Parcial |
| Dashboard supervisor | `/personal` | SUPERVISOR | Cinco reportes `/reports/*` | ReportState por reporte | Ceros/listas vacías desde API | ErrorState + reintentar | Filtrar | ReportFilters, ReportDistribution | Parcial |
| Reportes supervisor | `/personal/reportes` | SUPERVISOR | Reportes + `GET /reports/{name}/export?format=csv` | ReportState | Ceros/listas vacías | ErrorState / 422 export | Filtros, exportar CSV | ReportFilters, ReportDistribution, DownloadButton | Sin exportación |
| Conocimiento público | `/faq` | Visitante | `GET /faqs`, `GET /categories`, `POST /faqs/{id}/feedback` | LoadingState | Sin publicaciones | ErrorState | Buscar, filtrar, feedback | FaqAccordion, FeedbackButtons | Incompleto |
| Conocimiento editorial | `/personal/conocimiento` | SUPERVISOR | `GET /faqs/admin`, CRUD FAQ/categorías, workflow/status, history, utility metrics | Listas/formularios loading | Sin borradores | ErrorState | Crear/editar/revisar/publicar/archivar/restaurar/historial/métricas | KnowledgeTable, FaqForm, CategoryForm, Modal, Tabs | Incompleto: solo activos |
| Auditoría | `/personal/auditoria` | SUPERVISOR | `GET /audit` paginado y filtros | Tabla loading | Sin eventos | ErrorState | Filtrar, paginar, leer detalles redacted | AuditTable, Pagination | No existe |

### OpenAPI gap inventory

- Already consumed: login/register/me/logout, public FAQs/categories, basic chatbot create/get/message/link-user, basic tickets/comments/history/status/close/reopen/cancel/assign/convert, five report reads.
- Pending real contracts: forgot/reset/change/verify email, profile/preferences, notifications, operational queues/take/release, optimistic `expected_version`, SLA reads/actions/policies, attachments and downloads, paginated search/filter contracts, FAQ admin/workflow/history/feedback/metrics, CSV exports, global audit, chatbot escalate/reset/feedback/convert and full response metadata.
- Contract corrections required: `TicketRead` needs `updated_at` and `version`; `TicketListFilters` needs search/source/date/update/queue/pagination fields; FAQs now include title/summary/tags/synonyms/intent/status/version/editorial timestamps; all paginated endpoints return `{ page, page_size, total, total_pages, items }` when pagination parameters are sent.

## Implementation tasks

### Task 1: Contract-safe HTTP client and shared types

**Files:** Modify `src/lib/api-client.ts`, `src/lib/auth.ts`; create `src/lib/api-errors.ts`, `src/lib/query-params.ts`, `src/lib/download.ts`, `src/types/api.ts`; update feature `types/` files and their API tests.

- [ ] Write failing tests for abort propagation, network errors, 401 session clearing, 403/404/409/413/415/422 messages, controlled retry, DELETE, multipart upload, and CSV download headers.
- [ ] Run the focused tests and confirm they fail for missing behavior.
- [ ] Implement a typed request boundary with `VITE_API_BASE_URL`, optional `AbortSignal`, JSON/multipart bodies, `ApiError` normalization, `Retry-After`-aware bounded retries only for network/5xx GETs, and no token or response-body logging.
- [ ] Add typed pagination, date serialization, safe path segments, and download helpers that use the server `Content-Disposition` filename without exposing physical storage keys.
- [ ] Run focused tests and TypeScript compilation; refactor only after green.

### Task 2: Authentication, guards, profile, preferences, and notifications

**Files:** Modify `src/features/auth/*`, `src/app/router.tsx`, `src/app/app-shell.tsx`, `src/components/layout/portal-layout.tsx`, `src/components/layout/staff-layout.tsx`; create `src/features/profile/*`, `src/features/notifications/*`, and related pages/tests.

- [ ] Write failing tests for forgot/reset/change/verify requests, `/auth/me` restoration, role-crossing redirects, profile/preferences update, notification pagination/read-all, and keeping JWT only in `sessionStorage`.
- [ ] Run focused tests and confirm the expected failures.
- [ ] Add typed auth services/forms for `/forgot-password`, `/reset-password?token=…`, `/change-password`, `/verify-email`, with generic recovery feedback and backend error mapping.
- [ ] Add client/staff profile pages and notification pages with real hooks, independent loading/error/empty/success states, and invalidation after mutations.
- [ ] Add unread-count navigation badges without exposing notification metadata, and add route guards for `/cliente/*` vs `/personal/*`.
- [ ] Run focused tests, lint, and build checks.

### Task 3: Paginated client tickets, comments, SLA, and attachments

**Files:** Modify `src/features/tickets/api/ticket-api.ts`, hooks, types, pages, forms and components; create `src/features/tickets/components/pagination.tsx`, `attachments.tsx`, `sla-card.tsx`; add schemas/tests.

- [ ] Write failing tests for server-side search/filters/pagination, `version` concurrency, SLA reads, multipart upload validation/progress, safe download, logical delete, and 413/415/422 handling.
- [ ] Run focused tests and confirm failures are contract-related.
- [ ] Implement `/tickets/mine` with query params and page response normalization, preserving server ordering and avoiding local fabricated filtering.
- [ ] Implement comments with `expected_version`, attachments list/upload/download/delete, client-side size/extension/MIME checks matching the backend allowlist, and no `storage_key` rendering.
- [ ] Implement `/tickets/{id}/sla`, honest SLA status, and refresh after ticket/comment/action changes.
- [ ] Add visible pagination, empty/error/retry states, and double-submit prevention to client forms.
- [ ] Run ticket tests, lint, and build.

### Task 4: Advisor operational portal

**Files:** Modify `src/features/tickets/pages/advisor-dashboard-page.tsx`, `staff-tickets-page.tsx`, `staff-ticket-detail-page.tsx`, `ticket-actions.tsx`, hooks and API; create queue/filter components and tests.

- [ ] Write failing tests for every operational queue, advisor-only take/release, authorized status transitions, reopen reason, expected-version conflict, and staff-only chatbot blocking.
- [ ] Run focused tests and confirm failures.
- [ ] Implement `/tickets/operations` with real queue, filter, search, date, page, and page-size parameters.
- [ ] Implement take/release, response/status/resolve/close/reopen actions with server-authorized controls, confirmation for destructive actions, and 409 refresh guidance.
- [ ] Reuse the ticket detail components for history/comments/SLA/attachments with staff-specific permissions.
- [ ] Run advisor tests, lint, and build.

### Task 5: Supervisor reports, exports, assignment, FAQs, and audit

**Files:** Modify report and knowledge APIs/hooks/pages; create supervisor assignment/audit APIs, hooks, pages, and reusable tables/filters; update `src/app/router.tsx` and staff navigation.

- [ ] Write failing tests for CSV export request/headers, advisor directory assignment/reassignment, FAQ admin pagination/workflow/history/metrics, category status, and audit pagination/filtering.
- [ ] Run focused tests and confirm failures.
- [ ] Implement the real report export endpoint for the allowed `ReportName`/`csv` contract and browser download behavior; keep XLSX visibly unavailable because OpenAPI says it returns 422.
- [ ] Implement supervisor assignment with advisor data from `/users/advisors`, expected-version conflict handling, and confirmations.
- [ ] Implement public FAQ pagination/filters/feedback separately from supervisor admin records; never leak drafts to public routes.
- [ ] Implement workflow transitions `DRAFT → REVIEW → PUBLISHED → ARCHIVED`, restoration through the real workflow/status contracts, version history, utility metrics, categories, and audit table.
- [ ] Run supervisor/knowledge/report tests, lint, and build.

### Task 6: Complete chatbot lifecycle

**Files:** Modify chatbot API/types/hooks/provider/components/pages and client conversion flow; add schemas/tests.

- [ ] Write failing tests for anonymous/authenticated restoration, reset confirmation, escalation, feedback, clarification/options, source references, fallback metadata, turn limits, conversion confirmation, and errors/retries.
- [ ] Run focused tests and confirm failures.
- [ ] Extend the typed chatbot contract to render backend-provided confidence, FAQ references, clarification options, fallback reason, response source, conversation status, and `offers_ticket` without invented content.
- [ ] Add real reset/escalate/feedback/convert mutations and clear/invalidate conversation state only after successful server responses.
- [ ] Gate the widget on public/CLIENTE routes and hide it on `/personal/*`, ASESOR/SUPERVISOR sessions, and the full `/chat` page.
- [ ] Run chatbot tests, lint, and build.

### Task 7: UX, design-system, accessibility, and security hardening

**Files:** Modify affected UI/layout/styles; create or update token/component files only where repetition is real; update accessibility tests.

- [ ] Review all changed surfaces with the GNB direction contract: deep navy, turquoise, lime, white/cool-gray surfaces, Manrope/Inter, 10–16px radii, restrained shadows, responsive task-first hierarchy.
- [ ] Add accessible focus/error/live regions, keyboard-safe dialogs/drawers/tabs, reduced-motion support, 44px controls, and no global horizontal overflow at 1440/1280/1024/768/390×844/375×812.
- [ ] Remove runtime prototype/demo/unavailable copy where a real endpoint now exists; retain only honest capability messages for backend contracts that return 422 or are not exposed.
- [ ] Search changed code for `any`, `localStorage` token access, unsafe HTML/code sinks, secret exposure, fabricated runtime data, duplicate HTTP calls, and unbounded retries.
- [ ] Run the Impeccable detector once over changed UI targets and resolve actionable findings; run the Web Interface Guidelines review against changed UI files using fresh upstream rules.

### Task 8: Tests, browser QA, and final verification

**Files:** Add/modify Vitest and Playwright tests, QA notes, and the final implementation matrix.

- [ ] Expand unit/integration coverage for API services, hooks, guards, forms, pagination, filters, notifications, profile, attachments, chatbot, roles, 401/403/404/409/413/415/422, and regressions.
- [ ] Run persistent-browser E2E against the live frontend/backend without creating real tickets/comments/assignments; use only existing demo records and read-only or explicitly safe flows.
- [ ] Cover visitor, CLIENTE, ASESOR, SUPERVISOR, and security-crossing journeys from the request, including `localhost:5173` and `127.0.0.1:5173`, desktop and 390×844/375×812 viewport fit, console errors, CORS, and overflow.
- [ ] Run `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev`, and `git diff --check`; inspect every exit code and fix failures before any completion claim.
- [ ] Verify backend files and migrations are unchanged, confirm no commit/push was made, and update the final matrix with implemented, blocked, and not-exposed capabilities.

## Known contract limitations to document, not workaround

- The backend OpenAPI exposes CSV export but not XLSX implementation (the backend returns 422 for `format=xlsx`); the frontend must not simulate XLSX.
- Email delivery is backend/provider controlled; the frontend can submit recovery/verification requests but cannot invent or reveal tokens.
- Physical attachment storage paths and `storage_key` are intentionally absent from response contracts and must never be displayed.
- Backend authorization and allowed ticket transitions remain authoritative even when a control is visible.

