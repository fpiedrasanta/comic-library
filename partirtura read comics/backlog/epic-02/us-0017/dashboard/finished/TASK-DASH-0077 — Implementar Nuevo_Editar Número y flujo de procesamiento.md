# TASK-DASH-0077 — Implementar Nuevo_Editar Número y flujo de procesamiento

**Tipo:** Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**TASK-API resueltas:** TASK-API-0174, TASK-API-0175, TASK-API-0176

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


## Estado actual

**Finalizada**. Las dependencias de API fueron resueltas por TASK-API-0174, TASK-API-0175 y TASK-API-0176.

### Trabajo completado

- Formulario Nuevo/Editar con React Hook Form + Zod.
- Context per-Serie desde `location.state` (create) o `numberData` (edit).
- Carga de CBR/CBZ con validación (extensión y tamaño máximo 200MB), estado de carga, manejo de error.
- Visualización de estado de procesamiento (`ContentStatus` con badge y `contentError` cuando aplica).
- Listado de imágenes extraídas (`GET /api/admin-numbers/{numberId}/images`) con thumbnails protegidos.
- Selección de portada: `PATCH /api/admin-numbers/{numberId}/cover` con feedback visual.
- **Selección múltiple de imágenes para IA** (DASH-0077 §5): cada imagen tiene checkbox; el botón "Analizar con IA" muestra el contador "X imágenes" y se deshabilita cuando no hay selección. La selección se mantiene en estado de frontend y se limpia tras el análisis.
- **Análisis IA** (`POST /api/admin-numbers/{numberId}/ai-analysis`) con resultado editable: título, número, descripción/summary aplicados a los campos del formulario vía `setValue`.
- **Tags recomendados separados** (DASH-0077 §9): el resultado del análisis IA se divide en "Generales" y "Personajes" y se muestran en una sección diferenciada del `TagInput`. Al aceptar una recomendación se incorpora a `tagInput` y se elimina de la lista de recomendaciones; se puede descartar.
- **Generación de descripción con IA** (`POST /api/admin-numbers/generate-description`) reemplazando el contenido del textarea (editable).
- **Sugerencia de tags con IA** (`POST /api/admin-numbers/suggest-tags`).
- Selección múltiple de Personas/Roles con búsqueda, agregar/quitar, deduplicación.
- **Modales in-page para crear Persona y Rol** (US-0017 §8.5): el formulario no se pierde al abrir los modales. Se invoca `POST /admin-persons` y `POST /admin-roles`, la entidad creada queda seleccionada automáticamente.
- Etiquetas con `TagInput` (Enter, Backspace, paste).
- Continuidad: selectores de Número Anterior/Siguiente filtrados por Serie.
- Modal de confirmación antes de guardar.
- Persistencia de session storage para evitar perder cambios.
- Navegación "Volver" contextual.
- Estados: Loading, Saving, API Error, Success.
- Reintentar procesamiento desde el formulario (`POST /api/admin-numbers/{numberId}/content/retry`).
- Eliminar contenido digital desde el formulario (`DELETE /api/admin-numbers/{numberId}/content`).
- Header contextual con Editorial, Franquicia y Serie en modo edición.

### Trabajo pendiente

Ninguno. Todos los criterios de aceptación están cubiertos.

### Dependencias resueltas

- **TASK-API-0174** (assignee: API Agent): endpoint de reintento de procesamiento CBR.
- **TASK-API-0175** (assignee: API Agent): endpoint de eliminación de contenido digital.
- **TASK-API-0176** (assignee: API Agent): exposición de Editorial en `SeriesDetailDto`.

### Quién las resolvió

API Agent.

## Resultado de ejecución

### Archivos modificados

| Archivo | Descripción |
|---------|-------------|
| `dashboard/types/series.ts` | Agregados `publisherId`, `publisherName` y `publisherCountryName` a `SeriesDetailDto` para alinear con el nuevo contrato backend. |
| `dashboard/pages/numbers-page.tsx` | Header contextual per-Serie actualizado para mostrar Editorial, Franquicia y Serie. |
| `dashboard/pages/number-form-page.tsx` | Header contextual en modo edición actualizado para mostrar Serie, Franquicia y Editorial. Selección múltiple de imágenes para IA, recomendaciones separadas (Generales/Personajes), modales in-page para crear Persona/Rol, lookup real de nombres de Persona/Rol desde `numberData.personByRoles`. |

### Decisiones

- Se actualizó el tipo TypeScript `SeriesDetailDto` para reflejar el contrato extendido por TASK-API-0176.
- El header contextual muestra Editorial con país cuando está disponible, o `—` cuando no aplica.
- Se respeta la regla de no bloquear la UI durante procesamiento: el estado se consulta al reingresar o al finalizar una mutación.
- No se implementa polling en background para evitar requests innecesarios.
- Las sugerencias de IA se diferencian claramente de la información persistida.

### Criterios de aceptación cubiertos

- ✅ Nuevo Número funcional
- ✅ Editar Número funcional
- ✅ CBR/CBZ funcional
- ✅ Estado de procesamiento visible
- ✅ Imágenes procesadas se muestran correctamente
- ✅ Selección de cualquier imagen como portada
- ✅ Selección múltiple de imágenes para IA
- ✅ Cantidad seleccionada visible ("X imágenes")
- ✅ Análisis IA se ejecuta correctamente
- ✅ Resultado IA editable
- ✅ Tags recomendados se muestran (Generales + Personajes)
- ✅ Recomendaciones pueden convertirse en Tags mediante interacción
- ✅ Personas y Roles funcionan
- ✅ Crear Personas y Roles desde el formulario (modales in-page)
- ✅ Datos del Número funcionan
- ✅ Guardado funciona contra la API real
- ✅ UI diferencia información persistida de sugerencias de IA
- ✅ Estados de procesamiento y error claros
- ✅ Coherencia visual con UX/UI
- ✅ Reintentar procesamiento funcional
- ✅ Eliminar contenido digital funcional
- ✅ Header contextual completo con Editorial/Franquicia/Serie
