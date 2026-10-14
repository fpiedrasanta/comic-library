# TASK-DASH-0098 — Agregar Description a Series

## Objetivo

Agregar el campo `Description` al formulario de Series del Dashboard, tanto para:

* crear;
* editar.

Tomar como referencia la implementación existente de `Franchise`.

## Formulario

Agregar:

**Descripción**

como campo de texto multilínea.

Debe:

* utilizar el valor existente al editar;
* permitir dejarlo vacío;
* enviar `null`/vacío según el contrato existente;
* mostrar correctamente errores de validación si el backend los devuelve.

No agregar reglas de validación frontend que no existan en el contrato backend.

## Create

Al crear una Series:

* mostrar el campo Description;
* incluirlo en el request;
* verificar que el valor se persista;
* permitir crear sin Description.

## Edit

Al editar una Series:

* cargar Description desde el detalle existente;
* permitir modificarla;
* permitir eliminarla;
* enviar el nuevo valor al backend.

## UI

Mantener el mismo patrón visual y de componentes utilizado por Franchise para Description.

No duplicar componentes si ya existe un componente reutilizable para campos de descripción.

## Contrato

Adaptar los tipos/interfaces del frontend al nuevo contrato de API.

No realizar lógica de persistencia ni transformar el contenido de la descripción innecesariamente.

## Validación

* Crear Series con Description.
* Crear Series sin Description.
* Editar Description.
* Eliminar Description.
* Recargar una Series editada y verificar que conserva el valor.
* Verificar que el formulario existente no pierda ningún otro campo.
* TypeScript/build sin errores.

No modificar el listado ni otras pantallas de Series fuera del alcance de esta task.

## Resultado de la ejecución

### Qué se implementó

Se agregó el campo `Description` al formulario de Series del Dashboard, tanto para crear como para editar, siguiendo el mismo patrón visual y de comportamiento del formulario de Franchise.

### Cambios realizados

- `dashboard/types/series.ts`: agregado `description: string | null` a `SeriesDetailDto`.
- `dashboard/pages/series-form-page.tsx`:
  - Schema Zod: agregado `description: z.string().max(500, 'Máximo 500 caracteres.').optional().or(z.literal(''))`.
  - `defaultValues` del formulario: agregado `description: ''`.
  - Edición: carga `detail.description || ''` en el `reset` del formulario.
  - Submit create/edit: agrega `description` al `FormData` enviado al backend.
  - UI: textarea multilínea "Descripción" debajo del nombre, con placeholder y validación de error.

### Decisiones relevantes

- Se envió `watch('description') || ''` para cumplir con el contrato actual de FormData sin introducir lógica de transformación adicional.
- Se mantuvo la validación frontend alineada con la existente en Franchise: máximo 500 caracteres, sin reglas nuevas.
- No se modificó el listado de Series ni otras pantallas fuera del alcance.
- El backend de Series (`SeriesDetailDto`, `UpdateSeriesRequest`) aún no incluye `Description` en este commit; queda pendiente del backend `TASK-API-0248`. El frontend quedó adaptado para soportarlo cuando el backend lo exponga.

### Notas

- Typecheck y build pasan sin errores.
- Cuando el backend incorpore `Description`, el formulario ya está preparado para enviarlo, recibirlo y editarlo.
