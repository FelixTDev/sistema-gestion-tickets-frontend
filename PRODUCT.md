# Sistema de Gestión de Tickets Banco GNB Perú

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Invitados consultan información pública, preguntas frecuentes y el asistente, sin acceso a tickets.
- Clientes registran y consultan sus propios tickets y pueden convertir una conversación en ticket.
- Asesores atienden la bandeja, comentarios y transiciones autorizadas de tickets.
- Supervisores administran además reportes, asignaciones, asesores y conocimiento.

## Product Purpose

Centralizar consultas y tickets, dar seguimiento verificable a cada solicitud y ofrecer a cada rol solo las acciones respaldadas por el servicio real. El éxito significa que una persona puede orientarse, crear o atender una solicitud y comprender su estado sin confundir el portal con un canal de operaciones bancarias.

## Operating Context

La experiencia combina un sitio público, autenticación separada para clientes y personal, un portal de cliente y un portal operativo. El aviso institucional único es: “Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.”

## Capabilities and Constraints

- React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS y shadcn/ui.
- El cliente HTTP único es `src/lib/api-client.ts`; el JWT permanece exclusivamente en `sessionStorage`.
- El backend conserva la autoridad de permisos. La interfaz no inventa datos, éxito, paginación, exportación, recuperación de contraseña ni borrado físico.
- Toda consulta remota presenta carga, error, vacío y éxito; las acciones destructivas requieren confirmación.
- La interfaz no presenta selectores de rol ni credenciales precargadas.

## Brand Commitments

La identidad visual corresponde a Banco GNB Perú. Solo se usan los PNG autorizados `src/assets/brand/banco-gnb-horizontal.png` y `src/assets/brand/banco-gnb-apilado.png`; no se reconstruye el logotipo. En superficies oscuras, los archivos conservan su lienzo mediante una placa blanca.

## Evidence on Hand

- La fuente visual vinculante se extrajo en `C:\Users\felix\AppData\Local\Temp\codex-gnb-figma-reference-20260913`.
- El 2026-09-13 se verificó respuesta HTTP 200 del health local y se inspeccionó el OpenAPI del backend.
- OpenAPI confirma autenticación, FAQs, categorías, tickets, chatbot y cinco endpoints de reportes. No expone borrado de FAQs/categorías, exportación de reportes ni metadatos de paginación para `GET /tickets`.
- No hay testimonios, métricas comerciales ni otros elementos probatorios autorizados; no deben fabricarse.

## Product Principles

- Orientación clara antes que densidad visual.
- Datos y resultados visibles siempre proceden del backend o de un estado honesto.
- Cada rol ve una experiencia enfocada, mientras el servidor decide la autorización final.
- La identidad institucional y el aviso aprobado se mantienen consistentes en todas las superficies.
- Acciones, estados y límites se expresan con texto además de color.

## Accessibility & Inclusion

Diseño mobile-first con teclado y lector de pantalla para navegación, menús, pestañas, diálogos y formularios. Debe conservar foco visible, asociaciones accesibles de error y ayuda, regiones vivas para feedback, movimiento reducido, controles táctiles adecuados y ausencia de scroll horizontal global en 1440, 1280, 1024, 768, 390×844 y 375×812.
