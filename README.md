# Atiende · frontend

Base técnica del prototipo académico independiente de gestión de tickets. No es un canal bancario oficial ni ejecuta operaciones bancarias reales.

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

Las cuentas demo son ficticias y deben existir en el backend local; no se incluyen credenciales reales en el repositorio. El destino depende del rol: `CLIENTE` va a `/cliente`, `ASESOR` a `/panel/tickets` y `SUPERVISOR` a `/panel`.

## Pruebas y build

```bash
npm run lint
npm run test
npm run build
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

El cliente HTTP centralizado usa `fetch`, serializa JSON, admite `Authorization: Bearer` cuando exista una estrategia de sesión y transforma errores al tipo `ApiError`. Las llamadas de negocio quedan pendientes hasta conectar los endpoints documentados.
