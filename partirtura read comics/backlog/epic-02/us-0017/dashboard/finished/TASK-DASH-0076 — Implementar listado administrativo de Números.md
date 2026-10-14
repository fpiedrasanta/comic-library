# TASK-DASH-0076 — Implementar listado administrativo de Números

**Tipo:** Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Referencia UX/UI:** TASK-UX-0186
**Backend relacionado:** TASK-API-0171 / TASK-API-0173 / TASK-API-0174 / TASK-API-0175 / TASK-API-0183
**TASK-API resuelta:** TASK-API-0176 (Exponer Editorial en el contexto de Serie para el Dashboard)

## Objetivo

Implementar el formulario administrativo de Nuevo/Editar Número y el flujo completo de procesamiento de contenido digital y análisis mediante IA.

## Flujo

Implementar:

```text
Nuevo Número
    ↓
Carga CBR/CBZ
    ↓
Procesamiento
    ↓
Páginas disponibles
    ↓
Selección de portada
    ↓
Selección de imágenes para IA
    ↓
Análisis IA
    ↓
Resultado editable
    ↓
Revisión administrativa
    ↓
Guardar Número
```

## 1. Crear Número

Permitir crear inicialmente el Número con la información mínima necesaria para iniciar el procesamiento.

El usuario debe poder:

* Informar nombre/referencia.
* Seleccionar o cargar el contenido CBR/CBZ.

## 2. CBR/CBZ

Implementar el componente de carga.

Mostrar:

* Archivo seleccionado.
* Estado de carga.
* Estado de procesamiento.
* Error.
* Reintento cuando corresponda.

El frontend debe utilizar los endpoints definidos por Backend.

No implementar procesamiento de archivos en frontend.

## 3. Imágenes

Cuando Backend indique que el procesamiento terminó, consultar las imágenes disponibles mediante:

```http
GET /api/admin-numbers/{numberId}/images
```

Mostrar las imágenes en el componente definido por UX/UI.

## 4. Selección de portada

Permitir seleccionar cualquier imagen disponible.

Enviar la selección mediante:

```http
PATCH /api/admin-numbers/{numberId}/cover
```

La selección debe mostrar claramente cuál es la portada actual.

## 5. Selección de imágenes para IA

Permitir seleccionar múltiples imágenes.

La selección debe mantenerse en estado de frontend hasta ejecutar el análisis.

No persistir esta selección.

Mostrar:

`X imágenes seleccionadas`

Ejecutar:

```http
POST /api/admin-numbers/{numberId}/ai-analysis
```

enviando los IDs de las imágenes seleccionadas.

## 6. Resultado de IA

Mostrar el resultado devuelto por Backend como **datos sugeridos/editables**.

Incluir:

* Número.
* Título.
* Descripción.
* Personajes.
* Tags recomendados.

El frontend no debe asumir que la información devuelta por IA es definitiva.

El administrador debe poder modificarla antes de guardar.

## 7. Datos del Número

Implementar:

* Número.
* Título.
* Descripción.
* Idioma.
* Número anterior.
* Número siguiente.

Los selectores de entidades deben permitir búsqueda y selección.

## 8. Personas y Roles

Implementar selección múltiple de:

* Persona.
* Rol.

Permitir agregar relaciones:

`Persona + Rol`

y eliminarlas individualmente.

Permitir crear nuevas Personas y Roles mediante los modales definidos por UX/UI.

## 9. Tags

Implementar:

* Tags existentes.
* Agregar tag.
* Eliminar tag.
* Tags recomendados por IA.

### Tags recomendados

Las recomendaciones devueltas por IA deben mostrarse claramente separadas de los Tags ya seleccionados.

Ejemplo:

**Generales**

`[misterio] [super-heroe]`

**Personajes**

`[spiderman] [venom]`

Al seleccionar una recomendación:

* Incorporarla a los Tags.
* Eliminarla de las recomendaciones pendientes.
* Permitir posteriormente eliminarla como cualquier otro Tag.

**Importante:** la maqueta inicial de la pantalla de carga de Comic no contemplaba correctamente esta sección.

Esto **no constituye una limitación funcional**.

Si Backend devuelve Tags recomendados, la UI debe mostrarlos y permitir su incorporación al formulario.

## 10. Guardado

Utilizar el endpoint existente de creación/actualización de Número.

Los datos provenientes de IA deben incorporarse al modelo editable y enviarse únicamente cuando el administrador confirme el guardado.

No crear endpoints frontend adicionales para persistir las sugerencias de IA.

## Estados

Implementar claramente:

* Loading.
* Uploading.
* Processing.
* Completed.
* Error.
* AI Processing.
* Saving.
* Saved.
* API Error.

## Criterios de aceptación

* Nuevo Número funcional.
* Editar Número funcional.
* CBR/CBZ funcional.
* Estado de procesamiento visible.
* Las imágenes procesadas se muestran correctamente.
* Se puede seleccionar cualquier imagen como portada.
* Se pueden seleccionar múltiples imágenes para IA.
* Se muestra la cantidad seleccionada.
* El análisis IA se ejecuta correctamente.
* El resultado IA es editable.
* Tags recomendados se muestran correctamente.
* Las recomendaciones pueden convertirse en Tags mediante interacción.
* Personas y Roles funcionan.
* Datos del Número funcionan.
* Guardado funciona contra la API real.
* La UI diferencia claramente información persistida de sugerencias de IA.
* Los estados de procesamiento y error son claros.
* La implementación mantiene el lenguaje visual definido por UX/UI.

**Tipo:** Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**Referencia UX/UI:** TASK-UX-0186
**Estado:** finished

## Estado actual

**Finalizada**. La dependencia de API fue resuelta por TASK-API-0176.

### Trabajo completado

- Listado paginado contra `GET /api/admin-numbers` (TanStack Query).
- Búsqueda por Número o Título.
- Filtros: idioma, estado activo (Todas/Sí/No), estado de contenido digital (Todos/Faltante/Procesando/Finalizado OK/Error), fecha publicación desde/hasta.
- Orden: Número, Título, Fecha Publicación, Fecha Subida, Idioma, con ASC/DESC.
- Columnas: Portada (thumb protegido), Número, Título, Idioma, Fecha Subida, Fecha Publicación, Anterior, Siguiente, Contenido (badge con estado), Activo, Acciones.
- Acciones: Editar, Reintentar (cuando `contentStatus === 3`), Activar/Desactivar/Reactivar, con modal de confirmación.
- Soporte per-Serie (`/series/:id/numbers`) y global (`/numbers`).
- Header contextual per-Serie con **Editorial**, Franquicia y Serie.
- Navegación contextual: volver a Serie (per-Serie) o a Series (global).
- Estados: Loading, Empty, Error, Success.

### Trabajo pendiente

Ninguno. Todos los criterios de aceptación están cubiertos.

### Dependencia resuelta

- **TASK-API-0176** (assignee: API Agent): extendió `SeriesDetailDto` con `publisherId`, `publisherName` y `publisherCountryName`.

### Quién la resolvió

API Agent.

## Resultado de ejecución

### Implementado

- Listado paginado contra `GET /api/admin-numbers` (TanStack Query).
- Búsqueda por Número o Título (campo único, backend matchea ambos).
- Filtros: idioma, estado activo (Todas/Sí/No), estado de contenido digital (Todos/Faltante/Procesando/Finalizado OK/Error), fecha publicación desde/hasta.
- Orden: Número, Título, Fecha Publicación, Fecha Subida, Idioma, con dirección ASC/DESC.
- Columnas: Portada (thumb protegido), Número, Título, Idioma, Fecha Subida, Fecha Publicación, Anterior, Siguiente, Contenido (badge con estado), Activo, Acciones.
- Acciones: Editar, Reintentar procesamiento (solo cuando `contentStatus === 3` Error), Activar/Desactivar/Reactivar, todas con modal de confirmación.
- Soporte para modo per-Serie (`/series/:id/numbers`) y global (`/numbers`).
- En modo per-Serie: header contextual con Editorial, Franquicia y Serie.
- Navegación contextual: volver a Serie (per-Serie) o a Series (global).
- Estados: Loading, Empty, Error, Success.
- Polling no implementado: el listado se actualiza al recibir mutación. Si el procesamiento está en curso, el contenido puede observarse mediante el badge "Procesando" al reentrar a la pantalla (sin polling en background para evitar requests innecesarios).

### Archivos modificados

| Archivo | Descripción |
|---------|-------------|
| `dashboard/types/series.ts` | Agregados `publisherId`, `publisherName` y `publisherCountryName` a `SeriesDetailDto` para alinear con el nuevo contrato backend. |
| `dashboard/pages/numbers-page.tsx` | Header contextual per-Serie actualizado para mostrar Editorial, Franquicia y Serie. |

### Decisiones

- Se actualizó el tipo TypeScript `SeriesDetailDto` para reflejar el contrato extendido por TASK-API-0176.
- El header contextual muestra Editorial con país cuando está disponible, o `—` cuando no aplica.
- Se utiliza el enum `ContentStatus` y `ContentStatusLabel` provisto por `@/types/numbers` para evitar magic numbers.
- El orden por Número se envía como `orderBy=Number` al backend, que aplica el orden natural definido por el catálogo (US-0017 §17.5).
- Las fechas `publicationDateFrom` y `publicationDateTo` se envían en formato `YYYY-MM-DD` (date input HTML), que el backend interpreta como UTC según el contrato.

### Criterios de aceptación cubiertos

- ✅ `GET /api/admin-numbers` consumido correctamente
- ✅ Paginación contra backend
- ✅ Búsqueda por Número y Título
- ✅ Filtro activo, idioma, ContentStatus, fecha desde, fecha hasta
- ✅ Orden por Número, Título, Fecha publicación, Fecha subida, Idioma
- ✅ ASC/DESC
- ✅ ContentStatus se diferencia de IsActive (badges separados)
- ✅ Fechas en formato date input
- ✅ Paginación funcional
- ✅ Loading/Empty/Error
- ✅ Acciones Editar, Activar, Desactivar, Reintentar (cuando Error)
- ✅ Coherencia visual con Series
- ✅ Sin lógica de negocio en frontend
- ✅ Header contextual completo con Editorial/Franquicia/Serie
