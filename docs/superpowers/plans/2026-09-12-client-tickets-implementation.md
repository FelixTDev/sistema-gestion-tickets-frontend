# Client Ticket Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el portal de tickets de `CLIENTE` y convertir conversaciones no resueltas del chatbot en tickets mediante los contratos reales del backend.

**Architecture:** El nuevo módulo `features/tickets` separa contratos, API, esquemas, consultas/mutaciones, componentes y páginas. TanStack Query conserva el estado del servidor; React Hook Form y Zod controlan formularios; el router mantiene todas las superficies de cliente bajo `/cliente/*`. La integración del chatbot se realiza por composición desde `App`, sin duplicar conversación ni cambiar sus reglas para visitantes o personal.

**Tech Stack:** React 19, TypeScript 5.9 estricto, React Router 7, TanStack Query 5, React Hook Form, Zod 4, Vitest, Testing Library y CSS existente.

## Global Constraints

- Trabajar exclusivamente en `C:\dev\sistema-gestion-tickets\frontend`.
- El backend en `C:\dev\sistema-gestion-tickets\backend` es una fuente de contratos de solo lectura.
- No añadir dependencias, endpoints, campos de API ni permisos inexistentes.
- Usar el cliente central `src/lib/api-client.ts` y TanStack Query para estado del servidor.
- Usar TypeScript sin `any`, componentes funcionales y nombres kebab-case.
- No guardar tickets, mensajes, comentarios ni datos personales en `localStorage`.
- Conservar `chat_conversation_id` hasta recibir un `TicketRead` exitoso de conversión.
- Mantener el aviso académico, diseño azul profundo/turquesa, accesibilidad y layouts diferenciados.
- Mantener el chatbot disponible para visitantes/CLIENTE e inactivo para ASESOR/SUPERVISOR.
- Aplicar RED–GREEN–REFACTOR y no realizar commits intermedios.
- Crear al final un único commit: `feat(tickets): add client ticket portal`.

## Backend decisions verified from source and integration tests

- `TicketRead` no incluye categorías expandidas ni comentarios; la categoría se resuelve con `GET /categories`.
- No existe `GET /tickets/{ticket_id}/comments`. El detalle mostrará la trazabilidad completa y los `CommentRead` creados durante el montaje actual. También explicará que el contrato actual no permite recuperar el texto de comentarios anteriores.
- `CLIENTE` puede crear manualmente, convertir una conversación propia, listar sus tickets, leer un ticket propio, leer su historial y comentar si no está `CERRADO` o `CANCELADO`.
- `POST /close` y `POST /reopen` requieren personal; `POST /cancel` requiere `SUPERVISOR`. No se definirán ni mostrarán acciones de estado para `CLIENTE`.
- El backend responde 403 al leer tickets ajenos y filtra `GET /tickets/mine` por el usuario autenticado; el frontend nunca usa `GET /tickets` para el portal de cliente.
- La conversión puede responder 404 si no existe la conversación, 403 si no pertenece al cliente y 409 si ya tiene ticket o no es una conversación no resuelta.

---

## Exact File Map

**Create**

- `src/features/tickets/types/ticket-types.ts`: contratos exactos y uniones de estado, prioridad y fuente.
- `src/features/tickets/ticket-utils.ts`: ordenamiento inmutable y etiquetas compartidas sin interferir con Fast Refresh.
- `src/features/tickets/api/ticket-api.ts`: las seis operaciones HTTP usadas por el portal.
- `src/features/tickets/schemas/ticket-schemas.ts`: esquemas de creación y comentario.
- `src/features/tickets/hooks/use-tickets.ts`: query keys, queries y mutaciones.
- `src/features/tickets/components/ticket-badges.tsx`: etiquetas accesibles de estado, prioridad y fuente.
- `src/features/tickets/components/ticket-list.tsx`: listado responsive y categorías.
- `src/features/tickets/components/ticket-form.tsx`: formulario manual/conversión compartido.
- `src/features/tickets/components/ticket-history.tsx`: trazabilidad cronológica.
- `src/features/tickets/components/ticket-comments.tsx`: formulario y comentarios creados durante la sesión.
- `src/features/tickets/pages/client-dashboard-page.tsx`: resumen y tickets recientes.
- `src/features/tickets/pages/client-tickets-page.tsx`: bandeja propia.
- `src/features/tickets/pages/client-ticket-create-page.tsx`: creación y conversión.
- `src/features/tickets/pages/client-ticket-detail-page.tsx`: detalle, historial y comentarios.
- `src/features/tickets/tickets-api.test.ts`: contratos HTTP y ausencia de almacenamiento inseguro.
- `src/features/tickets/tickets.test.tsx`: flujos de UI, permisos, errores y regresión.

**Modify**

- `src/lib/api-client.ts`: reconocer `detail` textual de FastAPI sin exponer datos no textuales.
- `src/lib/api-client.test.ts`: cubrir errores FastAPI con `detail`.
- `src/app/app-shell.tsx`: componer el callback de conversión y pasarlo al router/widget.
- `src/app/router.tsx`: registrar `/cliente/tickets/nuevo` y usar las páginas reales.
- `src/app/app.test.tsx`: proteger la nueva ruta y conservar regresiones de roles.
- `src/components/layout/portal-layout.tsx`: añadir acceso “Crear ticket”.
- `src/features/chatbot/chatbot-provider.tsx`: exponer una limpieza condicionada al ID tras conversión exitosa.
- `src/features/chatbot/components/conversation-panel.tsx`: convertir la CTA preparada en copy funcional.
- `src/features/chatbot/components/chatbot-widget.tsx`: aceptar y propagar `onCreateTicket`.
- `src/features/chatbot/pages/chat-page.tsx`: aceptar y propagar `onCreateTicket`.
- `src/features/chatbot/chatbot.test.tsx`: regresión de visitante, CLIENTE y personal.
- `src/pages/base-pages.tsx`: retirar únicamente los stubs de cliente reemplazados.
- `src/styles/globals.css`: estilos responsive de dashboard, lista, formulario, detalle, historial y comentarios.
- `README.md`: rutas, endpoints, flujo de conversión, permisos y limitación de comentarios.

---

### Task 1: Contratos HTTP, errores y esquemas

**Interfaces produced:**

```ts
export type TicketPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'
export type TicketStatus = 'NUEVO' | 'ASIGNADO' | 'EN_PROCESO' | 'PENDIENTE_CLIENTE' | 'RESUELTO' | 'CERRADO' | 'CANCELADO'
export type TicketSource = 'CHATBOT' | 'MANUAL'

export interface TicketCreate {
  category_id: string
  subject: string
  description: string
  priority: TicketPriority
}

export interface TicketRead {
  id: string
  tracking_code: string
  client_id: string
  conversation_id: string | null
  category_id: string
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  source: TicketSource
  assigned_advisor_id: string | null
  created_at: string
  assigned_at: string | null
  resolved_at: string | null
  closed_at: string | null
  cancelled_at: string | null
}

export interface CommentCreate { content: string }
export interface CommentRead { id: string; ticket_id: string; author_id: string; content: string; created_at: string }
export interface HistoryRead { id: string; ticket_id: string; actor_id: string | null; action: string; old_value: string | null; new_value: string | null; description: string; created_at: string }
```

- [x] **RED:** crear `tickets-api.test.ts` para verificar URLs, método, body exacto, retorno tipado y que la conversión nunca invoque `/tickets`. Añadir a `api-client.test.ts` un error `{ detail: "Ticket no autorizado" }` que debe producir ese mensaje.
- [x] **Verify RED:** ejecutar `npm run test -- --run src/features/tickets/tickets-api.test.ts src/lib/api-client.test.ts`. Esperado: FAIL por módulos inexistentes y porque `ApiError` ignora `detail`.
- [x] **GREEN:** crear tipos y `ticket-api.ts` con `listMyTickets`, `createTicket`, `getTicket`, `getTicketHistory`, `addTicketComment` y `convertConversationToTicket`. Extender `ApiErrorPayload` con `detail?: unknown` y usarlo solo si es `string`.
- [x] **GREEN:** crear `ticketCreateSchema` con categoría obligatoria, asunto trim 3–200, descripción trim 5–10000 y `z.enum(['BAJA','MEDIA','ALTA','URGENTE'])`; crear `commentSchema` trim 1–5000.
- [x] **Verify GREEN / REFACTOR:** ejecutar el mismo comando. Esperado: todas las pruebas de contratos pasan; `localStorage` permanece vacío y no hay endpoints de estado definidos.

### Task 2: Queries, listado propio y dashboard

**Interfaces produced:**

```ts
export const ticketsQueryKey = ['client-tickets'] as const
export const ticketQueryKey = (id: string) => ['ticket', id] as const
export const ticketHistoryQueryKey = (id: string) => ['ticket-history', id] as const
export function useMyTickets(): UseQueryResult<TicketRead[]>
export function useTicket(id: string): UseQueryResult<TicketRead>
export function useTicketHistory(id: string): UseQueryResult<HistoryRead[]>
```

- [x] **RED:** crear pruebas UI para carga de `/tickets/mine`, orden descendente aun si el mock llega desordenado, código, asunto, estado, prioridad, fuente, categoría resuelta, enlace al detalle, vacío, error y reintento.
- [x] **RED:** probar dashboard con total abierto, total resuelto/cerrado, tres recientes, enlaces a crear/lista/chat y estado vacío.
- [x] **Verify RED:** ejecutar `npm run test -- --run src/features/tickets/tickets.test.tsx -t "bandeja|dashboard"`. Esperado: FAIL porque las páginas reales no existen.
- [x] **GREEN:** implementar hooks con `retry: false`, badges con texto visible y clases por valor, `TicketList`, `ClientTicketsPage` y `ClientDashboardPage`. Reutilizar `useCategories`; excluir categorías inactivas y mostrar “Categoría no disponible” cuando no haya coincidencia.
- [x] **GREEN:** calcular abiertos como todos salvo `CERRADO` y `CANCELADO`; mostrar recientes mediante copia ordenada, sin mutar la respuesta de Query.
- [x] **Verify GREEN / REFACTOR:** ejecutar el filtro anterior. Esperado: PASS para carga, contenido, orden, vacío, error, reintento y resumen.

### Task 3: Creación manual y conversión de chatbot

**Interfaces produced:**

```ts
export function useCreateTicketMutation(): UseMutationResult<TicketRead, Error, { data: TicketCreate; conversationId: string | null }>
export interface TicketFormProps {
  categories: CategoryRead[]
  conversationId: string | null
  onCreated: (ticket: TicketRead) => void
}
```

- [x] **RED:** probar validación visible de categoría, asunto, descripción y prioridad; botón deshabilitado durante envío; creación manual por `POST /tickets`; manejo 401, 403, 409 y 422 sin limpiar campos.
- [x] **RED:** probar `?conversationId=conversation-1`: carga del contexto real, `POST /chat/conversations/conversation-1/convert-to-ticket`, ausencia de `POST /tickets`, conservación de formulario/ID ante error y limpieza solo tras `TicketRead` exitoso.
- [x] **RED:** probar que éxito manual o conversión navega a `/cliente/tickets/{id}`, conserva el ticket en cache y muestra el código de seguimiento.
- [x] **Verify RED:** ejecutar `npm run test -- --run src/features/tickets/tickets.test.tsx -t "creación|conversión"`. Esperado: FAIL por formulario, ruta y mutación inexistentes.
- [x] **GREEN:** implementar una sola mutación cuyo `mutationFn` seleccione el endpoint exclusivamente por `conversationId !== null`; usar `TicketForm` con React Hook Form, `zodResolver`, valores iniciales y mensajes de status específicos.
- [x] **GREEN:** implementar `ClientTicketCreatePage`; cargar categorías activas y `useConversationQuery` cuando haya ID. Mostrar mensajes reales de conversación con `MessageList`, sin prellenar ni generar contenido.
- [x] **GREEN:** añadir `clearConversationAfterTicket(conversationId)` al contexto; limpiar storage/cache/memoria solo si el ID convertido sigue siendo el actual y solo dentro de `onSuccess`.
- [x] **GREEN:** desde `App`, crear el callback `navigate('/cliente/tickets/nuevo?conversationId=' + encodeURIComponent(conversation.id))` únicamente para `CLIENTE`; pasarlo a `AppRouter`, `ChatPage` y `ChatbotWidget`.
- [x] **Verify GREEN / REFACTOR:** ejecutar el filtro anterior y `src/features/chatbot/chatbot.test.tsx`. Esperado: PASS; visitantes siguen viendo login/registro, clientes ven CTA real y personal continúa sin chatbot.

### Task 4: Detalle, historial y comentarios

**Interfaces produced:**

```ts
export function useAddTicketCommentMutation(ticketId: string): UseMutationResult<CommentRead, Error, CommentCreate>
export function TicketHistory({ items }: { items: HistoryRead[] }): JSX.Element
export function TicketComments({ ticket }: { ticket: TicketRead }): JSX.Element
```

- [x] **RED:** probar detalle con tracking code, asunto, descripción, badges, categoría, fuente, asesor opcional y solo fechas existentes; probar carga conjunta de ticket e historial, 403/404, error y reintento.
- [x] **RED:** probar historial vacío/lleno y comentarios trim 1–5000. Tras POST exitoso debe aparecer una sola vez el `CommentRead`, refrescar ticket/historial y mantener la misma ruta.
- [x] **RED:** probar que `CERRADO`/`CANCELADO` ocultan el formulario de comentario y que ningún estado muestra botones cerrar, reabrir o cancelar para `CLIENTE`.
- [x] **Verify RED:** ejecutar `npm run test -- --run src/features/tickets/tickets.test.tsx -t "detalle|historial|comentario|acciones"`. Esperado: FAIL por página/componentes pendientes.
- [x] **GREEN:** implementar página y componentes. El historial se ordena ascendente; el comentario exitoso se agrega por ID a estado local y se invalidan `ticketQueryKey`, `ticketHistoryQueryKey` y `ticketsQueryKey` sin navegación ni manipulación de scroll.
- [x] **GREEN:** mostrar nota accesible de que el backend actual no ofrece lectura del contenido histórico de comentarios; no llamar ni simular un endpoint GET de comentarios.
- [x] **Verify GREEN / REFACTOR:** ejecutar el filtro anterior. Esperado: PASS y cero llamadas a `/close`, `/reopen`, `/cancel` o `/status` desde el portal del cliente.

### Task 5: Rutas, layouts, estilos y regresión

- [x] **RED:** ampliar `app.test.tsx` para `/cliente/tickets/nuevo` sin sesión, `ASESOR` y `SUPERVISOR`; los tres casos deben terminar en login/acceso denegado según el guard existente. Añadir regresión de `/personal/*`, `/panel/*` y chatbot oculto para personal.
- [x] **Verify RED:** ejecutar `npm run test -- --run src/app/app.test.tsx src/features/auth/auth.test.tsx src/features/chatbot/chatbot.test.tsx`. Esperado: la nueva ruta falla hasta registrarla.
- [x] **GREEN:** sustituir imports de stubs en router por las cuatro páginas de tickets, registrar `/cliente/tickets/nuevo` antes de `:ticketId`, eliminar solo los tres stubs de cliente en `base-pages.tsx` y añadir “Crear ticket” al layout.
- [x] **GREEN:** añadir estilos mobile-first para `.client-dashboard-*`, `.ticket-list-*`, `.ticket-card-*`, `.ticket-form-*`, `.ticket-detail-*`, `.ticket-history-*` y `.ticket-comments-*`; conservar focus-visible y reduced motion existentes.
- [x] **Verify GREEN / REFACTOR:** ejecutar pruebas de app, auth, chatbot y tickets. Esperado: rutas de cliente exclusivas de CLIENTE; rutas internas siguen en `/personal/*`; widget ausente para personal.

### Task 6: Documentación, autoauditoría y cierre

- [x] **Docs:** actualizar README con endpoints usados, rutas nuevas, creación manual, conversión, permisos reales, sessionStorage y limitación del GET de comentarios.
- [x] **Full validation:** ejecutar `npm run lint`. Esperado: exit 0 sin errores.
- [x] **Full validation:** ejecutar `npm run test`. Esperado: exit 0 y todas las suites pasan sin warnings de React.
- [x] **Full validation:** ejecutar `npm run build`. Esperado: exit 0; TypeScript y Vite generan `dist`.
- [x] **Full validation:** ejecutar `npm audit --omit=dev`. Esperado: exit 0 y `found 0 vulnerabilities`.
- [x] **Scope audit:** ejecutar `git diff --check`, `git status --short`, `git diff --name-only`, `git ls-files '.env*'`, escaneo de secretos y `rg -n 'localStorage|/personal|/panel|convert-to-ticket|/close|/reopen|/cancel' src README.md docs/superpowers/plans/2026-09-12-client-tickets-implementation.md`.
- [x] **Scope audit expected:** solo archivos frontend; `.env.example` es el único archivo `.env*` rastreado y no contiene secretos; no hay `localStorage` runtime; `/panel/*` solo conserva redirecciones; no hay endpoints de estado de cliente; conversión usa exclusivamente `convert-to-ticket`.
- [x] **Single commit:** ejecutar `git add .` y `git commit -m "feat(tickets): add client ticket portal"`. Esperado: un único commit nuevo y `git status --short` vacío.

## Plan Self-Audit

- **Coverage:** Tasks 1–2 cubren contratos, API, lista y dashboard; Task 3 cubre creación/conversión; Task 4 cubre detalle, trazabilidad, comentarios y permisos; Task 5 integra rutas/estilos/regresión; Task 6 valida y documenta.
- **Types:** nombres y nullabilidad coinciden con Pydantic `TicketRead`, `CommentRead` e `HistoryRead`; no se añade un contrato de comentarios inexistente.
- **Endpoints:** solo se usan `GET /categories`, `POST /tickets`, `GET /tickets/mine`, `GET /tickets/{id}`, `POST /tickets/{id}/comments`, `GET /tickets/{id}/history` y `POST /chat/conversations/{id}/convert-to-ticket`.
- **Permissions:** CLIENTE no recibe controles de cerrar, reabrir, cancelar, asignar o cambiar estado; el backend continúa siendo la autoridad sobre propiedad y transición.
- **Conversion:** el endpoint se selecciona de forma excluyente, el ID se conserva ante errores y se limpia únicamente tras respuesta `TicketRead` exitosa.
- **Comments:** no se inventa lectura; solo se muestran respuestas creadas durante el montaje y eventos del historial.
- **Routes:** `/cliente`, `/cliente/tickets`, `/cliente/tickets/nuevo` y `/cliente/tickets/:ticketId` comparten el guard `CLIENTE`; `/personal/*` no cambia.
- **Security:** no hay almacenamiento persistente de tickets/comentarios, datos bancarios, tokens o mensajes; el aviso académico permanece.
- **Completitud:** no contiene marcadores de posición, decisiones abiertas ni tareas fuera del alcance.
