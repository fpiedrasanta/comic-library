# TASK-API-0236 — Incluir IAResponse en el detalle de Work

## Objetivo

Modificar el endpoint de detalle de `Work` para incluir la respuesta del análisis IA almacenada en `Work.IAResponse`.

El cliente debe recibir la respuesta como un objeto JSON cuando exista y como `null` cuando no exista.

---

## Endpoint

Modificar:

```text id="k8r3m1"
GET /api/admin-works/{id}
```

Mantener el comportamiento actual del endpoint y agregar la información correspondiente al análisis IA.

---

## Respuesta

Agregar al DTO de detalle:

```json id="q1z7kp"
{
  "iaResponse": {
    "title": "...",
    "publisher": "...",
    "number": "...",
    "description": "...",
    "summary": "...",
    "publicationDate": "...",
    "writers": [],
    "artists": [],
    "inkers": [],
    "tags": [],
    "characters": []
  }
}
```

Cuando no exista respuesta:

```json id="5h2x8n"
{
  "iaResponse": null
}
```

`IAResponse` no debe devolverse como un string conteniendo JSON.

Incorrecto:

```json id="4k7v3p"
{
  "iaResponse": "{\"title\":\"...\"}"
}
```

Correcto:

```json id="m9c2rx"
{
  "iaResponse": {
    "title": "..."
  }
}
```

---

## Deserialización

El valor persistido en `Work.IAResponse` debe deserializarse al modelo correspondiente antes de construir la respuesta HTTP.

Utilizar el mismo contrato utilizado para representar el resultado del análisis IA:

```text id="e7s4nb"
ComicAnalysisResult
```

Si `IAResponse` es `null`, el DTO debe devolver `null`.

No devolver el JSON persistido como texto.

No modificar el contenido almacenado durante la lectura.

---

## IARequest

El endpoint debe conservar también el estado de solicitud de IA si el DTO de detalle ya lo expone o si resulta necesario para representar correctamente el estado del análisis.

Como mínimo, `IAResponse` debe estar disponible en el detalle.

No introducir un nuevo estado calculado como `IAStatus`.

El estado continúa derivándose de:

```text id="z3q6dy"
IARequest = false
IAResponse = null
→ Nunca solicitado

IARequest = true
IAResponse = null
→ Solicitado, pendiente o sin respuesta

IARequest = true
IAResponse = JSON
→ Respuesta disponible
```

---

## Compatibilidad

No modificar:

* la ruta;
* autorización;
* comportamiento de los demás campos del detalle;
* relaciones existentes;
* reglas de negocio de `Work`.

La incorporación de `iaResponse` no debe alterar los datos definitivos de la obra.

---

## Documentación

Leer y actualizar:

```text id="x6p1mv"
project/endpoints.md
```

Documentar:

* `GET /api/admin-works/{id}`;
* propiedad `iaResponse`;
* estructura de la respuesta IA;
* comportamiento cuando no existe respuesta.

No modificar:

```text id="2g5v8a"
project/domain/domain.md
project/repositories.md
project/services.md
```

---

## Reglas

* No devolver `IAResponse` como `string`.
* No modificar `Work` al consultar el detalle.
* No aplicar automáticamente las sugerencias IA sobre los campos definitivos.
* No ejecutar análisis IA.
* No crear ni modificar Jobs Hangfire.
* No devolver datos del proveedor IA distintos del resultado normalizado almacenado.
* Mantener el contrato existente del resto del DTO.

---

## Criterios de aceptación

* [x] `GET /api/admin-works/{id}` continúa funcionando.
* [x] La respuesta incluye `iaResponse`.
* [x] `iaResponse` contiene un objeto JSON cuando existe `Work.IAResponse`.
* [x] `iaResponse` es `null` cuando `Work.IAResponse` es `null`.
* [x] `iaResponse` no se devuelve como JSON serializado dentro de un string.
* [x] La estructura corresponde al contrato de `ComicAnalysisResult`.
* [x] El contenido almacenado no se modifica durante la lectura.
* [x] Los campos definitivos de `Work` no se modifican automáticamente.
* [x] `project/endpoints.md` está actualizado.
* [x] El proyecto compila correctamente.
* [x] No se incorporaron cambios fuera del alcance de la task.

## Resultado esperado

El detalle de una Work permite al Dashboard conocer las sugerencias generadas por IA:

```text id="w7j2qd"
GET /api/admin-works/{id}
        │
        ▼
    Work detail
        │
        ├── IARequest
        │
        └── IAResponse
              │
              ├── null
              │
              └── ComicAnalysisResult
```

El Dashboard podrá utilizar `IAResponse` para mostrar las sugerencias al usuario, quien decidirá cuáles aplicar sobre los datos definitivos de la obra.

## Resultado de la ejecución

### Qué se implementó

* **`WorkDetailDto`** — agregado campo `IAResponse` de tipo `ComicAnalysisResult?` (nullable)
* **`WorkService.GetByIdAsync`** — deserializa `Work.IAResponse` (JSON string) a `ComicAnalysisResult` usando `JsonSerializer` con `PropertyNameCaseInsensitive = true`
  - Si `IAResponse` es null o vacío → devuelve `null`
  - Si JSON es inválido → captura excepción y devuelve `null` (no rompe el endpoint)
  - Nunca modifica el contenido persistido en BD
* **Endpoint `GET /api/admin-works/{id}`** — ahora incluye `iaResponse` en la respuesta:
  - Objeto JSON deserializado cuando existe
  - `null` cuando no hay respuesta
  - Nunca devuelve el JSON como string

### Archivos modificados

* `Application/DTOs/WorkDtos.cs` — campo `IAResponse` en `WorkDetailDto`
* `Application/Services/WorkService.cs` — deserialización en `GetByIdAsync`
* `project/endpoints/endpoints-works.md` — documentación completa con ejemplo y notas de estado

### Validación

* `dotnet build api\ComicLibrary.sln`: compilación correcta (0 errores, 0 warnings)
* `dotnet test tests\Infrastructure.Tests\Infrastructure.Tests.csproj --no-build --no-restore`: **79/79 tests pasan**

### Notas

* `IAResponse` se devuelve como objeto JSON nativo, nunca como string serializado
* El contenido almacenado en BD no se modifica durante la lectura
* No se aplican automáticamente las sugerencias IA sobre campos definitivos
* Estado IA se deriva de `IARequest` + `IAResponse` (nunca solicitado / solicitado sin respuesta / respuesta disponible)
