# TASK-DASH-0094 — Validación final de la unificación de Work

## Objetivo

Realizar la validación final de la migración del Dashboard hacia la entidad unificada `Work`.

No agregar nuevas funcionalidades.

El objetivo es detectar y corregir inconsistencias, referencias obsoletas o comportamientos incorrectos derivados de la eliminación de los formularios y listados específicos de `Number` y `GraphicNovel`.

## Documentación

Antes de comenzar, leer:

* `project/project.md`
* `project/communication.md`
* `project/dashboard-architecture.md`
* `project/frontend-dashboard-stack-technology.md`
* `project/frontend-dashboard-agent.md`
* `project/frontend-coding-rules.md`
* `project/endpoints.md`
* `project/pages.md`
* `project/components.md`

Revisar además las tareas:

* `TASK-DASH-0089`
* `TASK-DASH-0090`
* `TASK-DASH-0091`
* `TASK-DASH-0092`
* `TASK-DASH-0093`

## Validación funcional

Verificar el flujo completo de Works:

### Work general

```text
/api/admin-works
```

Debe:

* listar Works;
* permitir búsqueda;
* permitir filtros correspondientes;
* permitir ordenamiento;
* permitir paginación;
* permitir edición;
* no permitir creación.

### Works de Publisher

```text
/api/admin-works/publisher/{id}
```

Debe:

* listar únicamente Works dependientes de ese Publisher;
* permitir búsqueda, filtros, ordenamiento y paginación;
* permitir crear una nueva obra con `PublisherId`;
* permitir editar Works.

### Works de Franchise

```text
/api/admin-works/franchise/{id}
```

Debe:

* listar únicamente Works dependientes de ese Franchise;
* permitir búsqueda, filtros, ordenamiento y paginación;
* permitir crear una nueva obra con `FranchiseId`;
* permitir editar Works.

### Works de Series

```text
/api/admin-works/series/{id}
```

Debe:

* listar únicamente Works dependientes de esa Series;
* permitir búsqueda, filtros, ordenamiento y paginación;
* permitir crear un nuevo número con `SeriesId`;
* permitir editar Works.

## WorkForm

Verificar que exista un único formulario para Work.

Debe soportar:

* creación;
* edición;
* WorkType;
* Number Value opcional;
* Previous opcional;
* Next opcional;
* contexto de Publisher;
* contexto de Franchise;
* contexto de Series.

No debe existir un formulario independiente para:

* Number;
* GraphicNovel.

## Contexto

Verificar que el contexto nunca se determine por `WorkType`.

`WorkType` solamente clasifica el Work.

No debe existir código equivalente a:

```text
if WorkType == Number
```

o:

```text
if WorkType == GraphicNovel
```

para determinar qué relaciones son válidas.

La validez de las relaciones pertenece al estado concreto del Work.

## Edición desde cualquier listado

Verificar que un mismo Work pueda editarse desde:

* listado general;
* Publisher;
* Franchise;
* Series.

La dependencia debe obtenerse del backend.

El frontend no debe asumir:

```text
"vengo de Series → entonces pertenece a Series"
```

sino:

```text
"obtengo el Work → uso su contexto real"
```

Al guardar, no debe perderse ninguna relación existente.

## API

Revisar todas las llamadas relacionadas con Works y eliminar cualquier dependencia funcional obsoleta de:

```text
/api/admin-numbers
```

o endpoints específicos de GraphicNovel.

El Dashboard debe utilizar exclusivamente la API unificada de Works.

## Código obsoleto

Buscar y eliminar referencias que hayan quedado sin uso relacionadas con:

* Number;
* GraphicNovel;
* NumberForm;
* GraphicNovelForm;
* servicios específicos de Number;
* tipos específicos de Number;
* rutas antiguas;
* navegación antigua;
* componentes antiguos;
* imports obsoletos.

No eliminar código que todavía sea utilizado legítimamente por otras funcionalidades.

## WorkType

Verificar que el frontend obtenga los WorkTypes mediante la API correspondiente y no tenga una lista hardcodeada.

No agregar comportamiento especial basado en el nombre del WorkType.

Agregar un nuevo WorkType en el catálogo no debe requerir modificar el Dashboard.

## Arquitectura

Verificar:

* Page = composición y estado de alto nivel.
* Components = presentación y comportamiento visual específico.
* Services = comunicación con API.
* Types = contratos utilizados por la feature.
* No existen llamadas HTTP desde componentes visuales.
* No existen Pages monolíticas.
* No existen duplicaciones innecesarias.
* Se reutilizan componentes existentes cuando corresponde.
* No se introdujeron abstracciones prematuras.

## Documentación

Actualizar:

* `project/pages.md`
* `project/components.md`

La documentación debe reflejar el estado final real de las páginas y componentes después de la unificación.

No modificar documentación no relacionada.

## Validación técnica

Ejecutar y corregir cualquier problema encontrado en:

* TypeScript;
* Vite/build;
* imports;
* rutas;
* navegación;
* tipos;
* llamadas HTTP;
* contratos de API.

Verificar especialmente que no existan errores producidos por la eliminación de las antiguas funcionalidades de Number y GraphicNovel.

## Resultado esperado

Al finalizar:

* `Work` es el único modelo utilizado para estas obras en Dashboard.
* Existe un único `WorkForm`.
* Existen listados general, Publisher, Franchise y Series.
* Cada listado utiliza el endpoint correspondiente.
* La creación se realiza únicamente desde los contextos que corresponden.
* La edición funciona desde cualquier contexto.
* El backend es la fuente de verdad para la dependencia del Work.
* `WorkType` no contiene semántica de negocio en frontend.
* No quedan referencias funcionales obsoletas a Number/GraphicNovel.
* La arquitectura del Dashboard queda consistente con el resto del proyecto.
* TypeScript y Vite compilan correctamente.

---

## Resultado de ejecución

### Estado: Finished

### Archivos eliminados (código obsoleto)
- `pages/numbers-page.tsx`
- `pages/number-form-page.tsx`
- `pages/graphic-novels-page.tsx`
- `pages/graphic-novel-form-page.tsx`
- `features/numbers/services/numbers.service.ts`
- `features/graphic-novels/services/graphic-novels.service.ts`
- `types/numbers.ts`
- `types/graphic-novels.ts`
- `features/numbers/components/number-search-select.tsx`

### Archivos nuevos
- `features/works/components/works-listing.tsx` — Componente compartido de listado de Works.
- `features/works/pages/franchise-works-page.tsx`
- `features/works/pages/series-works-page.tsx`
- `features/works/pages/publisher-works-page.tsx`

### Archivos modificados
- `app/router/routes.tsx` — Rutas nuevas/actualizadas para Works contextuales; eliminadas rutas obsoletas de Number/GraphicNovel.
- `pages/works-page.tsx` — Ya estaba adaptado al modelo unificado.
- `pages/franchises-page.tsx` — Navegación actualizada a `/franchises/:franchiseId/works`.
- `pages/series-page.tsx` — Navegación actualizada a `/series/:seriesId/works`.
- `pages/publishers-page.tsx` — Agregada acción "Gestionar obras" con navegación a `/publishers/:publisherId/works`.
- `project/pages.md` — Documentación actualizada.
- `project/components/dashboard-components.md` — Documentación actualizada.

### Verificaciones
- TypeScript compila sin errores.
- Vite build pasa exitosamente.
- No quedan imports funcionales a `admin-numbers` ni `admin-graphic-novels` desde componentes activos.
- No queda lógica condicional basada en `WorkType` para determinar relaciones.
- La edición siempre navega a `/works/:id/edit` y el backend provee el contexto real.
- El listado general no tiene botón de creación; los contextuales sí lo tienen con la etiqueta correcta.

### Notas
- Los componentes compartidos de Number que aún usa el WorkForm (`LanguageSearchSelect`, `RoleSearchSelect`, `TagInput`) se mantuvieron porque son utilizados legítimamente.
- TASK-DASH-0089 ya estaba finalizada previamente; esta task validó y limpió el resultado.
