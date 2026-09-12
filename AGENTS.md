# Instrucciones del frontend

## Contexto

Este frontend implementa el prototipo académico de gestión de tickets con chatbot. Debe comunicar claramente que no es un canal bancario oficial.

## Stack

- React.
- TypeScript.
- Vite.
- React Router.
- TanStack Query.
- React Hook Form.
- Zod.
- Tailwind CSS.
- shadcn/ui.

## Reglas de implementación

- Usar TypeScript sin `any`.
- Preferir componentes funcionales.
- Usar kebab-case en carpetas y archivos.
- Usar TanStack Query para estado del servidor.
- Mantener el cliente HTTP en `src/lib/api-client.ts`.
- No duplicar contratos de API sin documentarlos.
- Mostrar estados de carga, error, vacío y éxito.
- Proteger rutas según rol.
- No confiar solo en permisos visuales; el backend es la autoridad.
- Diseñar mobile-first y mantener accesibilidad de teclado y lector de pantalla.
- Usar componentes reutilizables solo cuando exista repetición real.

## Criterios visuales

- Interfaz sobria y clara.
- Azul profundo como base y turquesa como acento.
- Estados con texto y color.
- Formularios con validación visible.
- Confirmación para acciones destructivas.
