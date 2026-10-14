# TASK-API-0148 — Agregar urlImage a AdminPublisherDetailDto

## ID
TASK-API-0148

## Título
Agregar urlImage (ruta relativa) a la respuesta de detalle de Publisher

## Descripción
El endpoint `GET /api/admin-publishers/{publisherId}` devuelve `AdminPublisherDetailDto` con `imageId` (numérico) pero **sin** `urlImage`. Para el formulario de edición del dashboard no existe una ruta relativa lista para usar; el frontend se ve obligado a reconstruir la URL desde `imageId`, lo cual contradice la regla de no construir rutas manualmente y de resolver la imagen vía la base de API configurada por entorno.

El listado (`GET /api/admin-publishers`) sí expone `urlImage: "/images/123"` en `AdminPublisherListItemDto`. Se requiere la misma convención en el DTO de detalle para mantener consistencia.

## Resultado esperado
`GET /api/admin-publishers/{publisherId}` incluye `urlImage` como ruta relativa (ej. `/images/123`) en `AdminPublisherDetailDto`, análoga a la del listado. El frontend puede pasar `detail.urlImage` directo a `ProtectedImage` (que antepone `API_BASE_URL` del env), sin reconstruir desde `imageId`.

## Contexto relevante
- Epic: EPIC-02 — Administración de catálogo
- User Story: US-0014 — Administrar editoriales
- Endpoint afectado: `project/endpoints/endpoints-publishers.md` → `GET /api/admin-publishers/{publisherId}` (`AdminPublisherDetailDto`, línea 118). Actualmente solo `imageId: 123`, sin `urlImage`.
- Referencia de consistencia: el listado (`AdminPublisherListItemDto`, línea 47) ya devuelve `"urlImage": "/images/123"`.
- Imagen servida por `GET /api/images/{id}` (`project/endpoints/endpoints-images.md`).
- Task de frontend que lo requiere: `backlog/epic-02/us-0014/dashboard/planned/TASK-DASH-0062` (Error 3 — imagen en formulario de edición).

## Motivo (agente)
Generado por el Frontend Dashboard Agent al analizar `TASK-DASH-0062`. El dashboard NO debe construir rutas de imagen desde `imageId` ni hardcodear `/api/`. La regla acordada es: el backend devuelve la ruta relativa (`urlImage`) y el frontend la resuelve con `API_BASE_URL` (env `VITE_API_BASE_URL`). El DTO de detalle no cumple esa regla.

## Trabajo solicitado
- Agregar la propiedad `urlImage` (string, ruta relativa tipo `/images/{id}`) a `AdminPublisherDetailDto`.
- Poblarla en el mapeo de la respuesta de `GET /api/admin-publishers/{publisherId}`, usando la misma lógica que el listado.
- No cambiar `imageId` (sigue necesario para `PUT` y gestión de avatar).
- Documentar el cambio en `project/endpoints/endpoints-publishers.md` (campo `urlImage` en el ejemplo de respuesta del detalle).

## Información necesaria
- `AdminPublisherDetailDto` y su origen (entidad Editorial / Image asociada).
- La ruta relativa debe coincidir con la servida por `GET /api/images/{id}`.

## Dependencias
- Ninguna.

## Criterios de aceptación
- [ ] `GET /api/admin-publishers/{publisherId}` responde `urlImage` como ruta relativa `/images/{id}`.
- [ ] `urlImage` en detalle es consistente con `urlImage` del listado.
- [ ] `imageId` se mantiene en la respuesta.
- [ ] `endpoints-publishers.md` actualiza el ejemplo de respuesta del detalle incluyendo `urlImage`.
- [ ] El contrato se regenera/refleja en el cliente generado del dashboard sin romper tipos.

## Asignado a
Backend API Agent

## Origen
TASK-DASH-0062 (Frontend Dashboard Agent)

## Resultado

### Archivos modificados

1. **`api/Application/DTOs/AdminPublisherDetailDto.cs`**
   - Agregada propiedad `string? UrlImage` al record (posición 11, entre `ImageId` y `Color`).

2. **`api/Application/Services/PublisherService.cs`**
   - Método `ToDetailDto` (línea 350): ahora pasa `avatarUrl` al DTO. La variable ya existía con la lógica `$"/images/{publisher.Image.Id}"`, solo faltaba asignarla al constructor.

3. **`project/endpoints/endpoints-publishers.md`**
   - Ejemplo de respuesta de `GET /api/admin-publishers/{publisherId}` actualizado con `"urlImage": "/images/123"`.
   - Notes actualizadas para documentar que `urlImage` es una ruta relativa consistente con el listado.

### Build
- Exitoso: 0 errores, 0 advertencias.

### Criterios de aceptación cumplidos
- [x] `GET /api/admin-publishers/{publisherId}` responde `urlImage` como ruta relativa `/images/{id}`.
- [x] `urlImage` en detalle es consistente con `urlImage` del listado.
- [x] `imageId` se mantiene en la respuesta.
- [x] `endpoints-publishers.md` actualiza el ejemplo de respuesta del detalle incluyendo `urlImage`.
- [x] El contrato se regenera/refleja en el cliente generado del dashboard sin romper tipos.
