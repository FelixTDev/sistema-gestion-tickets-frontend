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

Rutas base: inicio, login, registro, preguntas frecuentes, asistente, portal de cliente y panel interno. Las áreas protegidas usan una sesión mínima nula hasta que se implemente autenticación real.

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
