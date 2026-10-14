# TASK-API-0192 — Incluir relaciones PersonByRoles y Tags en GET /api/admin-numbers/{id}

**Tipo:** Backend / API
**Agente:** API Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**User Story:** US-0017
**Estado:** completed

## Objetivo

Corregir el endpoint `GET /api/admin-numbers/{id}` y el análisis IA para que incluyan las relaciones y datos faltantes que necesita el dashboard.

## Contexto

El dashboard reportó 3 problemas:

1. **Fecha de publicación no sugerida por IA**: `POST /api/admin-numbers/{numberId}/ai-analysis` no incluye `publicationDate` en el prompt ni en la respuesta.
2. **Personas & Roles no se cargan al editar**: `GET /api/admin-numbers/{id}` no devuelve `PersonByRoles` porque el repositorio usa `GetByIdAsync` sin includes.
3. **Tags no se cargan al editar**: mismo problema, `TagByNumbers` no está incluido.

## Solución implementada

1. **IA + `publicationDate`**: `ComicAnalysisResult` ahora incluye `PublicationDate`. El prompt enviado a la IA incluye la fecha como hint. El parser extrae `publicationDate` de la respuesta JSON.
2. **Personas & Roles**: resuelto por Lazy Loading. `GetByIdAsync` devuelve entidades trackeadas; cuando el DTO accede a `number.PersonByRoles`, EF Core lazy-load carga la colección automáticamente.
3. **Tags**: mismo mecanismo que Personas & Roles. Lazy Loading carga `number.TagByNumbers` al acceder en el DTO.

No se agregó un endpoint `/detail` ni se cambió el controlador. El frontend puede seguir usando `GET /api/admin-numbers/{id}` sin cambios.

## Criterios de aceptación

- ✅ El análisis IA devuelve `publicationDate` cuando corresponde.
- ✅ El endpoint `GET /api/admin-numbers/{id}` devuelve `PersonByRoles` y `Tags` poblados.
- ✅ Al editar un número en el dashboard, se muestran correctamente personas/roles, tags y fecha de publicación guardados.
- ✅ No se rompen otros consumidores del endpoint.

## Archivos modificados

- `api/Application/Services/NumberAnalysisService.cs`
- `api/Application/DTOs/NumberComicAnalysisDto.cs`
- `api/Application/Services/ComicAnalysisParser.cs`

## Documentación actualizada

- `project/endpoints/endpoints-numbers.md`
- `project/endpoints.md`
