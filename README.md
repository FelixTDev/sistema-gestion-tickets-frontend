# Banco GNB Perú · sistema inteligente de atención y tickets

Frontend del prototipo académico independiente de orientación y gestión de tickets. La identidad visible usada en la demostración es “Banco GNB Perú”, pero la aplicación no es un canal bancario oficial, no está afiliada a sus canales operativos y no ejecuta operaciones bancarias reales.

> **Prototipo académico no oficial. Utilice únicamente datos y cuentas de demostración.**

## Diseño y accesos

La interfaz adopta un lenguaje institucional propio, sobrio y accesible, con azul profundo como color base y turquesa como acento. La web pública se centra en orientación, asistente de atención y seguimiento de tickets; no reproduce literalmente el sitio oficial.

- `/login`: acceso exclusivo para cuentas demo con rol `CLIENTE`.
- `/registro`: alta exclusiva de cuentas demo de clientes.
- `/personal/login`: acceso exclusivo para cuentas demo con rol `ASESOR` o `SUPERVISOR`.
- `/cliente` y descendientes: portal protegido para `CLIENTE`.
- `/cliente/tickets`: bandeja de tickets del cliente autenticado.
- `/cliente/tickets/nuevo`: creación manual o conversión de una conversación del asistente.
- `/cliente/tickets/:ticketId`: detalle, historial y comentarios permitidos del ticket.
- `/personal/tickets` y descendientes: espacio protegido para `ASESOR` y `SUPERVISOR`.
- `/personal` y `/personal/conocimiento`: espacio protegido para `SUPERVISOR`.
- `/panel/*`: rutas antiguas que redirigen con reemplazo de historial a su equivalente `/personal/*`.
- `/preguntas-frecuentes`: FAQ públicas con búsqueda y filtro por categoría.
- `/chat`: asistente disponible para visitantes y `CLIENTE`; los roles internos son redirigidos a su espacio oficial.

El enlace de acceso para personal se muestra de forma discreta únicamente en el footer público. Los layouts público, de cliente y de personal son visual y funcionalmente distintos. El dashboard y el portal de tickets de cliente consumen la API real; las superficies operativas de personal continúan fuera del alcance de esta fase.

## Requisitos

- Node.js 22 o superior
- npm 11 o superior

## Instalación

```bash
npm install
copy .env.example .env
```

## Variables de entorno

`VITE_API_BASE_URL` define la URL base de la API. El valor de ejemplo es `http://localhost:8000/api/v1`. No se deben guardar secretos en variables `VITE_*`, porque quedan expuestas en el navegador.

## Ejecución

```bash
npm run dev
```

Rutas base: inicio, login, registro, preguntas frecuentes, asistente, portal de cliente y panel interno. La autenticación usa los endpoints `/auth/register`, `/auth/login`, `/auth/me` y `/auth/logout` del backend configurado en `VITE_API_BASE_URL`.

## Flujo de autenticación

El registro valida nombre, correo, teléfono opcional, contraseña y confirmación antes de enviar `POST /auth/register`. El login envía correo y contraseña a `POST /auth/login`; el token recibido se guarda únicamente en `sessionStorage` bajo `auth_token`. `sessionStorage` conserva la sesión durante la pestaña actual y se limpia al cerrarla; nunca se usa `localStorage` ni se guardan contraseñas.

Al iniciar la aplicación, si existe un token se consulta `GET /auth/me`. Una respuesta 401 limpia la sesión local. El cierre de sesión intenta llamar `POST /auth/logout` y limpia siempre la sesión local, incluso si la llamada falla. No se implementan refresh tokens porque no forman parte del contrato actual.

Las cuentas demo son ficticias y deben existir en el backend local; no se incluyen credenciales reales en el repositorio. No ingrese claves, números de tarjeta, CVV, tokens, códigos, saldos ni información bancaria real. El destino depende del rol: `CLIENTE` va a `/cliente`, `ASESOR` a `/personal/tickets` y `SUPERVISOR` a `/personal`.

Aunque ambos portales usan `POST /auth/login`, cada uno valida el rol devuelto. Si una cuenta intenta entrar por el portal incorrecto, la sesión y el token se eliminan, se explica el acceso correspondiente y se ofrece un enlace hacia él.

## Preguntas frecuentes y chatbot

La página de FAQ consume `GET /faqs` y `GET /categories`, excluye contenido inactivo y permite buscar localmente por pregunta o palabras clave. El asistente usa exclusivamente:

- `POST /chat/conversations` para iniciar una conversación.
- `GET /chat/conversations/{conversation_id}` para restaurarla.
- `POST /chat/conversations/{conversation_id}/messages` para enviar consultas al motor de FAQ.
- `POST /chat/conversations/{conversation_id}/link-user` para asociar una conversación anónima después del login de un cliente.

Solo `chat_conversation_id` se guarda en `sessionStorage`, por lo que permanece durante la pestaña actual. Los mensajes se mantienen en memoria y se recuperan del backend; no se guardan en `localStorage`. Al aparecer una sesión `CLIENTE`, primero se intenta la asociación y después se actualiza la conversación, sin bloquear el login. Para `ASESOR` y `SUPERVISOR` el chatbot se oculta y no restaura, crea, asocia ni envía conversaciones.

Cuando el backend devuelve `offers_ticket`, los visitantes reciben enlaces a login y registro, mientras que los clientes pueden continuar a la creación del ticket conservando el `conversationId`. La conversión usa exclusivamente `POST /chat/conversations/{conversation_id}/convert-to-ticket`; nunca crea además un ticket manual. El identificador de conversación se conserva si hay un error y solo se elimina tras recibir el ticket creado correctamente.

## Portal de tickets del cliente

El portal usa únicamente operaciones autorizadas para `CLIENTE`:

- `GET /tickets/mine` para el dashboard y la bandeja propia.
- `POST /tickets` para una solicitud manual.
- `GET /tickets/{ticket_id}` y `GET /tickets/{ticket_id}/history` para detalle y trazabilidad.
- `POST /tickets/{ticket_id}/comments` para añadir comentarios cuando el ticket no está `CERRADO` ni `CANCELADO`.
- `POST /chat/conversations/{conversation_id}/convert-to-ticket` para convertir una conversación no resuelta.

El cliente no recibe controles para cerrar, reabrir, cancelar, asignar o cambiar el estado: esas transiciones corresponden al personal según el backend. El contrato actual tampoco ofrece un endpoint para leer el contenido de comentarios anteriores. Por ello, la pantalla muestra el historial persistente y únicamente los comentarios creados durante su montaje actual, sin inventar datos ni una operación GET inexistente.

## Pruebas y build

```bash
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

## Estructura

```text
src/
├── app/                 # router, providers y shell
├── components/          # layouts, UI y áreas preparadas
├── features/            # módulos de dominio preparados
├── hooks/               # hooks reutilizables
├── lib/                 # cliente HTTP, auth y utilidades
├── pages/               # páginas públicas, cliente y personal
├── styles/              # tokens y estilos globales
├── types/               # contratos TypeScript
└── main.tsx
```

El cliente HTTP centralizado usa `fetch`, serializa JSON, envía el token mediante `Authorization: Bearer` y transforma errores al tipo `ApiError`. La autenticación, las FAQ, el chatbot y el portal de tickets de cliente están conectados. La bandeja operativa, asignación, transiciones de estado, métricas y dashboard real del personal quedan para la próxima fase.
