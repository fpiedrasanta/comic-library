# TASK-DASH-0090 — Adaptar listado de Works de Franchise

## Objetivo

Modificar el listado actual de obras de una Franchise para utilizar el nuevo endpoint contextual de `Work`.

La pantalla debe continuar funcionando visualmente como hasta ahora, pero dejar de consumir el endpoint o modelo específico utilizado anteriormente para Numbers.

El listado debe representar exclusivamente las `Work` que dependen de la Franchise actual.

---

## API

Utilizar:

```text
GET /api/admin-works/franchise/{id}
```

con los filtros y parámetros de búsqueda definidos por Backend.

El endpoint devuelve las obras que cumplen:

```text
FranchiseId = {id}
PublisherId = null
SeriesId = null
```

No implementar este filtrado en frontend.

El backend es responsable de determinar qué obras pertenecen al contexto.

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

* la página actual de Franchise;

* el listado actual de Numbers dentro de Franchise;

* los componentes utilizados actualmente por ese listado;

* el nuevo `WorkForm` implementado en `TASK-DASH-0089`.

Actualizar al finalizar:

* `project/pages.md`

* `project/components.md`

---

## Funcionalidad

Mantener el comportamiento actual del listado de obras dentro de Franchise, adaptándolo al nuevo modelo `Work`.

Debe conservar:

* búsqueda;
* filtros existentes;
* ordenamiento;
* paginación;
* loading;
* estado vacío;
* errores;
* acciones disponibles actualmente.

Los parámetros deben enviarse al nuevo endpoint contextual de Franchise.

No implementar filtrado local.

---

## Modelo

El listado debe trabajar con `Work`.

No utilizar modelos específicos de:

```text
Number
GraphicNovel
```

El hecho de que algunas obras tengan `Number Value`, `Previous` o `Next` no debe determinar el modelo utilizado por la tabla.

La tabla debe representar una colección de `Work`.

Los campos visualizados deben mantener la información actualmente mostrada por la pantalla, adaptándola al nuevo contrato de Backend.

---

## Servicio

Modificar el servicio de la feature para consumir:

```text
/api/admin-works/franchise/{id}
```

La comunicación HTTP debe permanecer encapsulada en el servicio.

No realizar llamadas HTTP directamente desde componentes visuales.

El servicio debe recibir el `franchiseId` como contexto y enviar los filtros y parámetros de consulta correspondientes.

No construir manualmente filtros de pertenencia en frontend.

---

## Componentización

Mantener la componentización existente.

La Page debe encargarse de:

* composición;
* estado de alto nivel;
* contexto de Franchise;
* consulta;
* navegación.

Los componentes visuales deben mantener responsabilidades específicas.

No trasladar nuevamente el HTML completo al Page.

Reutilizar componentes existentes cuando corresponda.

No crear una segunda implementación de componentes ya existentes.

---

## Nueva Obra

Agregar en este listado la acción:

```text
Nueva Obra
```

Al seleccionarla, navegar al nuevo `WorkForm` implementado en `TASK-DASH-0089`.

El formulario debe recibir el contexto:

```text
FranchiseId = id de la Franchise actual
```

El alta debe crear una `Work` asociada a esa Franchise.

El formulario no debe recibir:

```text
PublisherId
SeriesId
```

como contexto de creación.

La obra creada debe aparecer posteriormente en el listado de la Franchise.

---

## Edición

La acción de edición debe continuar disponible.

Al editar una `Work`:

1. navegar al `WorkForm`;
2. cargar la obra mediante el endpoint de detalle de `Work`;
3. utilizar la información devuelta por Backend para determinar su contexto;
4. preservar esa pertenencia durante la edición.

No inferir la pertenencia únicamente porque la edición fue iniciada desde una Franchise.

Backend es la fuente de verdad.

---

## Contexto

La página debe conservar la Franchise actual como contexto de navegación.

El listado representa exclusivamente:

```text
Franchise → Works
```

No debe mostrar Works pertenecientes a:

* Publisher;
* Series.

No implementar esa exclusión en frontend.

El endpoint contextual es el responsable de devolver solamente las obras correspondientes.

---

## Eliminación de dependencia de Number

Eliminar del listado las dependencias que sean exclusivamente necesarias por el modelo anterior de Number.

No utilizar:

```text
admin-numbers
```

para cargar el listado.

No crear lógica de compatibilidad para decidir si una Work debe tratarse como Number.

Una Work con Number Value y una Work sin Number Value pertenecen al mismo listado.

---

## Reutilización

Revisar:

* componentes actuales del listado de Numbers de Franchise;
* componentes de listas de Works existentes;
* componentes de tablas;
* componentes de búsqueda;
* componentes de filtros;
* componentes de paginación;
* componentes de acciones;
* componentes utilizados por `WorkForm`.

Reutilizar cuando corresponda.

No duplicar componentes.

---

## Validación

Verificar:

* Compilación TypeScript.
* Build de Vite.
* Navegación al listado de Franchise.
* Carga del listado.
* Uso del endpoint `/api/admin-works/franchise/{id}`.
* Búsqueda.
* Filtros existentes.
* Ordenamiento.
* Paginación.
* Loading.
* Estado vacío.
* Manejo de errores.
* Visualización correcta de Works.
* No utilización de `admin-numbers`.
* Botón `Nueva Obra`.
* Navegación al `WorkForm`.
* Contexto `FranchiseId` correctamente enviado al alta.
* Creación de una Work desde Franchise.
* Aparición de la nueva Work en el listado.
* Edición de una Work.
* Preservación de la referencia contextual obtenida desde Backend.
* Correcta separación Page / Components / Service.
* Ausencia de lógica HTTP en componentes visuales.
* Consistencia visual con la pantalla existente.

Actualizar `pages.md` y `components.md` con cualquier cambio estructural realizado.

---

## Restricciones

* No modificar todavía el listado de Works de Series.
* No modificar todavía el listado de Works de Publisher.
* No implementar todavía el botón de Works en Publisher.
* No modificar el listado general de Works.
* No crear un formulario específico para Franchise.
* No duplicar `WorkForm`.
* No utilizar `Number` como entidad del frontend.
* No implementar filtrado de pertenencia en frontend.
* No interpretar `WorkType`.
* No colocar lógica de API dentro de componentes visuales.
* Mantener la arquitectura y componentización existente del Dashboard.

---

## Resultado de ejecución

### Estado: Finished

### Archivos nuevos
- `features/works/pages/franchise-works-page.tsx` — Page del listado contextual de Works de Franchise. Carga la Franchise, usa `getWorksByFranchise` y renderiza el componente compartido `WorksListing` con contexto, botón "Nueva Obra" y back navigation.

### Archivos modificados
- `features/works/components/works-listing.tsx` — Componente compartido de listado de Works (usado por general, Franchise, Series y Publisher). Maneja búsqueda, filtros, paginación, acciones, modal de confirmación y polling de content status.
- `app/router/routes.tsx` — Rutas actualizadas: `/franchises/:franchiseId/works`, `/franchises/:franchiseId/works/create`, `/franchises/:franchiseId/works/:workId/edit`.
- `pages/franchises-page.tsx` — Navegación de acción de gestión actualizada de `/franchises/:franchiseId/graphic-novels` a `/franchises/:franchiseId/works`; título del botón actualizado a "Gestionar obras".
- `project/pages.md` — Documentación actualizada.
- `project/components/dashboard-components.md` — Documentación actualizada.

### Decisiones
- Se creó `WorksListing` como componente compartido para evitar duplicación entre los 4 listados (general, Franchise, Series, Publisher).
- La navegación de edición siempre va a `/works/:id/edit`. El backend provee el contexto real; no se infiere desde el listado origen.
- El listado de Franchise no incluye el filtro de WorkType (coincide con el comportamiento anterior de Graphic Novels).

### Notas
- `getWorksByFranchise` ya estaba implementado en `works.service.ts`.
- Las páginas antiguas `graphic-novels-page.tsx` y `graphic-novel-form-page.tsx` fueron eliminadas en TASK-DASH-0094.
