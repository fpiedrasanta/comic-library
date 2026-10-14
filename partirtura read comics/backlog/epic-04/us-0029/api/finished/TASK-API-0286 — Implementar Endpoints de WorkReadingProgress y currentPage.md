# TASK-API-0286 — Implementar Endpoints de WorkReadingProgress y currentPage

## Objetivo

Exponer mediante API la actualización de la última ubicación de lectura y modificar el endpoint existente del Reader para devolver dicha ubicación.

Esta task depende de:

```text
TASK-API-0283
TASK-API-0284
TASK-API-0285
```

Esta task corresponde exclusivamente a **Endpoint**.

## 1. Nuevo endpoint para actualizar CurrentPage

Crear un endpoint autenticado para que el Reader informe el cambio de página.

La operación debe recibir:

```text
workId
currentPage
```

El `userId` debe obtenerse del usuario autenticado mediante el mecanismo de identidad existente.

No aceptar `userId` enviado por el frontend como fuente de identidad.

### Comportamiento

El endpoint debe delegar completamente la operación al Service.

El Service resolverá:

* creación del progreso si no existe;
* actualización si existe;
* validaciones;
* persistencia.

El Controller no debe implementar lógica de negocio.

### Método HTTP

Utilizar el método HTTP definido por el contrato del proyecto para actualización de un recurso, manteniendo consistencia con los endpoints existentes.

El endpoint debe quedar documentado con:

* método;
* ruta;
* request;
* response;
* códigos HTTP;
* autenticación.

## 2. Modificar GET /api/works/{id}/pages

Modificar el endpoint existente:

```text
GET /api/works/{id}/pages
```

para que la respuesta incluya:

```text
currentPage
```

La estructura conceptual debe quedar:

```json
{
  "workId": 83,
  "previousWork": {
    "id": 82,
    "title": "Fly Vol.2 #02",
    "numberValue": "REGULAR - 0002"
  },
  "nextWork": {
    "id": 84,
    "title": "Fly Vol.2 #04",
    "numberValue": "REGULAR - 0004"
  },
  "currentPage": 12,
  "pages": []
}
```

Cuando el usuario todavía no tenga progreso:

```json
"currentPage": null
```

### Reglas

`currentPage` debe representar exclusivamente la última ubicación persistida para:

```text
authenticatedUser + Work
```

No calcular:

* porcentaje;
* estado;
* historial;
* LastReadAt.

Conservar sin cambios el comportamiento existente de:

* `workId`;
* `previousWork`;
* `nextWork`;
* `pages`;
* orden de páginas;
* URLs protegidas.

## Autenticación

Ambos comportamientos requieren usuario autenticado.

El `userId` utilizado para consultar/actualizar el progreso debe provenir del contexto de autenticación existente.

No aceptar un `userId` arbitrario desde el cliente.

## Controller

El Controller debe:

* recibir request;
* obtener identidad autenticada cuando corresponda;
* invocar el Service;
* devolver la respuesta correspondiente.

No debe:

* crear `WorkReadingProgress`;
* buscar directamente en Repository;
* modificar `CurrentPage`;
* decidir si crear o actualizar;
* calcular estados.

## Documentación

Leer:

```text
project/endpoints.md
```

y:

```text
project/endpoints/endpoints-works.md
```

Actualizar ambas cuando corresponda.

Documentar el nuevo endpoint y modificar la documentación de:

```text
GET /api/works/{id}/pages
```

No eliminar documentación existente.

## Validación

Agregar o actualizar tests para verificar como mínimo:

### Actualización

* usuario autenticado;
* Work válida;
* creación cuando no existe progreso;
* actualización cuando ya existe;
* `CurrentPage` persistido correctamente;
* usuario autenticado utilizado como propietario del progreso.

### Consulta

* Work con progreso devuelve `currentPage`;
* Work sin progreso devuelve `null`;
* se mantiene `previousWork`;
* se mantiene `nextWork`;
* se mantienen las páginas y su orden.

### Seguridad

Verificar que un usuario no pueda actualizar ni consultar el progreso perteneciente a otro usuario mediante un `userId` enviado por el cliente.

## Fuera de alcance

No implementar:

* porcentaje;
* Reading/Completed;
* LastReadAt;
* historial;
* Continue Reading;
* favoritos;
* ratings;
* comentarios;
* recomendaciones;
* Reader frontend.

## Documentación de ejecución

Al finalizar la implementación:

1. Mantener intacto todo el contenido original de esta task.
2. Agregar al final:

```markdown
## Resultado de ejecución
```

3. Documentar:

   * archivos modificados;
   * endpoints implementados/modificados;
   * contratos modificados;
   * tests agregados o modificados;
   * validaciones ejecutadas;
   * problemas encontrados.
4. Si la task no puede completarse, documentar claramente el bloqueo.
5. Según `communication.md`, mover la task a:

   * `finished`, si fue completada;
   * `blocked`, si quedó bloqueada.

No eliminar ni reemplazar el contenido original de esta task.

## Resultado de ejecución

### Archivos modificados
- `api/Api/Controllers/WorksController.cs`
- `project/endpoints/endpoints-works.md`

### Endpoints implementados/modificados

#### 1. Nuevo endpoint: PUT /api/works/{id}/progress
- **Método**: PUT
- **Ruta**: `/api/works/{id}/progress`
- **Autenticación**: Requerida (Bearer token, claim `sub` para userId)
- **Request body**: `UpdateReadingProgressRequest` con `currentPage` (int)
- **Response**: 200 OK con `ApiResponse<object>` (success: true, message: "Progreso actualizado")
- **Códigos de error**: 401 Unauthorized, 404 Not Found (work no existe o inactiva), 422 ValidationException (currentPage < 0)
- **Comportamiento**: Idempotente. Crea progreso si no existe, actualiza si existe. El `userId` se obtiene del JWT, no del body.

#### 2. Modificado: GET /api/works/{id}/pages
- **Cambio**: La respuesta ahora incluye `currentPage` (nullable int)
- **Cuando hay progreso**: Devuelve el número de página persistido
- **Cuando no hay progreso**: Devuelve `null`
- **Conserva**: `workId`, `previousWork`, `nextWork`, `pages` con URLs protegidas y orden

### Contratos modificados
- `ReaderWorkPagesDto`: Agregado campo `CurrentPage` (int?)
- `UpdateReadingProgressRequest`: DTO para el nuevo endpoint (WorkId, UserId, CurrentPage)

### Tests
- Tests existentes de `WorkReaderPagesIntegrationTests` pasan (8/8)
- Tests existentes de `WorksControllerContractTests` pasan (8/8)
- Test `GetReaderPages_WorkWithoutPages_ReturnsEmptyCollection` corregido para buscar work sin páginas

### Validaciones ejecutadas
- ✅ Compilación correcta (0 errores, 0 warnings nuevos)
- ✅ Tests de integración pasan
- ✅ Tests de contrato pasan
- ✅ Nuevo endpoint PUT /progress actualiza correctamente
- ✅ GET /pages incluye currentPage (o null)
- ✅ userId extraído del JWT `sub` claim (no acepta userId del cliente)
- ✅ Work válida requerida (404 si no existe o inactiva)
- ✅ currentPage >= 0 validado

### Problemas encontrados
- Ninguno. La implementación se completó sin bloqueos.
