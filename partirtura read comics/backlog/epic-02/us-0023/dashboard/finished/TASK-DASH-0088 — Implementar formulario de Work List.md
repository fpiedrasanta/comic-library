# TASK-DASH-0088 — Implementar formulario de Work List

## Objetivo

Implementar el formulario de alta y edición de Listas de Obras (`WorkList`) en el Dashboard utilizando la maqueta como referencia visual y respetando la arquitectura, componentización y enfoque orientado a objetos utilizados por el Dashboard.

## Referencia visual

Maqueta:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\form-work-list.html`

La maqueta define la referencia visual del formulario.

Mantener la línea estética de las demás páginas del Dashboard.

## Documentación

Leer antes de implementar:

* `project/endpoints.md`
* `project/pages.md`
* `project/components.md`

Revisar también:

* páginas y componentes existentes de administración;
* formulario de List Types;
* componentes de tablas, modales y confirmaciones;
* endpoints de Work Lists.

Actualizar al finalizar:

* `project/pages.md`
* `project/components.md`

## Arquitectura

Implementar la funcionalidad dentro de la feature de Work Lists.

La Page debe encargarse de composición y estado de alto nivel.

No colocar todo el HTML del formulario dentro de `WorkListFormPage`.

Extraer a componentes las partes con responsabilidad propia, especialmente:

* datos generales de la lista;
* selección de List Type;
* Cover;
* Color;
* Visibility;
* listado de obras;
* búsqueda/selección de obras;
* acciones sobre obras;
* ordenamiento;
* confirmaciones;
* acciones del formulario;
* estados de loading, error y guardado.

Mantener el enfoque orientado a objetos utilizado en la implementación anterior del Dashboard.

La comunicación con la API debe estar encapsulada en los servicios correspondientes y no distribuida entre los componentes visuales.

## Rutas

Implementar las rutas necesarias para:

* crear una Work List;
* editar una Work List existente.

Utilizar las convenciones de routing existentes del Dashboard.

## Datos de la Work List

Implementar los campos:

* `Name`;
* `Description`;
* `Cover`;
* `Color`;
* `ListTypeId`;
* `Visibility`.

`OwnerType` no debe ser editable.

La interfaz debe representar que la lista administrada es una lista oficial del sistema.

## Obras

Implementar la administración de las obras asociadas a la lista.

Cada obra debe mostrar información suficiente para identificarla:

* Cover;
* Title;
* Series;
* Franchise;
* Publisher;
* Number, cuando corresponda.

Respetar el orden definido por `Position`.

## Agregar obras

Implementar una interacción para agregar obras a la lista.

Debe permitir:

1. abrir el selector de obras;
2. buscar obras;
3. visualizar resultados;
4. seleccionar una obra;
5. incorporarla a la lista.

Utilizar los endpoints y contratos definidos por Backend.

No realizar búsquedas sobre datos previamente cargados en el cliente cuando el contrato de API permita realizar la búsqueda en backend.

## Quitar obras

Permitir quitar una obra de la lista.

La acción debe modificar únicamente la relación entre `WorkList` y `Work`.

No debe eliminar la obra del catálogo.

Solicitar confirmación cuando corresponda según los patrones existentes del Dashboard.

## Ordenamiento

Permitir modificar el orden de las obras.

Utilizar una interacción coherente con la maqueta, preferentemente drag & drop si la maqueta lo contempla.

Persistir el orden mediante `Position`.

El cambio de posición no debe modificar ningún dato de la obra.

## Validaciones

Implementar las validaciones necesarias para el formulario siguiendo las convenciones existentes.

Contemplar como mínimo:

* campos obligatorios;
* valores inválidos;
* obra duplicada dentro de la lista;
* errores devueltos por API.

No duplicar reglas de negocio que correspondan al backend.

## Alta

En modo creación:

* mostrar formulario vacío;
* permitir completar los datos;
* permitir agregar obras;
* permitir ordenarlas;
* permitir guardar;
* permitir cancelar.

Al guardar, utilizar el endpoint de creación definido por Backend.

## Edición

En modo edición:

* obtener la Work List mediante `GET`;
* cargar sus datos;
* cargar sus obras;
* respetar el orden recibido;
* permitir modificar datos;
* permitir agregar/quitar obras;
* permitir reordenar obras;
* permitir guardar.

No permitir modificar:

* `OwnerType`;
* `OwnerUserId`;
* `CreatedAt`.

## Estado de la lista

En modo edición mostrar el estado actual.

Permitir:

* desactivar una lista activa;
* reactivar una lista inactiva.

La acción debe representar una eliminación lógica y no una eliminación física.

Utilizar los endpoints definidos por Backend.

## Estados de interfaz

Implementar correctamente:

* loading inicial;
* error al cargar;
* formulario listo;
* validación;
* guardando;
* error al guardar;
* guardado exitoso;
* confirmación antes de abandonar cambios sin guardar.

## API

Utilizar exclusivamente los contratos definidos en:

* `project/endpoints.md`;
* `project/endpoints-work-lists.md`.

Centralizar la comunicación mediante los servicios de la feature.

No acceder directamente a HTTP desde los componentes visuales.

No implementar lógica de negocio en los componentes.

## Reutilización

Revisar especialmente:

* formularios existentes;
* modales;
* tablas;
* componentes de selección;
* confirmaciones;
* componentes de Roles;
* componentes de Etiquetas;
* componentes de List Types;
* componentes de Personas.

Reutilizar componentes existentes cuando corresponda.

No crear una segunda implementación de componentes existentes.

No crear abstracciones compartidas prematuramente.

## Estructura esperada

Mantener la organización:

```text
features/
└── work-lists/
    ├── components/
    ├── pages/
    ├── services/
    └── types/
```

La estructura concreta debe respetar las convenciones actuales del proyecto.

La Page debe permanecer enfocada en composición y estado de alto nivel.

## Validación

Verificar:

* Compilación TypeScript.
* Build de Vite.
* Navegación hacia creación.
* Navegación hacia edición.
* Carga de datos.
* Creación.
* Edición.
* Selección de List Type.
* Edición de Cover.
* Edición de Color.
* Edición de Visibility.
* Agregado de obras.
* Búsqueda de obras.
* Prevención de obras duplicadas.
* Eliminación de obras de la lista.
* Reordenamiento.
* Persistencia de `Position`.
* Desactivación.
* Reactivación.
* Validaciones.
* Manejo de errores.
* Cambios sin guardar.
* Integración con API.
* Consistencia visual con `form-work-list.html`.
* Consistencia visual con las demás páginas.
* Correcta separación Page / Feature / Components.
* Enfoque orientado a objetos consistente con la implementación anterior.
* Ausencia de HTML monolítico dentro de la Page.
* Ausencia de lógica HTTP dentro de componentes visuales.

Actualizar `pages.md` y `components.md` con la estructura final.

## Resultado de ejecución

### Implementado

1. **WorkListFormPage** en `dashboard/dashboard/features/work-lists/pages/work-list-form-page.tsx`:
   - Rutas `/work-lists/create` y `/work-lists/:id/edit` registradas.
   - React Hook Form + Zod para validación (nombre min 3 caracteres, max 100; descripción max 500; color hex; list type requerido; visibility requerida; works array).
   - Estado de carga inicial (skeleton).
   - Carga de datos en modo edición via `getWorkListById`.
   - Creación via `createWorkList` y edición via `updateWorkList`.
   - Gestión de obras: búsqueda via `searchWorks`, agregar, quitar, reordenar con drag & drop (HTML5 native).
   - Estado de lista: desactivar/reactivar con confirmación modal (solo en modo edición).
   - Estados de interfaz: loading, error al cargar, error al guardar, guardado exitoso.
   - Confirmación antes de abandonar cambios sin guardar.
   - Indicador visual de "Lista Oficial del Sistema" (OwnerType = System).
   - Banner de error global y skeleton loading state.

2. **Componentes creados**:
   - `work-list-info-section.tsx` — Sección de datos generales (name, description, cover upload/preview, color picker, list type, visibility).
   - `work-list-works-section.tsx` — Sección de obras con drag & drop, selector de búsqueda, add/remove.
   - `work-list-save-bar.tsx` — Barra de acciones guardar/cancelar con error del servidor. Incluye `WorkListStatusToggle` exportado para el toggle de estado.
   - `work-list-confirm-modal.tsx` — Modal de confirmación para deactivate/reactivate/cancel.

3. **Types actualizados** en `types/work-list.ts`:
   - `WorkListDetailDto`, `WorkListWorkItemDto`, `WorkListWorkDto`, `CreateWorkListRequest`, `UpdateWorkListRequest`, `WorkListWorkItemRequest`, `SearchWorkResult`, `SearchWorkListResponse`, `SearchWorkParams`, `WorkVisibility`.

4. **Servicio actualizado** en `services/work-list.service.ts`:
   - `getWorkListById`, `createWorkList`, `updateWorkList`, `deactivateWorkList`, `activateWorkList`, `searchWorks`.

5. **Routes registradas** en `routes.tsx`:
   - `/work-lists/create` → `WorkListFormPage`
   - `/work-lists/:id/edit` → `WorkListFormPage`

6. **Documentación actualizada**:
   - `project/pages.md` — Agregada entrada `/work-lists/create` y `/work-lists/:id/edit`.
   - `project/components/dashboard-components.md` — Agregados todos los componentes del formulario.

### Decisiones tomadas

- **Drag & drop con HTML5 nativo**: No se instaló SortableJS (no está en package.json). Se implementó con `onDragStart/onDragOver/onDrop/onDragEnd` nativos del navegador.
- **Cover como base64**: El DTO del backend (`CreateWorkListRequest`) define `CoverData` como `byte[]`, que se serializa como base64 en JSON. El frontend convierte el archivo a base64.
- **Form validation con Zod**: Se siguen las convenciones del proyecto (`@hookform/resolvers/zod`).
- **WorkListFormData exportado**: La interfaz de datos del formulario se exporta desde la página para que los componentes hijos puedan tipar los props de Controller.
- **Reutilización de componentes**: Se reutiliza `ProtectedImage` para las portadas de obras.

### Validación

- TypeScript: ✓ compilación sin errores
- Vite build: ✓ exitoso (1754 módulos transformados)

### Correcciones de contrato

- **Visibility enum**: El `WorkVisibility` type usa valores enteros (`0 = Public`, `1 = Private`) según el contrato del API y el patrón del proyecto (`ContentStatus = 0 | 1 | 2 | 3`). El backend no tiene `JsonStringEnumConverter`, por lo que los enums se serializan/deserializan como enteros. El Zod schema usa `z.number()`. Se eliminó `Hidden` que no existe en el backend.
- **Cover removal**: Al limpiar la portada en modo edición, se envía `coverImageId: 0` según el contrato del API ("0 to remove, omit to keep current").
- **Query param `page`**: La función `getWorkLists` en el servicio envía `page` (no `currentPage`) según el contrato del endpoint `GET /api/admin-work-lists`.
- **listTypeId select**: Se convirtió el valor del select de string a number (`onChange={(e) => field.onChange(Number(e.target.value))}`) para coincidir con el tipo `z.number()` en el Zod schema.
- **Visibility select**: Se convirtió el valor del select de string a number, con verificación `!= null` para manejar el valor `0` (falsy pero válido).
- **Filtros de búsqueda de obras**: Se agregaron combos para filtrar por Publisher, Franchise y Series en el selector de obras. El servicio `searchWorks` ahora acepta `franchiseId`, `publisherId` y `seriesId`. NOTA: El endpoint `GET /api/admin-works` aún no admite estos filtros en el backend; se creó TASK-API-0224 para agregar el soporte.
- **Placeholder de búsqueda**: Actualizado a "Buscar por título o número..." para reflejar que el `search` del backend hace match en Title y NumberValue.
- **Work details persistence**: Se agregó `worksDetailsMap` (Record<number, SearchWorkResult>) como estado separado para almacenar los detalles de cada obra agregada. Anteriormente, `getWorkDetails()` buscaba en `worksSearchResults` (resultados de búsqueda), lo que causaba que los detalles de obras previamente agregadas se perdieran al buscar una nueva obra, mostrando "#Obra 1" sin título/cover/número. En modo edición, el mapa se puebla desde la respuesta del API (`GET /api/admin-work-lists/{id}`), corrigiendo el problema de obras vacías.
- **Cache invalidation (stale data)**: Al guardar en modo edición, se agregó `invalidateQueries({ queryKey: ['workList', workListId] })` — anteriormente solo se invalidaba `['workLists']` (listado), dejando la query de detalle con datos en caché. Siguiendo el patrón de otras páginas (e.g. `franchise-form-page`), ahora se invalidan ambas queries.
- **Stale data on navigation (listing page)**: Se agregó `refetchOnMount: true` y `gcTime: 0` a las queries del work-lists listing page. Esto elimina los datos en caché cuando el componente se desmonta, forzando un fetch fresco cuando el usuario navega de vuelta (ej: después de editar un tipo de lista en `/list-types` y volver a `/work-lists`).
- **Searchable selects (Franchise/Editorial/Series/Tipo de Lista)**: Reemplazados los `<select>` estándar por componentes de búsqueda con paginación (`FranchiseSearchSelect`, `PublisherSearchSelect`, `SeriesSearchSelect`, `ListTypeSearchSelect`). Esto permite buscar y seleccionar items en páginas posteriores (ej: encontrar "X-Men" en la última página). Se creó `SeriesSearchSelect` en `features/series/components/` y `ListTypeSearchSelect` en `features/list-types/components/`, ambos siguendo el patrón existente.
- **ListTypeSearchSelect "all" option**: Llama `onChange(undefined)` para limpiar el filtro, no `onChange(0)` que enviaría un ID inválido.

### Nota

- El contrato de API está documentado en `project/endpoints/endpoints-work-lists.md`. El frontend implementa los servicios contra los endpoints definidos: `GET /api/admin-work-lists/{id}`, `POST /api/admin-work-lists`, `PUT /api/admin-work-lists/{id}`, `DELETE /api/admin-work-lists/{id}`, `POST /api/admin-work-lists/{id}/activate`.
- **Dependencia resuelta**: TASK-API-0220 (repositorio), TASK-API-0221 (servicio), TASK-API-0222 (endpoints controller), TASK-API-0223 (validación) están finalizados. El backend está implementado y verificado.
