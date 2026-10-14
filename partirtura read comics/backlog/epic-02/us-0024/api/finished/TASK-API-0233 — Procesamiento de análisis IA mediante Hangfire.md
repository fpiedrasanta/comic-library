# TASK-API-0233 — Procesamiento de análisis IA mediante Hangfire

## Objetivo

Implementar el procesamiento asíncrono del análisis IA mediante Hangfire.

El análisis no debe ejecutarse durante la request HTTP. La request únicamente deberá registrar la solicitud y crear el Job; el procesamiento, la lectura de imágenes, la comunicación con el proveedor IA y el almacenamiento de la respuesta serán responsabilidad del Worker.

---

## Alcance

Modificar o crear:

```text
BackgroundJobService.cs
```

en la capa Infrastructure, reutilizando la infraestructura Hangfire existente en el proyecto.

El Worker debe recibir únicamente información necesaria para identificar el trabajo a procesar:

```text
WorkId
ImageIds
```

No almacenar ni enviar como argumentos del Job:

* bytes de imágenes;
* objetos `Work`;
* entidades de Entity Framework;
* objetos dependientes del contexto de la request.

En cada ejecución el Worker debe recuperar nuevamente la información necesaria desde la aplicación/Repository y Storage.

---

## Flujo del Worker

El Job debe realizar el siguiente flujo:

### 1. Recuperar la Work

Obtener la `Work` correspondiente a `WorkId`.

Si la obra ya no existe, el Job debe finalizar sin intentar realizar el análisis.

### 2. Validar las imágenes

Obtener las imágenes correspondientes a `ImageIds` y verificar que pertenecen al contenido de la obra.

Utilizar el mismo criterio de validación que utiliza actualmente el análisis IA síncrono.

### 3. Leer archivos

Obtener los archivos físicos mediante el mecanismo de almacenamiento existente.

Construir los `AIImagePart` necesarios para realizar la consulta.

No persistir bytes de imágenes en Hangfire.

### 4. Ejecutar análisis IA

Reutilizar el servicio IA y el prompt/parser existentes.

No implementar un segundo mecanismo de análisis.

El comportamiento actual de identificación y construcción de `ComicAnalysisResult` debe mantenerse.

### 5. Validar respuesta

Una respuesta válida debe poder convertirse correctamente al modelo normalizado:

```csharp
ComicAnalysisResult
```

Una respuesta inválida, incompleta a nivel de formato o imposible de parsear **no debe considerarse un análisis exitoso**.

El parser actual devuelve `Empty()` ante contenido inválido. Modificar el mecanismo necesario para que el Worker pueda distinguir entre:

* respuesta válida;
* respuesta inválida.

No persistir una respuesta vacía producida por un error de parsing como si fuera una respuesta IA válida.

### 6. Persistir respuesta

Cuando el análisis sea exitoso:

1. Convertir `ComicAnalysisResult` al JSON normalizado.
2. Guardarlo en `Work.IAResponse`.
3. Persistir los cambios.

`IAResponse` debe contener el JSON normalizado del resultado, no el texto crudo devuelto por el proveedor IA.

No modificar automáticamente los campos definitivos de `Work` a partir de esta respuesta.

---

## Reintentos

Si el proveedor IA devuelve un error o el análisis no puede completarse correctamente:

* no marcar el Job como definitivamente fallido;
* programar nuevamente el mismo procesamiento;
* utilizar un retraso aleatorio entre **1 y 10 minutos**;
* no establecer un número máximo de reintentos a nivel de aplicación.

El objetivo es que el análisis continúe intentando hasta obtener una respuesta válida.

El siguiente intento debe volver a recuperar la información necesaria, en lugar de reutilizar objetos o bytes de una ejecución anterior.

El retraso aleatorio debe calcularse para cada reprogramación.

---

## Estado de `Work`

El Worker no debe cambiar `IARequest` a `false`.

Durante el procesamiento:

```text
IARequest = true
IAResponse = null
```

Después de un análisis exitoso:

```text
IARequest = true
IAResponse = JSON
```

En caso de error:

```text
IARequest = true
IAResponse = null
```

y se programa un nuevo intento.

---

## Reutilización del análisis existente

El análisis IA actualmente implementado de forma síncrona ya contiene la lógica para:

* obtener la Work;
* validar las imágenes;
* leer los archivos;
* construir el prompt;
* invocar `_aiService`;
* interpretar el resultado.

Reutilizar esa lógica o extraerla a una abstracción adecuada.

No duplicar innecesariamente el algoritmo de análisis.

El resultado final debe seguir siendo:

```csharp
ComicAnalysisResult
```

---

## Hangfire

Utilizar la configuración y los patrones Hangfire existentes en el proyecto.

No introducir una segunda configuración de Hangfire.

El Worker debe poder:

* ejecutarse de forma asíncrona;
* reprogramarse ante errores recuperables;
* continuar independientemente de la request HTTP original.

La programación del Job deberá utilizar los mecanismos existentes del proyecto.

---

## Documentación

Leer y actualizar:

```text id="n5t9sp"
project/services.md
```

Documentar el nuevo procesamiento asíncrono de análisis IA, incluyendo:

* responsabilidad del Worker;
* argumentos del Job;
* estados `IARequest` / `IAResponse`;
* reintentos;
* reprogramación aleatoria entre 1 y 10 minutos;
* persistencia de `IAResponse`.

No modificar:

```text id="7j7w7h"
project/domain/domain.md
project/repositories.md
project/endpoints.md
```

---

## Reglas

* No modificar endpoints HTTP en esta task.
* No crear todavía el endpoint que encola el Job.
* No actualizar directamente campos definitivos de `Work` con la respuesta IA.
* No almacenar bytes de imágenes como argumentos de Hangfire.
* No almacenar entidades EF como argumentos de Hangfire.
* No implementar un número máximo de reintentos.
* No realizar polling.
* No bloquear una request HTTP esperando el resultado del análisis.
* Mantener el análisis IA desacoplado del ciclo de vida de la request.
* Mantener las convenciones existentes de Infrastructure y Hangfire.
* No introducir una nueva implementación de almacenamiento de archivos.

---

## Criterios de aceptación

* [x] Existe un procesamiento de análisis IA ejecutable mediante Hangfire.
* [x] El Job recibe `WorkId` e `ImageIds`, no entidades ni bytes.
* [x] El Worker recupera nuevamente Work, imágenes y archivos en cada ejecución.
* [x] Se reutiliza la lógica existente de análisis IA.
* [x] Una respuesta válida se convierte a `ComicAnalysisResult`.
* [x] Una respuesta inválida no se persiste como `IAResponse` exitosa.
* [x] Una respuesta exitosa se serializa como JSON normalizado en `Work.IAResponse`.
* [x] El Worker no modifica los campos definitivos de `Work`.
* [x] Ante errores del proveedor o procesamiento, el Job se reprograma.
* [x] El retraso de reprogramación es aleatorio entre 1 y 10 minutos.
* [x] No existe un límite de reintentos a nivel de aplicación.
* [x] Los reintentos recuperan nuevamente los datos necesarios.
* [x] `project/services.md` está actualizado.
* [x] El proyecto compila correctamente.
* [x] No se modificaron endpoints HTTP como parte de esta task.

## Resultado esperado

El análisis IA queda desacoplado del ciclo de vida de la request:

```text
Request
   │
   └── Encola Job
          │
          ▼
     Hangfire Worker
          │
          ├── Recupera Work
          ├── Recupera imágenes
          ├── Ejecuta IA
          │
          ├── Éxito
          │      └── IAResponse = JSON
          │
          └── Error
                 └── Reprograma 1–10 min
```

El endpoint que dispara este procesamiento será implementado en `TASK-API-0234`.

## Resultado de la ejecución

### Qué se implementó

* **`ComicAnalysisParser.TryParse(string, out ComicAnalysisResult?)`** — método público que distingue respuesta válida (incluye JSON con campos null/[]) de respuesta inválida/malformed. `Parse` ahora delega en `TryParse`.
* **`WorkAnalyzer`** — componente compartido (Application/Services) con la lógica pura de análisis IA:
  - Recupera Work, valida imágenes, lee archivos físicos, construye `AIImagePart`
  - Invoca `IAIService` + `ComicAnalysisParser.BuildPrompt` + `TryParse`
  - Retorna `ComicAnalysisResult?` (null = error validación/trabajo no encontrado)
  - Usado por **tanto** `WorkAnalysisService` (HTTP) como `WorkAnalysisJob` (Hangfire) → **una sola lógica de negocio**
* **`WorkAnalysisService`** — ahora delega en `WorkAnalyzer`; maneja validaciones HTTP y lanza excepciones de dominio
* **`WorkAnalysisJob`** — Worker Hangfire en cola `ai-analysis`:
  - Argumentos serializables: `WorkId` + `ImageIds[]`
  - Usa `WorkAnalyzer.AnalyzeAsync`
  - Válido → serializa JSON → persiste en `Work.IAResponse`
  - Inválido/error → `BackgroundJob.Schedule` con delay aleatorio 1–10 min
  - **Concurrencia por WorkId: NO IMPLEMENTADA** (known issue, ver abajo)
  - `IARequest` se mantiene `true`; `IAResponse` = `null` durante procesamiento/error; JSON en éxito
  - No modifica campos definitivos de Work
  - Reintentos explícitos indefinidos via `BackgroundJob.Schedule`, sin `AutomaticRetry`
* **`BackgroundJobService.EnqueueWorkAnalysis`** + interfaz `IBackgroundJobService` — encolado del Job
* **Documentación** en `project/services/services-catalog.md`: BackgroundJobService, WorkAnalysisJob, WorkAnalyzer, WorkAnalysisService actualizado

### Archivos creados/modificados

* `Application/Services/ComicAnalysisParser.cs` — `TryParse` público, clase `public`
* `Application/Services/WorkAnalyzer.cs` — **nuevo** componente compartido de lógica de análisis
* `Application/Services/WorkAnalysisService.cs` — refactorizado para usar `WorkAnalyzer`
* `Application/Interfaces/IBackgroundJobService.cs` — nuevo método
* `Infrastructure/Services/BackgroundJobService.cs` — implementación `EnqueueWorkAnalysis`
* `Infrastructure/Jobs/WorkAnalysisJob.cs` — refactorizado para usar `WorkAnalyzer`
* `Api/Program.cs` — registro DI `WorkAnalyzer` + queue `ai-analysis`
* `project/services/services-catalog.md` — documentación completa

### Validación

* `dotnet build api\ComicLibrary.sln`: compilación correcta (0 errores, 2 warnings preexistentes)
* `dotnet test tests\Infrastructure.Tests\Infrastructure.Tests.csproj --no-build --no-restore`: **79/79 tests pasan** (incluyendo FullWorkflowIntegrationTests)
* `dotnet test --filter "CbrProcessingJobPolicyTests|SensitiveDataRedactionEnricherTests"`: 18/18 tests unitarios pasan

### Notas

* No se modificaron endpoints HTTP (se hará en TASK-API-0234)
* No se introdujo `AutomaticRetry` de Hangfire; reprogramación explícita con `BackgroundJob.Schedule`
* Cada reintento recupera Work, imágenes y archivos desde cero
* Cola dedicada `ai-analysis` separada de `cbr-processing`

### Known Issues

* **Concurrencia por WorkId no implementada**: El Job actual no previene que dos workers procesen simultáneamente el mismo `WorkId`. Esto podría resultar en análisis duplicados y escrituras concurrentes en `IAResponse`. 
  - **Mitigación actual**: El retry eventual y la idempotencia parcial (sobrescritura de `IAResponse`) limitan el impacto.
  - **Solución futura**: Implementar lock distribuido (ej. `DisableConcurrentExecution` con key por WorkId, lock en BD, o campo `IsAnalyzing` en `Work`) en una task posterior.
