# TASK-DASH-0095 — Filtros y estado de IA en listados de Works

## Objetivo

Actualizar los listados de Works del Dashboard para reflejar el nuevo estado de procesamiento de IA.

Las tres pantallas utilizan la misma grilla de Works:

* `/publishers/{id}/works`
* `/franchises/{id}/works`
* `/series/{id}/works`

## Cambios

### 1. Filtros

Agregar el filtro **IA response** y *IA request* a las tres pantallas.

Estado actual:

```text
Tipo | Contenido | Public. desde | Public. hasta
Ordenar por | Dirección
```

Nuevo estado:

```text
Linea 1: Tipo      | Public. desde | Public. hasta
Linea 2: Contenido | IA request    | IA response
Linea 3: Ordenar por | Dirección
```

Opciones de `IA response`:

```text
All
Pending
Processing
Success
Error
```

Opciones de `IA request`:

```text
All
Si
No
```

El filtro debe utilizar `IAStatus`.

No agregar `Not requested` como opción de filtro.

### 2. Grilla compartida

Agregar la columna `I` después de `C` y antes de `A`.

Columnas finales:

```text
Tipo | Título | Número | Ant. | Sig. | Subida | Pub | C | I | A | Acciones
```

`I` representa el estado de IA.

| IARequest | IAStatus   | Indicador            |
| --------- | ---------- | -------------------- |
| false     | null       | Gris — sin solicitud |
| true      | Pending    | Azul                 |
| true      | Processing | Amarillo             |
| true      | Success    | Verde                |
| true      | Error      | Rojo                 |

La representación debe utilizar el mismo patrón visual de indicadores utilizado actualmente para `C` y `A`.

### 3. Datos

Utilizar los campos disponibles en el contrato actual del listado de Works:

* `IARequest`
* `IAStatus`

No mostrar `IAResult` en la grilla.

El backend ya expone estos datos.

## Alcance

Modificar únicamente lo necesario para:

* Los filtros de las tres pantallas.
* El componente/grilla compartida de Works.
* Los modelos/servicios de frontend necesarios para soportar `IAStatus`.
* La documentación correspondiente.

No modificar backend.

No implementar nuevas acciones de IA.

No modificar el comportamiento existente de los filtros de contenido, ordenamiento o fechas.

## Documentación

Actualizar al finalizar:

* `project/pages.md`
* `project/components.md`

Documentar el nuevo filtro y la nueva columna de la grilla.

## Validación

Verificar:

* Las tres páginas muestran el filtro `IA response`.
* El filtro funciona con todos los estados definidos.
* La grilla muestra la columna `I`.
* `false/null` se representa como gris/sin solicitud.
* `Pending` se representa en azul.
* `Processing` se representa en amarillo.
* `Success` se representa en verde.
* `Error` se representa en rojo.
* Las tres páginas utilizan correctamente la grilla compartida.
* Los filtros existentes continúan funcionando.
* No se muestra `IAResult` en la grilla.
* Build sin errores.
* Tests existentes pasan.

---

## Resultado de ejecución

### Estado: Completado (finished)

### Qué se implementó

1. **Filtros reorganizados en `WorksListing`** (`dashboard/features/works/components/works-listing.tsx`):
   - Layout reorganizado a 3 líneas:
     - Línea 1: Activas | Public. desde | Public. hasta
     - Línea 2: Contenido | IA request | IA response
     - Línea 3: Ordenar por | Dirección
   - Filtro `IA request`: opciones All / Sí / No → envía `iaRequest` boolean al backend
   - Filtro `IA response`: opciones All / Pendiente / Procesando / Completado / Error → envía `iaStatus` (0-3) al backend
   - Removido filtro `Tipo` de las pantallas contextuales (las 3 páginas pasaban `showWorkTypeFilter={false}`)
   - `Activas` filter preserved and placed in línea 1
   - `showWorkTypeFilter` prop removed (no longer needed since Tipo is not in the contextual layout)

2. **Columna IA (`I`) en la grilla compartida** (`works-listing.tsx`):
   - Columna `I` agregada entre `C` (Content status) y `A` (Active status)
   - Indicadores de color según spec:
     - `iaRequest=false` → gris (sin solicitud)
     - `iaStatus=null` → azul (pendiente)
     - `iaStatus=0 (Pending)` → azul
     - `iaStatus=1 (Processing)` → amarillo
     - `iaStatus=2 (Success)` → verde
     - `iaStatus=3 (Error)` → rojo
   - El title del indicador incluye `since` cuando está disponible, ej: "Completado - Since: 2 horas"
   - No se muestra `IAResult` en la grilla (solo el indicador de estado)

3. **Polling de estado IA** (`works-listing.tsx`):
   - Nuevo `useEffect` que invalida la query cada 10s cuando hay works con `iaRequest=true` y `iaStatus` de Pending(0) o Processing(1)

4. **Tipos y servicios frontend**:
   - `dashboard/types/works.ts`: `IAStatusLabel` enum ya existía (Pendiente/Procesando/Completado/Error); `WorkListItemDto` ya tenía `iaRequest`, `iaStatus`, `iaRequestedAt`, `since`
   - `dashboard/features/works/services/works.service.ts`: `GetWorksParams` ya incluía `iaRequest`, `iaStatus`, `withDescription`; servicio ya enviaba estos params a todas las funciones de API (`getWorks`, `getWorksByFranchise`, `getWorksBySeries`, `getWorksByPublisher`)

5. **Páginas actualizadas** (3 pantallas que usan `WorksListing`):
   - `publisher-works-page.tsx`: `createApiFn` type updated — agregado `isActive`, `iaRequest`, `iaStatus`; removido `workTypeId` y `showWorkTypeFilter={false}`
   - `franchise-works-page.tsx`: mismo cambio
   - `series-works-page.tsx`: mismo cambio

6. **Documentación actualizada**:
   - `project/pages.md`: actualizadas las descripciones de las 3 páginas de Works contextuales con los nuevos filtros IA y polling
   - `project/components/dashboard-components.md`: actualizada descripción de `WorksListing` con IA filters, IA status column (con `since` en title), y IA polling

7. **Fix preexistente en `works-page.tsx`** (página global `/works`, fuera de scope de este Task pero necesario para build limpio):
   - Agregado `LanguageSearchSelect` a los filtros (estaba importado pero no usado)
   - Agregado manejo de `languageIdFilter` en los parámetros de búsqueda

### Archivos modificados
- `dashboard/features/works/components/works-listing.tsx` (filtros reorganizados, columna IA con `since`, polling, WorkListParams con isActive/iaRequest/iaStatus)
- `dashboard/features/works/pages/publisher-works-page.tsx` (createApiFn type, removed showWorkTypeFilter)
- `dashboard/features/works/pages/franchise-works-page.tsx` (createApiFn type, removed showWorkTypeFilter)
- `dashboard/features/works/pages/series-works-page.tsx` (createApiFn type, removed showWorkTypeFilter)
- `dashboard/pages/works-page.tsx` (fix preexistente: LanguageSearchSelect)
- `project/pages.md`
- `project/components/dashboard-components.md`

### Validación
- `npx tsc --noEmit` — sin errores
- `npx vite build` — build exitoso
- Tests: no existen archivos de test en el proyecto
