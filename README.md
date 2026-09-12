# Banco GNB Perú · sistema inteligente de atención y tickets

Frontend del prototipo académico independiente de orientación y gestión de tickets. La identidad visible usada en la demostración es “Banco GNB Perú”, pero la aplicación no es un canal bancario oficial, no está afiliada a sus canales operativos y no ejecuta operaciones bancarias reales.

> **Prototipo académico no oficial. Utilice únicamente datos y cuentas de demostración.**

## Diseño y accesos

La interfaz adopta un lenguaje institucional propio, sobrio y accesible, con azul profundo como color base y turquesa como acento. La web pública se centra en orientación, asistente simulado y seguimiento de tickets; no reproduce literalmente el sitio oficial.

- `/login`: acceso exclusivo para cuentas demo con rol `CLIENTE`.
- `/registro`: alta exclusiva de cuentas demo de clientes.
- `/personal/login`: acceso exclusivo para cuentas demo con rol `ASESOR` o `SUPERVISOR`.
- `/cliente` y descendientes: portal protegido para `CLIENTE`.
- `/panel/tickets` y descendientes: espacio protegido para `ASESOR` y `SUPERVISOR`.
- `/panel` y `/panel/conocimiento`: espacio protegido para `SUPERVISOR`.

El enlace de acceso para personal se muestra de forma discreta únicamente en el footer público. Los layouts público, de cliente y de personal son visual y funcionalmente distintos. El chatbot, los tickets y el dashboard continúan como superficies simuladas; esta etapa no implementa su lógica real.

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

Las cuentas demo son ficticias y deben existir en el backend local; no se incluyen credenciales reales en el repositorio. No ingrese claves, números de tarjeta, códigos, saldos ni información bancaria real. El destino depende del rol: `CLIENTE` va a `/cliente`, `ASESOR` a `/panel/tickets` y `SUPERVISOR` a `/panel`.

Aunque ambos portales usan `POST /auth/login`, cada uno valida el rol devuelto. Si una cuenta intenta entrar por el portal incorrecto, la sesión y el token se eliminan, se explica el acceso correspondiente y se ofrece un enlace hacia él.

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

El cliente HTTP centralizado usa `fetch`, serializa JSON, envía el token mediante `Authorization: Bearer` y transforma errores al tipo `ApiError`. La autenticación ya está conectada; las funciones reales de chatbot, tickets y dashboard permanecen fuera del alcance actual.
