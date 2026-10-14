# TASK-API-0008 — Crear servicio de envío de email de validación

Crear el servicio encargado de enviar el email necesario para validar la dirección de correo electrónico de un usuario.

El servicio debe:

- Recibir la información necesaria para enviar el email de validación.
- Utilizar el mecanismo de validación generado para el usuario.
- Generar el contenido necesario para que el usuario pueda completar la validación.
- Utilizar la configuración correspondiente al entorno para realizar el envío.
- Mantener separada la lógica de negocio del mecanismo concreto utilizado para enviar emails.

El servicio debe utilizar una abstracción para el envío de emails y no depender directamente de una implementación concreta de infraestructura.

Actualizar `services.md` con los servicios e interfaces creados y sus responsabilidades.

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`
Epic: `/partirtura read comics/backlog/epic-01/epic-01.md`

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio.
Actualización de IEmailService (ya existente).
Actualización de EmailService en Infrastructure/Services:
  - Ahora envía correos reales mediante SMTP usando MailKit.
  - Separa configuración SMTP de configuración de contenido.
  - Soporta template HTML (`ValidationMailContent:HtmlTemplatePath`) y texto plano (`ValidationMailContent:TextTemplatePath`).
  - Reemplaza placeholders `{{code}}` y `{{time to expire}}` en ambos templates.
  - Envía mensaje multipart (texto + HTML).
  - Configura SMTP desde `Email:Smtp:*` en appsettings.json.
  - Configura asunto desde `ValidationMailContent:Subject`.
  - No expone credenciales ni información sensible en logs.
  - Lanza excepción si el envío falla.
  - Ahora recibe `expiresInMinutes` para reflejar el tiempo real de expiración en el template.
Instalación de MailKit 4.17.0 en Infrastructure.
Actualización de appsettings.json con nueva estructura ordenada (`Email:Smtp` + `ValidationMailContent`).
Creación de `Api/EmailTemplates/validation-mail-body.html` (template HTML).
Creación de `Api/EmailTemplates/validation-mail-body.txt` (template texto plano).
Configuración de `Api.csproj` para copiar templates al output durante el build.
Eliminación de templates duplicados de `ux_ui/`.
Actualización de `project/services.md` con nueva configuración y paths relativos.
Actualización de `backend-stack-technology.md` con MailKit.
Actualización de `backend-coding-rules.md` con regla 47.2 sobre envío de correo.
Actualización de `UserService.RegisterAsync` y `ResendValidationEmailAsync` para pasar `expiresInMinutes` al servicio de email.
Verificación de compilación exitosa de ComicLibrary.sln (0 errores, 0 advertencias).

Resultado:
El servicio de envío de email de validación queda implementado con envío real por SMTP, template HTML configurable y placeholders dinámicos.
