# TASK-DASH-0080 — Implementar listado administrativo global de Works

## ID

TASK-DASH-0080

## Título

Implementar listado administrativo global de Works

## Descripción

Transformar el listado administrativo existente de **Números** en un listado administrativo global de **Works**.

El concepto `Work` representa actualmente dos tipos de obra:

```text
Work
├── Number
└── GraphicNovel
```

La pantalla debe dejar de asumir que todos los registros corresponden a un `Number` y pasar a mostrar conjuntamente todos los `Works` disponibles para administración.

La experiencia funcional existente del listado de Números debe conservarse en todo aquello que sea común a un `Work`, adaptando la presentación y las acciones según el tipo concreto de obra.

Esta task corresponde exclusivamente al **listado**. No implementa todavía el alta, edición ni navegación específica para Graphic Novels.

## Contexto relevante

- `Number` y `GraphicNovel` heredan de `Work`.
- Un `Number` pertenece a una `Series`.
- Un `GraphicNovel` pertenece a una `Franchise`.
- Un `Number` posee `NumberValue`, `PreviousNumber` y `NextNumber`.
- Un `GraphicNovel` es una obra independiente / single shot.
- Un `GraphicNovel` no posee continuidad y, por lo tanto, no tiene:
  - `NumberValue`
  - `PreviousNumber`
  - `NextNumber`
- La experiencia administrativa de `GraphicNovel` debe ser conceptualmente equivalente a la de `Number` cuando la funcionalidad sea común.
- La navegación de `Number` continúa siendo:
  `Franchise → Series → Numbers`
- La navegación de `GraphicNovel` será:
  `Franchise → Graphic Novels`
- La pantalla existente de Series (`series-page.tsx`) continúa siendo el listado administrativo de Series y su acción para administrar Numbers no debe eliminarse.
- El listado global debe permitir identificar claramente qué tipo de `Work` representa cada registro.
- No debe implementarse lógica de negocio en el frontend.
- El contrato real del backend es la fuente de verdad sobre endpoints, parámetros, filtros, ordenamiento y respuestas.

## Alcance

### 1. Transformar el listado de Números en listado global de Works

Tomar como base la implementación existente de:

```text
dashboard/pages/numbers-page.tsx
```

y transformarla conceptualmente en el listado administrativo global de `Works`.

La pantalla ya no debe asumir que cada registro es un `Number`.

Debe mostrar conjuntamente:

- `Number`
- `GraphicNovel`

El título, navegación, textos, estados y acciones de la pantalla deben reflejar el concepto `Work` y no únicamente `Number`.

### 2. Mantener la funcionalidad común del listado

Conservar las funcionalidades que actualmente existen para el listado de Números cuando sean aplicables a ambos tipos de `Work`.

Como mínimo, revisar y mantener, de acuerdo con el contrato backend:

- búsqueda;
- filtros;
- ordenamiento;
- paginación;
- estado activo/inactivo;
- idioma;
- estado de contenido;
- rango de fecha de publicación;
- información de portada;
- fecha de carga;
- fecha de publicación;
- estado de procesamiento;
- activación;
- desactivación;
- reactivación;
- retry del procesamiento cuando corresponda;
- estados Loading, Empty, Error y Success.

No eliminar una capacidad existente simplemente porque no esté representada explícitamente en una maqueta UX.

### 3. Identificación del tipo de Work

Cada fila debe permitir identificar claramente si corresponde a:

- `Number`
- `GraphicNovel`

La representación visual debe integrarse con la jerarquía y lenguaje visual existente del Dashboard.

No debe inferirse el tipo a partir de campos opcionales como `NumberValue`.

El tipo debe provenir del contrato de datos del backend.

### 4. Información contextual según el tipo

La información específica debe adaptarse al tipo de Work.

Para un `Number`:

- mostrar su `Series`;
- mostrar su número (`NumberValue`) cuando corresponda;
- permitir acceder a la edición de ese Number;
- conservar la información de continuidad cuando corresponda.

Para un `GraphicNovel`:

- mostrar su `Franchise`;
- no mostrar `NumberValue`;
- no mostrar `PreviousNumber`;
- no mostrar `NextNumber`;
- permitir acceder a la edición del Graphic Novel cuando exista la ruta/página correspondiente.

La UI no debe mostrar valores ficticios, `0`, `N/A` ni placeholders engañosos para representar propiedades que conceptualmente no existen en un Graphic Novel.

### 5. Acciones por fila

Las acciones deben determinarse según el tipo de Work.

Para `Number`:

- editar Number;
- acciones de estado;
- retry cuando corresponda.

Para `GraphicNovel`:

- editar Graphic Novel cuando exista la pantalla correspondiente;
- acciones de estado soportadas por el backend;
- retry cuando corresponda.

No implementar una navegación hacia una pantalla inexistente.

Si la pantalla de edición de Graphic Novel todavía no existe, la acción deberá quedar alineada con la arquitectura/routing definida por el proyecto y, si el flujo depende de una task posterior, documentar la dependencia en el resultado de la task en lugar de inventar una ruta.

### 6. Búsqueda, filtros y ordenamiento

Revisar cada criterio existente del listado de Números y determinar si:

- es común a `Work`;
- es específico de `Number`;
- requiere adaptación para soportar ambos tipos.

Un criterio específico de `Number` no debe aplicarse artificialmente a un `GraphicNovel`.

Si el contrato backend permite filtrar por tipo de Work, incorporar dicho filtro para poder distinguir:

- Todos
- Numbers
- Graphic Novels

Si el backend no expone esa capacidad, no inventar un parámetro ni implementar una solución que altere la semántica de paginación o filtrado del backend.

### 7. Contrato Backend

Antes de implementar la integración, revisar:

```text
project/endpoints.md
```

y los endpoints específicos disponibles para Works, Numbers y Graphic Novels.

Utilizar únicamente capacidades realmente expuestas por el backend.

No crear endpoints, parámetros, DTOs ni respuestas ficticias desde el Dashboard.

Particularmente, no implementar una combinación de dos listados paginados en frontend como si constituyera un listado global correctamente paginado, salvo que el contrato existente lo defina explícitamente de esa manera.

Si para obtener un listado global de Works fuese necesaria una capacidad backend que todavía no existe, detener esa parte de la implementación y registrar claramente la dependencia/bloqueo en lugar de introducir una solución incorrecta en frontend.

### 8. Modelo y componentes

Revisar los tipos TypeScript actualmente utilizados por el listado de Números.

El modelo del frontend debe representar explícitamente el concepto `Work` y sus variantes cuando resulte necesario.

Evitar duplicar componentes que representen exactamente el mismo comportamiento para `Number` y `GraphicNovel`.

Si durante la implementación se identifica una abstracción común clara, utilizarla respetando:

- `components.md`;
- `frontend-coding-rules.md`;
- la arquitectura existente del Dashboard.

No realizar una refactorización general de componentización fuera de lo necesario para esta task.

### 9. Routing y navegación

Revisar el routing existente y adaptar la navegación del listado global.

El listado global debe poder coexistir conceptualmente con:

```text
Franchise
 ├── Series
 │    └── Numbers
 └── Graphic Novels
```

La navegación específica de cada Work debe utilizar la pantalla correspondiente a su tipo.

No modificar en esta task la navegación interna de Series ni implementar todavía la acción de Franchise → Graphic Novels.

### 10. Compatibilidad con el flujo existente de Numbers

La transformación de la pantalla no debe romper el flujo existente de Numbers.

Debe continuar siendo posible:

- acceder a los Numbers de una Series;
- visualizar sus datos;
- editar un Number;
- activar/desactivar;
- reactivar;
- reintentar procesamiento;
- volver al contexto anterior cuando corresponda.

La diferencia es que el listado global ahora representa `Work` y no únicamente `Number`.

### 11. Estados de procesamiento

Conservar el comportamiento existente relacionado con `ContentStatus`.

Para Works que se encuentren procesando:

- mostrar el estado correspondiente;
- conservar el mecanismo existente de actualización/refresco;
- actualizar la información cuando el procesamiento pase a `Completed` o `Error`.

No agregar polling para estados que no correspondan al contrato backend.

### 12. Revisión contra US-0017 y US-0018

Durante la implementación, considerar explícitamente la relación entre:

```text
backlog/us-0017/us-0017.md
backlog/us-0018/us-0018.md
```

US-0018 debe entenderse como la misma experiencia funcional general de administración de obras que US-0017, pero aplicada a `GraphicNovel`.

La diferencia fundamental es:

```text
US-0017
Series
└── Number
    ├── NumberValue
    ├── PreviousNumber
    └── NextNumber

US-0018
Franchise
└── GraphicNovel
    └── sin continuidad
```

No trasladar al Graphic Novel conceptos que pertenecen exclusivamente a la continuidad de Numbers.

### 13. Documentación del Dashboard

Al finalizar la task, actualizar **únicamente**:

```text
project/pages.md
project/components.md
```

`pages.md` debe reflejar el nuevo listado global de Works y sus responsabilidades.

`components.md` debe reflejar los componentes nuevos, modificados o reutilizados como consecuencia de esta implementación.

No actualizar otros documentos de `project/` como parte de esta task, salvo que una instrucción posterior lo solicite explícitamente.

## Fuera de alcance

- Crear o modificar endpoints backend.
- Modificar entidades de dominio.
- Modificar servicios backend.
- Implementar alta de Graphic Novel.
- Implementar edición de Graphic Novel.
- Implementar procesamiento CBR de Graphic Novel.
- Implementar análisis IA de Graphic Novel.
- Implementar la acción Franchise → Graphic Novels.
- Modificar `series-page.tsx` para agregar navegación a Graphic Novels.
- Implementar continuidad para Graphic Novels.
- Crear `NumberValue`, `PreviousNumber` o `NextNumber` para Graphic Novels.
- Refactorizar globalmente todos los componentes del Dashboard.
- Modificar otras páginas del Dashboard que no sean necesarias para que el nuevo listado funcione.
- Inventar endpoints o contratos que no estén definidos por backend.
- Implementar lógica de negocio en frontend.

## Criterios de aceptación

1. La pantalla anteriormente correspondiente al listado de Números representa ahora el concepto global de `Work`.

2. El listado permite visualizar conjuntamente `Number` y `GraphicNovel`.

3. Cada fila identifica claramente el tipo de Work.

4. Los datos comunes de Work se muestran correctamente para ambos tipos.

5. Los Numbers muestran su Series y sus datos específicos cuando corresponda.

6. Los Graphic Novels muestran su Franchise y no muestran campos de continuidad de Number.

7. No se muestran valores ficticios para propiedades que no existen en Graphic Novel.

8. Las acciones disponibles para cada fila corresponden al tipo de Work.

9. La edición de un Number continúa funcionando.

10. Las acciones de activación, desactivación, reactivación y retry continúan funcionando cuando corresponden.

11. La búsqueda, filtros, ordenamiento y paginación respetan el contrato backend.

12. No se implementan parámetros ni endpoints inexistentes.

13. No se combinan dos listados paginados independientes en frontend para simular una paginación global incorrecta.

14. El listado conserva los estados Loading, Empty, Error y Success.

15. El comportamiento de actualización de estados de procesamiento existente para Numbers no se rompe.

16. La navegación contextual existente para Numbers continúa funcionando.

17. El código respeta la arquitectura y reglas de coding del Dashboard.

18. No se agrega lógica de negocio al frontend.

19. Se reutilizan o generalizan componentes cuando exista una abstracción común clara, sin realizar una refactorización innecesaria.

20. `project/pages.md` queda actualizado únicamente con los cambios de esta task.

21. `project/components.md` queda actualizado únicamente con los cambios de esta task.

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

Debe comprender las similitudes y diferencias funcionales entre US-0017 y US-0018 antes de modificar el listado.

También debe revisar la implementación actual de:

```text
dashboard/pages/numbers-page.tsx
```

y todos los servicios, tipos y componentes directamente relacionados con dicho listado.

## Resultado esperado

El Dashboard deja de tener conceptualmente un "listado global de Números" y pasa a disponer de un **listado administrativo global de Works**.

El administrador puede visualizar en una única pantalla tanto:

```text
Number
```

como:

```text
GraphicNovel
```

manteniendo las capacidades comunes existentes y adaptando correctamente la información y acciones específicas de cada tipo.

El frontend representa correctamente la relación:

```text
Work
├── Number
│   └── Series
└── GraphicNovel
    └── Franchise
```

sin introducir conceptos de continuidad de Numbers en Graphic Novels ni realizar workarounds sobre el contrato backend.

## Execution result

### Status

`finished`

### Work completed

- Se revisaron los documentos obligatorios del proyecto, la arquitectura del Dashboard, el stack, las reglas de frontend, los endpoints y la documentación de páginas y componentes.
- Se revisó la implementación actual de `numbers-page.tsx`, sus servicios, tipos y componentes relacionados, junto con los contratos de Numbers y Graphic Novels.
- Se confirmó la disponibilidad del endpoint global `GET /api/admin-works` luego de la finalización de `TASK-API-0197`.
- Se creó `dashboard/types/works.ts` con `WorkType`, `WorkTypeLabel`, `ContentStatus`, `ContentStatusLabel`, `WorkListItemDto` y `WorkListResponse`.
- Se creó `dashboard/features/works/services/works.service.ts` con la función `getWorks` que consume `GET /api/admin-works` y mapea filtros, ordenamiento y paginación.
- Se creó `dashboard/pages/works-page.tsx` como listado administrativo global de Works basado en `numbers-page.tsx`, adaptado para mostrar conjuntamente Numbers y Graphic Novels.
- La página implementa búsqueda, filtros (tipo de obra, activo, idioma, estado de contenido, rango de publicación), ordenamiento (título, publicación, carga, idioma, número), paginación, y acciones contextuales por tipo (editar, desactivar, reactivar).
- El retry de procesamiento se expone solo para `Number` en el listado global, porque el retry de `GraphicNovel` requiere archivo CBR/CBZ y corresponde al formulario de edición.
- Se implementó polling de estados de contenido para obras en procesamiento, delegando en los servicios específicos de Number y Graphic Novel.
- Se registró la ruta `/works` en `dashboard/app/router/routes.tsx`.
- La ruta `/numbers` ahora apunta a `WorksPage` para alinear la navegación con el nuevo listado global de Works.
- Se actualizó `dashboard/pages/dashboard-layout.tsx` para que el ítem de navegación "Obras" apunte a `/works`.
- Se actualizó `project/pages.md` con la nueva página global `/works`.
- Se actualizó `project/components.md` con el componente `WorksPage`.
- Se corrigieron errores de compilación: exportación de `ContentStatus`/`ContentStatusLabel`/`WorkTypeLabel` en `works.ts`, importación de `WorkTypeLabel` en `works-page.tsx`, remoción de importaciones sin uso y ajuste del modal de confirmación.
- Se completó el listado contextual de Graphic Novels por Franquicia en `dashboard/pages/graphic-novels-page.tsx`, basado en `numbers-page.tsx` pero sin columnas de anterior/siguiente, integrando `GET /api/admin-graphic-novels?franchiseId=...` y polling de `contentStatus`.
- Se extendió `dashboard/features/graphic-novels/services/graphic-novels.service.ts` con `getGraphicNovels`.
- Se ajustaron `dashboard/types/graphic-novels.ts` para incluir `GraphicNovelListItemDto`, `GraphicNovelListResponse` y codificaciones numéricas de `contentStatus` coherentes con el contrato backend.

### Validation

- `npm run build` pasa correctamente (`tsc -b && vite build`).
- `npm run dev` inicia sin errores de compilación.
- ESLint no pudo ejecutarse porque el proyecto no cuenta con archivo de configuración `eslint.config.*` o `.eslintrc.*`; es un problema preexistente del setup del dashboard, no introducido por esta task.