# TASK-DASH-0089 — Implementar formulario unificado de Work

## Objetivo

Implementar el formulario unificado de alta y edición de `Work` en el Dashboard.

El nuevo formulario debe reemplazar los formularios actuales utilizados para:

* Number;
* Graphic Novel.

El formulario debe funcionar funcionalmente como el formulario actual de Number, pero representar la nueva entidad `Work`.

La implementación debe realizarse desde cero sobre la arquitectura actual del Dashboard, utilizando **componentización**, separación de responsabilidades y organización por feature.

No colocar todo el HTML dentro de la Page.

---

## Referencia funcional

Utilizar como referencia el formulario actual de alta/edición de Number.

La experiencia de uso, campos, comportamiento, validaciones, mensajes, estados y flujo general deben mantenerse equivalentes a la implementación actual de Number, salvo las modificaciones indicadas explícitamente en esta task.

El nuevo formulario debe incorporar el nuevo modelo unificado de `Work`.

---

## Documentación

Leer antes de implementar:

* `project/project.md`

* `project/communication.md`

* `project/dashboard-architecture.md`

* `project/frontend-dashboard-stack-technology.md`

* `project/frontend-dashboard-agent.md`

* `project/frontend-coding-rules.md`

* `project/endpoints.md`

* `project/pages.md`

* `project/components.md`

Revisar también:

* implementación actual del formulario de Number;

* implementación actual del formulario de Graphic Novel;

* componentes reutilizables existentes;

* servicios existentes utilizados para Number, Graphic Novel, Series, Franchise y Publisher.

Actualizar al finalizar:

* `project/pages.md`

* `project/components.md`

---

## Unificación

Crear un único formulario para representar `Work`.

La nueva implementación debe reemplazar conceptualmente a:

```text
NumberForm
GraphicNovelForm
```

No crear dos variantes del nuevo formulario.

Debe existir una única implementación reutilizable de:

```text
WorkForm
```

El formulario debe utilizarse tanto para:

* alta;
* edición.

---

## Estructura

Organizar la funcionalidad dentro de una feature propia de Work.

La estructura debe seguir el patrón utilizado por el Dashboard:

```text
features/

└── works/

    ├── components/

    ├── pages/

    ├── services/

    └── types/
```

La estructura concreta debe respetar las convenciones actuales del proyecto.

La Page debe encargarse de:

* composición;
* estado de alto nivel;
* carga inicial;
* coordinación del formulario;
* navegación;
* integración con el servicio.

No debe contener todo el HTML del formulario.

---

## Componentización

Extraer a componentes las partes que tengan responsabilidad propia.

Por ejemplo:

* información general de la obra;
* tipo de obra;
* información de numeración;
* relaciones Previous / Next;
* información contextual;
* acciones de guardado;
* acciones de estado;
* confirmaciones;
* estados de loading;
* estados de error.

La división concreta debe surgir de la implementación y de las responsabilidades reales de cada sección.

No crear componentes artificialmente pequeños.

No colocar todo el formulario dentro de `WorkFormPage`.

No crear abstracciones compartidas prematuramente.

Reutilizar componentes existentes cuando corresponda.

---

## Datos de Work

El formulario debe trabajar con la nueva representación unificada de `Work`.

Debe contemplar, como mínimo, los datos que actualmente maneja el formulario de Number y los nuevos datos correspondientes al modelo unificado.

Entre ellos:

* `WorkType`;
* Title;
* Number Value;
* Previous Work;
* Next Work;
* demás campos que actualmente correspondan a Work.

Los nombres exactos deben respetar los contratos definidos por Backend.

---

## Number Value

El campo correspondiente al número de la obra debe dejar de ser obligatorio.

Debe poder quedar vacío.

El usuario debe poder crear una obra sin Number Value.

No inferir el `WorkType` a partir de la existencia o ausencia de Number Value.

---

## Previous y Next

Los campos Previous y Next deben ser opcionales.

Debe ser posible:

* no seleccionar Previous;
* no seleccionar Next;
* seleccionar solamente Previous;
* seleccionar solamente Next;
* seleccionar ambos.

No asociar estos campos al `WorkType`.

Por ejemplo, una obra clasificada como Graphic Novel puede tener Previous y Next.

El formulario no debe impedir esta combinación.

---

## WorkType

Agregar al formulario la selección de `WorkType`.

Utilizar el CRUD/API existente de `WorkType` como fuente de datos.

El formulario debe:

* cargar los Work Types disponibles;
* permitir seleccionar un Work Type;
* enviar el `WorkTypeId` correspondiente.

No implementar reglas condicionales basadas en el nombre del Work Type.

No implementar lógica como:

```text
if WorkType == Number
```

ni:

```text
if WorkType == Graphic Novel
```

El formulario debe tratar `WorkType` como un dato de clasificación.

---

## Contexto

El formulario debe soportar un contexto de pertenencia.

Una `Work` puede depender de:

* Publisher;
* Franchise;
* Series.

El contexto debe ser recibido por la Page/formulario y determinar la dependencia de la obra.

### Series

Cuando el formulario sea abierto desde una Series para crear una obra:

```text
SeriesId = contexto actual
PublisherId = null
FranchiseId = null
```

La experiencia debe mantener el comportamiento actual de "Nuevo número" desde Series.

### Franchise

Cuando el formulario sea abierto desde una Franchise para crear una obra:

```text
FranchiseId = contexto actual
PublisherId = null
SeriesId = null
```

La acción debe presentarse como "Nueva Obra".

### Publisher

Cuando el formulario sea abierto desde un Publisher para crear una obra:

```text
PublisherId = contexto actual
FranchiseId = null
SeriesId = null
```

La acción debe presentarse como "Nueva Obra".

---

## Contexto no editable

La dependencia contextual no debe ser seleccionable arbitrariamente desde el formulario.

Si el formulario fue abierto desde una Series, debe conservar la Series recibida.

Si fue abierto desde una Franchise, debe conservar la Franchise recibida.

Si fue abierto desde un Publisher, debe conservar el Publisher recibido.

El formulario no debe permitir cambiar una obra de contexto agregando manualmente otra dependencia.

La representación visual del contexto debe ser clara para el usuario.

---

## Edición

El mismo formulario debe utilizarse para editar una `Work`.

Al abrir una edición, la información de pertenencia debe provenir de la `Work` obtenida desde Backend.

No asumir que la obra pertenece al contexto desde el cual se abrió la pantalla.

El Backend es la fuente de verdad.

El formulario debe cargar y preservar correctamente:

* Publisher;
* Franchise;
* Series.

Si una obra pertenece a una Series, debe continuar perteneciendo a esa Series.

Si pertenece a una Franchise, debe continuar perteneciendo a esa Franchise.

Si pertenece a un Publisher, debe continuar perteneciendo a ese Publisher.

La edición no debe perder ni alterar la referencia contextual al guardar.

---

## Alta

El formulario debe soportar alta mediante el contexto recibido.

Ejemplos:

```text
Series
  ↓
Nuevo número
  ↓
WorkForm
  ↓
Work asociada a Series
```

```text
Franchise
  ↓
Nueva obra
  ↓
WorkForm
  ↓
Work asociada a Franchise
```

```text
Publisher
  ↓
Nueva obra
  ↓
WorkForm
  ↓
Work asociada a Publisher
```

El formulario debe utilizar el mismo componente en los tres casos.

---

## Listado general

El listado general de Works no debe utilizar este formulario para crear nuevas obras.

La creación contextual se realizará desde:

* Series;
* Franchise;
* Publisher.

El formulario sí debe soportar edición cuando se acceda desde el listado general.

---

## API

Utilizar los endpoints unificados definidos por Backend para `Work`.

Consultar:

* `project/endpoints.md`

La comunicación con la API debe estar encapsulada en el servicio de la feature.

Los componentes visuales no deben realizar llamadas HTTP directamente.

El formulario debe utilizar una única operación de creación y una única operación de actualización de `Work`.

No utilizar endpoints específicos de:

```text
Number
GraphicNovel
```

---

## Eliminación de formularios anteriores

Una vez implementado y validado el nuevo formulario:

Eliminar de la aplicación los formularios específicos anteriores de:

* Number;
* Graphic Novel.

No mantener implementaciones duplicadas.

No mantener rutas activas que permitan acceder a los formularios anteriores.

Las funcionalidades que antes utilizaban esos formularios deben quedar preparadas para utilizar el nuevo `WorkForm`.

La adaptación de los listados y navegación contextual será realizada en tasks posteriores.

---

## Reutilización

Revisar especialmente:

* componentes utilizados por el formulario actual de Number;
* componentes utilizados por el formulario actual de Graphic Novel;
* componentes de búsqueda y selección de Works;
* componentes de Series;
* componentes de Franchise;
* componentes de Publisher;
* componentes de formularios existentes;
* componentes de carga de imágenes;
* componentes de modales;
* componentes de acciones de guardado.

Reutilizar lo que corresponda.

No duplicar componentes existentes.

No trasladar mecánicamente el HTML monolítico del formulario actual de Number.

---

## Estados

Implementar correctamente:

* loading inicial;
* loading de datos relacionados;
* estado de formulario vacío;
* errores de carga;
* errores de validación;
* errores provenientes del API;
* guardado;
* guardado exitoso;
* cancelación;
* edición;
* obra activa/inactiva cuando corresponda.

Mantener la experiencia existente del formulario de Number cuando sea aplicable.

---

## Validaciones

Mantener las validaciones actuales que sigan siendo válidas para `Work`.

Modificar las siguientes:

* Number Value es opcional.
* Previous es opcional.
* Next es opcional.

No crear validaciones basadas en `WorkType`.

No asumir que:

```text
WorkType = X
→ Number obligatorio
```

ni:

```text
WorkType = X
→ Previous/Next prohibidos
```

El formulario debe permitir las combinaciones admitidas por el contrato de Backend.

---

## Navegación

Implementar las rutas necesarias para alta y edición siguiendo las convenciones actuales del Dashboard.

La implementación debe permitir que posteriormente las distintas listas naveguen hacia el mismo formulario proporcionando el contexto correspondiente.

No crear rutas diferentes para:

```text
Number
GraphicNovel
```

El recurso administrado es:

```text
Work
```

---

## Validación

Verificar:

* Compilación TypeScript.
* Build de Vite.
* Alta de Work.
* Edición de Work.
* Carga de WorkType.
* Selección de WorkType.
* Alta con Number Value.
* Alta sin Number Value.
* Alta con Previous.
* Alta con Next.
* Alta con Previous y Next.
* Alta sin Previous ni Next.
* Alta desde contexto Series.
* Alta desde contexto Franchise.
* Alta desde contexto Publisher.
* Preservación del contexto durante la edición.
* Edición de una Work sin Series.
* Edición de una Work sin Franchise.
* Edición de una Work sin Publisher.
* Manejo de errores.
* Manejo de loading.
* Guardado exitoso.
* Integración con el endpoint unificado de Work.
* Ausencia de llamadas a endpoints específicos de Number.
* Ausencia de llamadas a endpoints específicos de Graphic Novel.
* Correcta separación Page / Feature / Components.
* Ausencia de HTML monolítico dentro de la Page.
* Ausencia de lógica de API dentro de componentes visuales.
* Reutilización correcta de componentes existentes.
* Consistencia visual y funcional con el formulario actual de Number.

Actualizar `pages.md` y `components.md` con la estructura final de la nueva feature.

## Restricciones

* No implementar las modificaciones de los listados de Franchise, Series o Publisher en esta task.
* No implementar el nuevo botón de Publisher en esta task.
* No implementar todavía la navegación contextual desde los tres listados.
* No crear formularios separados por contexto.
* No crear formularios separados por WorkType.
* No interpretar semánticamente `WorkType`.
* No duplicar el formulario para Number y Graphic Novel.
* No colocar todo el HTML dentro de la Page.
* No implementar llamadas HTTP directamente desde componentes visuales.
* Respetar la arquitectura y reglas de código actuales del Dashboard.

---

## Restricciones

* No implementar las modificaciones de los listados de Franchise, Series o Publisher en esta task.
* No implementar el nuevo botón de Publisher en esta task.
* No implementar todavía la navegación contextual desde los tres listados.
* No crear formularios separados por contexto.
* No crear formularios separados por WorkType.
* No interpretar semánticamente `WorkType`.
* No duplicar el formulario para Number y Graphic Novel.
* No colocar todo el HTML dentro de la Page.
* No implementar llamadas HTTP directamente desde componentes visuales.
* Respetar la arquitectura y reglas de código actuales del Dashboard.

---

## Resultado de ejecución

### Estado: Finished

### Archivos nuevos
- `features/works/work-form.tsx` — Wrapper del formulario que consume `useWorkForm`, compone todas las secciones, maneja submit y confirmation modal.
- `features/works/contexts/work-form-context.tsx` — Context + Provider con todo el estado del formulario (mode, workTypeId, languageId, isActive, personByRoles, tags, previous/next work, contenido, imágenes, AI suggestions, modales, handlers, maps de nombres).
- `features/works/components/work-type-search-select.tsx` — Select de WorkType desde `/api/admin-work-types`.
- `features/works/components/work-basic-info-section.tsx` — WorkType, título, idioma, descripción, fecha de publicación, número. Muestra AI suggestions.
- `features/works/components/work-number-navigation.tsx` — Navegación previous/next work (SearchSelect perWork).
- `features/works/components/work-person-roles-section.tsx` — Pares persona+rol con botones de crear inline y recommendations.
- `features/works/components/work-tags-section.tsx` — Tag input con AI recommended tags (accept/dismiss).
- `features/works/components/work-context-display.tsx` — Display del contexto inmutable (Publisher/Franchise/Series).
- `features/works/components/work-save-bar.tsx` — Barra de acciones: save (loading), cancel, error.
- `features/works/components/work-alerts.tsx` — Alerts de success y error.
- `features/works/components/work-confirm-modal.tsx` — Modal de confirmación de guardado.
- `features/works/components/work-create-entity-modals.tsx` — Modales para crear Persona/Rol inline (desde context).
- `features/works/components/work-content-section.tsx` — CBR upload, galería de imágenes con selección de cover, multi-image selection para AI, content retry/delete.
- `features/works/components/work-search-select.tsx` — SearchSelect reutilizable para buscar Works (usado en previous/next).
- `features/works/pages/work-form-page.tsx` — Page del formulario unificado: composición, estado alto nivel, carga inicial, coordinación del formulario, navegación, integración con servicio, session storage persistence, content status polling.

### Archivos modificados
- `features/works/services/works.service.ts` — `publicationDate` cambiado a `string | undefined` en payloads; eliminado import no usado `WorkTypeDto`.
- `pages/works-page.tsx` — Adaptado al modelo unificado de Work.
- `app/router/routes.tsx` — Agregadas rutas `/works/create` y `/works/:id/edit`.
- `types/works.ts` — Ya existía con el modelo unificado completo.
- `project/pages.md` — Documentación actualizada.
- `project/components/dashboard-components.md` — Documentación actualizada.

### Decisiones
- Se adoptó `WorkFormContext` con patrón Provider para manejar el estado complejo del formulario.
- Se utilizó React Hook Form + Zod para validaciones.
- La navegación de edición siempre va a `/works/:id/edit`. El backend provee el contexto real, no se infiere desde el listado origen.
- El modo create requiere CBR y usa `createWorkWithContent`; el modo edit usa `updateWork` o `updateWorkWithContent`.

### Notas
- La reimplementación corregida se completó en esta sesión, cumpliendo el requisito de "igual que Number" para create mode.

