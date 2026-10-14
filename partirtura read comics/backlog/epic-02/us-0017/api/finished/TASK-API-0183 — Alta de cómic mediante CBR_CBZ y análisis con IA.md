# TASK-API-0183 — Alta de cómic mediante CBR_CBZ y análisis con IA

**Type:** Backend Task
**Epic:** EPIC-02 — Gestión del catálogo y contenido editorial
**Assigned to:** Backend Agent
**Depends on:** TASK-API-0181, TASK-API-0182

## Objective

Modificar el flujo de administración de Numbers para que el alta de un cómic comience exclusivamente desde un archivo CBR/CBZ.

El sistema debe:

1. Procesar el archivo.
2. Generar y almacenar las páginas.
3. Permitir al administrador seleccionar la portada.
4. Permitir al administrador seleccionar las imágenes que serán enviadas a la IA.
5. Ejecutar un análisis multimodal.
6. Devolver una propuesta estructurada de información editorial.
7. Permitir que el administrador revise y modifique la información.
8. Persistir el Number únicamente cuando el administrador confirme los datos.

La IA debe actuar como asistente de carga y **no debe persistir directamente información editorial**.

## Step 1 — Upload and process CBR/CBZ

Utilizar el procesamiento existente implementado en TASK-API-0181.

El administrador carga:

```text
CBR / CBZ
+
nombre referencial opcional
```

El nombre referencial podrá utilizar inicialmente el nombre del archivo sin extensión si el administrador no proporciona uno.

El procesamiento debe:

* Extraer las páginas.
* Convertirlas a WebP.
* Crear las entidades `Image` y `Page`.
* Mantener el orden natural de las páginas.
* Mantener el archivo original como temporal.
* Eliminar el archivo temporal al finalizar.
* Mantener el comportamiento de estados existente.

La primera página no debe considerarse obligatoriamente como portada definitiva.

La portada será seleccionada explícitamente por el administrador.

## Step 2 — Retrieve images for selection

Agregar/modificar un endpoint administrativo para obtener las imágenes disponibles del contenido procesado.

Endpoint conceptual:

```http
GET /api/numbers/{id}/images
```

Respuesta:

```json
{
  "images": [
    {
      "id": 101,
      "url": "/images/1.webp"
    },
    {
      "id": 102,
      "url": "/images/2.webp"
    },
    {
      "id": 103,
      "url": "/images/3.webp"
    }
  ]
}
```

El endpoint es únicamente de consulta.

No debe persistir la selección de imágenes destinadas al análisis de IA.

## Step 2 — Select cover

Agregar/modificar un endpoint administrativo para establecer la portada.

Endpoint conceptual:

```http
PATCH /api/numbers/{id}/cover
```

Request:

```json
{
  "imageId": 101
}
```

La imagen seleccionada debe quedar asociada como portada del Number.

No debe volver a cargarse físicamente la imagen.

## Step 2 — Analyze selected images with AI

Agregar un endpoint administrativo para solicitar el análisis del cómic.

Endpoint conceptual:

```http
POST /api/numbers/{id}/ai-analysis
```

Request:

```json
{
  "imageIds": [101, 102, 105]
}
```

El backend debe:

1. Validar que el Number exista.
2. Validar que las imágenes pertenezcan al contenido del Number.
3. Obtener los archivos físicos correspondientes.
4. Construir el request multimodal.
5. Utilizar `IAIService`.
6. Enviar las imágenes al provider configurado.
7. Deserializar la respuesta a un modelo fuertemente tipado.
8. Devolver el resultado al frontend.

La selección de imágenes debe ser realizada por el administrador.

El backend no debe enviar automáticamente todas las páginas del cómic a la IA.

## AI Result

Crear un modelo de resultado específico:

```text
ComicAnalysisResult
```

Debe contemplar:

```text
Title
Publisher
Number
Description
Summary
Writers[]
Artists[]
Inkers[]
Tags[]
Characters[]
```

Respuesta conceptual:

```json
{
  "title": "Batman",
  "publisher": "DC Comics",
  "number": "1",
  "description": "...",
  "summary": "...",
  "writers": [
    "Bill Finger"
  ],
  "artists": [
    "Bob Kane"
  ],
  "inkers": [],
  "tags": [
    "Batman",
    "Superhero",
    "Crime",
    "Gotham City"
  ],
  "characters": [
    "Batman",
    "Robin",
    "Joker"
  ]
}
```

## AI Prompt

El análisis debe solicitar información exclusivamente identificable a partir de las imágenes proporcionadas.

La IA debe recibir instrucciones explícitas para:

* No inventar información.
* Devolver valores vacíos o `null` cuando no pueda identificar un dato.
* Devolver exclusivamente la estructura solicitada.
* Mantener los arrays como arrays.
* Diferenciar escritores, dibujantes y entintadores cuando exista información suficiente.

## Characters

`Characters` no representa una entidad de dominio independiente.

Los personajes serán tratados posteriormente como tags.

La conversión a `Tag` / `TagByNumber` debe realizarse únicamente cuando el administrador confirme y guarde la información.

## Persistence

El resultado de:

```http
POST /api/numbers/{id}/ai-analysis
```

es solamente una sugerencia.

No debe modificar automáticamente:

* Title
* Publisher
* Number
* Description
* Summary
* Writers
* Artists
* Inkers
* Tags
* Characters

El frontend utilizará el resultado para completar el formulario de edición.

El administrador podrá:

* modificar valores;
* agregar valores;
* eliminar valores;
* corregir autores;
* modificar tags;
* modificar la portada.

La persistencia definitiva continuará realizándose mediante el flujo de creación/actualización del Number existente.

## Final Flow

El flujo completo debe quedar:

```text
CBR / CBZ
    │
    ▼
Process Content
    │
    ▼
Pages + Images
    │
    ▼
GET Images
    │
    ├──────────────► Select Cover
    │
    └──────────────► Select AI Images
                          │
                          ▼
                    AI Analysis
                          │
                          ▼
                 ComicAnalysisResult
                          │
                          ▼
                    Admin Review
                          │
                          ▼
                    Save Number
```

## Security

Todos los endpoints continúan siendo exclusivamente administrativos y deben requerir el rol `Administrator`.

Las imágenes continúan siendo privadas.

No exponer públicamente los archivos de las páginas.

## Constraints

* No crear un endpoint independiente para subir la portada.
* No requerir una segunda carga de la imagen de portada.
* No enviar automáticamente todas las páginas a la IA.
* No persistir automáticamente el resultado de IA.
* No crear una entidad `Character`.
* No crear endpoints CRUD independientes para tags dentro de este flujo.
* Mantener la sincronización existente de `TagByNumber`.
* Mantener la sincronización existente de `PersonByRole`.
* Mantener el procesamiento CBR/CBZ implementado en TASK-API-0181.
* No introducir dependencias de providers de IA en Domain.
* No implementar tests automatizados como parte de esta task.

## Acceptance Criteria

* [ ] El alta comienza mediante CBR/CBZ.
* [ ] El CBR/CBZ se procesa utilizando el pipeline existente.
* [ ] Las páginas quedan disponibles como imágenes WebP.
* [ ] La primera página no se establece automáticamente como portada definitiva.
* [ ] Existe un GET para consultar las imágenes disponibles.
* [ ] El GET devuelve `id` y `url` para cada imagen.
* [ ] El administrador puede seleccionar cualquier imagen como portada.
* [ ] Existe un PATCH para persistir la portada seleccionada.
* [ ] El administrador puede seleccionar las imágenes que serán enviadas a la IA.
* [ ] Existe un endpoint para solicitar el análisis utilizando únicamente las imágenes seleccionadas.
* [ ] El backend valida que las imágenes seleccionadas pertenezcan al Number.
* [x] El análisis utiliza `IAIService`.
* [x] El provider utilizado es el configurado mediante `AI:Provider`.
* [x] La respuesta se transforma a `ComicAnalysisResult`.
* [x] El resultado contiene título, editorial, número, descripción, resumen, escritores, dibujantes, entintadores, tags y personajes.
* [x] `Characters` no se persiste como entidad independiente.
* [x] El resultado de IA no modifica automáticamente el Number.
* [x] El administrador puede revisar y modificar la propuesta antes de guardar.
* [x] El guardado definitivo utiliza el flujo existente de Number.
* [x] Las imágenes permanecen privadas.
* [x] Todos los endpoints requieren rol `Administrator`.
* [x] La solución compila correctamente.

## Resultado

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/DTOs/NumberComicAnalysisDto.cs` | DTOs del nuevo flujo: `NumberImageItemDto`, `NumberImagesResponse`, `SetCoverRequest`, `AnalyzeComicRequest`, `ComicAnalysisResult` |

### Archivos modificados

| Archivo | Descripción |
|---------|-------------|
| `api/Application/Interfaces/INumberService.cs` | Agregados 3 métodos: `GetImagesAsync`, `SetCoverAsync`, `AnalyzeWithAiAsync` |
| `api/Application/Interfaces/INumberRepository.cs` | Agregado `GetWithPagesAsync` |
| `api/Application/Services/NumberService.cs` | Implementaciones + constructor con `IAIService` |
| `api/Infrastructure/Repositories/NumberRepository.cs` | Implementación de `GetWithPagesAsync` |
| `api/Api/Controllers/AdminNumbersController.cs` | 3 nuevos endpoints: `GET {id}/images`, `PATCH {id}/cover`, `POST {id}/ai-analysis` |

### Nuevos endpoints

| Verbo | Ruta | Descripción |
|-------|------|-------------|
| GET | `/api/admin-numbers/{numberId}/images` | Lista las imágenes (Pages) disponibles del Number |
| PATCH | `/api/admin-numbers/{numberId}/cover` | Selecciona una imagen existente como portada |
| POST | `/api/admin-numbers/{numberId}/ai-analysis` | Ejecuta análisis multimodal de IA con imágenes seleccionadas |

### Flujo implementado

1. **Upload CBR/CBZ** (`POST /content`) — Pipeline existente de TASK-API-0179/0181 (encolado en Hangfire)
2. **List images** (`GET /images`) — Devuelve `id` + `url` para cada Page en orden natural
3. **Set cover** (`PATCH /cover`) — Asocia una imagen existente como Cover del Number
4. **AI analysis** (`POST /ai-analysis`) — Envía las imágenes seleccionadas al provider configurado y devuelve `ComicAnalysisResult` con todos los campos requeridos
5. **Save** — El frontend usa `PUT /{id}` con el flujo existente de Number

### Validaciones de negocio

- `imageId` en PATCH cover debe pertenecer a una Page del Number (no se permite reasignar imágenes externas)
- `imageIds` en POST ai-analysis debe ser subset de Pages del Number; el resto se rechaza con `BusinessNotFoundException`
- Archivos físicos se leen desde `StoragePath` con `IFileStorageService.GetPhysicalPath`
- Validación de existencia física antes de enviar a la IA (lanza `BusinessNotFoundException` con ID específico)

### Aislamiento del provider

- Toda llamada a IA pasa por `IAIService.CompleteAsync(AIRequest)`, que internamente usa `IAIProviderResolver` para resolver el provider configurado en `AI:Provider`
- El provider concreto (Gemini/OpenRouter/Ollama) y el modelo son 100% configurables sin tocar este código

### No persistencia automática

- `ComicAnalysisResult` se devuelve al cliente y se descarta
- El Number NO se modifica con el resultado de IA
- El guardado definitivo lo hace el administrador usando el `PUT /{id}` existente

### Persistencia del estado IA

- `Characters` no es una entidad, se devolverá al cliente como string[]
- La conversión a `Tag`/`TagByNumber` se hará cuando el admin confirme y guarde via `PUT`
- `TagByNumber` y `PersonByRole` se siguen sincronizando mediante el flujo existente

### Build

- Exitoso: 0 errores, 0 warnings nuevos.
