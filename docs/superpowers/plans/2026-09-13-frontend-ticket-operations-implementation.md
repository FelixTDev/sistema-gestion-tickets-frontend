# Frontend Ticket Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar comentarios persistentes y construir las superficies operativas de tickets para `ASESOR` y `SUPERVISOR`, sin alterar el portal cliente, chatbot, autenticación ni backend.

**Architecture:** El módulo existente `src/features/tickets` conservará contratos, servicios HTTP, queries, componentes compartidos y páginas separadas por audiencia. El cliente y el personal reutilizarán badges, metadatos, historial y comentarios; las acciones operativas vivirán en un componente específico que recibe el usuario actual y respeta las transiciones verificadas en backend. TanStack Query manejará cache e invalidación; los filtros se aplicarán mediante un formulario explícito para evitar peticiones por cada pulsación.

**Tech Stack:** React, TypeScript estricto, Vite, React Router, TanStack Query, React Hook Form, Zod, Vitest, Testing Library y CSS existente.

## Global Constraints

- Trabajar exclusivamente en `C:\dev\sistema-gestion-tickets\frontend`.
- No modificar el backend ni archivos externos al repositorio frontend.
- Consumir únicamente los endpoints existentes bajo `/api/v1`.
- No usar `any`, no inventar endpoints y no agregar dependencias.
- Mantener `sessionStorage` para la sesión existente y no guardar tickets, comentarios, tokens ni secretos en `localStorage`.
- No mostrar UUID crudos de autores de comentarios; mostrar “Tú” o “Atención” según el usuario actual.
- El backend es la autoridad de permisos; el frontend solo oculta controles y refleja respuestas 401, 403, 404, 409 y 422.
- Mantener `/personal`, `/personal/tickets` y `/personal/tickets/:ticketId` como rutas oficiales.
- Mantener `/panel/*` como redirección con `replace` hacia `/personal/*`.
- Mantener el chatbot operativo para visitantes y `CLIENTE`, completamente inactivo para `ASESOR` y `SUPERVISOR`.
- Mantener el aviso “Prototipo académico no oficial”, accesibilidad, foco, teclado, contraste y diseño responsive.
- No implementar dashboard, reportes ni administración de FAQ para supervisor en esta fase.
- No realizar commits intermedios; el resultado final será un único commit `feat(tickets): add persistent comments and staff ticket workspace`.

## Contratos backend verificados

El router y los tests reales del backend confirman:

```ts
export interface TicketStatusChange {
  status: TicketStatus
  reason: string | null
}

export interface ReasonRequest {
  reason: string
}

export interface AssignmentCreate {
  advisor_id: string
}

export interface TicketListFilters {
  status: TicketStatus | ''
  category_id: string
  priority: TicketPriority | ''
  created_from: string
  created_to: string
}
```

- `GET /tickets/{id}/comments` devuelve `CommentRead[]` ordenados por el repositorio.
- `POST /tickets/{id}/comments` permite al supervisor cualquier ticket autorizado; al asesor solo el ticket asignado a su usuario; al cliente solo sus tickets.
- `GET /tickets` exige `ASESOR` o `SUPERVISOR` y acepta `status`, `category_id`, `priority`, `created_from`, `created_to`.
- `POST /tickets/{id}/status` exige personal; el asesor solo puede gestionar tickets asignados a él; el supervisor puede gestionar tickets globales.
- `POST /tickets/{id}/close` aplica la transición a `CERRADO` y solo es válida desde `RESUELTO`.
- `POST /tickets/{id}/reopen` exige motivo, solo acepta `RESUELTO` y cambia a `EN_PROCESO`.
- `POST /tickets/{id}/cancel` exige supervisor y motivo.
- `POST /tickets/{id}/assignments` exige supervisor, pero no existe endpoint para listar asesores; no se mostrará selector ni se aceptarán IDs escritos manualmente.
- Las transiciones válidas se reflejarán en la UI solo para evitar acciones imposibles; cada mutación seguirá dependiendo de la validación backend.

## Exact File Map

**Create**

- `src/features/tickets/components/ticket-detail-meta.tsx`: metadatos compartidos y fechas opcionales.
- `src/features/tickets/components/ticket-filters.tsx`: filtros accesibles del personal.
- `src/features/tickets/components/ticket-actions.tsx`: estado, cierre, reapertura y cancelación con confirmación/motivo.
- `src/features/tickets/pages/staff-tickets-page.tsx`: bandeja operativa con filtros.
- `src/features/tickets/pages/staff-ticket-detail-page.tsx`: detalle operativo.

**Modify**

- `src/features/tickets/types/ticket-types.ts`: contratos de filtros y mutaciones operativas.
- `src/features/tickets/api/ticket-api.ts`: lectura persistente de comentarios, listado global y mutaciones operativas.
- `src/features/tickets/hooks/use-tickets.ts`: queries globales, comentarios y mutaciones con invalidación.
- `src/features/tickets/components/ticket-comments.tsx`: consumir comments query, diferenciar autor sin UUID y compartir formulario cliente/personal.
- `src/features/tickets/components/ticket-list.tsx`: aceptar destino de detalle cliente/personal.
- `src/features/tickets/pages/client-ticket-detail-page.tsx`: usar comentarios persistentes y metadatos compartidos.
- `src/app/router.tsx`: usar páginas operativas reales bajo `/personal/tickets`.
- `src/features/tickets/tickets-api.test.ts`: contratos HTTP nuevos.
- `src/features/tickets/tickets.test.tsx`: cobertura de comentarios, bandeja operativa, detalle y acciones.
- `src/app/app.test.tsx`: regresiones de acceso, rutas oficiales y redirecciones legacy.
- `src/styles/globals.css`: estilos de filtros, acciones, comentarios persistentes y detalle operativo responsive.
- `README.md`: endpoints, permisos, filtros, acciones y limitación de asignación.

---

## Bloque A: Comentarios persistentes

### A1. API, tipos y queries

**Interfaces:**

```ts
export function getTicketComments(ticketId: string): Promise<CommentRead[]>
export function listTickets(filters: TicketListFilters): Promise<TicketRead[]>
export function changeTicketStatus(ticketId: string, data: TicketStatusChange): Promise<TicketRead>
export function closeTicket(ticketId: string): Promise<TicketRead>
export function reopenTicket(ticketId: string, data: ReasonRequest): Promise<TicketRead>
export function cancelTicket(ticketId: string, data: ReasonRequest): Promise<TicketRead>
```

- [ ] **RED:** ampliar `tickets-api.test.ts` con `getTicketComments`, `listTickets` y las cuatro mutaciones, verificando URL, método, body exacto, query params y que no aparezca ninguna ruta inventada.
- [ ] **RED:** ampliar `tickets.test.tsx` para que el detalle cliente exija GET de comentarios, lista persistente, orden cronológico, estado vacío, error y reintento.
- [ ] **Verify RED:** ejecutar `npm run test -- --run src/features/tickets/tickets-api.test.ts src/features/tickets/tickets.test.tsx -t "comentarios persistentes|API operativa"`. Debe fallar por funciones y consumo inexistentes.
- [ ] **GREEN:** añadir `getTicketComments`, `listTickets`, `changeTicketStatus`, `closeTicket`, `reopenTicket` y `cancelTicket` al servicio existente; serializar solo filtros no vacíos y mantener `Authorization` en `api-client`.
- [ ] **GREEN:** añadir `useTicketComments`, `useOperationalTickets`, `useChangeTicketStatusMutation`, `useCloseTicketMutation`, `useReopenTicketMutation` y `useCancelTicketMutation`. Cada mutación invalidará ticket, historial, comentarios y bandeja operativa relacionadas.
- [ ] **Verify GREEN:** ejecutar el mismo comando. Esperado: contratos y queries pasan, con cero uso de `localStorage` runtime.

### A2. Componente común de comentarios

- [ ] **RED:** probar cliente y personal con comentarios persistidos, comentarios propios rotulados “Tú”, comentarios de atención rotulados “Atención”, ausencia de UUID, estado vacío, error con reintento, publicación exitosa, conservación del texto ante 401/403/409/422, deduplicación y botón deshabilitado.
- [ ] **GREEN:** refactorizar `TicketComments` para usar `useTicketComments(ticket.id)`, ordenar una copia por `created_at`, mostrar contenido/fecha, mantener comentarios nuevos por ID y llamar `invalidateQueries` desde la mutación. Usar `useAuth` para la etiqueta de autor y nunca renderizar `author_id`.
- [ ] **GREEN:** conservar el formulario solo cuando el estado no sea `CERRADO` ni `CANCELADO`; dejar el backend como autoridad ante errores.
- [ ] **Verify GREEN / REFACTOR:** ejecutar `npm run test -- --run src/features/tickets/tickets.test.tsx -t "comentario|Comentarios"` y confirmar que cliente y personal usan el mismo componente.

### A3. Detalle cliente y regresión

- [ ] **RED:** ajustar mocks del detalle cliente para responder `/comments`, verificar que comentarios sobreviven al desmontaje y nuevo montaje con la respuesta del endpoint, y que historial continúa separado.
- [ ] **GREEN:** crear `TicketDetailMeta`, reutilizarlo en cliente y personal, y actualizar `ClientTicketDetailPage` para delegar comentarios persistentes sin cambiar sus rutas, CTA, permisos ni chatbot.
- [ ] **Verify GREEN:** ejecutar `npm run test -- --run src/features/tickets/tickets.test.tsx src/features/chatbot/chatbot.test.tsx src/features/auth/auth.test.tsx`; deben mantenerse las regresiones aprobadas.

## Bloque B: Bandeja y detalle operativo

### B1. Bandeja `/personal/tickets`

**Interfaces:**

```ts
export interface TicketFiltersProps {
  value: TicketListFilters
  categories: CategoryRead[]
  onChange: (next: TicketListFilters) => void
}
```

- [ ] **RED:** probar acceso sin sesión, `CLIENTE`, `ASESOR` y `SUPERVISOR`; carga global, vacío, error/reintento, filtros por estado/prioridad/categoría/fecha, query params exactos, orden visual, categorías activas, cliente seguro omitido si solo es UUID, asesor asignado y enlaces `/personal/tickets/:id`.
- [ ] **Verify RED:** ejecutar `npm run test -- --run src/features/tickets/tickets.test.tsx src/app/app.test.tsx -t "operativa|personal|filtros"`. Debe fallar por la bandeja real y filtros ausentes.
- [ ] **GREEN:** crear `TicketFilters` con selects y date inputs; mantener valores locales y aplicar el snapshot completo al enviar para no solicitar por cada cambio. Convertir fechas a ISO de inicio/fin antes de `listTickets`.
- [ ] **GREEN:** crear `StaffTicketsPage` con `useOperationalTickets`, estados accesibles, categorías activas, `TicketList` parametrizado con base `/personal/tickets` y texto claro de que el backend filtra el alcance por rol.
- [ ] **Verify GREEN:** ejecutar el filtro anterior y comprobar que cambiar controles sin pulsar aplicar no genera peticiones adicionales.

### B2. Detalle operativo y acciones

- [ ] **RED:** probar GET conjunto de ticket, comentarios e historial para asesor/supervisor; metadatos, fechas, comentarios persistentes, historial separado, errores 401/403/404/409/422 y reintento.
- [ ] **RED:** probar que un asesor no asignado no obtiene controles de gestión, un asesor asignado puede usar transiciones permitidas, supervisor puede gestionar, y ningún rol puede ejecutar desde la UI transición inválida.
- [ ] **RED:** probar confirmación de cierre/cancelación/reapertura, motivos obligatorios para cancelación/reapertura, botón deshabilitado, invalidación de detalle/bandeja/historial/comentarios y no duplicación.
- [ ] **RED:** probar que no aparece asignación manual ni selector de asesor porque no existe fuente válida de asesores.
- [ ] **Verify RED:** ejecutar `npm run test -- --run src/features/tickets/tickets.test.tsx -t "detalle operativo|acciones|asignación"`. Debe fallar por página y controles pendientes.
- [ ] **GREEN:** crear `TicketActions` con reglas de transición verificadas: `NUEVO → ASIGNADO/CANCELADO`, `ASIGNADO → EN_PROCESO/CANCELADO`, `EN_PROCESO → PENDIENTE_CLIENTE/RESUELTO/CANCELADO`, `PENDIENTE_CLIENTE → EN_PROCESO`, `RESUELTO → CERRADO/EN_PROCESO/CANCELADO`; limitar gestión de asesor al ticket asignado y cancelación al supervisor.
- [ ] **GREEN:** usar diálogo accesible controlado: confirmación para cierre, cancelación y reapertura; campo de motivo para cancelación/reapertura; Escape devuelve el foco al activador; cada acción usa endpoint exacto y no usa `window.prompt`.
- [ ] **GREEN:** crear `StaffTicketDetailPage`, compartir `TicketDetailMeta`, `TicketComments`, `TicketHistory` y badges, y mostrar solo el cliente como “Cliente asociado” cuando `TicketRead` entregue únicamente UUID; mantener asesor asignado sin exponer autores de comentarios.
- [ ] **Verify GREEN / REFACTOR:** ejecutar el filtro anterior y comprobar con `rg` que el portal no llama `/assignments` ni intenta listar asesores.

### B3. Rutas, documentación y regresión

- [ ] **RED:** agregar pruebas de `/personal/tickets` y `/personal/tickets/:ticketId`, `/panel/* → /personal/*`, bloqueo del portal cliente para personal, mantenimiento del chatbot para visitante/cliente y ausencia para personal.
- [ ] **GREEN:** cambiar únicamente las rutas internas de tickets para usar `StaffTicketsPage` y `StaffTicketDetailPage`; conservar `/personal` como espacio preparado para dashboard futuro y no crear jerarquías nuevas.
- [ ] **GREEN:** actualizar `README.md` con comentarios persistentes, endpoints operativos, filtros, reglas por rol, transiciones, confirmaciones y limitación de asignación sin endpoint de asesores.
- [ ] **GREEN:** añadir CSS mobile-first para filtros, tablas/tarjetas, acciones, diálogos y comentarios, reutilizando tokens y focus-visible existentes.
- [ ] **Verify GREEN:** ejecutar `npm run test -- --run src/app/app.test.tsx src/features/auth/auth.test.tsx src/features/chatbot/chatbot.test.tsx src/features/tickets/tickets.test.tsx`; esperar todas las suites en verde.

## Validación final y autoauditoría

- [ ] Ejecutar `npm run lint`; esperado exit 0 sin errores ni warnings.
- [ ] Ejecutar `npm run test`; registrar suites y pruebas aprobadas.
- [ ] Ejecutar `npm run build`; esperado exit 0 con TypeScript y Vite correctos.
- [ ] Ejecutar `npm audit --omit=dev`; esperado exit 0 y `found 0 vulnerabilities`.
- [ ] Ejecutar `git diff --check`.
- [ ] Verificar `git ls-files '.env*'`: solo `.env.example`, sin secretos.
- [ ] Verificar `rg -n 'localStorage|/assignments|/status|/close|/reopen|/cancel|/panel|/personal|/tickets/.*/comments' src README.md docs/superpowers/plans/2026-09-13-frontend-ticket-operations-implementation.md`; confirmar que `localStorage` solo aparece en documentación/tests, que las rutas antiguas solo redirigen, que las mutaciones corresponden al personal y que comentarios usan GET/POST exactos.
- [ ] Verificar con `git -C ..\backend status --short` que backend no cambió.
- [ ] Revisar que no se rendericen `author_id`, tokens ni contraseñas; que cliente, asesor y supervisor reciban solo superficies autorizadas; y que el chatbot siga inactivo para personal.
- [ ] Marcar todos los pasos del plan como completados después de su evidencia.
- [ ] Crear un único commit `feat(tickets): add persistent comments and staff ticket workspace` y confirmar `git status --short` vacío.

## Plan Self-Audit

- **Cobertura:** Bloque A cubre lectura persistente, publicación, estados, deduplicación y regresión cliente; Bloque B cubre bandeja global, filtros, detalle, historial, comentarios y acciones por rol.
- **Contratos:** `CommentRead`, `TicketRead`, `HistoryRead`, filtros y cuerpos de mutación coinciden con los schemas y router backend inspeccionados.
- **Permisos:** asesor solo gestiona tickets asignados; supervisor gestiona globalmente; cancelación es exclusiva de supervisor; no se habilita asignación sin listado real de asesores.
- **Rutas:** solo se añaden páginas bajo `/personal/tickets`; `/panel/*` conserva redirección; cliente y personal no comparten guard.
- **Seguridad:** no se muestran UUID de autores, no se persisten tickets/comentarios, no se agregan secretos y el backend conserva la autoridad.
- **DRY/YAGNI:** comentarios, historial, metadatos, badges, errores y lista se reutilizan; no se implementan reportes, FAQ admin, búsqueda textual ni funcionalidades de backend ausentes.
- **Accesibilidad:** formularios etiquetados, estados con roles ARIA, diálogos con foco/Escape, confirmaciones visibles y layout responsive.
- **Contradicciones:** no se encontró conflicto entre el contrato nuevo de comentarios persistentes y la limitación anterior; la documentación se actualizará para reemplazar la nota de comentarios solo de montaje por lectura persistente.
