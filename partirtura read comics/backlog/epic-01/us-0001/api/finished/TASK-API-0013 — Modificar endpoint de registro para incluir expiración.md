# TASK-API-0013 — Modificar endpoint de registro para incluir información de expiración del código

Modificar el endpoint `POST /api/users/register` para que la respuesta incluya la información de expiración del código de validación de email.

Actualmente el endpoint devuelve:
```json
{
    "success": true,
    "message": "User registered successfully.",
    "code": 201,
    "payload": { "userId": 123 }
}
```

Debe devolver:
```json
{
    "success": true,
    "message": "User registered successfully.",
    "code": 201,
    "payload": {
        "userId": 123,
        "expiresInMinutes": 60
    }
}
```

El campo `expiresInMinutes` es obligatorio para que el Public Web pueda determinar la duración del temporizador en la pantalla de validación de email.

Motivo:
- La pantalla de validación de email (`TASK-PUBLIC-WEB-0006`) requiere esta información para mostrar el temporizador de expiración del código.
- Sin este dato, el frontend no puede implementar el requisito: "Utilizar la información de expiración devuelta por la API para determinar la duración del temporizador."

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`
Epic: `/partirtura read comics/backlog/epic-01/epic-01.md`

Origin:
TASK-PUBLIC-WEB-0006 — Crear pantalla de validación de email

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio.
Actualización de Application/DTOs/RegisterUserResponse.cs para incluir `ExpiresInMinutes`.
Actualización de Application/Services/UserService.cs:
  - RegisterAsync ahora retorna `RegisterUserResponse(user.Id, 60)`.
  - Token de validación de email configurado para expirar en 60 minutos.
  - ResendValidationEmailAsync también actualizado para usar 60 minutos de expiración.
Actualización de Api/Controllers/UsersController.cs para propagar el nuevo campo en la respuesta.
Actualización de project/endpoints.md con el nuevo formato de respuesta del endpoint de registro.
Verificación de compilación exitosa de ComicLibrary.sln (0 errores, 0 advertencias).

Resultado:
El endpoint de registro ahora incluye `expiresInMinutes` en la respuesta, permitiendo que el Public Web implemente el temporizador de expiración del código.

Desbloquea:
TASK-PUBLIC-WEB-0006 — Crear pantalla de validación de email

Corrección posterior solicitada:
Se eliminó el valor hardcodeado de expiración. Ahora el tiempo de expiración del token de validación de email es configurable mediante `Email:TokenExpirationMinutes` en `appsettings.json`.
Valor por defecto: 1 minuto.
La configuración se consume mediante `IEmailTokenSettingsProvider` en `Infrastructure/Settings/EmailTokenSettingsProvider.cs`, registrado en DI desde `Api/Program.cs`.
No es necesario cambiar en 2 lugares; el servicio `UserService` obtiene el valor desde un solo origen de configuración.

