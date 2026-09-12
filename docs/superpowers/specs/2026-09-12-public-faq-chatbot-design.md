# Diseño de preguntas frecuentes y asistente de atención

## Alcance

Esta fase conecta la página pública de preguntas frecuentes y el chatbot con los endpoints de FAQ existentes. El asistente no usa LLM, RAG, servicios externos ni respuestas construidas en el frontend: toda respuesta funcional procede del motor de FAQ del backend. La implementación funciona para visitantes anónimos y clientes autenticados, conserva el diseño institucional azul profundo y turquesa y mantiene visible el aviso “Prototipo académico no oficial”.

No se implementa la conversión real a ticket ni se modifican el backend, los contratos de autenticación o los módulos operativos de tickets y dashboard.

## Decisión arquitectónica

La aplicación incorpora un `ChatbotProvider` global dentro de `AuthProvider`. Este proveedor mantiene el identificador y el estado en memoria, coordina las consultas y mutaciones de TanStack Query y expone una interfaz única a dos presentaciones del mismo componente de conversación:

- `ChatbotWidget`, como launcher y panel flotante en páginas públicas y rutas de cliente.
- `ChatPage`, como experiencia de página completa en `/chat`.

Ambas presentaciones reutilizan `ConversationPanel`, sus mensajes, formulario, estados y acciones. En `/chat` se oculta el launcher flotante para evitar interfaces duplicadas. El componente global se oculta para cualquier usuario con rol `ASESOR` o `SUPERVISOR`, independientemente de la ruta.

## Organización de módulos

```text
src/features/faqs/
├── api/faq-api.ts
├── components/faq-accordion.tsx
├── hooks/use-faqs.ts
├── pages/faq-page.tsx
├── types/faq-types.ts
└── faqs.test.tsx

src/features/chatbot/
├── api/chatbot-api.ts
├── components/chatbot-widget.tsx
├── components/conversation-panel.tsx
├── components/message-list.tsx
├── components/new-conversation-dialog.tsx
├── hooks/use-chat-conversation.ts
├── pages/chat-page.tsx
├── schemas/chat-message-schema.ts
├── types/chatbot-types.ts
├── chatbot-api.test.ts
├── chatbot-provider.tsx
├── chatbot-storage.ts
└── chatbot.test.tsx
```

Los contratos viven en `types`, las llamadas HTTP en `api`, las operaciones de servidor en hooks de TanStack Query, el estado coordinador en el proveedor y la presentación en componentes y páginas. No se duplican contratos ni se añade estado global fuera del módulo.

## Contratos y acceso a la API

Los tipos TypeScript representan `FAQRead`, `CategoryRead`, `ChatMessageRead`, `ConversationRead`, `SendMessageRequest`, `SendMessageResponse` y la respuesta definida de asociación:

```ts
type LinkConversationResponse = {
  id: string
  user_id: string
  status: string
}
```

Las funciones usan exclusivamente `src/lib/api-client.ts`:

- `getFaqs()` → `GET /faqs`.
- `getCategories()` → `GET /categories`.
- `createConversation()` → `POST /chat/conversations`.
- `getConversation(id)` → `GET /chat/conversations/{id}`.
- `sendConversationMessage(id, content)` → `POST /chat/conversations/{id}/messages`.
- `linkConversationToUser(id)` → `POST /chat/conversations/{id}/link-user`, con respuesta `LinkConversationResponse`.

El cliente HTTP existente añade `Authorization: Bearer` cuando hay sesión. Ningún servicio registra tokens, mensajes o datos personales.

## Página pública de preguntas frecuentes

`/preguntas-frecuentes` carga FAQ y categorías con consultas separadas. Antes de mostrar resultados elimina cualquier FAQ con `is_active !== true`; las categorías inactivas tampoco se ofrecen como filtro.

La página incluye:

- búsqueda local normalizada por `question` y `keywords`;
- filtro “Todas” y filtros por categoría activa;
- conteo de resultados;
- acordeones accesibles implementados con `details` y `summary`;
- estados de carga, error con reintento y vacío;
- enlace existente desde la navegación pública.

La búsqueda y el filtro se combinan. Las respuestas se muestran literalmente como contenido del backend, sin ampliarlas ni inventar explicaciones.

## Ciclo de la conversación

La única persistencia es `chat_conversation_id` en `sessionStorage`. No se escriben mensajes, datos personales ni estado del chatbot en `localStorage`.

1. Sin ID, el panel muestra una introducción estática, advertencia de seguridad y ejemplos de consultas generales. Los ejemplos son sugerencias, no respuestas simuladas.
2. El primer mensaje válido crea una conversación y, después, envía el mensaje.
3. La acción explícita “Nueva conversación” crea inmediatamente otra conversación y sustituye el ID almacenado.
4. Si la conversación actual contiene mensajes, “Nueva conversación” abre un diálogo de confirmación accesible. Cancelar conserva la conversación; confirmar crea la nueva.
5. Con un ID almacenado y sin sesión, el proveedor restaura la conversación mediante `GET` cuando la superficie está habilitada.
6. Cuando aparece una sesión `CLIENTE`, el proveedor pausa la restauración, intenta primero `link-user` en segundo plano y solo después del éxito restaura o actualiza la conversación. Nunca ejecuta simultáneamente `GET conversation` y `POST link-user` para el mismo ID.
7. Un 403 o 404 durante la restauración elimina el ID y vuelve al estado inicial. Los errores temporales conservan el ID y ofrecen reintento.
8. Cada envío incorpora `user_message` y `bot_message` devueltos por el backend y actualiza `resolved` y `offers_ticket`; el frontend no genera mensajes funcionales.
9. Al cambiar de conversación se elimina únicamente el ID anterior y el estado en memoria asociado.

El formulario rechaza contenido vacío o compuesto solo por espacios y limita el texto a 2000 caracteres mediante Zod y `maxLength`. Mientras crea o envía, permanece deshabilitado para evitar duplicados. La lista se desplaza al mensaje más reciente.

## Visitantes, clientes y personal

El chatbot se habilita solamente cuando no hay sesión o cuando el usuario tiene rol `CLIENTE`.

- Visitante: puede crear, restaurar y usar una conversación anónima.
- Cliente: puede usar el asistente en páginas públicas, `/chat` y rutas `/cliente/*`; las solicitudes llevan autorización automáticamente.
- ASESOR o SUPERVISOR: el widget no se renderiza, `/chat` redirige a su inicio interno y el proveedor no restaura, crea, enlaza ni envía conversaciones mientras exista esa sesión, independientemente de la ruta.

Mientras `AuthProvider` valida una sesión persistida mediante `/auth/me`, el proveedor mantiene el chatbot inactivo. Solo decide restaurar o asociar después de conocer si la pestaña pertenece a un visitante, un `CLIENTE` o personal interno.

El proveedor conserva un ID almacenado mientras hay sesión de personal, pero no lo lee desde el backend ni lo modifica. Esto evita actividad del chatbot durante la sesión interna y permite recuperar la conversación anónima al cerrar esa sesión y volver a una superficie habilitada.

## Asociación después del login

Cuando `AuthProvider` publica una sesión `CLIENTE` y existe `chat_conversation_id`, `ChatbotProvider` deshabilita temporalmente la restauración, intenta `link-user` en segundo plano y, tras asociar con éxito, restaura o actualiza la conversación. El login y su redirección nunca esperan ni dependen del resultado.

- Éxito: conserva el ID y la conversación pasa a estar asociada.
- 403 o 404: limpia el ID y el estado en memoria porque la conversación no es utilizable por ese cliente.
- Fallo temporal o 5xx: conserva el ID para permitir un intento posterior sin bloquear la sesión.
- ASESOR o SUPERVISOR: nunca ejecuta `link-user`.

Se evita repetir la asociación más de una vez para la misma combinación de sesión e ID durante el montaje actual.

## Rutas internas oficiales y compatibilidad

Las rutas oficiales de personal quedan bajo `/personal/*`:

- `/personal` para `SUPERVISOR`.
- `/personal/tickets` y `/personal/tickets/:ticketId` para `ASESOR` o `SUPERVISOR`.
- `/personal/conocimiento` para `SUPERVISOR`.
- `/personal/login` como acceso público exclusivo de personal.

Las rutas antiguas `/panel`, `/panel/tickets`, `/panel/tickets/:ticketId` y `/panel/conocimiento` se conservan únicamente como redirecciones cliente con `replace` hacia sus equivalentes `/personal/*`. No renderizan contenido ni aparecen en navegación o documentación principal. Las redirecciones mantienen compatibilidad con enlaces guardados sin sostener dos jerarquías activas.

Un rol interno que intente abrir `/chat` se redirige a `/personal/tickets` si es `ASESOR` y a `/personal` si es `SUPERVISOR`. Visitantes y clientes conservan acceso a `/chat`.

## Escalamiento futuro a ticket

Cuando `offers_ticket === true`:

- para visitantes se explica que deben iniciar sesión o registrarse, con enlaces válidos a `/login` y `/registro`; el ID permanece en `sessionStorage` durante la navegación;
- para clientes se informa que la consulta puede convertirse en ticket y se presenta el estado preparado para la fase siguiente;
- `ConversationPanel` acepta opcionalmente `onCreateTicket`, pero no ejecuta ninguna llamada si la función no existe.

No se crea una ruta nueva ni se llama a `convert-to-ticket` en esta fase.

## Experiencia, accesibilidad y seguridad

El panel se presenta como “Asistente de atención” y explica que responde consultas generales con la base de preguntas frecuentes. Incluye de forma visible: “No ingreses números de tarjeta, claves, CVV, tokens ni información financiera real”.

El launcher tiene nombre accesible y estado expandido. El panel flotante usa semántica de diálogo, cierra con Escape, mueve el foco al abrirse y lo devuelve al launcher al cerrarse. El diálogo de nueva conversación gestiona foco, Escape, confirmación y cancelación. Los mensajes dinámicos usan regiones vivas discretas, los errores se anuncian, todos los controles tienen etiquetas y los estilos mantienen foco visible, contraste y adaptación móvil. Las animaciones respetan `prefers-reduced-motion`.

## Estados y errores

- FAQ: carga, error recuperable, vacío general y vacío por filtros.
- Conversación: inicial, restaurando, lista, creando, enviando y error recuperable.
- Envío fallido: conserva el texto para reintento y no agrega mensajes inventados.
- Conversación inválida: limpia el ID solo cuando el backend confirma que no existe o no es accesible.
- Asociación fallida: nunca interrumpe ni invalida el login.

## Estrategia de pruebas

El desarrollo sigue ciclos RED–GREEN–REFACTOR. Las pruebas cubren como mínimo:

- carga, categorías, exclusión de FAQ inactivas, filtrado, búsqueda y combinación de filtros;
- carga, error, reintento y estados vacíos de FAQ;
- apertura, cierre con botón y Escape, foco y advertencia sensible del widget;
- creación explícita y creación al primer envío;
- envío y renderizado exclusivo de mensajes devueltos por el backend;
- mensajes vacíos, espacios y más de 2000 caracteres;
- escritura exclusiva del ID en `sessionStorage` y ausencia de uso de `localStorage`;
- restauración, reintento temporal y limpieza ante conversación inválida;
- confirmación antes de reemplazar una conversación con mensajes;
- `offers_ticket` para visitante y CLIENTE;
- asociación coordinada antes de la restauración después del login de CLIENTE y manejo de 403, 404 y 5xx;
- ausencia total de restauración, creación y asociación durante sesiones ASESOR o SUPERVISOR;
- ocultamiento del widget, bloqueo de `/chat` y redirecciones heredadas para personal;
- regresión de autenticación y separación entre `/login` y `/personal/login`.

La validación final ejecuta `npm run lint`, `npm run test`, `npm run build`, `npm audit --omit=dev` y `git status` antes de crear un único commit que incluya diseño, plan e implementación: `feat(chatbot): connect public faq and chatbot`.
