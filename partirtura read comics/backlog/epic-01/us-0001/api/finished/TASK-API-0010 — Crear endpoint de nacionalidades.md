# TASK-API-0010 — Crear endpoint de nacionalidades

Crear el endpoint que permita obtener la lista de nacionalidades disponibles del sistema.

El endpoint debe:

- Devolver todas las nacionalidades activas.
- Respetar el formato de respuesta estándar definido para la API.
- Ser consumido por el Public Web durante el formulario de registro para poblar el select de nacionalidades.

Ruta sugerida:
- `GET /api/nationalities`

Response esperado:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": [
          { "id": 1, "code": "AR", "name": "Argentina", "isActive": true },
          { "id": 2, "code": "BR", "name": "Brasil", "isActive": true }
      ]
  }

UserStory: `/partirtura read comics/backlog/epic-01/us-0001/us-0001.md`
Epic: `/partirtura read comics/backlog/epic-01/epic-01.md`

Origin:
TASK-PUBLIC-WEB-0005 — Crear formulario de registro

Estado:
Finished

Trabajo realizado:
Lectura del contexto obligatorio.
Actualización de INationalityRepository con GetActiveAsync.
Actualización de NationalityRepository con GetActiveAsync.
Creación de Application/Features/Nationalities:
  - GetNationalitiesQuery
  - GetNationalitiesQueryHandler
Registro de handler en Api/Program.cs mediante MediatR.
Implementación del endpoint GET /api/nationalities en Program.cs.
Actualización de project/endpoints.md.
Verificación de compilación exitosa de ComicLibrary.sln.

Resultado:
El endpoint de nacionalidades queda implementado y disponible para el Public Web.
