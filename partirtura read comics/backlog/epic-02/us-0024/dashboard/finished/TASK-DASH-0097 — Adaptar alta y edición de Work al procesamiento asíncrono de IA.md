# TASK-DASH-0097 — Adaptar alta y edición de Work al procesamiento asíncrono de IA

## Objetivo

Adaptar el formulario de alta/edición de Works al nuevo procesamiento asíncrono de IA mediante Hangfire.

El Dashboard debe:

1. Solicitar el análisis de IA.
2. Recibir `200 OK` inmediatamente.
3. Volver a la grilla de Works.
4. Permitir consultar posteriormente el resultado de IA desde la edición del Work.
5. Mantener la experiencia actual de edición asistida por IA cuando exista una respuesta.

## Flujo actual

1. Se realiza `POST` para subir el CBR y crear el Work con un título temporal.
2. `ContentStatus` comienza en `Missing`.
3. Hangfire procesa el contenido:

   * `Missing`
   * `Processing`
   * `Completed`
4. Se entra a editar el Work.
5. Se seleccionan páginas.
6. Se solicita análisis de IA.
7. Actualmente el frontend espera la respuesta del análisis y permanece en el formulario.

## Nuevo flujo

### Solicitud de IA

Desde la edición del Work:

1. El usuario selecciona las páginas.
2. Ejecuta **Analizar con IA**.
3. El Dashboard realiza:

```http
POST /api/admin-works/{workId}/ai-analysis
```

4. Si recibe `200 OK`:

   * No espera ni procesa un resultado de IA.
   * Navega inmediatamente a la grilla de Works.
5. La grilla mostrará el estado de IA mediante la columna `I`.

El endpoint es asíncrono: `200 OK` significa que la solicitud fue aceptada y el procesamiento continuará en background.

### Resultado de IA

Cuando Hangfire termina correctamente:

```text
IAStatus = Success
IAResult = resultado normalizado
```

Al volver a entrar en edición del Work, el Dashboard debe obtener el detalle del Work y utilizar `IAResult` para mostrar **la misma información y experiencia que mostraba anteriormente cuando el análisis era síncrono**.

No cambiar la funcionalidad existente de presentación/aplicación de las sugerencias de IA salvo lo necesario para adaptarla al nuevo contrato.

## Estados

El frontend debe respetar:

```text
IARequest = false
IAStatus = null
→ sin solicitud

IARequest = true
IAStatus = Pending
→ solicitado, esperando procesamiento

IARequest = true
IAStatus = Processing
→ procesando

IARequest = true
IAStatus = Success
→ resultado disponible

IARequest = true
IAStatus = Error
→ procesamiento fallido
```

### Edición

Al cargar el formulario:

* `IAStatus = Success` + `IAResult` disponible → mostrar la información de IA como antes.
* `IAStatus = Pending` → no intentar mostrar un resultado inexistente.
* `IAStatus = Processing` → no intentar mostrar un resultado inexistente.
* `IAStatus = Error` → no mostrar un resultado de IA inexistente.
* `IAStatus = null` → comportamiento actual para una obra sin solicitud de IA.

## Restricciones

* No modificar backend.
* No realizar polling de Hangfire.
* No esperar el resultado de IA después del `POST`.
* No mostrar `IAResult` en la grilla.
* No modificar la lógica de procesamiento de CBR/Content.
* No modificar las reglas de negocio de IA.
* Reutilizar los componentes existentes siempre que sea posible.
* Mantener la funcionalidad existente del formulario de Work.
* La respuesta de IA nunca modifica automáticamente los campos definitivos del Work.

## Documentación

Actualizar:

* `project/pages.md`
* `project/components.md`

Documentar el nuevo flujo de solicitud asíncrona de IA y el comportamiento del formulario según `IAStatus`.

## Validación

Verificar:

* Alta de Work continúa funcionando.
* El procesamiento de Content continúa funcionando.
* El formulario permite seleccionar páginas y solicitar IA.
* `POST /ai-analysis` se ejecuta correctamente.
* Con `200 OK`, el usuario vuelve inmediatamente a la grilla.
* La grilla muestra el estado correspondiente en `I`.
* No se espera una respuesta `ComicAnalysisResult` del POST.
* Un Work con `IAStatus = Success` carga correctamente `IAResult`.
* La información de IA se muestra igual que antes.
* `Pending`, `Processing` y `Error` no intentan utilizar `IAResult`.
* No se realizan modificaciones automáticas de los campos definitivos a partir de `IAResult`.
* Build sin errores.
* Tests existentes pasan.


## Resumen

Se adaptó el formulario de alta/edición de Works al procesamiento asíncrono de IA mediante Hangfire.

## Cambios

### Servicio: `analyzeWorkWithAi`
- Modificado para retornar `Promise<void>` en lugar de `Promise<ComicAnalysisResult>`.
- El endpoint `POST /api/admin-works/{workId}/ai-analysis` retorna `200 OK` con `payload: null` (solicitud encolada, procesamiento async).
- Removido `ComicAnalysisResult` del import del servicio (ya no se usa para este endpoint).

### Página de formulario: `work-form-page.tsx`
- **`handleAnalyzeWithAi`**: No espera el resultado de IA. En su lugar:
  1. Llama al endpoint que encola el job de Hangfire.
  2. En `200 OK`: invalida queries (`work`, `works`, `publisher-works`, `franchise-works`, `series-works`, `work-lists`), muestra toast de éxito, y navega inmediatamente a la grilla de Works.
- **Carga de resultados de IA al editar**: En el `useEffect` que carga `workData`, cuando `IAStatus = 2` (Success) y `iaResult` está disponible:
  - Carga `iaResult` en `lastAiResult` (para que `WorkAiResultsSection` muestre la información).
  - Popula todos los estados de sugerencias: `aiSuggestedNumberValue`, `aiSuggestedTitle`, `aiSuggestedDescription`, `recommendedPublicationDate`, `recommendedGeneralTags`, `recommendedCharacters`, `recommendedWriters`, `recommendedArtists`, `recommendedInkers`.
  - Los filtros usan `workData.personByRoles` y `workData.tags` directamente (no state) para evitar problemas de timing con React batching.
- **Reseteo de sugerencias**: Cuando `IAStatus` no es Success o no hay `iaResult` (Pending, Processing, Error, null), se limpian todos los estados de sugerencias y `lastAiResult` se setea a `null`.

## Estados respetados

| IARequest | IAStatus | Comportamiento en formulario |
|-----------|----------|------------------------------|
| false | null | Sin solicitud — comportamiento normal (sin sección de IA) |
| true | 0 (Pending) | No se muestra resultado de IA |
| true | 1 (Processing) | No se muestra resultado de IA |
| true | 2 (Success) | Se muestra `IAResult` y sugerencias como antes |
| true | 3 (Error) | No se muestra resultado de IA |

## Restricciones cumplidas

- [x] No modificar backend
- [x] No realizar polling de Hangfire
- [x] No esperar el resultado de IA después del POST
- [x] No mostrar `IAResult` en la grilla
- [x] No modificar lógica de procesamiento de CBR/Content
- [x] Reutilizar componentes existentes (`WorkAiResultsSection`, `WorkForm`)
- [x] Mantener funcionalidad existente del formulario
- [x] La respuesta de IA nunca modifica automáticamente los campos definitivos

## Validación

- [x] TypeScript: `tsc --noEmit` pasa sin errores
- [x] Build: `vite build` pasa sin errores

## Nota sobre `IARequest` en listados

El backend `WorkListItemDto` incluye `bool IARequest` (agregado en `MapWork()` con `IARequest: work.IARequest`). El frontend utiliza `work.iaRequest` directamente para los dots de estado en grilla y para el polling de IA.
