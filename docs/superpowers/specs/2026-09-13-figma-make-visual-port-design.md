# Port visual Figma Make de Banco GNB — Especificación de diseño

**Fecha:** 2026-09-13  
**Estado:** pendiente de revisión del usuario  
**Rama autorizada:** `ui-redesing-gnb-v2`  
**Fuente visual definitiva:** `C:\Users\felix\Downloads\Create App.zip`

## 1. Objetivo

Portar de forma directa la composición visual del paquete de Figma Make al frontend React existente, conservando la arquitectura, autenticación, roles, navegación, validaciones, TanStack Query y contratos reales de la API. El resultado debe reproducir layouts, componentes, estilos y comportamiento responsive del ZIP sin incorporar su router artificial, estado global ficticio ni datos de demostración al runtime.

## 2. Decisiones aprobadas

- Estrategia: port directo por componentes.
- El ZIP define la estructura JSX, jerarquía visual, tokens, iconos, tamaños, espaciados, estados y responsive.
- La aplicación actual conserva React Router, `AuthProvider`, TanStack Query, React Hook Form, Zod y `src/lib/api-client.ts`.
- El rol procede exclusivamente de `GET /auth/me` o de la respuesta autenticada de `POST /auth/login`.
- El JWT permanece únicamente en `sessionStorage`; no se añade persistencia en `localStorage`.
- Los arrays `TICKETS`, `ADVISORS`, `FAQS`, `CATEGORIES` y los indicadores calculados con datos ficticios del ZIP no se portan.
- Las funciones sin contrato real se muestran como no disponibles o deshabilitadas, conservando la apariencia del control del ZIP.
- No se modifica el backend.
- No se crea commit durante este trabajo.

## 3. Aviso institucional aprobado

La interfaz no mostrará las expresiones prohibidas en la solicitud. Para cumplir la regla vigente del repositorio de diferenciar este portal de los canales transaccionales, se utilizará únicamente el siguiente texto profesional:

> Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.

El aviso utilizará la composición visual de `AcademicBanner` del ZIP, pero se renombrará en código para evitar semántica académica.

## 4. Fuentes visuales y activos

### 4.1 Archivos del ZIP

| Archivo | Uso en el port |
|---|---|
| `src/index.css` | Paleta, tipografías, foco, scrollbars y animaciones `gnb-*`. |
| `src/lib.tsx` | Iconos, botones, badges, cards, campos, alertas, modales, tabs, breadcrumbs, skeletons, estados, timeline, paginación, toasts y estadísticas. |
| `src/public.tsx` | Navbar pública, footer, landing, FAQ, autenticación y chatbot flotante. |
| `src/client.tsx` | Shell del cliente, dashboard, tickets, creación, conversión, detalle y chat completo. |
| `src/staff.tsx` | Login interno, shell, dashboard de asesor, bandeja, detalle, supervisión, reportes, asignación y conocimiento. |
| `src/system.tsx` | Pantalla de Design System y catálogo visual. |
| `src/App.tsx` | Correspondencia conceptual entre pantallas y roles; no se porta su router. |
| `src/imports/pasted_text/academic-ticket-system-design.md` | Inventario visual y responsive; no se copia texto académico a la interfaz. |

### 4.2 Logos autorizados

- Horizontal: `C:\Users\felix\AppData\Local\Temp\codex-clipboard-a8bc4e29-861d-4da6-9127-161cd4cd322d.png`.
- Apilado: `C:\Users\felix\AppData\Local\Temp\codex-clipboard-85e953d1-0fc1-4a22-b266-8732d68adb70.png`.
- Se copiarán a `src/assets/brand/` con nombres kebab-case.
- No se recreará el logotipo mediante texto, SVG aproximado ni el sustituto del ZIP.
- La variante horizontal se usará en cabeceras, autenticación, portales y footer. La variante apilada se mostrará en el Design System y en composiciones verticales.
- Como los archivos entregados tienen fondo blanco, en superficies oscuras se mostrarán dentro de una placa blanca sin alterar la imagen original.

## 5. Arquitectura de integración

### 5.1 Capas preservadas

```text
React Router
  ├─ guards por rol y layouts
  ├─ páginas por feature
  │    ├─ hooks de TanStack Query
  │    ├─ formularios React Hook Form + Zod
  │    └─ componentes visuales portados del ZIP
  ├─ cliente HTTP único: src/lib/api-client.ts
  └─ sesión real: AuthProvider + sessionStorage
```

El port visual no reemplaza los hooks ni los servicios. Las páginas transforman resultados reales de la API en props tipadas para los componentes visuales. Los componentes presentacionales no llaman directamente a `fetch`, no conocen tokens y no contienen datos de dominio inventados.

### 5.2 Cliente HTTP

`src/lib/api-client.ts` seguirá siendo la única puerta de red. Se añadirá soporte tipado para `PATCH`, necesario para FAQs y categorías. No se añadirá `DELETE` porque OpenAPI no lo expone; la desactivación se realizará con los endpoints de estado reales.

### 5.3 Datos y estados

Cada consulta remota tendrá cuatro estados explícitos:

1. Carga: skeleton con la composición del ZIP.
2. Error: `ErrorState` con reintento cuando sea seguro.
3. Vacío: `EmptyState` contextual y sin registros inventados.
4. Éxito: datos reales del backend.

Las mutaciones tendrán estado pendiente, éxito, validación y error. El éxito invalidará únicamente las query keys afectadas.

## 6. Autenticación, autorización y visibilidad

| Rol | Rutas permitidas | Comportamiento |
|---|---|---|
| Invitado | públicas, login, registro, recuperación visual, Design System | FAQ y chatbot público; sin acceso a tickets. |
| `CLIENTE` | `/cliente/*`, `/chat`, públicas | tickets propios, comentarios, creación y conversión de conversación. |
| `ASESOR` | `/personal`, `/personal/tickets/*` | dashboard operativo, bandeja, detalle, comentarios y transiciones autorizadas; sin chatbot ni reportes. |
| `SUPERVISOR` | todo `/personal/*` | dashboard, reportes, asignación, asesores y gestión de conocimiento; sin chatbot. |

Los controles visuales refuerzan permisos, pero el backend conserva la autoridad. Un rol incompatible se redirige a su destino permitido; no se presenta selector de rol.

## 7. Tabla pantalla–ruta–componente–API–acción

| Pantalla Figma | Ruta actual/final | Componente actual | API real | Acción |
|---|---|---|---|---|
| Landing | `/` | `HomePage` | `GET /categories`, `GET /faqs` para contenido dinámico visible | Reemplazar JSX y estilos por `Landing`; conservar copy institucional y usar resultados reales o estados. |
| FAQ | `/faq`, `/preguntas-frecuentes` | `FaqPage` | `GET /faqs`, `GET /categories` | Portar buscador, filtros, acordeón y estados del ZIP; ambas rutas renderizan la misma página. |
| Chatbot flotante | públicas y portal cliente | `ChatbotWidget` | conversaciones actuales y FAQs indirectamente vía chatbot | Portar panel, burbujas, typing, error y CTA; ocultar para personal. |
| Chat completo | `/chat` | `ChatPage` | crear/obtener conversación, enviar mensaje, asociar usuario | Invitado usa shell público; cliente autenticado recibe composición `ClientChat`; personal es redirigido. |
| Login cliente | `/login` | `ClientLoginForm` | `POST /auth/login`, `GET /auth/me` | Portar `ClientLogin`/`AuthShell`; preservar validación y bloqueo de roles internos. |
| Registro | `/register`, `/registro` | `RegisterForm` | `POST /auth/register` | Portar composición, validación y éxito real; mantener alias de la ruta existente. |
| Recuperación visual | `/recuperar-contrasena` | no existe | ninguno | Portar `RecoverPage` como función no disponible; formulario y envío deshabilitados con mensaje claro. |
| Login personal | `/personal/login` | `StaffLoginForm` | `POST /auth/login`, `GET /auth/me` | Portar `StaffLogin`; aceptar únicamente `ASESOR` y `SUPERVISOR`. |
| Dashboard cliente | `/cliente` | `ClientDashboardPage` | `GET /tickets/mine`, `GET /categories` | Portar `ClientDashboard`; métricas derivadas exclusivamente de tickets reales. |
| Mis tickets | `/cliente/tickets` | `ClientTicketsPage`, `TicketList` | `GET /tickets/mine`, `GET /categories` | Portar tabla/cards responsive, búsqueda local sobre datos recibidos y estados. |
| Crear ticket | `/cliente/tickets/nuevo` | `ClientTicketCreatePage`, `TicketForm` | `GET /categories`, `POST /tickets` | Portar formulario y confirmación; mostrar código real de respuesta. |
| Conversión a ticket | `/cliente/tickets/nuevo?conversation=:id` | flujo dentro de `TicketForm` | `POST /chat/conversations/{id}/convert-to-ticket` | Portar composición `ConvertTicket`; usar conversación real de `sessionStorage`/query param validado. |
| Detalle cliente | `/cliente/tickets/:id` | `ClientTicketDetailPage` | ticket, history, comments y POST comments | Portar metadata, tabs, timeline y comentarios; solo datos del backend. |
| Dashboard asesor | `/personal` para `ASESOR` | actualmente redirige a bandeja | `GET /tickets`, `GET /categories` | Portar `AdvisorDashboard`; indicadores derivados de la bandeja real. |
| Bandeja asesor | `/personal/tickets` | `StaffTicketsPage` | `GET /tickets`, `GET /categories` | Portar filtros y tabla responsive. No mostrar paginación funcional si el contrato no contiene metadatos. |
| Detalle asesor | `/personal/tickets/:id` | `StaffTicketDetailPage` | ticket, history, comments, POST comment, POST status/close/reopen/cancel | Portar detalle y modales de confirmación; transiciones según respuesta del backend. |
| Dashboard supervisor | `/personal` para `SUPERVISOR` | `SupervisorDashboardPage` | cinco endpoints de reportes y `GET /categories` | Portar `SupDashboard`; distribuciones y métricas reales. |
| Reportes | `/personal/reportes` | contenido incluido hoy en dashboard | cinco endpoints de reportes | Separar `Reports`; filtros reales. Exportación deshabilitada porque no hay endpoint. |
| Asignación | `/personal/asignacion` | `TicketAssignment` dentro de detalle | `GET /tickets`, `GET /users/advisors`, `POST /tickets/{id}/assignments` | Portar `Assign`; selector y confirmación con tickets/asesores reales. |
| Gestión de FAQs | `/personal/conocimiento` tab FAQ | `KnowledgePage` placeholder | GET/POST/PATCH FAQ y PATCH status | Portar cards, formulario y modales; “eliminar” visual se expresa como desactivar. |
| Gestión de categorías | `/personal/conocimiento` tab categorías | `KnowledgePage` placeholder | GET/POST/PATCH category y PATCH status | Portar tabla/formulario; activar/desactivar con contrato real. |
| Design System | `/design-system` | no existe | ninguna | Portar `DesignSystem` con ejemplos exclusivamente visuales y datos neutrales; sin mocks de dominio. |
| Acceso denegado | navegación protegida | redirecciones `ProtectedRoute` | sesión actual | Usar estilo `AccessDenied` cuando corresponda, sin revelar contenido restringido. |
| 404 | `*` | `NotFoundPage` | ninguna | Portar estado visual coherente y eliminar textos prohibidos. |
| Legacy | `/panel/*` | `LegacyPanelRedirect` | ninguna | Mapear panel, tickets, reportes, asignación y conocimiento a `/personal/*`. |

## 8. Mapeo de componentes del ZIP

| Componente del ZIP | Destino propuesto | Integración |
|---|---|---|
| `Logo` | `src/components/brand/bank-logo.tsx` | Renderiza únicamente los PNG autorizados. |
| `Icon` | `src/components/ui/icons.tsx` | Porta los paths SVG de iconos utilitarios; no incluye logo. |
| `AcademicBanner` | `src/components/layout/service-notice.tsx` | Misma composición visual con el aviso aprobado. |
| `Button` | `src/components/ui/button.tsx` | Variantes, tamaños, loading y disabled tipados. |
| `Card` | `src/components/ui/card.tsx` | Radio, borde y sombra exactos del ZIP. |
| `Field`, `Input`, `Textarea`, `Select`, `Checkbox` | `src/components/ui/form-controls.tsx` | Presentación compatible con React Hook Form, errores y ayudas accesibles. |
| `StatusBadge`, `PriorityBadge` | componentes actuales de tickets | Reemplazar estilos manteniendo enums reales, incluido `PENDIENTE_CLIENTE`. |
| `Alert`, `Banner` | `src/components/ui/alert.tsx` | Estados por texto, icono y color. |
| `Modal` | `src/components/ui/modal.tsx` | Apariencia del ZIP con foco inicial, cierre Escape, retorno de foco y bloqueo de fondo. |
| `Tabs` | `src/components/ui/tabs.tsx` | Tabs visuales con teclado y atributos ARIA. |
| `Breadcrumbs` | `src/components/ui/breadcrumbs.tsx` | Usa `Link` real y ruta actual. |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Shimmer del ZIP y respeto a `prefers-reduced-motion`. |
| `EmptyState`, `ErrorState` | `src/components/ui/states.tsx` | Restyling directo, conserva API de componentes cuando sea posible. |
| `Timeline` | `TicketHistory` | Adapta `HistoryRead[]` sin nombres inventados. |
| `Pagination` | componente visual deshabilitado | Solo Design System o estado explícitamente futuro; no aparece como funcional en bandejas sin metadatos. |
| `ToastHost` | `src/components/ui/toast-provider.tsx` | Feedback de mutaciones reales; sin mensajes falsos de éxito. |
| `Stat`, `Bar` | reportes/dashboard | Reciben valores reales; `Bar` maneja total cero sin división inválida. |
| `PublicNav` | `src/components/layout/public-navigation.tsx` | Port directo con rutas reales y menú móvil. |
| `PublicFooter` | `src/components/layout/footer.tsx` | Port directo, logo autorizado y aviso aprobado. |
| `AuthShell` | `src/components/layout/auth-shell.tsx` | Compartido por login, registro, recuperación y login interno. |
| `ClientShell` | `src/components/layout/portal-layout.tsx` | Sidebar desktop, header y drawer móvil controlado. |
| `StaffShell` | `src/components/layout/staff-layout.tsx` | Navegación por rol y drawer móvil. |
| `PageHead` | `src/components/layout/page-header.tsx` | Título, subtítulo y acción responsive. |
| `Chatbot` / `ClientChat` | componentes actuales de chatbot | Se conserva `ChatbotProvider` y se sustituye solo la presentación. |

## 9. Contratos API verificados

El 2026-09-13 se verificó `HTTP 200` en `GET http://localhost:8000/api/v1/health` y se inspeccionó `http://localhost:8000/openapi.json`.

### Autenticación

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

### Conocimiento

- `GET`, `POST /api/v1/faqs`
- `GET`, `PATCH /api/v1/faqs/{faq_id}`
- `PATCH /api/v1/faqs/{faq_id}/status` con `{ is_active: boolean }`
- `GET`, `POST /api/v1/categories`
- `PATCH /api/v1/categories/{category_id}`
- `PATCH /api/v1/categories/{category_id}/status` con `{ is_active: boolean }`

No existe `DELETE`; la UI no simulará borrado físico.

### Tickets y chatbot

- Los contratos enumerados en la solicitud existen en OpenAPI.
- Las transiciones actuales son endpoints `POST` específicos; no se inventará `PATCH /tickets/{id}` porque no aparece en OpenAPI.
- `GET /tickets` no declara metadatos de paginación; los controles de paginación de datos permanecerán ausentes o deshabilitados.

### Reportes

- Los cinco endpoints solicitados existen y aceptan filtros reales.
- No existe endpoint de exportación; el control se mostrará deshabilitado con explicación.

## 10. Rutas finales

```text
/
/faq
/preguntas-frecuentes
/chat
/login
/register
/registro
/recuperar-contrasena
/personal/login
/cliente
/cliente/tickets
/cliente/tickets/nuevo
/cliente/tickets/:ticketId
/personal
/personal/tickets
/personal/tickets/:ticketId
/personal/reportes
/personal/asignacion
/personal/conocimiento
/design-system
/panel/* -> redirección equivalente a /personal/*
```

## 11. Responsive y accesibilidad

- Breakpoints de aceptación: 1440, 1280, 1024, 768, 390×844 y 375×812.
- `overflow-x: hidden` solo como protección global; cada tabla y layout debe resolver su ancho localmente.
- Las tablas se mantienen como tabla con scroll contenido en desktop/tablet y cambian a tarjetas legibles cuando el ancho móvil lo requiera.
- Los sidebars se convierten en drawers con overlay, cierre por botón, Escape y navegación.
- El chatbot respeta `max-height`, áreas seguras y evita cubrir acciones principales.
- Menús, tabs, modales y formularios admiten teclado y lector de pantalla.
- Estados no se comunican únicamente mediante color.
- Animaciones `gnb-fade`, `gnb-pop`, `gnb-shimmer` y `gnb-blink` respetan `prefers-reduced-motion`.
- Tipografías objetivo: Manrope para display, Inter para texto y JetBrains Mono para identificadores. Se definen fallbacks locales si las fuentes remotas no cargan.

## 12. Tratamiento de contenido del ZIP

### Se porta

- Copy estructural no sensible: títulos, labels, ayudas y nombres de navegación.
- Composición de hero, cards, formularios, tablas, timelines, chat, dashboards y Design System.
- Tokens visuales, iconos, radios, sombras, bordes y espaciados.

### No se porta al runtime

- Credenciales precargadas.
- Usuarios, tickets, asesores, comentarios, fechas, códigos, métricas, FAQs y categorías ficticias.
- `AppProvider`, `route`, `go`, `login` y `logout` simulados.
- Retardos artificiales, `Math.random`, respuestas simuladas o toasts de éxito sin mutación real.
- Selectores de rol.
- Mensajes con “prototipo”, “académico”, “demo”, “simulado”, “datos ficticios”, “uso educativo” o “no oficial”.

Los ejemplos del Design System usarán contenido neutral como “Título”, “Descripción”, “Estado” y “Ejemplo”, sin representar registros bancarios o respuestas de API.

## 13. Manejo de errores y acciones no disponibles

- Errores 401 limpian la sesión y conducen al login correspondiente.
- Errores 403 muestran acceso denegado o redirigen sin exponer información.
- Errores 404 de ticket usan estado vacío/error contextual.
- Errores 409 y 422 conservan mensajes de validación ya implementados.
- Recuperación de contraseña: formulario deshabilitado y mensaje “Funcionalidad no disponible”.
- Exportación de reportes: botón deshabilitado con ayuda visible.
- Borrado físico de FAQ/categoría: no se ofrece; se utiliza activar/desactivar.
- Paginación de API: no se simula.

## 14. Estrategia de pruebas

La implementación seguirá ciclos TDD para comportamiento nuevo o modificado.

- Routing: aliases, rutas nuevas, legacy y redirecciones por rol.
- Autenticación: token solo en `sessionStorage`, logout, restauración y portales incompatibles.
- API: método `PATCH`, payloads CRUD reales, invalidación de queries y errores.
- Páginas: carga, error, vacío y éxito con respuestas controladas en tests, nunca mocks de runtime.
- Roles: chatbot visible solo para invitado/cliente; reportes y conocimiento solo para supervisor.
- Contenido: prueba que los textos prohibidos no estén presentes en el DOM de runtime.
- Seguridad: prueba que no existan credenciales precargadas ni uso de `localStorage` para JWT.
- Responsive: QA visual manual en todos los tamaños de aceptación.
- Accesibilidad: navegación por teclado, foco, nombres accesibles, modales y drawers.

## 15. Plan de implementación por fases

### Fase A — Base visual y contratos

- Copiar logos autorizados.
- Portar tokens, fuentes, iconos y primitives visuales.
- Añadir `PATCH` tipado al cliente HTTP.
- Crear pruebas base de contenido, almacenamiento y rutas.

### Fase B — Sitio público y autenticación

- Portar navbar, footer, aviso, landing, FAQ, login, registro y recuperación no disponible.
- Portar chatbot flotante conectado al provider actual.
- Validar responsive público y móvil.

### Fase C — Portal cliente

- Portar shell, dashboard, lista, creación, conversión, detalle, historial, comentarios y chat completo.
- Conservar hooks y mutaciones actuales; completar estados visuales.

### Fase D — Portal de asesor

- Portar shell interno, dashboard operativo, bandeja, filtros, detalle y confirmaciones.
- Validar transiciones reales y permisos.

### Fase E — Supervisor

- Portar dashboard, reportes, asignación, directorio implícito en selectores y conocimiento.
- Implementar CRUD/estado real de FAQs y categorías.

### Fase F — Design System, rutas y compatibilidad

- Portar pantalla completa de Design System.
- Completar aliases y redirecciones legacy.
- Eliminar componentes antiguos sin consumidores solo después de demostrar cobertura funcional.

### Fase G — Validación integral

- Ejecutar lint, tests, build, audit y `git diff --check`.
- Verificar health, consola, red, storage, textos, roles y datos estáticos.
- Comparar visualmente las veinte vistas solicitadas en desktop y móvil.
- Corregir diferencias antes del cierre; no crear commit.

## 16. Criterios de aceptación

1. La estructura visual de cada pantalla corresponde directamente al componente homólogo del ZIP.
2. Ningún dato ficticio ni router del ZIP llega al runtime.
3. Todos los datos de dominio visibles proceden de endpoints reales o muestran estados de carga, error, vacío o no disponible.
4. Autenticación, JWT, roles y guards mantienen su comportamiento y pruebas.
5. El logo utilizado es exclusivamente el activo autorizado entregado por el usuario.
6. No aparecen los textos prohibidos en la interfaz.
7. El aviso institucional aprobado permanece visible en la composición del ZIP.
8. No hay scroll horizontal global, clipping ni controles inaccesibles en los tamaños definidos.
9. Lint, tests, build y `git diff --check` finalizan con código cero.
10. `npm audit --omit=dev` se informa con su resultado real, sin ocultar vulnerabilidades.
11. El backend responde health 200 y no fue modificado.
12. El estado Git final contiene únicamente cambios del frontend en la rama actual y ningún commit nuevo.

## 17. Autorrevisión de la especificación

- No contiene marcadores incompletos ni contratos inventados.
- Las rutas y endpoints se contrastaron con el router actual y OpenAPI local.
- El tratamiento de funciones sin endpoint es explícito.
- El port visual y la integración de datos están separados por interfaces claras.
- La excepción del aviso institucional está documentada con el texto aprobado.
- La instrucción de no crear commit prevalece sobre el flujo predeterminado de documentación.
