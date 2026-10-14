# TASK-DASH-0081 — Agregar gestión de Graphic Novels desde Franchise

## ID

TASK-DASH-0081

## Título

Agregar gestión de Graphic Novels desde Franchise

## Descripción

Incorporar en el listado administrativo de **Franchises** una acción que permita acceder a los **Graphic Novels pertenecientes a una Franchise**.

La navegación debe establecer explícitamente la relación:

```text
Franchise
└── Graphic Novels
```

Esta task implementa únicamente el acceso contextual desde una Franchise.

El listado global de Works corresponde a `TASK-DASH-0080`.

La implementación del alta y edición de Graphic Novels corresponde a tasks posteriores.

## Contexto relevante

El dominio contempla actualmente:

```text
Work
├── Number
│   └── Series
│       └── Franchise
│
└── GraphicNovel
    └── Franchise
```

Un `GraphicNovel` pertenece directamente a una `Franchise`.

A diferencia de `Number`, un `GraphicNovel`:

- no pertenece a una Series;
- no posee `NumberValue`;
- no posee `PreviousNumber`;
- no posee `NextNumber`;
- no tiene continuidad;
- representa una obra independiente / single shot.

Por lo tanto, la navegación administrativa correspondiente es:

```text
Franchise
   └── Graphic Novels
```

y no:

```text
Franchise
   └── Series
        └── Graphic Novels
```

La pantalla existente de Series debe continuar utilizando su navegación actual:

```text
Series
   └── Numbers
```

## Alcance

### 1. Agregar acción en el listado de Franchises

Modificar la pantalla administrativa existente de Franchises para incorporar una acción por cada Franchise que permita:

**Gestionar Graphic Novels**

La acción debe seguir el patrón visual y funcional de las acciones existentes para administrar Series.

No debe eliminarse ni modificarse el acceso existente para gestionar Series.

### 2. Navegación contextual

Al seleccionar la acción de una Franchise, navegar al listado de Graphic Novels correspondiente a esa Franchise.

La navegación debe conservar el contexto de la Franchise.

El listado destino deberá recibir el identificador de la Franchise utilizando el mecanismo de routing/contexto definido actualmente por el Dashboard.

No implementar una navegación global que pierda el contexto de la Franchise.

### 3. Identificación de la Franchise

El listado contextual de Graphic Novels debe poder identificar la Franchise desde la cual se accedió.

Debe utilizarse el mismo criterio de headers/contextual navigation utilizado actualmente en los listados administrativos relacionados con Series y Numbers.

La UI debe permitir al administrador comprender claramente:

```text
Franchise → Graphic Novels
```

### 4. Back navigation

El flujo debe permitir regresar desde el listado contextual de Graphic Novels al contexto de la Franchise desde el cual se ingresó.

No debe asumirse que el usuario siempre llegó desde el listado global de Works.

La navegación debe respetar el contexto definido por el Dashboard.

### 5. Routing

Revisar el routing existente antes de implementar la navegación.

Utilizar las convenciones existentes del proyecto para las rutas administrativas.

No crear rutas arbitrarias si ya existe una convención establecida en el Dashboard.

Si la ruta de listado de Graphic Novels todavía no existe, crear únicamente la estructura de routing necesaria para que esta navegación quede preparada para la implementación del listado correspondiente en la task siguiente.

No implementar en esta task el contenido funcional completo del listado de Graphic Novels.

### 6. Integración con el listado de Graphic Novels

La acción debe quedar preparada para que el listado de Graphic Novels pueda utilizar el contexto:

```text
franchiseId
```

para obtener únicamente los Graphic Novels pertenecientes a esa Franchise.

El contrato backend es la fuente de verdad.

No inventar parámetros ni endpoints.

### 7. Coherencia con Series

La implementación debe mantener una experiencia coherente entre:

```text
Series → Numbers
Franchise → Graphic Novels
```

Las dos acciones deben coexistir sin interferirse.

No modificar la lógica de navegación de Series salvo que sea estrictamente necesario para mantener la coherencia del routing.

### 8. Revisión de documentación existente

Antes de implementar, revisar:

- `project/pages.md`
- `project/components.md`

y la implementación actual de la página de Franchises.

Determinar si la acción puede reutilizar componentes existentes.

No crear componentes duplicados cuando ya exista una abstracción adecuada.

### 9. Documentación del Dashboard

Al finalizar la task, actualizar **únicamente**:

```text
project/pages.md
project/components.md
```

`pages.md` debe reflejar la nueva navegación desde Franchise hacia Graphic Novels.

`components.md` debe reflejar únicamente los componentes nuevos o modificados como consecuencia de esta task.

No actualizar otros documentos de `project/` como parte de esta task.

## Fuera de alcance

- Implementar el listado global de Works.
- Implementar el listado de Graphic Novels.
- Implementar alta de Graphic Novel.
- Implementar edición de Graphic Novel.
- Implementar carga de CBR/CBZ.
- Implementar procesamiento de contenido.
- Implementar IA para Graphic Novels.
- Implementar portada o páginas de Graphic Novel.
- Implementar personas, roles o tags de Graphic Novel.
- Implementar continuidad de Graphic Novel.
- Modificar el modelo de dominio.
- Modificar endpoints backend.
- Crear lógica de negocio en frontend.
- Modificar la navegación Franchise → Series → Numbers salvo lo estrictamente necesario para routing.
- Realizar una refactorización general de componentización.

## Criterios de aceptación

1. El listado administrativo de Franchises contiene una acción para gestionar los Graphic Novels de cada Franchise.

2. La acción utiliza el mismo lenguaje visual y patrón de interacción que las acciones administrativas existentes.

3. La acción de gestionar Series continúa funcionando sin cambios funcionales.

4. Al seleccionar "Gestionar Graphic Novels", el Dashboard navega al contexto correspondiente a esa Franchise.

5. El identificador de la Franchise se conserva durante la navegación.

6. El listado destino puede utilizar el `franchiseId` para obtener únicamente los Graphic Novels pertenecientes a esa Franchise.

7. La navegación representa correctamente la relación:

```text
Franchise → Graphic Novels
```

8. No se introduce una relación incorrecta:

```text
Series → Graphic Novels
```

9. La navegación de retorno conserva el contexto de la Franchise.

10. El routing utilizado respeta las convenciones existentes del Dashboard.

11. No se inventan endpoints ni parámetros backend.

12. No se implementa lógica de negocio en frontend.

13. Se reutilizan componentes existentes cuando resulte apropiado.

14. `project/pages.md` queda actualizado con la nueva navegación.

15. `project/components.md` queda actualizado únicamente con los componentes afectados.

## Execution result

### Status

Finished.

### Work completed

- Se agregó en `FranchisesPage` una acción por fila para gestionar los Graphic Novels de cada Franchise, conservando las acciones existentes de edición y estado.
- Se creó la ruta contextual `/franchises/:franchiseId/graphic-novels` y su página de preparación `GraphicNovelsPage`.
- La página contextual conserva `franchiseId`, carga la Franchise mediante el endpoint administrativo existente, muestra el contexto `Franchise → Graphic Novels` y ofrece navegación de retorno a `/franchises`.
- No se implementó el listado funcional de Graphic Novels ni se agregó una llamada al endpoint de obras, de acuerdo con el alcance de esta task.
- Se actualizaron únicamente `project/pages.md` y `project/components.md`.

### Validation

- `npm run build` y `npm run lint` no pudieron usar sus wrappers porque faltan los binarios `node_modules/typescript/bin/tsc` y `node_modules/eslint/bin/eslint.js`.
- La compilación directa con `node node_modules/typescript/lib/tsc.js -b` pasó.
- ESLint ejecutado directamente con `node node_modules/eslint/lib/cli.js .` pasó.
- La construcción directa con `node node_modules/vite/dist/node/cli.js build` pasó. Vite reportó únicamente la advertencia existente sobre chunks mayores a 500 kB.

## Dependencias

Antes de comenzar, el Dashboard Agent debe leer obligatoriamente:

```text
project/
 ├── project.md
 ├── communication.md
 ├── dashboard-architecture.md
 ├── frontend-dashboard-stack-technology.md
 ├── frontend-dashboard-agent.md
 ├── frontend-coding-rules.md
 ├── endpoints.md
 ├── pages.md
 └── components.md
```

También debe leer:

```text
backlog/
 ├── epic-02.md
 └── us-0018/
      └── us-0018.md
```

Y debe revisar explícitamente:

```text
backlog/us-0017/us-0017.md
```

Debe comprender especialmente que:

- `Number` pertenece a una `Series`;
- `GraphicNovel` pertenece directamente a una `Franchise`;
- `GraphicNovel` no forma parte de una continuidad de Numbers.

Debe revisar además:

- la implementación actual de la página de Franchises;
- la implementación de la navegación hacia Series;
- el routing administrativo existente;
- la implementación realizada en `TASK-DASH-0080`.

## Resultado esperado

El administrador puede acceder desde una Franchise directamente a sus Graphic Novels mediante una acción claramente identificada.

La navegación administrativa queda conceptualmente establecida como:

```text

Franchise -> Graphic Novels
Series -> Numbers
```

La task deja preparado el contexto y routing necesarios para que las siguientes tasks implementen el listado y posteriormente el alta/edición de Graphic Novels.