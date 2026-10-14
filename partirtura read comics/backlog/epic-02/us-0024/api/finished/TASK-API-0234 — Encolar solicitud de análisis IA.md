# TASK-API-0234 — Encolar solicitud de análisis IA

## Objetivo

Modificar el endpoint de análisis IA de `Work` para que deje de ejecutar el análisis de forma síncrona.

La request debe:

1. Validar la solicitud.
2. Registrar que el análisis IA fue solicitado.
3. Limpiar una respuesta IA anterior.
4. Encolar el procesamiento mediante Hangfire.
5. Responder inmediatamente con HTTP `200`.

El análisis propiamente dicho será ejecutado por el Worker implementado en `TASK-API-0233`.

---

## Endpoint

Mantener el endpoint existente:

```text
POST /api/admin-works/{workId}/ai-analysis
```

Mantener:

* autorización existente;
* rate limiting existente;
* contrato de entrada `AnalyzeComicRequest`.

La request continúa recibiendo los `ImageIds` seleccionados por el usuario.

---

## Flujo

### 1. Validación

Mantener las validaciones existentes:

* `workId` válido;
* `ImageIds` no nulo;
* al menos una imagen seleccionada;
* `Work` existente;
* las imágenes seleccionadas pertenecen al contenido de la `Work`.

La validación debe realizarse antes de modificar el estado de la obra o crear el Job.

---

### 2. Registrar solicitud

Cuando la validación sea correcta:

```text
IARequest = true
IAResponse = null
```

Esto debe aplicarse también cuando ya existía una respuesta IA.

Por lo tanto, una nueva solicitud representa un nuevo análisis y descarta la respuesta anterior.

---

### 3. Encolar Job

Crear un Job Hangfire para el Worker implementado en `TASK-API-0233`.

El Job debe recibir:

```text
WorkId
ImageIds
```

No ejecutar el análisis IA dentro de la request.

No enviar bytes de imágenes ni entidades EF como argumentos.

---

### 4. Respuesta HTTP

Una vez registrada la solicitud y creado el Job, responder:

```text
HTTP 200 OK
```

La respuesta debe indicar que el análisis fue solicitado/programado.

No esperar el resultado del proveedor IA.

No devolver `ComicAnalysisResult` en esta request.

---

## Reanálisis

El mismo endpoint debe permitir solicitar nuevamente el análisis de una Work que ya tenga:

```text
IARequest = true
IAResponse = JSON
```

En ese caso:

```text
IARequest = true
IAResponse = null
```

y se debe crear un nuevo Job con los `ImageIds` recibidos.

La respuesta IA anterior no debe conservarse mientras se procesa el nuevo análisis.

---

## Persistencia y Job

El estado de la Work debe persistirse antes de que el procesamiento asíncrono dependa de él.

El Job debe poder recuperar posteriormente:

* `Work`;
* imágenes;
* archivos físicos;

utilizando los identificadores recibidos.

No depender de objetos creados durante la request.

---

## Documentación

Leer y actualizar:

```text id="7t8y0m"
project/endpoints.md
```

Documentar:

* endpoint `POST /api/admin-works/{workId}/ai-analysis`;
* parámetros de entrada;
* comportamiento asíncrono;
* HTTP `200`;
* cambio de `IARequest` / `IAResponse`;
* creación del Job Hangfire;
* comportamiento de reanálisis.

No modificar:

```text id="p4yq6x"
project/domain/domain.md
project/repositories.md
project/services.md
```

---

## Reglas

* No ejecutar `_aiService` desde el endpoint.
* No esperar el resultado del análisis.
* No devolver `ComicAnalysisResult`.
* No implementar aquí la lógica de retry.
* No implementar aquí la lógica del Worker.
* No cambiar el contrato de `AnalyzeComicRequest`.
* Mantener autorización y rate limiting existentes.
* Mantener la ruta actual `/api/admin-works/{workId}/ai-analysis`.
* No utilizar `202 Accepted`; el contrato de esta operación es HTTP `200 OK`.

---

## Criterios de aceptación

* [x] El endpoint continúa siendo `POST /api/admin-works/{workId}/ai-analysis`.
* [x] Las validaciones actuales continúan funcionando.
* [x] Una solicitud válida establece `IARequest = true`.
* [x] Una solicitud válida establece `IAResponse = null`.
* [x] Se crea un Job Hangfire con `WorkId` e `ImageIds`.
* [x] El endpoint no ejecuta el análisis IA.
* [x] El endpoint no espera al proveedor IA.
* [x] El endpoint responde HTTP `200 OK`.
* [x] Es posible solicitar nuevamente el análisis de una Work que ya tiene `IAResponse`.
* [x] Una nueva solicitud elimina la respuesta IA anterior.
* [x] Autorización y rate limiting existentes permanecen activos.
* [x] `project/endpoints.md` está actualizado.
* [x] El proyecto compila correctamente.
* [x] No se incorporaron cambios fuera del alcance de la task.

## Resultado esperado

El flujo HTTP queda reducido a:

```text
POST /api/admin-works/{workId}/ai-analysis
            │
            ├── Validar Work + ImageIds
            │
            ├── IARequest = true
            ├── IAResponse = null
            │
            ├── Encolar Hangfire Job
            │
            └── HTTP 200 OK
                    │
                    ▼
              Worker procesa IA
```

La respuesta del análisis será obtenida posteriormente por el Worker y persistida en `Work.IAResponse`.

## Resultado de la ejecución

### Qué se implementó

* **`IWorkService.EnqueueWorkAnalysisAsync`** + implementación en `WorkService`:
  - Valida `workId` y `ImageIds`
  - Verifica Work existe, está en `ContentStatus.Completed`, y las imágenes pertenecen a la obra
  - Verifica existencia de archivos físicos
  - Establece `IARequest = true` y `IAResponse = null` (limpia respuesta anterior)
  - Persiste cambios en BD
  - Encola Job Hangfire via `IBackgroundJobService.EnqueueWorkAnalysis(workId, imageIds)`
  - Retorna inmediatamente sin esperar resultado IA

* **`AdminWorkAIController.AnalyzeWork`** — endpoint `POST /api/admin-works/{workId}/ai-analysis`:
  - Mantiene autorización `[Authorize(Roles = Administrator)]` y rate limiting `[EnableRateLimiting(AdminAiAnalysis)]`
  - Llama a `WorkService.EnqueueWorkAnalysisAsync`
  - Responde `200 OK` con `ApiResponse<object>` (payload null)
  - No ejecuta análisis IA, no espera proveedor IA

* **Documentación** en `project/endpoints/endpoints-works.md`:
  - Documentación completa del endpoint con validaciones, comportamiento, respuesta, errores, notes
  - Tabla de content endpoints actualizada

### Archivos modificados

* `Application/Interfaces/IWorkService.cs` — nuevo método
* `Application/Services/WorkService.cs` — implementación con validaciones y encolado
* `Api/Controllers/AdminNumberAIController.cs` — controller actualizado (inyecta `IWorkService`)
* `project/endpoints/endpoints-works.md` — documentación completa

### Validación

* `dotnet build api\ComicLibrary.sln`: compilación correcta (0 errores, 0 warnings)
* `dotnet test tests\Infrastructure.Tests\Infrastructure.Tests.csproj --no-build --no-restore`: **79/79 tests pasan** (incluyendo FullWorkflowIntegrationTests)

### Notas

* Endpoint usa HTTP 200 OK (no 202) según especificación
* No se devuelve `ComicAnalysisResult` en la respuesta
* Reanálisis: nueva solicitud limpia `IAResponse` anterior y encola nuevo Job
* Validaciones se ejecutan antes de modificar estado o crear Job
