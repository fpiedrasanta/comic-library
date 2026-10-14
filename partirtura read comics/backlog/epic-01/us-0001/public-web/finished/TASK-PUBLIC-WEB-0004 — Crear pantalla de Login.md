# TASK-PUBLIC-WEB-0004 — Crear pantalla de Login

Crear la pantalla de Login del Public Web.

Utilizar como referencia visual el template:

`/partirtura read comics/ux_ui/login-template.html`

La pantalla debe permitir visualizar el formulario de inicio de sesión, pero la funcionalidad de autenticación no forma parte de esta Task.

El botón o enlace `Registrarse` debe redirigir a la pantalla de registro.

No implementar en esta Task:

- Autenticación.
- Consumo del endpoint de Login.
- Generación o almacenamiento de tokens.
- Redirección al index después del Login.

La pantalla debe quedar preparada para incorporar posteriormente la funcionalidad de inicio de sesión.

Antes de implementar la Task, leer:

- `communication.md`
- `components.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `pages.md`
- `project.md`
- `public-web-architecture.md`
- `epic-01.md`
- `us-0001.md`

Actualizar `pages.md` y `components.md` cuando corresponda.

## Resultado de la ejecución

Se creó la pantalla de Login en `public-web/public-web/pages/login-page.tsx`.

Implementación:
- Layout responsive de dos columnas siguiendo el template visual
- Columna izquierda: branding con logo, frase principal y footer (visible en desktop)
- Columna derecha: formulario de inicio de sesión
- Botón SSO Google con icono oficial
- Separador visual entre SSO y formulario tradicional
- Campos: email y contraseña
- Botón de submit con gradiente neps
- Link a pantalla de registro (`/login` → `/register`)
- Toggle de visibilidad de contraseña (UI solamente)
- Sin lógica de autenticación, consumo de API ni almacenamiento de tokens

Configuración aplicada:
- Colores de marca neps agregados a `tailwind.config.ts`
- Ruta `/login` agregada en `app/router/routes.tsx`

Verificación:
- `npx tsc --noEmit` pasa sin errores
- `npm run build` exitoso

Actualizaciones de documentación:
- `pages.md` actualizado con la nueva página Login
- `components.md` sin cambios (no se crearon componentes reutilizables nuevos)
