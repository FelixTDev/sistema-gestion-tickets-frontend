# Banking UI and Access Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la web pública institucional del prototipo y separar con seguridad los accesos de clientes y personal.

**Architecture:** La autenticación conserva un único servicio y proveedor; dos formularios especializados aplican políticas de rol después del mismo `POST /auth/login`. Los layouts se componen con primitivas reutilizables y la página pública usa contenido estático informativo, sin llamadas de negocio nuevas.

**Tech Stack:** React 19, TypeScript estricto, React Router, React Hook Form, Zod, CSS/Tailwind, Vitest y React Testing Library.

## Global Constraints

- Trabajar solo en el frontend y no modificar el backend.
- Mantener el aviso “Prototipo académico no oficial. Utilice únicamente datos y cuentas de demostración.”
- No solicitar datos bancarios reales ni simular operaciones bancarias.
- Usar azul profundo y turquesa con diseño mobile-first y foco visible.
- Conservar el cliente HTTP, `sessionStorage` y las rutas protegidas actuales.

---

### Task 1: Separar los portales de autenticación

**Files:**
- Modify: `src/features/auth/auth-forms.tsx`
- Modify: `src/features/auth/auth.test.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/pages/base-pages.tsx`

**Interfaces:**
- Consumes: `useAuth().signIn`, `useAuth().signOut`, `Session.user.role`.
- Produces: `ClientLoginForm`, `StaffLoginForm`, ruta `/personal/login`.

- [x] **Step 1: Write failing role-policy tests**

```tsx
expect(await screen.findByText(/acceso interno/i)).toBeInTheDocument()
expect(sessionStorage.getItem('auth_token')).toBeNull()
```

- [x] **Step 2: Run the focused tests**

Run: `npm run test -- src/features/auth/auth.test.tsx`
Expected: FAIL porque no existen `StaffLoginForm` ni `/personal/login`.

- [x] **Step 3: Implement portal-specific forms**

```tsx
export function ClientLoginForm() { return <LoginForm portal="client" /> }
export function StaffLoginForm() { return <LoginForm portal="staff" /> }
```

Después de `signIn`, aceptar solo los roles del portal. Si el rol no corresponde, ejecutar `signOut`, mostrar un mensaje específico y enlazar al portal correcto.

- [x] **Step 4: Verify focused tests pass**

Run: `npm run test -- src/features/auth/auth.test.tsx`
Expected: PASS.

### Task 2: Crear componentes y layouts institucionales

**Files:**
- Create: `src/components/layout/brand-header.tsx`
- Create: `src/components/layout/public-navigation.tsx`
- Create: `src/components/layout/academic-disclaimer.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/page-container.tsx`
- Create: `src/components/ui/role-badge.tsx`
- Create: `src/components/ui/section-heading.tsx`
- Create: `src/components/ui/service-card.tsx`
- Modify: `src/components/layout/public-layout.tsx`
- Modify: `src/components/layout/portal-layout.tsx`
- Modify: `src/components/layout/staff-layout.tsx`
- Test: `src/app/app.test.tsx`

**Interfaces:**
- Produces: componentes semánticos con enlaces React Router y layouts con `Outlet`.

- [x] **Step 1: Write failing navigation and disclaimer tests**

```tsx
expect(screen.getByRole('contentinfo')).toHaveTextContent(/acceso para personal/i)
expect(screen.getAllByText(/prototipo académico no oficial/i).length).toBeGreaterThan(0)
```

- [x] **Step 2: Run tests and confirm the expected failures**

Run: `npm run test -- src/app/app.test.tsx`
Expected: FAIL por footer, marca y navegación todavía inexistentes.

- [x] **Step 3: Compose the three layouts**

Implementar header público, footer, aviso, identidad de usuario, badge de rol, navegación de cliente y navegación administrativa diferenciada. El único enlace a `/personal/login` vive en el footer.

- [x] **Step 4: Run layout tests**

Run: `npm run test -- src/app/app.test.tsx`
Expected: PASS.

### Task 3: Construir la portada informativa

**Files:**
- Modify: `src/pages/base-pages.tsx`
- Modify: `src/app/app.test.tsx`

**Interfaces:**
- Consumes: `PageContainer`, `SectionHeading`, `ServiceCard`.
- Produces: secciones `#servicios`, `#proceso`, `#preguntas` y `#canales`.

- [x] **Step 1: Write failing content tests**

```tsx
expect(screen.getByRole('heading', { name: /orientación que continúa contigo/i })).toBeInTheDocument()
expect(screen.getByRole('heading', { name: /tarjetas/i })).toBeInTheDocument()
```

- [x] **Step 2: Run tests and verify failure**

Run: `npm run test -- src/app/app.test.tsx`
Expected: FAIL porque la portada actual solo contiene tres tarjetas.

- [x] **Step 3: Implement static informational sections**

Crear hero, servicios, flujo de cuatro pasos, FAQ y canales simulados. Todas las acciones apuntan a `/chat`, `/login`, `/registro` o anclas públicas; ninguna simula transacciones.

- [x] **Step 4: Run public-page tests**

Run: `npm run test -- src/app/app.test.tsx`
Expected: PASS.

### Task 4: Consolidar tokens, documentación y validación

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/globals.css`
- Modify: `README.md`

**Interfaces:**
- Produces: tokens de color, tipografía, espaciado, radios, sombras y estados; documentación de rutas y comportamiento por rol.

- [x] **Step 1: Define complete CSS tokens**

```css
:root {
  --color-primary-900: #0b2942;
  --color-accent-500: #08a6a6;
  --color-success: #18795f;
  --color-warning: #9a6700;
  --color-error: #b4233c;
  --color-info: #1769aa;
}
```

- [x] **Step 2: Implement responsive styles and update README**

Documentar `/login`, `/registro`, `/personal/login`, la separación por rol, dirección visual y aviso académico.

- [x] **Step 3: Run complete verification**

Run: `npm run lint; npm run test; npm run build; npm audit --omit=dev`
Expected: exit code 0, all tests pass, build succeeds and no production vulnerabilities.

- [x] **Step 4: Commit**

```bash
git add .
git commit -m "feat(ui): add banking design and separate login portals"
```
