# Task 6 — Informe de implementación

## Estado

Implementado en el frontend, sin commit ni push. `src/app/router.tsx` fue preservado porque tiene un dueño concurrente.

## Cambios

- Portadas `SupervisorDashboardPage` y nueva `ReportsPage`: los indicadores, barras, porcentajes y tiempo de resolución proceden exclusivamente de las cinco consultas de reportes; no hay deltas, tendencias ni tasas inventadas.
- Filtros accesibles `from`, `to`, `category_id`, `status` y `priority`; las fechas se convierten a límites ISO solo al aplicar y no se agregan parámetros de paginación.
- Distribuciones accesibles en tablas con barras CSS zero-safe, y estados de carga, error/reintento, vacío y éxito.
- Nueva `TicketAssignmentPage`: consulta tickets reales, conserva únicamente no asignados no terminales y delega la confirmación a `POST /tickets/{ticket_id}/assignments` con `advisor_id` real. `TicketAssignment` muestra solo candidatos `ASESOR` del endpoint activo, no permite editar UUIDs y usa diálogo accesible.
- Se añadieron estilos responsive mobile-first para reportes, asignación, asesores y conocimiento usando los tokens existentes.
- Nueva `KnowledgePage`, `FaqForm`, `CategoryForm` y `knowledge-schemas.ts`: CRUD permitido por OpenAPI (POST/PATCH/status), validación RHF/Zod y solo registros activos en la interfaz. No se ofrece DELETE ni reactivación ficticia; la desactivación de FAQ/categoría requiere confirmación accesible y se comunica que el registro puede desaparecer y no ser recuperable desde esta vista después de refrescar.
- Se añadió el alias `useSummaryReport` y el tipo `PublicUser` para mantener contratos explícitos.

## Rutas para conectar en `src/app/router.tsx`

Importaciones:

```tsx
import { ReportsPage } from '../features/reports/pages/reports-page'
import { TicketAssignmentPage } from '../features/tickets/pages/ticket-assignment-page'
import { KnowledgePage as SupervisorKnowledgePage } from '../features/faqs/pages/knowledge-page'
```

Dentro de `Route element={<StaffLayout />}` agregar, todos protegidos exclusivamente para `SUPERVISOR`:

```tsx
<Route path="/personal/reportes" element={<ProtectedRoute roles={['SUPERVISOR']}><ReportsPage /></ProtectedRoute>} />
<Route path="/personal/asignacion" element={<ProtectedRoute roles={['SUPERVISOR']}><TicketAssignmentPage /></ProtectedRoute>} />
<Route path="/personal/conocimiento" element={<ProtectedRoute roles={['SUPERVISOR']}><SupervisorKnowledgePage /></ProtectedRoute>} />
```

El import/ruta anterior de `KnowledgePage` placeholder debe reemplazarse por el alias de la feature. El dashboard `/personal` existente debe continuar renderizando `SupervisorDashboardPage`; `/panel/*` debe seguir siendo únicamente redirect.

## Evidencia TDD

- RED real: antes de crear las páginas, el comando dirigido falló al resolver `./pages/reports-page` y `./pages/knowledge-page`.
- GREEN: `npm run test -- --run src/features/faqs/knowledge-page.test.tsx src/features/reports/supervisor-pages.test.tsx src/features/tickets/ticket-assignment.test.tsx src/features/reports/reports-api.test.ts` — 4 archivos, 11 pruebas, todas pasan; cubre confirmación y mutaciones de conocimiento, error 409 y confirmación de asignación, invalidación de caché y fallo parcial de reportes.
- Verificación adicional: `npm run lint` — exit 0; `npm run build` — exit 0; `git diff --check` — sin errores.

## Limitaciones de fidelidad y contrato

- La API no expone exportación; el botón permanece deshabilitado y anuncia `Funcionalidad no disponible`.
- La API de conocimiento devuelve solo activos; tras desactivar, el elemento puede desaparecer y no se simula una lista de inactivos ni una reactivación local.
- La API confirmada no expone paginación ni conteos de tickets por categoría; no se inventan esos datos.
- El suite amplio existente tiene fallos de regresión concurrentes ajenos a estas páginas; las pruebas dirigidas y compilación de Task 6 permanecen verdes.
