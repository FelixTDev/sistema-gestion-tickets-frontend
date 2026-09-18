# Task 5 — Portal de asesor

## Estado

Implementación realizada sin commit ni push en la rama `ui-redesing-gnb-v2`.

## Cambios

- Se creó `src/features/tickets/pages/advisor-dashboard-page.tsx`: dashboard derivado de `GET /tickets`, con estados de carga, error, vacío y éxito; métricas y actividad reciente sin registros inventados.
- Se actualizó `src/app/router.tsx`: `/personal` muestra el dashboard real para `ASESOR` y conserva el destino supervisor.
- Se actualizó `src/components/layout/staff-layout.tsx`: navegación por rol con `NavLink`, estado activo, sidebar oscuro desktop y drawer móvil accesible con overlay, Escape y cierre explícito.
- Se actualizó `src/features/tickets/components/ticket-actions.tsx`: transiciones reales con confirmación accesible y motivos para reapertura/cancelación; errores 401/403/404/409/422 visibles sin éxito optimista.
- Se actualizó `src/features/tickets/pages/staff-ticket-detail-page.tsx`: guard para IDs inválidos antes de iniciar queries y mensajes contextuales 401/403/404.
- Se actualizó `src/features/tickets/hooks/use-tickets.ts`: las operaciones exitosas invalidan también `['report']` para refrescar métricas supervisoras.
- Se creó `src/features/tickets/advisor-portal.test.tsx`; `ticket-filters.test.tsx` existente conserva pruebas de rango UTC y validación de fechas.

## Evidencia TDD

- RED: la prueba nueva falló tras corregir su setup porque `/personal` todavía redirigía a la bandeja y el detalle inválido iniciaba solicitudes.
- GREEN: `npm run test -- src/features/tickets/advisor-portal.test.tsx src/features/tickets/components/ticket-filters.test.tsx` terminó con 4 tests pasando.

## Verificación

- `npm run lint`: OK (código 0).
- `npm run build`: OK (código 0; Vite emitió advertencias informativas de comentarios de Zod y tamaño de chunk).
- `git diff --check`: OK; solo mostró advertencias de normalización CRLF de archivos ya modificados.
- `npm run test`: 152 pasando y 12 fallando en pruebas preexistentes de landing/chat/portal cliente e invariantes de copy, fuera del alcance de Task 5 y concurrentes con otras tareas.

## Consideraciones

- No se agregaron dependencias ni mocks de runtime, datos estáticos de dominio ni endpoints nuevos.
- `TicketAssignment` mantiene sus controles únicamente para `SUPERVISOR`; la autoridad final continúa en backend.
