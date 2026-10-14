# TASK-API-0012 — Crear endpoint de reenvío de código de validación

Crear el endpoint que permita reenviar el código de validación de email cuando el usuario no lo recibió o expiró.

El endpoint debe:

- Recibir el email del usuario.
- Generar un nuevo código de validación.
- Enviar el nuevo código por email.
- Respetar el formato de respuesta estándar definido para la API.
- Implementar rate limiting o mecanismo equivalente para evitar abuso.

Ruta sugerida:
- `POST /api/users/resend-validation-email`

Request:
- Content-Type: application/json
- Body:
  {
      "email": "string"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Validation email sent.",
      "code": 200,
      "payload": {
          "expiresInMinutes": 15
      }
  }

Errores:
- 404 Not Found: usuario no encontrado
- 429 Too Many Requests: límite de reenvíos alcanzado

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`
Epic: `/partirtura read comics/backlog/epic-01/epic-01.md`

Origin:
TASK-PUBLIC-WEB-0006 — Crear pantalla de validación de email

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio.
Actualización de IUserRepository con métodos de validación de email.
Actualización de UserRepository con SetEmailValidationAsync y ClearEmailValidationAsync.
Creación de Application/Interfaces/IJwtTokenGenerator.cs.
Creación de Infrastructure/Services/JwtTokenGenerator.cs.
Creación de Application/Features/ValidateEmail:
  - ValidateEmailRequest
  - ValidateEmailCommand
  - ValidateEmailCommandHandler
Creación de Application/Features/ResendValidationEmail:
  - ResendValidationEmailRequest
  - ResendValidationEmailCommand
  - ResendValidationEmailCommandHandler con rate limiting en memoria (max 5 intentos por hora por email)
Registro de servicios en Api/Program.cs.
Implementación del endpoint POST /api/users/resend-validation-email en UsersController.
Actualización de project/services.md con JwtTokenGenerator, ValidateEmailService y ResendValidationEmailService.
Actualización de project/endpoints.md.
Actualización de appsettings.json con configuración JWT.
Verificación de compilación exitosa de ComicLibrary.sln.

Resultado:
El endpoint de reenvío de código de validación queda implementado con rate limiting y documentado.
