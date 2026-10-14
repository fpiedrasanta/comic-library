# TASK-API-0011 — Crear endpoint de validación de email

Crear el endpoint que permita validar el código de 6 dígitos enviado por email durante el registro.

El endpoint debe:

- Recibir el código de validación.
- Verificar que el código sea válido y no haya expirado.
- Marcar el email del usuario como validado.
- Generar y devolver un token de autenticación para que el usuario pueda iniciar sesión automáticamente.
- Respetar el formato de respuesta estándar definido para la API.

Ruta sugerida:
- `POST /api/users/validate-email`

Request:
- Content-Type: application/json
- Body:
  {
      "email": "string",
      "code": "string (6 dígitos)"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Email validated successfully.",
      "code": 200,
      "payload": {
          "token": "string",
          "user": {
              "userId": 123,
              "email": "user@example.com",
              "fullName": "John Doe"
          },
          "role": "PublicUser"
      }
  }

Errores:
- 400 Bad Request: código inválido o expirado
- 404 Not Found: usuario no encontrado

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`
Epic: `/partirtura read comics/backlog/epic-01/epic-01.md`

Origin:
TASK-PUBLIC-WEB-0006 — Crear pantalla de validación de email

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio.
Actualización de IUserRepository con GetByEmailAndValidationTokenAsync.
Actualización de UserRepository con GetByEmailAndValidationTokenAsync.
Instalación de System.IdentityModel.Tokens.Jwt 8.22.0 en Infrastructure.
Creación de Application/Interfaces/IJwtTokenGenerator.cs.
Creación de Infrastructure/Services/JwtTokenGenerator.cs.
Creación de Application/Features/ValidateEmail:
  - ValidateEmailRequest
  - ValidateEmailCommand
  - ValidateEmailCommandHandler
Registro de IJwtTokenGenerator en Api/Program.cs.
Implementación del endpoint POST /api/users/validate-email en Program.cs:
  - Validación de request.
  - Invocación de ValidateEmailCommand vía MediatR.
  - Generación de JWT con claims (sub, email, name).
  - Respuesta en formato estándar.
Actualización de project/services.md con JwtTokenGenerator y ValidateEmailService.
Actualización de project/endpoints.md.
Actualización de appsettings.json con configuración JWT.
Verificación de compilación exitosa de ComicLibrary.sln.

Resultado:
El endpoint de validación de email queda implementado y devuelve un JWT funcional con el claim `role = PublicUser`, además del token, la información del usuario y el rol.
