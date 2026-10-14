# TASK-API-0025 — Crear endpoint de inicio de sesión

## Objetivo

Crear el endpoint que permita a un usuario iniciar sesión utilizando su email y contraseña.

## Endpoint

Crear el endpoint de autenticación correspondiente siguiendo las convenciones establecidas para los endpoints del proyecto.

El endpoint debe recibir:

- Email.
- Contraseña.

Debe devolver:

- Access Token.
- Refresh Token.

La respuesta debe utilizar el formato estándar definido en `backend-coding-rules.md`.

## Responsabilidad

El Controller debe:

1. Recibir el DTO.
2. Validar la estructura de la solicitud.
3. Invocar la interfaz del servicio de autenticación.
4. Devolver la respuesta correspondiente.

No debe contener lógica de autenticación ni acceso directo a repositorios.

## Errores

Debe contemplar como mínimo:

- Credenciales inválidas.
- Solicitud inválida.
- Errores internos.

No debe revelar si el email existe.

## Contexto obligatorio

Antes de comenzar, leer:

- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `communication.md`
- La Epic correspondiente: `epic-01.md`
- La User Story correspondiente: `us-0002.md`

Leer además el servicio de autenticación implementado en la Task anterior.

## Documentación

Si como resultado de la implementación se incorpora una nueva dependencia:

- Actualizar `backend-stack-technology.md`.

Si se incorpora o modifica un servicio:

- Actualizar `services.md`.

Si se establece una regla general reutilizable para el manejo de contraseñas:

- Actualizar `backend-coding-rules.md`.

Si como resultado de la implementación se incorpora o modifican entidades:
- Actualizar: `domain.md`

Si como resultado de la implementación se incorpora o modifican repositorios:
- Actualizar: `repositories.md`

Si como resultado de la implementación se incorpora o modifican end-points:
- Actualizar: `endpoints.md`

Si como resultado de la implementación se identifican errores en la comunicación:
- Actualizar/corregir: `communication.md`

## Criterio de finalización

La Task se considera finalizada cuando:

1. El endpoint permite iniciar sesión mediante email y contraseña.
2. Devuelve Access Token y Refresh Token cuando la autenticación es correcta.
3. Utiliza el servicio de autenticación.
4. No contiene lógica de negocio.
5. Los errores respetan las reglas de manejo de errores.
6. No revela si un email existe.
7. El endpoint está documentado en `endpoints.md`.

---

## Resultado de la ejecución

### Cambios realizados

**`Api/DTOs/LoginRequest.cs`** (nuevo)
- DTO de request con validaciones: `Email` (required, email address) y `Password` (required).

**`Api/Controllers/UsersController.cs`** (modificado)
- Se agregó dependencia a `IAuthService`.
- Se agregó el endpoint `POST /api/users/login`:
  - Recibe `LoginRequest`.
  - Invoca `_authService.LoginAsync`.
  - Retorna `ApiResponse<object>` con la respuesta de autenticación.
  - No contiene lógica de negocio.
  - Delega el manejo de errores al servicio y al middleware global.

**`project/endpoints.md`** (actualizado)
- Se agregó la documentación del endpoint `POST /api/users/login` con:
  - Request y response.
  - Errores esperados.
  - Notas de seguridad.

### Verificación

- `Api` compila correctamente.
- `Application` compila correctamente.
- `Infrastructure` compila correctamente.
- El endpoint respeta el formato estándar `ApiResponse`.
- No revela información sensible en errores.
