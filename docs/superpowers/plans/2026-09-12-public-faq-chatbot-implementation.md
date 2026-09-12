# Public FAQ and Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar las FAQ públicas y un asistente de atención reutilizable con el motor de FAQ existente, disponible para visitantes y clientes e inactivo para personal.

**Architecture:** `features/faqs` separa contratos, API, consultas y presentación. `features/chatbot` usa un proveedor global y TanStack Query para coordinar persistencia del ID, asociación, restauración y mutaciones; `ConversationPanel` se comparte entre el widget y `/chat`. Las rutas internas oficiales migran a `/personal/*` y `/panel/*` queda como compatibilidad por redirección.

**Tech Stack:** React 19, TypeScript 5.9 estricto, React Router 7, TanStack Query 5, React Hook Form, Zod 4, Vitest, Testing Library y CSS existente.

## Global Constraints

- Trabajar exclusivamente en `C:\dev\sistema-gestion-tickets\frontend`.
- No modificar backend ni archivos externos al repositorio.
- No añadir dependencias; usar HTML semántico y utilidades existentes.
- No usar LLM, RAG, servicios externos ni respuestas funcionales creadas en el frontend.
- Guardar únicamente `chat_conversation_id` en `sessionStorage`; no usar `localStorage` para mensajes o datos personales.
- Mantener el aviso “Prototipo académico no oficial”, la paleta azul profundo/turquesa y la separación cliente/personal.
- No llamar conversión a ticket; solo exponer `onCreateTicket?: () => void`.
- No ejecutar ninguna operación de chatbot con sesión `ASESOR` o `SUPERVISOR`.
- Ejecutar RED–GREEN–REFACTOR para cada bloque.
- No realizar commits intermedios; crear un único commit final `feat(chatbot): connect public faq and chatbot`.

---

## File Map

**Create**

- `src/features/faqs/types/faq-types.ts`: contratos `FAQRead` y `CategoryRead`.
- `src/features/faqs/api/faq-api.ts`: `getFaqs` y `getCategories`.
- `src/features/faqs/hooks/use-faqs.ts`: consultas y filtro puro `filterFaqs`.
- `src/features/faqs/components/faq-accordion.tsx`: acordeón semántico.
- `src/features/faqs/pages/faq-page.tsx`: búsqueda, categorías y estados.
- `src/features/faqs/faqs.test.tsx`: pruebas de FAQ.
- `src/features/chatbot/types/chatbot-types.ts`: contratos de conversación, mensajes y asociación.
- `src/features/chatbot/api/chatbot-api.ts`: operaciones HTTP exactas.
- `src/features/chatbot/schemas/chat-message-schema.ts`: validación de contenido.
- `src/features/chatbot/chatbot-storage.ts`: persistencia exclusiva del ID.
- `src/features/chatbot/hooks/use-chat-conversation.ts`: consultas y mutaciones de TanStack Query.
- `src/features/chatbot/chatbot-provider.tsx`: coordinación global por sesión y ruta.
- `src/features/chatbot/components/message-list.tsx`: mensajes provenientes del backend.
- `src/features/chatbot/components/new-conversation-dialog.tsx`: confirmación accesible.
- `src/features/chatbot/components/conversation-panel.tsx`: experiencia compartida.
- `src/features/chatbot/components/chatbot-widget.tsx`: launcher y diálogo flotante.
- `src/features/chatbot/pages/chat-page.tsx`: superficie completa de `/chat`.
- `src/features/chatbot/chatbot-api.test.ts`: contratos HTTP y storage.
- `src/features/chatbot/chatbot.test.tsx`: interacción, sesión, roles y rutas.
- `src/test/test-query-client.tsx`: wrapper aislado de TanStack Query para pruebas.

**Modify**

- `src/lib/api-client.ts`: permitir `RequestInit` en `get` para cancelar restauraciones.
- `src/app/app-shell.tsx`: montar `ChatbotProvider` y `ChatbotWidget` una sola vez.
- `src/app/router.tsx`: página FAQ/chat, guard de `/chat`, rutas `/personal/*` y redirects `/panel/*`.
- `src/features/auth/auth-forms.tsx`: destinos oficiales `/personal/*`.
- `src/components/layout/staff-layout.tsx`: enlaces oficiales `/personal/*`.
- `src/components/ui/section-heading.tsx`: permitir `h1` en títulos principales sin duplicar el componente.
- `src/pages/base-pages.tsx`: retirar páginas FAQ/chat antiguas y actualizar enlaces internos.
- `src/app/app.test.tsx`: wrapper QueryClient y regresiones de rutas.
- `src/features/auth/auth.test.tsx`: wrapper QueryClient y destinos internos.
- `src/styles/globals.css`: FAQ, widget, panel, mensajes, diálogo y responsive.
- `README.md`: endpoints, rutas, flujo, persistencia, roles y limitación de tickets.

---

### Task 1: Contratos, API y almacenamiento

**Interfaces:**

- `FAQRead`, `CategoryRead`, `ChatMessageRead`, `ConversationRead`, `SendMessageRequest`, `SendMessageResponse`, `LinkConversationResponse`.
- `getConversationId(): string | null`, `setConversationId(id: string): void`, `clearConversationId(): void` con clave `chat_conversation_id`.
- API: `createConversation`, `getConversation`, `sendConversationMessage`, `linkConversationToUser`.

- [x] **RED: escribir pruebas de endpoints y persistencia**

Crear `chatbot-api.test.ts` con mocks de `fetch` que verifiquen método, URL y body; comprobar que `LinkConversationResponse` conserva `{ id, user_id, status }`, que solo se escribe `sessionStorage.chat_conversation_id` y que `localStorage` permanece vacío.

```ts
expect(fetchMock).toHaveBeenCalledWith(
  expect.stringContaining(`/chat/conversations/${conversationId}/messages`),
  expect.objectContaining({ method: 'POST', body: JSON.stringify({ content: 'Consulta' }) }),
)
expect(localStorage.length).toBe(0)
```

- [x] **Verificar RED**

Run: `npm run test -- src/features/chatbot/chatbot-api.test.ts`

Expected: FAIL porque el módulo `features/chatbot` todavía no existe.

- [x] **GREEN: crear tipos, storage y API mínima**

Definir exactamente:

```ts
export interface LinkConversationResponse {
  id: string
  user_id: string
  status: string
}

export interface SendMessageResponse {
  user_message: ChatMessageRead
  bot_message: ChatMessageRead
  resolved: boolean
  offers_ticket: boolean
}
```

Usar rutas `/chat/conversations`, `/chat/conversations/${id}`, `/messages` y `/link-user`. Ampliar `apiClient.get<T>(path, init?)` sin cambiar el comportamiento actual.

- [x] **Verificar GREEN y refactorizar**

Run: `npm run test -- src/features/chatbot/chatbot-api.test.ts src/lib/api-client.test.ts`

Expected: PASS; ninguna contraseña, mensaje o token aparece en almacenamiento o logs.

---

### Task 2: FAQ públicas con TanStack Query

**Interfaces:**

- `getFaqs(): Promise<FAQRead[]>`, `getCategories(): Promise<CategoryRead[]>`.
- `filterFaqs({ faqs, categoryId, search }): FAQRead[]` excluye inactivas y busca en pregunta/palabras clave sin distinguir mayúsculas.
- `FaqPage` consume `useFaqs()` y `useCategories()`.

- [x] **RED: escribir pruebas de datos, filtros y estados**

Crear `faqs.test.tsx` para carga, exclusión de inactivas, filtro por categoría, búsqueda, combinación, carga, error con “Reintentar” y vacío. Envolver con `createTestQueryClient()`.

```tsx
expect(await screen.findByText('¿Cómo consulto mi cuenta?')).toBeInTheDocument()
expect(screen.queryByText('FAQ inactiva')).not.toBeInTheDocument()
await userEvent.type(screen.getByRole('searchbox'), 'tarjeta')
expect(screen.getByText('¿Cómo bloqueo una tarjeta?')).toBeInTheDocument()
```

- [x] **Verificar RED**

Run: `npm run test -- src/features/faqs/faqs.test.tsx`

Expected: FAIL por imports inexistentes.

- [x] **GREEN: implementar contratos, API, hooks, acordeón y página**

Usar query keys `['faqs']` y `['categories']`; filtrar `is_active === true`; renderizar `details/summary`; asociar `label` al buscador y botones de categoría con `aria-pressed`. El reintento llama `refetch()` en ambas consultas fallidas.

- [x] **Verificar GREEN y refactorizar**

Run: `npm run test -- src/features/faqs/faqs.test.tsx`

Expected: PASS para carga, filtros, búsqueda, error y vacíos.

---

### Task 3: Coordinador de conversación y reglas de sesión

**Interfaces:**

- `useChatbot()` expone `conversation`, `isRestoring`, `isCreating`, `isSending`, `error`, `draft`, `setDraft`, `sendMessage`, `startNewConversation`, `retry`, `offersTicket`, `canUseChatbot`.
- `useConversationQuery`, `useCreateConversationMutation`, `useSendMessageMutation` y `useLinkConversationMutation` encapsulan las operaciones y aceptan `AbortSignal` en restauración.
- `canUseChatbot` es falso durante la validación inicial de `/auth/me`, para roles internos y en rutas `/personal/*` o `/panel/*`.

- [x] **RED: escribir pruebas de creación, envío, validación y restauración**

En `chatbot.test.tsx`, verificar creación al primer envío, creación explícita, mensajes backend, rechazo vacío y >2000, ID en sessionStorage, restauración válida, 404 que limpia, 5xx que conserva y reintento.

```tsx
await userEvent.type(screen.getByLabelText('Escribe tu consulta'), '¿Qué es una cuenta?')
await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
await waitFor(() => expect(sessionStorage.getItem('chat_conversation_id')).toBe('conversation-1'))
expect(await screen.findByText('Respuesta exacta del backend')).toBeInTheDocument()
```

- [x] **Verificar RED**

Run: `npm run test -- src/features/chatbot/chatbot.test.tsx`

Expected: FAIL porque proveedor y panel no existen.

- [x] **GREEN: implementar esquema, hooks y proveedor**

El esquema es `z.string().trim().min(1, 'Escribe una consulta.').max(2000, 'La consulta no puede superar 2000 caracteres.')`. El envío sin ID ejecuta `createConversation` y luego `sendConversationMessage`; solo inserta `user_message` y `bot_message` recibidos. Restauración 403/404 limpia ID; errores temporales preservan ID.

- [x] **RED adicional: coordinación cliente y bloqueo interno**

Agregar pruebas que resuelvan manualmente promesas de fetch para demostrar que, con `CLIENTE`, POST `link-user` ocurre antes de GET conversation y nunca de forma simultánea. Verificar que ASESOR/SUPERVISOR no provocan GET, POST create, POST messages ni POST link-user, incluso mientras `/auth/me` determina inicialmente el rol.

- [x] **Verificar RED adicional**

Run: `npm run test -- src/features/chatbot/chatbot.test.tsx -t "asociación|personal"`

Expected: FAIL hasta incorporar coordinación por sesión.

- [x] **GREEN: coordinar asociación → restauración sin bloquear login**

Al cambiar a `CLIENTE`, cancelar cualquier query de restauración, ejecutar `linkConversationToUser`, marcar el par sesión/ID y solo después habilitar/fetch la conversación. En 403/404 limpiar ID; en 5xx conservarlo. Para roles internos retornar antes de toda operación. El efecto se ejecuta fuera de `signIn`, por lo que la navegación no espera.

- [x] **Verificar GREEN y refactorizar**

Run: `npm run test -- src/features/chatbot/chatbot.test.tsx`

Expected: PASS sin solicitudes paralelas y sin actividad en sesiones internas.

---

### Task 4: Panel compartido, widget y confirmación

**Interfaces:**

- `ConversationPanel({ onCreateTicket? })` usa el contexto, sin duplicar lógica entre widget y página.
- `ChatbotWidget` controla launcher, foco y Escape.
- `NewConversationDialog` confirma solo cuando `conversation.messages.length > 0`.

- [x] **RED: escribir pruebas accesibles del widget**

Cubrir apertura/cierre, `aria-expanded`, Escape, retorno de foco, advertencia sensible, hora discreta, scroll al final y ausencia del launcher en `/chat`.

```tsx
const launcher = screen.getByRole('button', { name: /abrir asistente de atención/i })
await userEvent.click(launcher)
expect(screen.getByRole('dialog', { name: /asistente de atención/i })).toBeInTheDocument()
await userEvent.keyboard('{Escape}')
expect(launcher).toHaveFocus()
```

- [x] **RED: escribir pruebas de confirmación y offers_ticket**

Comprobar que cancelar mantiene ID, confirmar crea uno nuevo, visitante ve `/login` y `/registro`, CLIENTE ve preparación de ticket y `onCreateTicket` solo se invoca cuando se proporciona.

- [x] **Verificar RED**

Run: `npm run test -- src/features/chatbot/chatbot.test.tsx -t "widget|Nueva conversación|ticket"`

Expected: FAIL por componentes pendientes.

- [x] **GREEN: implementar componentes compartidos**

Usar botones nativos, `role="dialog"`, `aria-modal`, `aria-live`, foco inicial y retorno al launcher. El diálogo de confirmación tiene “Conservar conversación” y “Crear nueva”. Añadir ejemplos estáticos y la advertencia exacta de datos sensibles. No crear respuestas simuladas.

- [x] **GREEN: integrar una única instancia global**

Montar `ChatbotProvider` y `ChatbotWidget` en `app-shell.tsx`; ocultar el widget en `/chat`, rutas internas y roles internos. `ChatPage` reutiliza `ConversationPanel`.

- [x] **Verificar GREEN y refactorizar**

Run: `npm run test -- src/features/chatbot/chatbot.test.tsx`

Expected: PASS para interacción, accesibilidad, confirmación y escalamiento visual.

---

### Task 5: Rutas oficiales y regresión de autenticación

**Interfaces:**

- Destinos: CLIENTE `/cliente`, ASESOR `/personal/tickets`, SUPERVISOR `/personal`.
- `ChatRoute`: visitantes/CLIENTE renderizan `ChatPage`; roles internos navegan con `replace` a su destino.
- Rutas `/panel/*`: `Navigate replace` al equivalente `/personal/*` conservando `ticketId`.

- [x] **RED: actualizar pruebas de rutas y login**

Cambiar expectativas antiguas `/panel/*`; agregar pruebas para rutas oficiales, redirecciones heredadas, bloqueo de `/chat` para ambos roles y ausencia del widget en personal.

```tsx
renderApp(['/panel/tickets/abc'])
expect(await screen.findByRole('heading', { name: /ticket abc/i })).toBeInTheDocument()
expect(screen.queryByRole('button', { name: /abrir asistente/i })).not.toBeInTheDocument()
```

- [x] **Verificar RED**

Run: `npm run test -- src/app/app.test.tsx src/features/auth/auth.test.tsx src/features/chatbot/chatbot.test.tsx`

Expected: FAIL porque router, destinos y layouts aún usan `/panel/*`.

- [x] **GREEN: migrar router, auth y navegación interna**

Registrar `/personal`, `/personal/tickets`, `/personal/tickets/:ticketId`, `/personal/conocimiento`; actualizar `destinationFor`, `StaffLayout` y enlaces de detalle. Añadir redirects antiguos con `replace`. Sustituir páginas FAQ/chat base por imports de los módulos.

- [x] **Verificar GREEN y refactorizar**

Run: `npm run test -- src/app/app.test.tsx src/features/auth/auth.test.tsx src/features/chatbot/chatbot.test.tsx`

Expected: PASS y ninguna navegación oficial apunta a `/panel/*`.

---

### Task 6: Estilos, documentación y validación final

**Files:** `src/styles/globals.css`, `README.md`, todas las pruebas de regresión.

- [x] **Implementar estilos responsive y accesibles**

Agregar clases `faq-*`, `chatbot-*`, `conversation-*` y `confirmation-*` usando tokens existentes. El widget ocupa un panel inferior en móvil y una tarjeta fija en escritorio; foco visible, contraste AA y `prefers-reduced-motion` se conservan.

- [x] **Actualizar README**

Documentar `/preguntas-frecuentes`, `/chat`, `/personal/*`, redirects `/panel/*`, endpoints, asociación cliente, inactividad para personal, clave `chat_conversation_id`, ausencia de `localStorage` y conversión a ticket pendiente.

- [x] **Ejecutar regresión completa**

Run: `npm run lint`

Expected: exit code 0, sin errores ni warnings del proyecto.

Run: `npm run test`

Expected: exit code 0, todas las suites y pruebas aprobadas.

Run: `npm run build`

Expected: exit code 0, TypeScript y Vite completan el build.

Run: `npm audit --omit=dev`

Expected: exit code 0 y `found 0 vulnerabilities`.

- [x] **Auditar alcance y seguridad**

Run: `git diff --check; git status --short; git diff --name-only; git ls-files ".env*"; rg -n "localStorage|/panel|chat_conversation_id" src README.md docs/superpowers`

Expected: sin whitespace inválido; solo archivos frontend esperados; únicamente `.env.example` está rastreado y no contiene secretos; no existe un archivo `.env` rastreado; `localStorage` aparece solo en aserciones negativas y documentación; `/panel` solo en redirects, pruebas de compatibilidad y documentación; `chat_conversation_id` solo en storage, pruebas y documentación.

- [x] **Crear el único commit final**

Run: `git add . && git commit -m "feat(chatbot): connect public faq and chatbot"`

Expected: un commit nuevo con especificación, plan, implementación, pruebas y README; `git status --short` queda vacío.

---

## Plan Self-Audit

- Cobertura: Tasks 1–2 cubren contratos/API/FAQ; Tasks 3–4 conversación/widget/asociación; Task 5 rutas y regresión; Task 6 estilos, documentación, seguridad y validación.
- Tipos: `LinkConversationResponse` usa exclusivamente `id`, `user_id`, `status`; los errores de asociación cubiertos son 403, 404 y fallos temporales.
- Coordinación: asociación CLIENTE precede restauración; login no la espera; personal deshabilita toda operación.
- Rutas: oficiales bajo `/personal/*`; `/panel/*` existe solo como redirección `replace`.
- Persistencia: solo `chat_conversation_id` en `sessionStorage`; mensajes permanecen en memoria/cache.
- Alcance: no hay conversión real a ticket, dependencias nuevas, respuestas inventadas ni cambios de backend.
