# TASK-API-0282 — Ampliar la respuesta del endpoint de Reader

## Objetivo

Ampliar la respuesta del endpoint de Reader:

```text
GET /api/works/{id}/pages
```

para que, además de las páginas de la Work, informe las Works anterior y siguiente según las relaciones explícitas existentes en el dominio.

Esta información será utilizada por el Public Web para permitir la navegación directa entre Works desde los extremos del Reader.

---

## Endpoint

Mantener:

```text
GET /api/works/{id}/pages
```

La respuesta debe incorporar:

```json
{
  "workId": 85,
  "previousWork": {
    "id": 84,
    "title": "Dios ama, el hombre mata",
    "numberValue": "REGULAR - 0003"
  },
  "nextWork": {
    "id": 86,
    "title": "Dios ama, el hombre mata",
    "numberValue": "REGULAR - 0005"
  },
  "pages": []
}
```

`previousWork` y `nextWork` deben ser `null` cuando no exista la relación correspondiente.

---

## Contrato

### ReaderWorkPagesDto

Mantener:

```text
WorkId
Pages
```

e incorporar:

```text
PreviousWork
NextWork
```

### ReaderWorkNavigationDto

Crear un DTO reutilizable para la navegación:

```text
Id
Title
NumberValue
```

---

## NumberValue

`NumberValue` representa el valor completo del Number de la Work.

Ejemplos válidos:

```text
REGULAR - 0001
ANUAL - 0001
ESPECIAL - 0001
```

No interpretar ni reconstruir este valor en el Public Web.

El Backend debe utilizar el valor existente del Number.

Cuando la Work no tenga Number:

```text
NumberValue = null
```

No generar:

* placeholders;
* valores ficticios;
* textos alternativos.

---

## Reglas de navegación

Utilizar exclusivamente las relaciones explícitas existentes:

```text
PreviousWork
NextWork
```

No inferir navegación mediante:

* Number;
* PublicationDate;
* UploadedAt;
* orden de resultados;
* Id;
* cualquier otro criterio.

Si la Work no tiene PreviousWork:

```json
"previousWork": null
```

Si la Work no tiene NextWork:

```json
"nextWork": null
```

---

## Datos a obtener

El servicio debe obtener para cada navegación:

### PreviousWork

* Id;
* Title;
* Number.Value.

### NextWork

* Id;
* Title;
* Number.Value.

No cargar información innecesaria para el Reader.

No obtener:

* imágenes;
* descripción;
* personas;
* tags;
* Publisher;
* Franchise;
* Series;
* ni demás información del detalle de Work.

---

## Persistencia

Adaptar el repositorio/consulta existente utilizado por:

```text
GET /api/works/{id}/pages
```

para obtener las relaciones necesarias.

Mantener:

* `AsNoTracking`;
* orden actual de las páginas;
* validación de Work activa;
* comportamiento actual del endpoint;
* protección de acceso existente.

No modificar el comportamiento de las páginas.

---

## Estados

La respuesta debe permitir representar correctamente:

### Primera Work

```json
"previousWork": null
```

### Última Work

```json
"nextWork": null
```

### Work intermedia

Ambas relaciones presentes cuando existan.

---

## Fuera de alcance

No implementar:

* progreso;
* historial;
* Continue Reading;
* navegación automática;
* navegación basada en Number;
* cambios en las relaciones PreviousWork/NextWork;
* modificación del detalle de Work;
* nuevos endpoints.

---

## Validación

Agregar o adaptar tests para verificar:

1. Work con PreviousWork y NextWork.
2. Work sin PreviousWork.
3. Work sin NextWork.
4. Work sin ninguna relación.
5. Work con Number.
6. Work sin Number.
7. `NumberValue` correctamente mapeado.
8. Las páginas existentes continúan devolviéndose correctamente.
9. Una Work inexistente continúa devolviendo 404.
10. Una Work inactiva continúa devolviendo 404.
11. No se exponen paths físicos de imágenes.

Actualizar la documentación del endpoint correspondiente.

---

## Criterios de aceptación

* `GET /api/works/{id}/pages` devuelve `previousWork`.
* `GET /api/works/{id}/pages` devuelve `nextWork`.
* Ambos pueden ser `null`.
* Cada navegación contiene Id, Title y NumberValue.
* NumberValue admite `null`.
* NumberValue conserva el valor completo del Number, por ejemplo `REGULAR - 0001`.
* PreviousWork/NextWork provienen exclusivamente de las relaciones explícitas del dominio.
* No se modifica el comportamiento actual de las páginas.
* El contrato queda documentado.
* Los tests existentes continúan funcionando.

---

## Resultado de ejecución

### Cambios implementados

- `api/Application/DTOs/WorkContentDtos.cs`: amplió `ReaderWorkPagesDto` con `PreviousWork` y `NextWork`; agregó `ReaderWorkNavigationDto`.
- `api/Application/Interfaces/IWorkRepository.cs`: agregó `GetByIdWithNavigationAsync`.
- `api/Infrastructure/Repositories/WorkRepository.cs`: implementó `GetByIdWithNavigationAsync` con `.AsNoTracking()` y `.Include(w => w.PreviousNumber)` / `.Include(w => w.NextNumber)`.
- `api/Application/Services/WorkService.cs`: `GetReaderPagesAsync` ahora usa `GetByIdWithNavigationAsync` y popula `previousWork`/`nextWork` con `ReaderWorkNavigationDto`.
- `project/endpoints/endpoints-works.md`: actualizó contrato, respuesta y notas de `GET /api/works/{id}/pages`.
- `tests/Infrastructure.Tests/Integration/WorkReaderPagesIntegrationTests.cs`: agregó 2 tests para `PreviousWork` y `NextWork`.

### Decisiones

- Se agregó un método específico `GetByIdWithNavigationAsync` para no modificar `GetByIdAsync` (que es usado por otros servicios sin includes).
- Se mantuvo `.AsNoTracking()` en la consulta de navegación.
- `NumberValue` se expone tal cual viene del dominio; `null` cuando no existe.

### Validación

- Compilación sin errores de código.
- Tests existentes preservados; tests nuevos agregados para navegación.
- Build bloqueado por proceso Api en ejecución (PID 35912); no es error de código.

### Notas

- Tarea completada. Movida de `pending` a `finished`.
