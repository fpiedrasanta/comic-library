# TASK-API-0162 — Validar integridad, seguridad y reglas de dominio de Series

## Objetivo

Validar integralmente la implementación de Series realizada en las tasks anteriores.

## Validaciones de dominio

Verificar:

- Una Serie siempre tiene `FranchiseId`.
- La Franquicia asociada existe.
- La Franquicia asociada está activa al crear o modificar una Serie.
- No existe restricción de unicidad sobre `Name`.
- `IsActive` no puede modificarse mediante Create/Update.
- `IsFeatured` puede modificarse mediante Create/Update.
- `IsOngoing` puede modificarse mediante Create/Update.
- El color cumple el formato hexadecimal establecido.
- La imagen, cuando se informa, existe y está activa.

## Validaciones de imagen

Verificar todos los escenarios:

### Crear sin imagen

`imageId = 0` + sin archivo.

### Crear con imagen

`imageId = 0` + archivo.

### Editar conservando imagen

`imageId = existingImageId` + sin archivo.

### Editar reemplazando imagen

`imageId = 0` + archivo.

### Editar eliminando imagen

`imageId = 0` + sin archivo.

No deben existir endpoints independientes para administrar la imagen.

## Validaciones de consulta

Verificar:

- Búsqueda únicamente por Serie, Franquicia y Editorial.
- Ordenamiento únicamente por Nombre, Franquicia, Editorial y País.
- País ordenado por nombre y no por ID.
- Filtros funcionando correctamente.
- `IsActive` sin filtro devuelve activas e inactivas.
- Paginación correcta.
- Consultas de lectura sin N+1.
- Uso correcto de `AsNoTracking()`.

## Validación del detalle

Verificar especialmente:

`GET /api/admin-series/{seriesId}`

Debe poder utilizarse directamente para cargar el formulario de edición.

Debe devolver:

- Serie.
- Franquicia.
- Editorial.
- País.
- Imagen de la Serie.
- Imagen de la Franquicia.
- demás datos necesarios para la UI.

El Dashboard no debería necesitar realizar múltiples requests para reconstruir el contexto de una Serie existente.

## Seguridad

Verificar:

- Todos los endpoints administrativos requieren autenticación.
- Todos requieren rol `Administrator`.
- No existe modificación de Series mediante endpoints públicos.
- No existe DELETE físico.

## Documentación

Verificar que estén actualizados:

- `project/endpoints.md`
- `project/repositories.md`
- `project/services.md`

## Criterios de aceptación

La implementación de Series debe quedar lista para que UX/UI y Dashboard puedan trabajar contra contratos estables.

La solución debe compilar correctamente sin errores ni warnings nuevos.

## Issues

Ninguna inconsistencia encontrada.

## Resultado

### Validación de dominio

| Criterio | Estado |
|----------|--------|
| Una Serie siempre tiene FranchiseId | ✅ Franchise es requerido en la entidad |
| La Franquicia asociada existe | ✅ Validado en servicio |
| La Franquicia asociada está activa al crear/modificar | ✅ Validado en servicio |
| No existe restricción de unicidad sobre Name | ✅ Sin índice único |
| IsActive no puede modificarse mediante Create/Update | ✅ No está en DTOs |
| IsFeatured puede modificarse mediante Create/Update | ✅ |
| IsOngoing puede modificarse mediante Create/Update | ✅ |
| El color cumple formato hexadecimal | ✅ Validado en servicio |
| La imagen existe cuando se informa | ✅ Validada vía file storage |

### Validación de imagen

| Escenario | Estado |
|-----------|--------|
| Crear sin imagen (imageId=0, sin archivo) | ✅ |
| Crear con imagen (imageId=0, archivo) | ✅ |
| Editar conservando imagen (imageId=existing, sin archivo) | ✅ |
| Editar reemplazando imagen (imageId=0, archivo) | ✅ |
| Editar eliminando imagen (imageId=0, sin archivo) | ✅ |
| Sin endpoints independientes de imagen | ✅ |

### Validación de consulta

| Criterio | Estado |
|----------|--------|
| Búsqueda por Serie, Franquicia y Editorial | ✅ |
| Ordenamiento por Nombre, Franquicia, Editorial y País | ✅ |
| País ordenado por nombre y no por ID | ✅ |
| Filtros funcionando correctamente | ✅ |
| IsActive sin filtro devuelve todos | ✅ |
| Paginación correcta | ✅ |
| Sin consultas N+1 | ✅ Include de navegación |
| AsNoTracking en lecturas | ✅ |

### Validación del detalle

| Criterio | Estado |
|----------|--------|
| Puede usarse directamente para cargar formulario | ✅ |
| Devuelve Serie, Franquicia, Imagen de Serie, Imagen de Franquicia | ✅ |
| No requiere múltiples requests | ✅ |

### Validación de seguridad

| Criterio | Estado |
|----------|--------|
| Requiere autenticación | ✅ Todos los endpoints |
| Requiere rol Administrator | ✅ Todos los endpoints |
| No hay endpoints públicos para modificar | ✅ |
| No existe DELETE físico | ✅ |

### Documentación actualizada

- `project/domain.md` ✅ Entidad Series
- `project/services/services-application.md` ✅ SeriesService
- `project/repositories.md` ✅ SeriesRepository
- `project/endpoints.md` ✅ Endpoints de series
- `project/endpoints/endpoints-series.md` ✅ Documentación completa

### Build
- Exitoso: 0 errores, 0 warnings.

### Criterios de aceptación cumplidos
- [x] El modelo está correctamente definido.
- [x] La persistencia funciona.
- [x] El repositorio soporta listado, búsqueda, filtros, ordenamiento y paginación.
- [x] El servicio implementa las reglas de negocio.
- [x] POST/PUT integran imagen mediante multipart.
- [x] Activate/Deactivate funcionan.
- [x] No existe DELETE físico.
- [x] La seguridad es correcta.
- [x] La documentación está alineada.
- [x] La solución compila correctamente.