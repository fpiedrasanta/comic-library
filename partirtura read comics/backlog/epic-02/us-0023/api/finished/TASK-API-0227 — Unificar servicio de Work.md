# TASK-API-0227 — Unificar servicio de Work

## Objetivo

Adaptar la capa de servicios al nuevo modelo de dominio en el que todas las obras son representadas por una única entidad `Work`.

La capa de aplicación debe dejar de diferenciar `GraphicNovel` como entidad independiente.

El servicio debe trabajar con una única operación conceptual de creación y actualización de `Work`, recibiendo un `WorkTypeId` que únicamente clasifica la obra.

**`WorkType` no define reglas de negocio ni determina qué propiedades de `Work` son obligatorias.**

El servicio debe validar la integridad de los datos recibidos y las relaciones existentes, pero no interpretar el significado del `WorkType`.

## Documentación obligatoria

Antes de modificar código:

1. Leer `project/services.md`.
2. Revisar `project/services/services-catalog.md`.
3. Inspeccionar los servicios actuales relacionados con:

   * `Work`
   * `GraphicNovel`
   * `Number`
   * `Series`
4. Revisar los DTOs actualmente utilizados por esas operaciones.
5. Revisar `project/endpoints.md` para comprender los contratos actuales que deberán ser reemplazados posteriormente.

Al finalizar:

* actualizar `project/services/services-catalog.md`;
* documentar cualquier decisión relevante derivada de la unificación.

## Alcance

### 1. Unificar las operaciones de Work

Adaptar `IWorkService` y `WorkService` para que `Work` sea la única entidad utilizada para:

* crear obras;
* obtener obras;
* obtener una obra por Id;
* actualizar obras;
* cambiar su estado cuando corresponda.

Eliminar la dependencia conceptual de un servicio especializado de `GraphicNovel`.

Si existen métodos específicos de `GraphicNovel` cuya funcionalidad pueda expresarse mediante `Work`, reemplazarlos por las operaciones correspondientes sobre `Work`.

### 2. WorkType

El servicio debe recibir y persistir `WorkTypeId`.

Debe comprobar que el `WorkType` indicado:

* existe;
* cumple las condiciones generales de integridad que correspondan al catálogo.

Pero **no debe interpretar su nombre ni su significado**.

No implementar lógica como:

```text id="3x5l5k"
if WorkType == "Number"
```

ni:

```text id="q1n2kv"
if WorkType.Name == "Graphic Novel"
```

ni ninguna variante equivalente.

El servicio debe poder aceptar un `WorkType` creado posteriormente mediante el CRUD sin necesidad de modificar código.

### 3. Datos opcionales de Work

La request unificada debe poder recibir los datos opcionales de `Work`, incluyendo cuando correspondan:

```text id="r8pnq4"
SeriesId
NextNumberId
PreviousNumberId
```

Estos valores pueden ser `null`.

El servicio debe validar únicamente su integridad:

* si `SeriesId` tiene valor, la `Series` debe existir;
* si `NextNumberId` tiene valor, el `Work` referenciado debe existir;
* si `PreviousNumberId` tiene valor, el `Work` referenciado debe existir;
* las referencias no deben apuntar a entidades inexistentes;
* respetar las restricciones estructurales existentes del dominio.

No determinar la validez de estos campos a partir de `WorkType`.

### 4. Creación

Implementar la creación de una `Work` unificada.

La operación debe:

1. Validar los datos generales.
2. Validar que `WorkTypeId` existe.
3. Resolver las relaciones indicadas.
4. Crear una única entidad `Work`.
5. Persistirla mediante `IWorkRepository`.
6. Ejecutar la operación dentro de la transacción correspondiente cuando sea necesario.
7. Retornar el resultado según las convenciones actuales del servicio.

Una obra sin `SeriesId`, `NextNumberId` o relaciones de numeración debe ser una situación válida.

### 5. Actualización

Implementar la actualización de `Work` utilizando la misma representación unificada.

Debe permitir modificar:

* datos generales;
* `WorkTypeId`;
* `SeriesId`;
* `NextNumberId`;
* `PreviousNumberId`;
* demás propiedades correspondientes a `Work`.

Las relaciones que sean opcionales deben poder establecerse en `null`.

No introducir reglas que impidan cambiar un `WorkType` por otro basándose en el significado de los tipos.

### 6. GraphicNovel

Eliminar del servicio cualquier flujo que trate `GraphicNovel` como una entidad diferente.

Una obra que anteriormente era una `GraphicNovel` ahora debe ser simplemente un `Work` cuyo `WorkTypeId` identifica su clasificación.

No crear un nuevo `GraphicNovelService`.

### 7. Number

Preservar la funcionalidad existente relacionada con obras numeradas.

La información que actualmente utiliza la pantalla de Numbers debe poder seguir representándose mediante `Work`.

El servicio no debe determinar que una obra es un Number mediante `WorkType`.

La identificación del tipo pertenece al dato `WorkTypeId` recibido por la operación.

### 8. DTOs

Adaptar los DTOs de Application necesarios para representar el nuevo `Work` unificado.

La request de creación y actualización debe utilizar una única representación de `Work`.

Debe ser posible enviar:

```json
{
  "workTypeId": 1,
  "title": "...",
  "seriesId": 15,
  "nextNumberId": 123,
  "previousNumberId": 121
}
```

y también:

```json
{
  "workTypeId": 2,
  "title": "...",
  "seriesId": null,
  "nextNumberId": null,
  "previousNumberId": null
}
```

sin que el servicio interprete qué significa cada `WorkType`.

Los nombres y estructuras finales deben respetar las convenciones existentes del proyecto.

## Validaciones

Mantener únicamente validaciones generales y estructurales, por ejemplo:

* campos requeridos;
* longitudes;
* formatos;
* existencia de entidades relacionadas;
* duplicados cuando correspondan;
* integridad de relaciones;
* restricciones existentes del dominio.

No agregar validaciones semánticas derivadas de `WorkType`.

En particular, no asumir que:

```text id="m6fdj8"
WorkType = X
→ determinadas propiedades son obligatorias
```

## Transacciones

Mantener las transacciones existentes cuando una operación modifique múltiples entidades o relaciones.

Las operaciones deben ser atómicas cuando corresponda.

No introducir transacciones innecesarias para operaciones simples.

## Fuera de alcance

Esta task NO debe modificar:

* Controllers.
* Endpoints.
* Dashboard.
* Public Web.
* CRUD de `WorkType`.
* Reglas visuales o de UX.
* Migraciones adicionales salvo las estrictamente necesarias para que el servicio compile con el nuevo modelo.

La unificación de los endpoints se realizará en la siguiente task.

## Criterios de aceptación

* [ ] Existe una única abstracción de servicio para `Work`.
* [ ] `GraphicNovel` ya no tiene un flujo de servicio independiente.
* [ ] Crear una obra utiliza una única operación de `Work`.
* [ ] Actualizar una obra utiliza una única operación de `Work`.
* [ ] `WorkTypeId` se valida por existencia.
* [ ] El servicio no interpreta el nombre ni el significado de `WorkType`.
* [ ] `SeriesId` puede ser `null`.
* [ ] `NextNumberId` puede ser `null`.
* [ ] `PreviousNumberId` puede ser `null`.
* [ ] Las referencias no nulas se validan por existencia.
* [ ] Las obras numeradas existentes continúan pudiendo representarse.
* [ ] Las Graphic Novels existentes continúan pudiendo representarse como `Work`.
* [ ] Cualquier nuevo `WorkType` creado mediante CRUD puede utilizarse sin modificar el servicio.
* [ ] Los DTOs de creación y actualización representan una única `Work`.
* [ ] Se mantienen las transacciones necesarias.
* [ ] `project/services/services-catalog.md` queda actualizado.
* [ ] La solución compila sin errores ni warnings.
* [ ] Los tests existentes relacionados con Work continúan pasando.

## Resultado de la ejecución

### Qué se implementó

* `WorkService` unificado: `CreateAsync`, `CreateWithContentAsync`, `UpdateAsync`, `GetByIdAsync`, `GetPagedAsync`, `ActivateAsync`, `DeactivateAsync`.
* `WorkContentService` creado (reemplaza `NumberContentService` + `GraphicNovelContentService`).
* DTOs unificados: `CreateWorkRequest`, `CreateWorkWithContentRequest`, `UpdateWorkRequest`, `WorkDetailDto`, `WorkContentDtos`.
* Eliminados `NumberService`, `GraphicNovelService`, `NumberContentService`, `GraphicNovelContentService`, `NumberAnalysisService` y sus DTOs.
* Registro DI actualizado en `Program.cs`.
* Documentación actualizada: `services-catalog.md`, `services.md`.

### Archivos modificados

* `Application/Services/WorkService.cs`
* `Application/Services/WorkContentService.cs` (nuevo)
* `Application/DTOs/WorkDtos.cs` (reemplaza DTOs antiguos)
* `Application/DTOs/WorkContentDtos.cs` (nuevo)
* `Application/DTOs/WorkListItemDto.cs`
* `Application/Interfaces/IWorkService.cs`
* `Application/Interfaces/IWorkContentService.cs` (nuevo)
* `Api/Program.cs`
* `project/services/services-catalog.md`
* `project/services/services.md`

### Decisiones relevantes

* `WorkTypeId` se valida por existencia; no se interpreta su nombre.
* Jerarquía validada en servicio: exactamente uno de `PublisherId`/`FranchiseId`/`SeriesId` debe estar seteado.
* `WorkContentService` centraliza todo el manejo de contenido CBR para cualquier `Work`.

### Notas

* La solución compila sin errores ni warnings.
