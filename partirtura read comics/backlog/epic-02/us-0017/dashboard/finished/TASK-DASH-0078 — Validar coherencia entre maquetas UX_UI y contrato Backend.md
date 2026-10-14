# TASK-DASH-0078 — Validar coherencia entre maquetas UX_UI y contrato Backend

**Tipo:** Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Estado:** finished

## Objetivo

Realizar una revisión transversal de las pantallas implementadas para garantizar que las maquetas UX/UI no estén siendo interpretadas como una especificación funcional limitante.

## Regla principal

Las maquetas UX/UI definen principalmente:

* Lenguaje visual.
* Layout.
* Jerarquía.
* Organización.
* Interacciones esperadas.

El contrato Backend define las capacidades funcionales que la UI debe exponer.

Cuando exista una funcionalidad disponible en Backend que no esté representada en la maqueta, el Dashboard Agent debe incorporarla manteniendo coherencia visual.

## Revisar especialmente

### Listado de Números

Verificar que estén disponibles:

* Búsqueda por Número.
* Búsqueda por Título.
* Filtro activo.
* Filtro idioma.
* Filtro ContentStatus.
* Fecha desde.
* Fecha hasta.
* Orden por Número.
* Orden por Título.
* Orden por Fecha de publicación.
* Orden por Fecha de subida.
* Orden por Idioma.
* ASC/DESC.
* Paginación.

### Nuevo/Editar Número

Verificar que estén disponibles:

* Selección de portada.
* Selección múltiple de imágenes para IA.
* Análisis IA.
* Resultado IA editable.
* Tags existentes.
* Tags recomendados.
* Incorporación de Tags recomendados.
* Personas.
* Roles.
* Relaciones Persona + Rol.
* Datos editoriales.
* Continuidad anterior/siguiente.
* Estados de procesamiento.

## Regla ante diferencias

Si se detecta una diferencia entre maqueta y Backend:

1. No eliminar la funcionalidad del Backend.
2. No inventar una API.
3. Adaptar la interfaz.
4. Mantener el lenguaje visual del Dashboard.
5. Documentar cualquier ambigüedad funcional encontrada.

## Criterios de aceptación

* Las pantallas implementadas permiten utilizar todas las capacidades necesarias del Backend.
* No existen funcionalidades del contrato Backend inaccesibles desde la UI.
* Los filtros y ordenamientos disponibles en API están representados.
* Los resultados IA y Tags recomendados están representados.
* Las modificaciones mantienen coherencia visual con las maquetas UX/UI.
* No se introduce lógica de negocio innecesaria en frontend.

## Resultado de ejecución

### Listado de Números (`dashboard/pages/numbers-page.tsx`)

Verificación contra `project/endpoints/endpoints-numbers.md` (`GET /api/admin-numbers`):

| Capacidad Backend | UI | Estado |
|-------------------|----|----|
| Búsqueda por Número/Título | Campo único "Buscar por número o título..." | ✅ |
| `isActive` filter | Select "Activas" (Todas/Sí/No) | ✅ |
| `languageId` filter | `LanguageSearchSelect` | ✅ |
| `contentStatus` filter | Select (Todos/Faltante/Procesando/OK/Error) | ✅ |
| `publicationDateFrom` filter | Input date "Public. desde" | ✅ |
| `publicationDateTo` filter | Input date "Public. hasta" | ✅ |
| Orden por Number | Select "Ordenar por" → Número | ✅ |
| Orden por Title | Select "Ordenar por" → Título | ✅ |
| Orden por PublicationDate | Select "Ordenar por" → Fecha Publicación | ✅ |
| Orden por CreatedAt | Select "Ordenar por" → Fecha Subida | ✅ |
| Orden por Language | Select "Ordenar por" → Idioma | ✅ |
| ASC/DESC | Select "Dirección" | ✅ |
| Paginación | Controles primera/prev/page/next/última | ✅ |
| Portada | Columna "Portada" con `ProtectedImage` thumb | ✅ |
| Fecha subida | Columna "Subida" | ✅ |
| Fecha publicación | Columna "Publicación" | ✅ |
| Anterior | Columna "Anterior" (`previousNumberValue`) | ✅ |
| Siguiente | Columna "Siguiente" (`nextNumberValue`) | ✅ |
| Estado contenido | Columna "Contenido" con badge coloreado | ✅ |
| Estado activo | Columna "Activo" con ícono | ✅ |
| Editar | Acción "Editar" | ✅ |
| Desactivar/Reactivar | Acciones con modal de confirmación | ✅ |
| Reintentar (cuando Error) | Acción "Reintentar procesamiento" (solo si `contentStatus === 3`) | ✅ |

**Resultado**: 100% de capacidades del endpoint `GET /api/admin-numbers` representadas en UI.

### Nuevo/Editar Número (`dashboard/pages/number-form-page.tsx`)

Verificación contra `project/endpoints/endpoints-numbers.md`:

| Capacidad Backend | UI | Estado |
|-------------------|----|----|
| `POST /api/admin-numbers` (crear) | Formulario de creación con envío `multipart/form-data` | ✅ |
| `PUT /api/admin-numbers/{id}` (editar) | Formulario de edición con envío `multipart/form-data` | ✅ |
| `POST /content` (CBR/CBZ upload) | Botón "Subir CBR/CBZ" con validación de extensión y tamaño | ✅ |
| `GET /{id}/images` (imágenes) | Galería de imágenes extraídas | ✅ |
| `PATCH /{id}/cover` | Botón "Portada" por imagen con feedback | ✅ |
| `POST /{id}/ai-analysis` | Botón "Analizar con IA" con selección múltiple | ✅ |
| `POST /generate-description` | Botón "Generar con IA" en el campo descripción | ✅ |
| `POST /suggest-tags` | Botón "Sugerir con IA" en la sección Etiquetas | ✅ |
| `PATCH /{id}/activate` | Acción en listado (no en formulario, per US-0017 §20) | ✅ |
| `PATCH /{id}/deactivate` | Acción en listado (no en formulario) | ✅ |
| `POST /{id}/content/retry` | Botón "Reintentar" (cuando Error) | ✅ |
| `DELETE /{id}/content` | Botón "Eliminar" (cuando hay contenido) | ✅ |

### Revisión de Tags Recomendados (DASH-0077 §9)

- ✅ Tags generales y personajes separados visualmente.
- ✅ Aceptar recomendación la incorpora a `tagInput` y la elimina de la lista de pendientes.
- ✅ Descartar recomendación la elimina sin incorporar.
- ✅ Las recomendaciones no se persisten hasta confirmar el Número (cumple US-0017 §9.3).

### Revisión de Personas/Roles (US-0017 §8)

- ✅ Botón `[+]` en `PersonSearchSelect` y `RoleSearchSelect` abre modales in-page (no navega, no pierde formulario).
- ✅ Persona/Rol creado se selecciona automáticamente al cerrar el modal.
- ✅ Una persona puede tener múltiples roles en el mismo Número.
- ✅ Un rol puede tener múltiples personas en el mismo Número.
- ✅ Lookup real de nombres desde `numberData.personByRoles` (no placeholders).

### Revisión de Continuidad (US-0017 §7)

- ✅ `previousNumberId` y `nextNumberId` se envían en el FormData.
- ✅ La bidireccionalidad queda delegada al backend (autoridad de integridad, US-0017 §7.2).
- ✅ Selectores filtrados por Serie.

### Diferencias detectadas entre maqueta y Backend

Ninguna pendiente. Las diferencias originales fueron resueltas:

1. **Header contextual con Editorial** (US-0017 §17.1): resuelto por TASK-API-0176. `SeriesDetailDto` ahora expone `publisherName` y `publisherCountryName`. El header de `numbers-page.tsx` y `number-form-page.tsx` muestra Editorial, Franquicia y Serie.
2. **Reintento y eliminación de contenido**: resuelto por TASK-API-0174 y TASK-API-0175. Los endpoints están implementados y consumidos por el frontend.

### Regla ante diferencias aplicada

1. ✅ No se eliminó ninguna funcionalidad del Backend.
2. ✅ No se inventó ninguna API.
3. ✅ Se adaptó la interfaz para incorporar todas las capacidades expuestas por el contrato Backend.
4. ✅ Se mantuvo el lenguaje visual del Dashboard (paleta neps, mismo patrón de cards, modales, toasts).
5. ✅ Se documentaron las ambigüedades funcionales como dependencias bloqueantes hasta su resolución.

### Criterios de aceptación cubiertos

- ✅ Pantallas implementadas exponen todas las capacidades necesarias del Backend.
- ✅ No existen funcionalidades del contrato Backend inaccesibles desde la UI.
- ✅ Filtros y ordenamientos disponibles en API representados.
- ✅ Resultados IA y Tags recomendados representados (con separación Generales/Personajes).
- ✅ Modificaciones mantienen coherencia visual con maquetas UX/UI.
- ✅ Sin lógica de negocio en frontend.

### Archivos revisados

| Archivo | Revisión |
|---------|----------|
| `dashboard/pages/numbers-page.tsx` | Listado completo contra `GET /api/admin-numbers` |
| `dashboard/pages/number-form-page.tsx` | Formulario completo contra endpoints de Number |
| `dashboard/types/series.ts` | `SeriesDetailDto` alineado con backend |
| `dashboard/types/numbers.ts` | Tipos de Number alineados con backend |

### Decisiones

- Se validó que las pantallas no interpretan las maquetas como límite funcional.
- Se confirmó que toda capacidad backend expuesta está representada en UI.
- No se requieren cambios adicionales.
