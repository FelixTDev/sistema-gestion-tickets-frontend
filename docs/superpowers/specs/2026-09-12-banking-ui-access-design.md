# Diseño institucional orientado a atención

## Alcance

Esta fase transforma la base visual del frontend y separa los accesos de clientes y personal. Conserva la autenticación, el cliente HTTP y las rutas protegidas existentes. No implementa chatbot, tickets ni dashboard reales.

## Identidad y seguridad comunicacional

La interfaz muestra “Banco GNB Perú” como contexto académico y “Sistema inteligente de atención y tickets” como nombre funcional. Todas las superficies incluyen el aviso: “Prototipo académico no oficial. Utilice únicamente datos y cuentas de demostración.” No se reproducen logotipos ni composiciones del sitio oficial y no se solicitan credenciales bancarias, tarjetas, saldos, códigos de seguridad ni documentos reales.

## Dirección visual

El sistema utiliza azul profundo para confianza y jerarquía, turquesa para acciones y orientación, blancos y grises suaves para superficies. Los tokens cubren color, tipografía, espaciado, radios, sombras y estados success, warning, error e info. La composición es mobile-first, con contraste suficiente, foco visible y estados acompañados por texto.

## Arquitectura de componentes

- `BrandHeader`: identidad común sin logotipo oficial.
- `PublicNavigation`: enlaces a inicio, servicios, proceso, preguntas frecuentes y asistente; “Ingresar” y “Registrarse” son las únicas acciones de cuenta visibles.
- `AcademicDisclaimer`: aviso permanente y legible.
- `Footer`: canales simulados, enlaces públicos y único acceso hacia `/personal/login`.
- `PageContainer` y `SectionHeading`: ritmo y alineación reutilizables.
- `ServiceCard`: categorías informativas sin acciones bancarias.
- `RoleBadge`: rol acompañado por texto.
- Estados reutilizables de carga, error y acceso denegado.
- `ClientLoginForm` y `StaffLoginForm`: comparten validación y API, pero tienen mensajes y reglas de rol distintas.

## Página pública

El inicio contiene header, hero de orientación, llamada al asistente, tarjetas informativas de tarjetas, cuentas, créditos y banca digital, el flujo consulta → respuesta → ticket → seguimiento, preguntas frecuentes estáticas de orientación y canales de atención explícitamente simulados. Los enlaces usan anclas accesibles y las rutas públicas existentes.

## Separación de accesos

- `/login` acepta únicamente `CLIENTE` y redirige a `/cliente`.
- Si una cuenta `ASESOR` o `SUPERVISOR` usa `/login`, la sesión recién creada se cierra y se muestra un mensaje con enlace a `/personal/login`.
- `/personal/login` acepta `ASESOR` y `SUPERVISOR`; redirige a `/panel/tickets` o `/panel` respectivamente.
- Si `CLIENTE` usa `/personal/login`, la sesión se cierra y se muestra un mensaje con enlace a `/login`.
- `/registro` continúa reservado a clientes.
- Las rutas protegidas y sus permisos siguen siendo autoridad del frontend solo para navegación; el backend conserva la autoridad final.

## Layouts

`PublicLayout` integra header, navegación, aviso, contenido y footer. `ClientLayout` muestra usuario, badge `CLIENTE`, navegación y cierre de sesión. `StaffLayout` adopta una barra lateral/esquema administrativo diferenciado, muestra nombre y rol, y conserva las rutas internas actuales sin desarrollar sus módulos.

## Errores y estados

Los formularios mantienen validación accesible y errores HTTP actuales. Un rol incompatible genera un mensaje específico sin exponer detalles del token y siempre limpia la sesión local. Mientras se comprueba o cierra la sesión, se informa el estado y se evitan envíos duplicados.

## Pruebas

Se cubren los dos portales de login, aceptación y rechazo por rol, limpieza de sesión, ubicación discreta del acceso interno, aviso académico, navegación pública, rutas protegidas y 404. La validación final comprende lint, tests, build y auditoría de dependencias de producción.
