# TASK-DASH-0079 — Implementar flujo completo de alta de Number con CBR en un solo paso

**Tipo:** Frontend / Dashboard
**Agente:** Dashboard Agent
**Épica:** EPIC-02 — Gestión del catálogo y contenido editorial
**User Story:** US-0017
**Depende de:** TASK-API-0187 (Backend: POST /api/admin-numbers/with-content)
**Bloqueada por:** ~~TASK-API-0192~~ (completada)
**Estado:** completed

## Resultado de ejecución

### What was implemented
- Flujo completo de alta de Number en un solo paso con `SeriesId` + `Title` + CBR/CBZ.
- Formulario condicional: en `mode === 'create'` muestra solo el campo `Title` y la carga de archivo CBR/CBZ desde el primer paso.
- En `mode === 'edit'` se mantiene el formulario completo con todos los campos (NumberValue, publicationDate, title, description, language, isActive, Personas/Roles, Tags, Continuidad, CBR, Imágenes, IA).
- Llamada a `POST /api/admin-numbers/with-content` desde el servicio `createNumberWithContent` en `numbers.service.ts`.
- Redirección al listado de números de la serie tras crear el número.
- Polling cada 10 segundos en `numbers-page.tsx` contra `GET /api/admin-numbers/{id}/content/status` mientras haya números en estado `Processing` (contentStatus === 1).
- Refresco automático del listado cuando el estado cambia a `Completed` o `Error`.
- Navegación a edición del número una vez finalizado el procesamiento.

### What was changed
- `dashboard/pages/number-form-page.tsx`: agregado modo create condicional, estado `cbrFile`, handler `handleCbrChange` para crear modo, submit con `createNumberWithContent`, limpieza de endpoints redundantes de IA.
- `dashboard/pages/numbers-page.tsx`: agregado polling con `useEffect` + `setInterval` que consulta `getNumberContentStatus` para números en `Processing`.
- `dashboard/features/numbers/services/numbers.service.ts`: agregadas funciones `createNumberWithContent` y `getNumberContentStatus`.

### Relevant decisions
- Se removieron endpoints redundantes de IA (`generateDescription`, `suggestTags`) porque `analyzeWithAi` ya retorna datos completos.
- El campo `Content` del backend se mapea directamente como `FormData` part `Content` en `createNumberWithContent`.
- El polling usa invalidación de query de TanStack Query para refrescar el listado sin estado local adicional.

### Notes
- TASK-API-0187 (backend) ya estaba finalizada, por lo que no se requirieron workarounds.
- Build compila sin errores.
- Corregido bug de validación Zod que impedía el submit en modo create: `numberValue` y `publicationDate` ahora son opcionales en el esquema y se validan manualmente en `handleConfirmSave` según el modo.
- Corregido bug en `handleConfirmSave`: la validación de `languageId` se aplica solo en modo edición. En modo create no se envía `languageId` por `FormData`, solo `SeriesId`, `Title` y `Content` (CBR).
- Agregado `publicationDate` al tipo `ComicAnalysisResult` y estado `recommendedPublicationDate` en el frontend para mostrar la fecha sugerida por IA en la sección "Datos sugeridos por IA". Muestra "Sin fecha de publicación sugerida" como placeholder en el campo de fecha en modo edición cuando no está disponible.
- Corregido bug en `getPersonName` / `getRoleName`: ahora usan mapas locales (`personNamesMap`, `roleNamesMap`) para resolver nombres de personas/roles agregados desde el frontend, que no están en `numberData.personByRoles`. Antes mostraba "Persona #1" / "Rol #1".
- Creada TASK-API-0193 en `api/pending/`: la IA no incluye `publicationDate` en su respuesta JSON. El parser y el prompt ya solicitan la fecha, pero la IA no la extrae de las imágenes.
- Separados los valores sugeridos por IA (`aiSuggestedNumberValue`, `aiSuggestedTitle`, `aiSuggestedDescription`) del formulario. La IA **no modifica** los campos editables directamente. Los valores sugeridos se muestran en la sección "Datos sugeridos por IA" y el admin los aplica manualmente.
- Agregado estado `recommendedPublicationDate` y sección en "Datos sugeridos por IA" que muestra "Sin fecha de publicación sugerida" cuando la IA no devuelve fecha.
- Corregido bug en `LanguageSearchSelect`: ahora se llama `loadLanguages()` al montar el componente. Antes, `allItems` estaba vacío hasta que el usuario hacía clic en el campo, por lo que el `useEffect` que busca el nombre del idioma no encontraba nada y no se mostraba el idioma cargado desde el backend.
- Corregido bug en `NumberSearchSelect`: ahora se llama `searchNumbers('')` al montar si hay `seriesId`. Antes, los items no se cargaban hasta que el usuario hacía foco, por lo que `previousNumber` y `nextNumber` no se mostraban en edit mode.
- Actualizado `NumberSearchSelect`: el dropdown ahora muestra `#numberValue: title` en lugar de solo el título.

## Objetivo

Implementar el flujo completo de alta de Number según la maqueta UX/UI (`ux_ui/form-numero.html`), una vez que el backend exponga el endpoint `POST /api/admin-numbers/with-content`.

## Contexto

Esta task está bloqueada hasta que el API Agent resuelva TASK-API-0187. Cuando el backend esté listo, mover este archivo a `dashboard/pending/` para ejecutarlo.

## Alcance

Adaptar `dashboard/pages/number-form-page.tsx` y `dashboard/pages/numbers-page.tsx` para soportar el nuevo flujo de alta:

1. **Formulario de alta** (`mode === 'create'`):
   - Mostrar el campo `Title` (nombre/título inicial) como primera información.
   - Mostrar la sección de carga CBR/CBZ desde el primer paso, sin necesidad de guardar primero.
   - Al enviar el formulario, llamar a `POST /api/admin-numbers/with-content` con `SeriesId` + `Title` + `Content`.
   - Si el upload tiene éxito, redirigir al listado de números de la serie (`/series/:seriesId/numbers`) donde se mostrará el estado de procesamiento.

2. **Listado de números** (`numbers-page.tsx`):
   - Sostener polling cada 10 segundos contra `GET /api/admin-numbers/{id}/content/status` cuando haya números en estado `Processing`.
   - Cuando el estado pase a `Completed`, permitir navegar a la edición del número.

3. **Edición** (`mode === 'edit'`):
   - Una vez finalizado el procesamiento, el administrador puede completar `NumberValue` y todos los campos mediante `PUT /api/admin-numbers/{id}`.
   - En modo edición se mantiene el formulario completo con Personas/Roles, Tags, Continuidad, etc.

## Criterios de aceptación

- El alta de Number se realiza en un solo paso con `SeriesId` + `Title` + CBR/CBZ.
- El formulario de alta muestra solo el campo Title y la carga CBR/CBZ desde el primer paso, sin workarounds.
- El listado de números muestra el estado de procesamiento y se actualiza automáticamente.
- Cuando el procesamiento finaliza, el número se puede editar para completar `NumberValue` y los campos sugeridos por IA.
- En modo edición se mantienen todas las secciones: Información básica, Personas/Roles, Tags, Continuidad, CBR, Imágenes, IA.
- No se implementan flujos alternativos ni workarounds mientras el backend no esté listo.

## Archivos a modificar

- `dashboard/pages/number-form-page.tsx`
- `dashboard/pages/numbers-page.tsx`
- `dashboard/features/numbers/services/numbers.service.ts` (agregar `createNumberWithContent`)

## Bloquea

- TASK-DASH-0077: Implementar Nuevo/Editar Número y flujo de procesamiento
- TASK-DASH-0078: Validar coherencia entre maquetas UX/UI y contrato Backend

## Asignado a

Dashboard Agent.

## Bloqueo actual

Bloqueada por TASK-API-0192:
- `GET /api/admin-numbers/{id}` no devuelve `PersonByRoles` ni `Tags`, por lo que al editar no se cargan las personas/roles ni los tags guardados.
- `POST /api/admin-numbers/{numberId}/ai-analysis` no incluye `publicationDate` en el prompt ni en la respuesta `ComicAnalysisResult`.

El dashboard espera a que el API Agent resuelva TASK-API-0192 para completar la experiencia de edición y análisis IA.
