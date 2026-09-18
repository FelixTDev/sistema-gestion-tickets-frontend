# Task 3 — Informe de cierre

**Estado:** DONE_WITH_CONCERNS

## Alcance

Se completó el sitio público, autenticación pública/personal, FAQ y chatbot de Task 3. Se conservaron los contratos y operaciones HTTP existentes, JWT en `sessionStorage`, `ChatbotProvider` global y la separación por roles. Se añadieron aliases públicos (`/faq`, `/preguntas-frecuentes`, `/register`, `/registro`) y redirecciones legacy explícitas desde `/panel`, `/panel/tickets`, `/panel/reportes`, `/panel/asignacion` y `/panel/conocimiento` hacia `/personal/*`, preservando query string y hash.

El almacenamiento de conversaciones acepta únicamente UUIDs con formato/version/variante válidos. Los IDs inválidos almacenados o devueltos por el servicio se descartan sin interpolarse en URLs ni persistirse. La asociación CLIENTE puede reintentarse tras un fallo temporal antes de restaurar la conversación; ASESOR y SUPERVISOR permanecen inactivos.

## Evidencia

- RED histórico documentado en `docs/superpowers/plans/2026-09-12-public-faq-chatbot-implementation.md`; el trabajo inicial partió de imports/componentes inexistentes.
- GREEN: `npm run test -- src/app/public-routes.test.tsx src/features/auth/auth.test.tsx src/features/faqs/faqs.test.tsx src/features/chatbot/chatbot.test.tsx` — **4 archivos, 65 pruebas aprobadas**.
- `npm run lint` — **código 0**.
- `npm run build` — **código 0**. Vite informa advertencias de anotaciones de comentarios de Zod/vendor y tamaño de chunk, sin errores de compilación.
- `git diff --check` — **código 0**.

La regresión completa (`npm run test`) fue ejecutada y actualmente reporta fallos en suites concurrentes de otras tareas: invariantes de copy pendientes de Task 7 y pruebas de portal/tickets que todavía usan fixtures visuales o IDs no UUID de etapas anteriores. Las cuatro suites exigidas por Task 3 permanecen verdes.

## Archivos de Task 3

Se actualizaron los layouts públicos, navegación, aviso de servicio, autenticación, FAQ, chatbot, router y sus pruebas; además se crearon `auth-shell.tsx`, `page-header.tsx`, `service-notice.tsx` y `public-routes.test.tsx` según el brief. También se amplió de forma autorizada `chatbot-provider.tsx` y `chatbot-storage.ts` para coordinación de sesión y validación UUID.

## Concerns

Los destinos `/personal/reportes` y `/personal/asignacion` quedan preparados como aliases legacy para las pantallas que completará Task 7. No se añadió una pantalla nueva fuera del ownership de Task 3. Las advertencias del build provienen de dependencias vendor y del tamaño de bundle, no del código TypeScript del proyecto.
