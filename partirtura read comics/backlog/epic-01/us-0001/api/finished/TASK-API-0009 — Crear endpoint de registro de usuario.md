# TASK-API-0009 — Crear endpoint de registro de usuario

Crear el endpoint que permita registrar un nuevo usuario.

El endpoint debe:

- Recibir los datos necesarios para el registro.
- Validar el request.
- Invocar el servicio de registro de usuario.
- Devolver la respuesta utilizando el formato estándar definido para la API.
- Informar correctamente los errores de validación y de negocio.
- No devolver información sensible, especialmente la contraseña.

El endpoint debe respetar la arquitectura definida para la API y utilizar el servicio correspondiente sin acceder directamente al repositorio.

Actualizar `endpoints.md` especificando:

- Método HTTP.
- Ruta.
- Request.
- Response.
- Parámetros.
- Errores posibles.

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`
Epic: `/partirtura read comics/backlog/epic-01/epic-01.md`

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio.
Actualización de GlobalExceptionHandlerMiddleware para mapear:
  - BusinessConflictException -> 409
  - BusinessNotFoundException -> 404
  - BusinessException -> 400
Creación de Api/Models/ApiResponse.cs y ApiError.cs para el formato estándar.
Creación de Api/Features/RegisterUser/RegisterUserApiRequest.cs.
Implementación del endpoint POST /api/users/register en Program.cs:
  - Validación manual de request.
  - Conversión de IFormFile a byte[].
  - Invocación de RegisterUserCommand vía MediatR.
  - Respuesta en formato estándar.
Actualización de project/endpoints.md con el contrato del endpoint.
Verificación de compilación exitosa de ComicLibrary.sln.

Resultado:
El endpoint de registro queda implementado respetando la arquitectura y el formato de respuesta estándar.
