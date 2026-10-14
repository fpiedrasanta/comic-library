# TASK-API-0174 — Implementar consulta de estado, detalle de errores y reintento del procesamiento CBR

## Objetivo

Implementar las operaciones administrativas necesarias para consultar y controlar el estado del procesamiento del contenido digital de un `Number`.

El administrador debe poder conocer si un Número:

- No posee contenido digital.
- Está siendo procesado.
- Fue procesado correctamente.
- Presenta un error de procesamiento.

Cuando el procesamiento haya fallado, el administrador debe poder consultar el detalle del error y solicitar un nuevo procesamiento del contenido digital.

## Alcance

La Task comprende:

- Endpoint administrativo para consultar el estado del contenido digital.
- Información del estado actual del procesamiento.
- Información del error cuando el estado sea `Error`.
- Endpoint administrativo para solicitar un reintento.
- Validaciones necesarias para evitar reintentos inválidos.
- Encolado de un nuevo procesamiento mediante el mecanismo de workers existente.
- Actualización del estado a `Procesando` al iniciar un reintento.

## Estados del contenido

El contenido digital debe utilizar los siguientes estados funcionales:

```text
Sin archivo
Procesando
Finalizado OK
Error
```

### Sin archivo

El Número no posee contenido digital procesado.

No existe un CBR pendiente de procesamiento.

### Procesando

Existe un procesamiento en ejecución.

El procesamiento continúa independientemente de:

- `Number.IsActive`.
- Cambios en la metadata del Número.
- Estado de visualización administrativa.

### Finalizado OK

El procesamiento finalizó correctamente.

Las páginas del Número fueron generadas y almacenadas correctamente.

### Error

El procesamiento no pudo finalizar correctamente.

Debe conservarse información suficiente para que el administrador pueda identificar el problema y decidir si corresponde reintentar.

## Endpoint de consulta de estado

Implementar:

`GET /api/admin-numbers/{numberId}/content/status`

El endpoint debe:

- Requerir autenticación.
- Requerir rol `Administrator`.
- Validar que el Número exista.
- Devolver el estado actual del contenido digital.
- Devolver información del procesamiento cuando corresponda.
- Devolver información del error cuando el estado sea `Error`.

Respuesta conceptual:

```json
{
  "status": "Error",
  "error": {
    "message": "No fue posible procesar una de las páginas.",
    "details": "..."
  }
}
```

La estructura definitiva del contrato debe respetar las convenciones existentes de la API.

## Información del procesamiento

Cuando corresponda, el estado puede incluir información adicional útil para el Dashboard, por ejemplo:

- Estado.
- Fecha de inicio.
- Fecha de finalización.
- Cantidad de páginas procesadas.
- Cantidad total de páginas.
- Mensaje de error.
- Detalle técnico del error.

La información técnica no debe exponer datos sensibles ni detalles internos de infraestructura que puedan representar un riesgo de seguridad.

## Endpoint de reintento

Implementar:

`POST /api/admin-numbers/{numberId}/content/retry`

El endpoint debe permitir solicitar un nuevo procesamiento cuando el contenido se encuentre en estado `Error`.

La operación debe:

1. Validar que el Número exista.
2. Validar autorización administrativa.
3. Validar que exista contenido disponible para reprocesar.
4. Validar que el estado actual permita un reintento.
5. Preparar nuevamente el procesamiento.
6. Cambiar el estado a `Procesando`.
7. Encolar el trabajo mediante el mecanismo de workers existente.
8. Responder sin esperar la finalización del procesamiento.

## Reglas de reintento

El reintento debe estar permitido cuando el procesamiento se encuentre en:

```text
Error
```

No debe permitirse iniciar simultáneamente otro procesamiento cuando el estado sea:

```text
Procesando
```

Esto evita múltiples workers procesando el mismo contenido al mismo tiempo.

Un contenido:

```text
Finalizado OK
```

no debe utilizar este endpoint para reemplazar su contenido.

Para incorporar un nuevo CBR se debe utilizar el flujo:

```text
Eliminar contenido
        ↓
Sin archivo
        ↓
Cargar nuevo CBR
        ↓
Procesando
```

## Archivo fuente

El archivo CBR original **no se conserva** como contenido permanente de lectura.

El mecanismo de reintento debe utilizar el mecanismo temporal o de almacenamiento definido por la arquitectura para poder volver a procesar el contenido cuando corresponda.

Si la arquitectura no conserva una fuente reprocesable después de una operación fallida, el estado debe permanecer en `Error` y el administrador deberá volver a cargar el CBR mediante el endpoint de carga.

No debe inventarse una estrategia de almacenamiento permanente del CBR original únicamente para resolver el reintento.

## Error de procesamiento

Cuando un worker detecte un error:

- El estado debe pasar a `Error`.
- Debe registrarse información del error.
- El error debe poder consultarse mediante el endpoint de estado.
- El Número no debe quedar marcado como contenido `Finalizado OK`.
- No debe presentarse una importación incompleta como disponible.

El detalle almacenado debe permitir diferenciar, cuando sea posible, entre:

- Error de archivo.
- Error de descompresión.
- Error de extracción.
- Error de conversión.
- Error de almacenamiento.
- Error de persistencia.
- Otros errores de procesamiento.

## Consistencia

Si un procesamiento falla, no deben quedar páginas parcialmente procesadas presentadas como contenido válido.

La implementación debe garantizar que el estado:

```text
Finalizado OK
```

solo pueda alcanzarse cuando el procesamiento completo haya finalizado correctamente.

Los mecanismos concretos de limpieza o rollback deben respetar la arquitectura existente de procesamiento.

## Independencia de `IsActive`

El estado del contenido digital es independiente de `Number.IsActive`.

Por ejemplo, son estados válidos:

```text
IsActive = true
Content = Error
```

```text
IsActive = false
Content = Procesando
```

```text
IsActive = true
Content = Sin archivo
```

Desactivar un Número no debe cancelar un procesamiento en curso.

Reactivar un Número no debe iniciar automáticamente un procesamiento.

## Seguridad

Ambos endpoints deben requerir:

- Usuario autenticado.
- Rol `Administrator`.

No deben existir endpoints públicos para consultar detalles internos del procesamiento ni para solicitar reintentos.

## Servicios y repositorios

La implementación debe respetar la arquitectura existente.

La lógica de consulta y control del procesamiento debe ubicarse en Application y no directamente en los Controllers.

El acceso a persistencia debe realizarse mediante los repositorios correspondientes.

El procesamiento debe continuar ejecutándose mediante el mecanismo de workers existente.

El endpoint de reintento únicamente debe iniciar/encolar el procesamiento y no ejecutar el CBR dentro de la petición HTTP.

## Fuera de alcance

Esta Task no comprende:

- Carga de nuevos archivos CBR.
- Eliminación del contenido digital.
- Administración manual de páginas.
- Edición de páginas.
- Reemplazo de un CBR.
- Procesamiento síncrono dentro del Controller.
- Conservación permanente del CBR original.

La carga inicial se implementa en:

`TASK-API-0173 — Implementar gestión del contenido digital de Number, incluyendo Page y procesamiento CBR`

La eliminación se implementa en:

`TASK-API-0175 — Implementar eliminación del contenido digital de Number`

## Documentación

Actualizar:

- `project/endpoints.md`
- `project/endpoints/endpoints-numbers.md`
- `project/services/services-application.md`
- `project/repositories.md`
- Documentación del mecanismo de workers cuando corresponda.

Documentar especialmente:

- Estados posibles.
- Endpoint de consulta.
- Endpoint de reintento.
- Reglas de transición.
- Condiciones para poder reintentar.

## Criterios de aceptación

- [x] Existe un endpoint administrativo para consultar el estado del contenido
- [x] El endpoint requiere autenticación
- [x] El endpoint requiere rol `Administrator`
- [x] El endpoint valida que el Número exista
- [x] Se representan los estados `Sin archivo`, `Procesando`, `Finalizado OK` y `Error`
- [x] El estado `Error` permite consultar información del error
- [x] Existe un endpoint administrativo para solicitar un reintento
- [x] El reintento requiere autenticación y rol `Administrator`
- [x] El reintento solo puede iniciarse cuando el estado permite hacerlo
- [x] No se permiten procesamientos simultáneos del mismo Número
- [x] El reintento utiliza el mecanismo de workers existente
- [x] La petición HTTP no espera la finalización del procesamiento
- [x] Al iniciar un reintento el estado pasa a `Procesando`
- [x] Un procesamiento fallido queda en estado `Error`
- [x] Un procesamiento incompleto no queda marcado como `Finalizado OK`
- [x] `IsActive` es independiente del estado del contenido
- [x] Desactivar un Número no interrumpe un procesamiento en curso
- [x] La documentación queda actualizada
- [x] La solución compila correctamente

## Resultado

### Endpoints implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin-numbers/{numberId}/content/status` | Consultar estado del contenido digital |
| POST | `/api/admin-numbers/{numberId}/content/retry` | Solicitar reintento del procesamiento |

### Archivos reales (verificados 2026-09-03)

| Archivo | Descripción |
|---------|-------------|
| `api/Application/DTOs/ContentStatusDto.cs` | DTO del estado del contenido |
| `api/Application/Services/NumberContentService.cs` | `GetContentStatusAsync` (línea 54) y `RetryContentAsync` (línea 81) |
| `api/Application/Interfaces/INumberContentService.cs` | Contrato del service |
| `api/Api/Controllers/AdminNumbersController.cs` | Endpoints `GetContentStatus` (l.141) y `RetryContent` (l.148) |
| `project/endpoints.md` | Índice actualizado con los 2 endpoints nuevos |
| `project/endpoints/endpoints-numbers.md` | Secciones `GET .../content/status` y `POST .../content/retry` documentadas con el DTO real |

### Estados del contenido (ContentStatus enum)

| Estado | Valor | Descripción |
|--------|-------|-------------|
| Missing | 0 | Sin archivo |
| Processing | 1 | Procesando |
| Completed | 2 | Finalizado OK |
| Error | 3 | Error de procesamiento |

### Decisiones relevantes

- Reintento solo permitido cuando estado es `Error` (cualquier otro estado devuelve `409`).
- El retry exige reenviar el archivo CBR/CBZ en `multipart/form-data` campo `file`.
- Estado del contenido independiente de `IsActive`.
- El DTO expone `status` como **string** (`"Missing" | "Processing" | "Completed" | "Error"`), no como int.

### Build

- Exitoso: Domain, Application, Infrastructure, Api compilan con **0 errores**.
- Tests: 128/128 Application.Tests + 52/52 Infrastructure.Tests = **180/180 verdes**.

## Conclusiones del Backend Agent para el Front Agent

### `GET /api/admin-numbers/{numberId}/content/status`
- Auth: Bearer + rol `Administrator`.
- Payload (`ContentStatusDto`):
  - `status` (string): `"Missing" | "Processing" | "Completed" | "Error"`.
  - `error` (string?): poblado solo cuando `status === "Error"`.
  - `startedAt` (DateTime?): puede venir `null`.
  - `completedAt` (DateTime?): puede venir `null`.
  - `pageCount` (int): siempre presente.
- Errors: `401`, `403`, `404` (Number no existe).

### `POST /api/admin-numbers/{numberId}/content/retry`
- Auth: Bearer + rol `Administrator`.
- Request: `multipart/form-data` campo `file` (CBR/CBZ, requerido).
- 200: `{ success:true, message:"Reintento encolado correctamente. El procesamiento iniciará en segundo plano.", code:200, payload:null }`.
- Errors:
  - `400` si el archivo falta o está vacío.
  - `404` si el Number no existe.
  - `409` con mensaje `"Solo se puede reintentar un procesamiento en estado Error."` si el estado actual no es `Error`.

### Reglas para Front

1. **Polling:** mientras `status === "Processing"`, llamar a `GET .../content/status` cada 2–5 s. Detener al pasar a `Completed` o `Error`.
2. **Mostrar error:** cuando `status === "Error"`, mostrar `error` (string único, no objeto).
3. **Botón "Reintentar":** habilitado solo si `status === "Error"`. Al pulsarlo, abrir selector de archivo CBR/CBZ y enviar `POST .../content/retry`.
4. **No usar retry para reemplazar un CBR exitoso:** si `status === "Completed"`, el endpoint devuelve `409`. Usar el flujo: `DELETE /{numberId}/content` → `POST /{numberId}/content`.

### Tareas del Dashboard que se desbloquean

- `TASK-DASH-0076` (botón "Reintentar" en `numbers-page.tsx`).
- Parte de `TASK-DASH-0077` (header y acciones de procesamiento en `number-form-page.tsx`).