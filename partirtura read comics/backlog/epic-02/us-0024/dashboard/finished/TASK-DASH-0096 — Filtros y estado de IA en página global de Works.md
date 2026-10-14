# TASK-DASH-0096 — Filtros y estado de IA en página global de Works

## Origen
TASK-DASH-0095 (completado) — Filtros y estado de IA en listados contextuales de Works
El usuario solicitó extensión a la página global `/works`.

## Objetivo

Actualizar la página global de Works (`/works`) para agregar filtros de IA y la columna de estado de IA en la grilla.

## Cambios

### 1. Filtros

Estado actual:

```text
Linea 1: Editorial | Franquicia | Serie | Tipo | Idioma | Activas | Contenido
Linea 2: Public. desde | Public. hasta | Subido desde | Subido hasta
Linea 3: Ordenar por | Dirección
```

Nuevo estado:

```text
Linea 1: Editorial | Franquicia | Serie | Tipo
Linea 2: Activas | Contenido | IA Request | IA Status
Linea 3: Public. desde | Public. hasta | Subido desde | Subido hasta
Linea 4: Ordenar por | Dirección
```

Opciones de `IA Status`:
- All
- Pending
- Processing
- Success
- Error

Opciones de `IA Request`:
- All
- Sí
- No

El filtro debe utilizar `IAStatus`.

### 2. Grilla

Agregar la columna `I` después de `C` y antes de `A`. Misma representación de colores que TASK-DASH-0095.

Columnas finales:

```text
Tipo | Título | Número | Ant. | Sig. | Subida | Pub | C | I | A | Acciones
```

### 3. Polling

Nuevo `useEffect` que invalida la query cada 10s cuando hay works con `iaRequest=true` y `iaStatus` de Pending(0) o Processing(1).

## Alcance

- Quitar `LanguageSearchSelect` de los filtros (no solicitado)
- Agregar filtros IA Request y IA Status
- Agregar columna IA a la grilla
- Agregar polling de IA status
- Mantener todos los filtros existentes (Editorial, Franquicia, Serie, Tipo, Activas, Contenido, fechas, ordenamiento)
- No modificar backend

## Documentación

Actualizar al finalizar:
- `project/pages.md`
- `project/components/dashboard-components.md`

## Validación

- La página `/works` muestra los filtros IA
- La grilla muestra la columna `I`
- Build sin errores

---

## Resultado de ejecución

### Estado: Completado (finished)

### Qué se implementó

1. **Filtros reorganizados en `works-page.tsx`** (`dashboard/pages/works-page.tsx`):
   - Layout reorganizado a 4 líneas:
     - Línea 1: Editorial | Franquicia | Serie | Tipo (4 items)
     - Línea 2: Activas | Contenido | IA Request | IA Status (4 items)
     - Línea 3: Public. desde | Public. hasta | Subido desde | Subido hasta (4 items)
     - Línea 4: Ordenar por | Dirección (2 items)
   - Removido `LanguageSearchSelect` (Idioma) de los filtros
   - Filtro `IA request`: opciones All/Sí/No → `iaRequest` boolean
   - Filtro `IA response`/`IA Status`: opciones All/Pendiente/Procesando/Completado/Error → `iaStatus` (0-3)
   - Agregado `IAStatusLabel` import y `IA_STATUS_OPTIONS` constant

2. **Columna IA (`I`) en la grilla** (`works-page.tsx`):
   - Columna `I` agregada entre `C` y `A`
   - Indicadores de color según spec:
     - `iaRequest=false` → gris (sin solicitud)
     - `iaStatus=null` → azul (pendiente)
     - `iaStatus=0 (Pending)` → azul
     - `iaStatus=1 (Processing)` → amarillo
     - `iaStatus=2 (Success)` → verde
     - `iaStatus=3 (Error)` → rojo
   - Title incluye `since` cuando está disponible: "Completado - Since: 2 horas"

3. **Polling de IA** (`works-page.tsx`):
   - Nuevo `useEffect` que invalida `['works']` query cada 10s cuando hay works con `iaRequest=true` y `iaStatus` de Pending(0) o Processing(1)

4. **Tipos y servicios frontend**:
   - `dashboard/types/works.ts`: `IAStatusLabel` importado desde types
   - `dashboard/features/works/services/works.service.ts`: `GetWorksParams` ya incluía `iaRequest`, `iaStatus` (ya existía del TASK-DASH-0095)

### Archivos modificados
- `dashboard/pages/works-page.tsx` (filtros reorganizados, columna IA, polling, IA params en queryParams)
- `project/pages.md` (actualizada descripción de página Works global)
- `project/components/dashboard-components.md` (actualizada descripción de WorksPage)

### Validación
- `npx tsc --noEmit` — sin errores
- `npx vite build` — build exitoso
- Tests: no existen archivos de test en el proyecto
