# TASK-PUBLIC-WEB-0005 — Crear formulario de registro

Crear la pantalla de registro del Public Web.

Utilizar como referencia visual el template:

`/partirtura read comics/ux_ui/formulario-registro-template.html`

La pantalla debe permitir ingresar los datos necesarios para registrarse:

- Nombre.
- Apellido.
- Email.
- Contraseña.
- Nacionalidad.
- Avatar.
- Aceptación de términos y condiciones.

Al enviar el formulario, debe consumir el endpoint de registro disponible en `endpoints.md`.

Si el registro es exitoso, la aplicación debe continuar con la pantalla de validación mediante código.

Si la API devuelve un error, debe mostrarse al usuario el mensaje correspondiente siguiendo las reglas de manejo de errores definidas para el frontend.

Antes de implementar la Task, leer:

- `communication.md`
- `components.md`
- `endpoints.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `pages.md`
- `project.md`
- `public-web-architecture.md`
- `epic-01.md`
- `us-0001.md`

Si el endpoint necesario para realizar el registro no existe en `endpoints.md`, generar una nueva Task destinada a `api` siguiendo el mecanismo definido en `communication.md`.

## Resultado de la ejecución

Se creó la pantalla de registro en `public-web/public-web/pages/register-page.tsx`.

Implementación:
- Formulario con campos: nombre, apellido, email, contraseña, confirmar contraseña, nacionalidad, avatar (opcional), términos y condiciones
- Validación frontend con React Hook Form + Zod
- Validación de coincidencia de contraseñas
- Select de nacionalidades cargado desde endpoint backend
- Preview de avatar antes del envío
- Envío mediante `FormData` como `multipart/form-data` al endpoint `/users/register`
- Manejo de errores de API: 400 (errores de validación por campo), 409 (email duplicado), 404 (nacionalidad no encontrada)
- Navegación a `/verify-email` con estado en caso de registro exitoso
- Pantalla placeholder de validación de email creada en `verify-email-page.tsx`
- Ruta `/register` y `/verify-email` agregadas en `app/router/routes.tsx`

Dependencia detectada:
- El select de nacionalidades requiere el endpoint `GET /api/nationalities` para cargar la lista de opciones.
- Se generó la Task `TASK-API-0010` en `planned/api/` para solicitar la creación de este endpoint.

Verificación:
- `npx tsc --noEmit` pasa sin errores
- `npm run build` exitoso

Actualizaciones de documentación:
- `pages.md` actualizado con las páginas Register y Verify Email
- `components.md` sin cambios (no se crearon componentes reutilizables nuevos)
