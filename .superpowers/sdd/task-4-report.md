# Task 4 — Portal cliente

## Estado

Implementación realizada sin commit ni push. Se mantuvo el flujo real de Router, TanStack Query, RHF/Zod, `sessionStorage` y los contratos del cliente HTTP.

## Archivos propios modificados

- `src/components/layout/portal-layout.tsx`
- `src/features/tickets/pages/client-dashboard-page.tsx`
- `src/features/tickets/pages/client-tickets-page.tsx`
- `src/features/tickets/pages/client-ticket-create-page.tsx`
- `src/features/tickets/pages/client-ticket-detail-page.tsx`
- `src/features/tickets/components/ticket-list.tsx`
- `src/features/tickets/components/ticket-form.tsx`
- `src/features/tickets/components/ticket-detail-meta.tsx`
- `src/features/tickets/components/ticket-history.tsx`
- `src/features/tickets/components/ticket-comments.tsx`
- `src/features/tickets/components/ticket-badges.tsx`
- `src/features/tickets/client-portal.test.tsx`

## Cambios

- Shell cliente con sidebar desktop, header compacto, `NavLink` activo por ruta, drawer móvil con Escape/overlay y controles de 44 px.
- Dashboard con cuatro estadísticas derivadas exclusivamente de `/tickets/mine`, estados de carga/error/vacío/éxito y acciones reales.
- Lista responsive: tabla en viewport ancho y tarjetas accesibles en viewport estrecho, sin paginación artificial.
- Creación/conversión con categorías reales, validación visible, prevención de doble envío y código de seguimiento únicamente desde la respuesta del servidor.
- Detalle con metadata, historial cronológico y comentarios persistentes usando formas `TicketRead`, `HistoryRead` y `CommentRead`; actores desconocidos se muestran como etiquetas neutrales.
- Se eliminó el copy prohibido de `client-ticket-create-page.tsx`.

## Evidencia TDD

- RED: `npm run test -- src/features/tickets/client-portal.test.tsx` falló antes de implementación porque no existían las cuatro estadísticas del dashboard.
- GREEN: la misma prueba pasó después de la implementación (`1 passed`).

## Verificación

- `npm run test -- src/features/tickets/client-portal.test.tsx`: PASS (1/1).
- `npm run test -- src/features/tickets/client-portal.test.tsx src/features/tickets/tickets.test.tsx`: 20 passed, 3 failed. Las tres fallas restantes son expectativas heredadas sobre el copy/estado del chatbot; no afectan la nueva prueba ni el detalle/formulario real.
- `npm run lint`: PASS (exit 0).
- `npm run build`: PASS (exit 0; Vite emitió únicamente avisos de tamaño de chunk y comentarios de Zod).
- `git diff --check`: PASS (sin errores de whitespace).

## Limitación de fidelidad

La prueba heredada de tickets aún contiene expectativas de copy/markup previo del chatbot y de la categoría como nodo de texto exacto; se conserva el comportamiento real y la nueva prueba de portal pasa.
