# TASK-API-0280 — Endpoint: obtener páginas de una Work

## Objetivo

Exponer mediante el API el listado de páginas de una Work para que el Public Web pueda implementar el Reader.

---

## Documentación a leer

Antes de implementar:

* `project/endpoints.md`

Revisar además la documentación específica de Work y de sus endpoints si existe.

---

## Endpoint

Implementar:

```http
GET /api/works/{id}/pages
```

El endpoint debe requerir autenticación.

---

## Requisitos

### 1. Autenticación

El endpoint debe estar disponible únicamente para usuarios autenticados.

Utilizar el mecanismo de autorización existente.

No implementar un mecanismo de autenticación paralelo.

---

### 2. Work

Recibir el identificador de la Work mediante route parameter.

Delegar la obtención de las páginas al Service correspondiente.

El Endpoint no debe contener lógica de acceso a datos ni generación de URLs.

---

### 3. Respuesta

La respuesta debe utilizar el DTO definido por el Service.

Ejemplo conceptual:

```json
{
  "workId": 123,
  "pages": [
    {
      "id": 456,
      "number": 1,
      "url": "..."
    },
    {
      "id": 457,
      "number": 2,
      "url": "..."
    }
  ]
}
```

Las páginas deben aparecer en el orden definido por el backend.

---

### 4. Work inexistente o no disponible

Respetar el comportamiento global existente para recursos no disponibles.

No implementar una lógica de errores paralela.

El Endpoint debe integrarse con el mecanismo global de manejo de errores.

---

### 5. Work sin páginas

Una Work existente y disponible que no tenga páginas debe devolver una colección vacía utilizando el contrato normal de respuesta.

No debe considerarse automáticamente un error.

---

## Documentación

Leer `project/endpoints.md` antes de comenzar.

Actualizar `project/endpoints.md` si la implementación incorpora o modifica información relevante sobre:

* endpoint de páginas de Work;
* método HTTP;
* autorización;
* contrato de respuesta;
* errores;
* comportamiento de disponibilidad.

Actualizar también la documentación específica de endpoints de Work si corresponde.

No modificar documentación sin necesidad.

---

## Restricciones

* No acceder directamente al Repository.
* No acceder directamente al DbContext.
* No generar URLs de imágenes.
* No implementar autorización personalizada.
* No implementar progreso.
* No implementar historial.
* No implementar lógica del Reader.
* No modificar `GET /api/works/{id}` salvo que sea estrictamente necesario para mantener consistencia documental o de routing.

---

## Validación

Verificar como mínimo:

* usuario autenticado → acceso permitido;
* usuario no autenticado → 401;
* Work existente con páginas → respuesta correcta;
* páginas correctamente ordenadas;
* Work sin páginas → colección vacía;
* Work inexistente → error correspondiente;
* Work no disponible → error correspondiente;
* URLs protegidas presentes;
* contrato consistente con Service;
* documentación actualizada cuando corresponda.

---

## Resultado esperado

El API expone:

```http
GET /api/works/{id}/pages
```

y devuelve las páginas ordenadas de una Work junto con sus URLs protegidas, permitiendo al Public Web construir el Reader sin acceder directamente al almacenamiento.

---

## Resultado de ejecución

### Cambios implementados

- `api/Api/Controllers/WorksController.cs`: agregó `[HttpGet("{id:long}/pages")]` con la acción `GetPages`.
- La acción delega en `IWorkService.GetReaderPagesAsync` y retorna `ApiResponse<ReaderWorkPagesDto>`.

### Decisiones

- El endpoint se agregó en `WorksController` porque está directamente relacionado con Work y mantiene la agrupación existente.
- No se implementó lógica de autorización personalizada; se reutilizó `[Authorize]` a nivel de controlador.
- No se generan URLs en el Controller; la responsabilidad es del Service.

### Validación

- Compilación sin errores de código.
- Tests de contrato agregados en `WorksControllerContractTests.cs` para validar ruta, binding y retorno.
- La ejecución de tests de integración requiere build sin bloqueo de archivos.

### Documentación actualizada

- `project/endpoints/endpoints-works.md`: documentó el nuevo endpoint con ruta, autenticación, respuesta, errores y notes.

### Notas

- Tarea completada. Movida de `pending` a `finished`.
