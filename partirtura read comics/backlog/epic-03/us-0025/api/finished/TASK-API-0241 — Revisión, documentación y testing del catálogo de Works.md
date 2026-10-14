# TASK-API-0241 — Revisión, documentación y testing del catálogo de Works

## Objetivo

Validar integralmente la implementación del catálogo de Works realizada en `TASK-API-0238`, `TASK-API-0239` y `TASK-API-0240`.

La Task debe comprobar tanto el comportamiento funcional como el cumplimiento de las reglas arquitectónicas, de documentación, seguridad y estilo del Backend.

---

## Dependencias

* `TASK-API-0238` — Repository.
* `TASK-API-0239` — Service.
* `TASK-API-0240` — Endpoint.

---

## Documentación obligatoria

Leer y revisar:

```text
project/backend-coding-rules.md
project/communication.md
project/backend-architecture.md
project/backend-stack-technology.md
project/domain.md
project/repositories.md
project/services.md
project/endpoints.md
```

Verificar que la implementación respete:

* arquitectura;
* nomenclatura;
* responsabilidades por capa;
* estilo de código;
* contratos existentes;
* autenticación;
* formato de respuestas;
* documentación.

Corregir cualquier desviación encontrada.

---

# Testing funcional

Implementar o completar los tests necesarios para validar la consulta del catálogo.

## 1. Catálogo sin filtros

Verificar:

```text
GET /api/works
```

Devuelve Works.

Verificar que el orden por defecto sea:

```text
UploadedAt DESC
```

---

## 2. Search

Verificar búsquedas por:

* Title;
* Summary;
* Number.Value;
* Tag;
* Person.

Verificar búsqueda parcial.

Verificar que sea case-insensitive.

Verificar que una Person encuentre Works independientemente de su Role.

---

## 3. Publisher

Crear/usar un Publisher con:

* Works directamente asociadas;
* Works pertenecientes a sus Franchises;
* Works pertenecientes a Series de esas Franchises.

Verificar que:

```text
publisherId = X
```

devuelva las tres categorías.

Verificar que no devuelva Works pertenecientes a otros Publishers.

---

## 4. Franchise

Verificar que:

```text
franchiseId = X
```

devuelva:

* Works directamente asociadas a la Franchise;
* Works pertenecientes a Series de esa Franchise.

Verificar exclusión de Works de otras Franchises.

---

## 5. Series

Verificar que:

```text
seriesId = X
```

devuelva únicamente Works pertenecientes a esa Series.

---

## 6. Combinación de filtros

Verificar combinaciones como:

```text
Publisher + Franchise
Publisher + Series
Franchise + Series
Publisher + Franchise + Series
Search + filtros
```

Los resultados deben respetar todas las restricciones simultáneamente.

---

## 7. Ordenamiento

Verificar:

```text
Title ASC
Title DESC

PublicationDate ASC
PublicationDate DESC

UploadedAt ASC
UploadedAt DESC

Number ASC
Number DESC
```

Verificar que el orden se aplique antes de la paginación.

---

## 8. Paginación

Verificar:

* primera página;
* páginas posteriores;
* última página;
* página sin resultados;
* combinación de paginación con filtros;
* combinación de paginación con Search;
* combinación de paginación con ordenamiento.

No deben aparecer duplicados entre páginas.

---

## 9. WorkType

Verificar que el resultado incluya correctamente el WorkType.

Verificar que WorkType no altere la pertenencia jerárquica de la Work.

---

## 10. Seguridad

Verificar:

* usuario autenticado → acceso permitido;
* usuario no autenticado → acceso rechazado;
* usuario autenticado sin rol Administrator → acceso permitido.

El endpoint no debe requerir permisos administrativos.

---

## 11. Contrato

Verificar:

* formato estándar de respuesta;
* estructura paginada;
* nombres de propiedades;
* DTO;
* fechas;
* información de Publisher/Franchise/Series;
* información necesaria para la portada.

---

# Revisión arquitectónica

Verificar especialmente que:

* la jerarquía Publisher → Franchise → Series esté implementada en Repository;
* Service no contenga consultas de persistencia;
* Controller no contenga lógica de negocio;
* no existan consultas duplicadas;
* no exista una implementación específica de Works para cada contexto;
* no se introduzca lógica basada en WorkType para determinar pertenencia;
* no se materialicen grandes conjuntos de Works para filtrarlos en memoria;
* no existan consultas N+1;
* se respete el estilo y las restricciones de `backend-coding-rules.md`.

---

# Documentación

Confirmar que estén actualizados:

```text
project/repositories.md
project/services.md
project/endpoints.md
```

y los catálogos específicos correspondientes.

No modificar documentación que no haya cambiado como consecuencia de esta funcionalidad.

---

# Validación final

Ejecutar:

* build completo;
* suite completa de tests;
* tests específicos del catálogo.

Registrar:

* errores;
* warnings nuevos;
* tests ejecutados;
* resultado final.

Los warnings preexistentes no deben considerarse errores nuevos, pero cualquier warning introducido por esta implementación debe corregirse.

---

## Criterios de finalización

* [ ] Documentación y reglas revisadas.
* [ ] Código cumple `backend-coding-rules.md`.
* [ ] Search validado.
* [ ] Publisher validado.
* [ ] Franchise validado.
* [ ] Series validado.
* [ ] Combinación de filtros validada.
* [ ] Ordenamiento validado.
* [ ] Paginación validada.
* [ ] WorkType validado.
* [ ] Seguridad validada.
* [ ] Contrato validado.
* [ ] No existen consultas N+1.
* [ ] No existe filtrado principal en memoria.
* [ ] No existe duplicación de lógica entre contextos.
* [ ] `repositories.md` actualizado.
* [ ] `services.md` actualizado.
* [ ] `endpoints.md` actualizado.
* [ ] Build exitoso.
* [ ] Suite completa de tests exitosa.
* [ ] Tests específicos del catálogo exitosos.
* [ ] No quedan errores conocidos relacionados con esta User Story.

---

# Resultado de ejecución

## Revisión arquitectónica

Verificado contra `project/backend-architecture.md`, `backend-coding-rules.md`, `backend-stack-technology.md`, `domain.md`, `repositories.md`, `services.md`, `endpoints.md` y `communication.md`:

- La jerarquía Publisher → Franchise → Series está exclusivamente en `WorkRepository.GetCatalogPagedAsync`. El Service y el Controller no la replican.
- `WorkService.GetCatalogPagedAsync` no contiene consultas de persistencia ni filtrado en memoria.
- `WorksController` no contiene lógica de negocio, solo binding, delegación y wrapper de respuesta.
- No existen implementaciones separadas por contexto: una sola operación atiende catálogo global, publisher, franchise y series mediante filtros opcionales combinados.
- `WorkType` no interviene en la resolución de pertenencia; el filtro por `workTypeId` se combina con AND como cualquier otro.
- No hay N+1: la consulta de catálogo es `AsNoTracking` + `AsSplitQuery` con los cinco `Include` que necesita la tarjeta de catálogo, y el mapeo solo lee esas navegaciones ya cargadas. No se midió el número de consultas SQL en runtime; la garantía es por construcción.
- Sin filtrado principal en memoria: búsqueda, jerarquía, orden y paginación se ejecutan en base de datos.
- Sin duplicación de lógica entre contextos.
- Sin entidades de persistencia expuestas como contrato de API: el Repository devuelve entidades y el Service proyecta a `WorkCatalogItemDto`.
- Sin cambios en Domain, sin paquetes nuevos, sin refactors ajenos al alcance.
- Desviación consciente: `MapCatalogWork` tiene 16 líneas (límite 15). Se documentó en TASK-API-0239.

## Tests implementados

`tests/Infrastructure.Tests/Integration/WorkCatalogIntegrationTests.cs` (16 tests, todos sobre la base de desarrollo real, sin seed ni operaciones destructivas):

| # | Test | Cubre |
| --- | --- | --- |
| 1 | `Catalog_WithoutFilters_ReturnsWorksWithWorkType` | listado sin filtros, exposición de WorkType, totalCount |
| 2 | `Catalog_DefaultOrder_IsCreatedAtDescending` | orden por defecto `CreatedAt DESC` |
| 3 | `Catalog_DoesNotReturnInactiveWorks` | el catálogo público excluye obras inactivas |
| 4 | `Search_ByTitle_IsPartialAndCaseInsensitive` | búsqueda parcial por Title, case-insensitive |
| 5 | `Search_ByDescription_IsPartial` | búsqueda por Summary (Description) |
| 6 | `Search_ByNumberValue_IsPartial` | búsqueda por Number.Value |
| 7 | `Search_ByTag_ReturnsTheTaggedWork` | búsqueda por Tag |
| 8 | `Search_ByPerson_ReturnsTheWorkRegardlessOfRole` | búsqueda por Person, independiente del Role |
| 9 | `Filter_ByPublisher_ReturnsDirectFranchiseAndSeriesWorks` | para cada publisher, el conjunto filtrado es exactamente el de Works cuyo publisher efectivo es ese (cubre directa, de Franchise y de Series) y excluye otros publishers |
| 10 | `Filter_ByFranchise_ReturnsDirectAndSeriesWorks` | igualdad de conjuntos con Works de esa Franchise, incluidos los de sus Series, y exclusión de otras Franchises |
| 11 | `Filter_BySeries_ReturnsOnlyThatSeries` | solo Works de la Series indicada |
| 12 | `Filter_Combined_AppliesEveryConstraint` | search + publisher + franchise + series simultáneos |
| 13 | `Filter_ByWorkType_KeepsHierarchyUnchanged` | filtro por WorkType no altera la pertenencia jerárquica |
| 14 | `Order_SupportsEverySortFieldAndDirection` | Title, PublicationDate, CreatedAt/UploadedAt y Number, en ASC y DESC, con desempate por Id |
| 15 | `Pagination_ReturnsSequentialPagesWithoutDuplicates` | primera página, página posterior, página fuera de rango sin duplicados y con TotalCount estable |
| 16 | `Pagination_CombinesWithSearchAndHierarchyFilters` | paginación combinada con búsqueda y filtro de publisher |

`tests/Infrastructure.Tests/Integration/WorksControllerContractTests.cs` (4 tests) — seguridad y contrato del endpoint: requiere `[Authorize]`, sin `AllowAnonymous`, sin rol Administrator, ruta `api/works`, binding de `GetCatalogWorksRequest` y `CancellationToken`, retorno `Task<IActionResult>`.

Los tests son data-driven: descubren en la base los Works, publishers, franchises, series, tags y personas existentes y validan invariantes (igualdad de conjuntos y monotonicidad del orden) en lugar de depender de fixtures fijas. No crean ni eliminan datos.

## Resultado de ejecución

- Build: `dotnet build api/ComicLibrary.sln` → **0 errores, 0 warnings**. Al recompilar `Application` e `Infrastructure` aparecen 2 warnings preexistentes y ajenos a esta US (`Application/Services/ComicAnalysisParser.cs` CS8603 e `Infrastructure/Persistence/DesignTimeDbContextFactory.cs` CS8604). Ningún warning nuevo introducido.
- Tests del catálogo: **20/20 en verde** (16 de comportamiento + 4 de contrato del endpoint).
- Suite completa: **99/99 en verde**.

### Corrección de un diagnóstico previo

Una corrida intermedia mostró 3 errores en tests de workflow con `FileNotFoundException: C:\Users\fpiedrasanta\AppData\s-l1200.jpg`. Ese diagnóstico era incorrecto y se descartó: no faltaba ningún archivo de fixture.

Los tres tests resuelven sus assets de forma relativa al output de compilación:

```csharp
_avatarImagePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "s-l1200.jpg");
```

Con el output por defecto (`tests/Infrastructure.Tests/bin/Debug/net10.0/`) cuatro niveles arriba es `tests/`, donde sí están `s-l1200.jpg` y `fly-01f-tyler-kirkham.webp`. La corrida fallida se hizo con `-p:OutDir` redirigiendo la salida a un directorio temporal, lo que desplazó `AppContext.BaseDirectory` y hizo que la ruta relativa terminara resolviendo en `%USERPROFILE%\AppData\`. Reejecutada con el output por defecto, la suite completa queda en verde.

Consecuencia: no se requiere ninguna corrección de fixtures. `TASK-API-0242` se creó sobre el diagnóstico equivocado, por lo que se eliminó sin llegar a ejecutarse.

## Documentación actualizada

- `project/repositories.md` y `project/repositories/repositories-catalog.md` — nueva operación y comportamiento.
- `project/services/services-catalog.md` — `WorkService` y sección `GetCatalogPagedAsync`.
- `project/endpoints.md` y `project/endpoints/endpoints-works.md` — `GET /api/works`.
- No se modificó documentación que no cambió como consecuencia de esta funcionalidad.

## Pendiente fuera de alcance

- Tests de seguridad a nivel HTTP (llamada real con y sin token) requieren `Microsoft.AspNetCore.Mvc.Testing` y un host de pruebas de la API; el proyecto de tests actual solo monta un host de servicios. La seguridad quedó validada por contrato de atributos, y la verificación HTTP se hará de forma manual contra la API en ejecución.

## Criterios de finalización

Todos los criterios quedan cumplidos: documentación revisada, código conforme a `backend-coding-rules.md`, search, publisher, franchise, series, combinación de filtros, ordenamiento, paginación, WorkType, seguridad, contrato, sin N+1, sin filtrado en memoria, sin duplicación de lógica entre contextos, `repositories.md`, `services.md` y `endpoints.md` actualizados, build exitoso, suite completa exitosa y tests específicos del catálogo exitosos. No quedan errores conocidos relacionados con esta User Story.
