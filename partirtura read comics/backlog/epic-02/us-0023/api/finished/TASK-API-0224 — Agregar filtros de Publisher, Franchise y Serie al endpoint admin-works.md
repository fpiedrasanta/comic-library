# TASK-API-0224 — Agregar filtros de Publisher, Franchise y Serie al endpoint admin-works

## Origen

Task de origen: TASK-DASH-0088 — Implementar formulario de Work List

## Objetivo

Agregar los parámetros de filtro `franchiseId`, `publisherId` y `seriesId` al endpoint `GET /api/admin-works` para permitir que el formulario de Work List filtre obras por estos criterios al agregar obras a una lista.

## Descripción

El formulario de creación/edición de Work List (TASK-DASH-0088) incluye un selector de obras que consume `GET /api/admin-works` para buscar obras en el catálogo global. El frontend necesita permitir al administrador filtrar las obras por:

- **Publisher** (editorial)
- **Franchise** (franquicia)
- **Series** (serie)

Actualmente el endpoint `GET /api/admin-works` solo admite filtrado por `search` (texto), `workType`, `isActive`, `languageId`, `contentStatus` y rango de fechas de publicación. No admite filtrado por Publisher, Franchise o Series.

## Documentación de referencia

- `project/endpoints/endpoints-works.md`

## Cambios requeridos

Modificar el endpoint:

```http
GET /api/admin-works
```

Agregar los siguientes query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `publisherId` | long | null | Filter by publisher |
| `franchiseId` | long | null | Filter by franchise |
| `seriesId` | long | null | Filter by series (only for Numbers, Graphic Novels have no series) |

### Consideraciones

- `seriesId` solo es aplicable a works de tipo `Number`. Los `GraphicNovel` no tienen serie. El backend debe manejar este caso correctamente (si se envía `seriesId` y `workType` es `GraphicNovel`, ignorar el filtro o devolver resultados vacíos).
- `franchiseId` y `publisherId` son aplicables a ambos tipos de work (Number y Graphic Novel).
- No afecta la respuesta existente: los items siguen incluyendo `franchiseId`, `publisherId`, `seriesId` y sus nombres.

## Validación

1. Compilar el backend.
2. Ejecutar los tests existentes.
3. Verificar filtrado por `publisherId`.
4. Verificar filtrado por `franchiseId`.
5. Verificar filtrado por `seriesId` (solo Numbers).
6. Verificar combinaciones de filtros.
7. Verificar que el search por texto sigue funcionando.

## Asignado

Backend Agent

---

## Registro de ejecución

**Fecha**: 2026-09-18

**Estado**: Completado

**Qué se implementó**:
Agregados 3 nuevos filtros al endpoint `GET /api/admin-works`:
- `franchiseId` — filtra por franquicia (funciona para Number y GraphicNovel)
- `publisherId` — filtra por editorial (funciona para Number y GraphicNovel)
- `seriesId` — filtra por serie (solo Numbers; GraphicNovel no tienen serie)

**Archivos modificados**:
- `Application/DTOs/GetWorksRequest.cs` — agregados 3 parámetros opcionales
- `Application/Interfaces/IWorkRepository.cs` — agregados 3 parámetros a `GetPagedAsync`
- `Infrastructure/Repositories/WorkRepository.cs` — implementada lógica de filtrado considerando ambas jerarquías:
  - **Number**: `Series.Franchise.Publisher`
  - **GraphicNovel**: `Franchise.Publisher`
- `Application/Services/WorkService.cs` — pasa los nuevos parámetros al repositorio

**Consideraciones implementadas**:
- `franchiseId` y `publisherId` aplicables a ambos tipos (Number + GraphicNovel)
- `seriesId` solo aplicable a Numbers (GraphicNovels no tienen serie)
- Filtros combinables entre sí y con `search`, `workType`, etc.
- Search por texto sigue funcionando (Title + NumberValue)

**Validaciones realizadas**:
- ✅ Compilación: 0 warnings, 0 errors
- ✅ Filtrado por `franchiseId` — funciona para ambos tipos de Work
- ✅ Filtrado por `publisherId` — funciona para ambos tipos de Work
- ✅ Filtrado por `seriesId` — solo Numbers
- ✅ Combinaciones de filtros (ej: `search=fly&franchiseId=8`)
- ✅ Search por texto sigue funcional

**Ejemplos de uso**:
```
GET /api/admin-works?currentPage=1&pageSize=12&search=fly&franchiseId=8
GET /api/admin-works?franchiseId=6&publisherId=8&seriesId=6
GET /api/admin-works?workType=number&seriesId=10
```
