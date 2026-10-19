# TASK-PUBLIC-WEB-0097 — Implementar favoritos en Public Web

## Objetivo

Implementar la gestión visual e interactiva de favoritos en Public Web, reutilizando `WorkCard` y `WorksPage`, e incorporando `/favorites` como contexto del catálogo.

## Fuentes obligatorias

Antes de implementar, leer:

- `US-0035.md`: definición funcional de favoritos.
- `pages.md`: páginas, rutas y convenciones de navegación.
- `components.md`: componentes existentes y responsabilidades.
- `endpoints.md`: contratos disponibles del Backend/API.
- `communication.md`: flujo de trabajo, estados y ubicación de las tasks.
- `frontend-coding-rules.md`.
- `frontend-public-web-agent.md`.
- `public-web-architecture.md`.
- Las tasks de Backend/API correspondientes a favoritos:
  - `TASK-API-0313`: endpoints.
  - `TASK-API-0314`: servicios.
  - `TASK-API-0315`: entidad y persistencia.
  - `TASK-API-0316`: filtro del catálogo e `isFavorite`.
  - `TASK-API-0317`: estado de favoritos en historial y recomendaciones.
  - `TASK-API-0318`: validación e integración.

Leer también los componentes y servicios actuales de catálogo, `WorkCard`, navegación, autenticación, manejo de errores y scroll infinito.

## Referencia visual

Utilizar como referencia el archivo local:

`C:/Users/fpiedrasanta/Desktop/read comics/partirtura read comics/ux_ui/favorito y lista.html`

Inspeccionar la sección correspondiente a favoritos para determinar ubicación, dimensiones, colores, estados y comportamiento visual de la estrella.

El HTML define la referencia visual; el comportamiento funcional se determina por `US-0035.md`, esta task y los contratos existentes.

## Implementación

### 1. Estrella de favoritos en WorkCard

Incorporar el control de favoritos en el componente reutilizable `WorkCard`, siguiendo la ubicación y el diseño definidos en el HTML de referencia.

Estados visuales:

- **Favorito:** estrella amarilla con fondo amarillo.
- **No favorito:** estrella sin fondo.

Comportamiento:

- Si `isFavorite` es `false`, permitir agregar el Work a favoritos.
- Si `isFavorite` es `true`, permitir quitarlo de favoritos.
- Obtener el estado inicial del atributo `isFavorite` devuelto por el Backend/API.
- Actualizar el estado visual después de completar correctamente la operación.
- Evitar que el clic en la estrella propague el evento y active la navegación u otra acción de la tarjeta.
- Evitar solicitudes duplicadas mientras la operación del mismo Work esté en curso.
- Comunicar errores mediante los mecanismos existentes del proyecto y mantener un estado coherente si la operación falla.

No duplicar la implementación de la estrella en las páginas que utilizan `WorkCard`.

### 2. Integración con Backend/API

Utilizar los contratos existentes documentados en `endpoints.md` y en las tareas del Backend/API.

Operaciones disponibles:

- `POST /api/favorites/{workId}`: agregar un favorito.
- `DELETE /api/favorites/{workId}`: quitar un favorito.

Requisitos:

- Utilizar el cliente HTTP, la autenticación y el manejo de errores existentes.
- No enviar una identidad de usuario en el request: el Backend/API la obtiene del contexto autenticado.
- No simular persistencia local ni reemplazar la API por datos ficticios.
- Conservar la compatibilidad con los mecanismos actuales de carga de datos y manejo de estado.

El estado `isFavorite` de los resultados es la fuente inicial para representar cada Work. No realizar una consulta individual por tarjeta para determinar si es favorito.

### 3. Página `/favorites`

Registrar `/favorites` en la navegación y en `pages.md` conforme a las convenciones existentes.

Debe reutilizar directamente `WorksPage` y el comportamiento del catálogo. No crear una página independiente que replique filtros, búsqueda, resultados o tarjetas.

La consulta debe utilizar el endpoint existente del catálogo con:

`isFavorite=true`

Mantener las funcionalidades existentes del catálogo:

- búsqueda;
- filtros estructurales y WorkType;
- ordenamiento;
- paginación y scroll infinito;
- estados de carga, error y ausencia de resultados;
- diseño responsive;
- `WorkCard` reutilizable.

El filtro debe aplicarse en el Backend/API. No descargar todos los Works para filtrar favoritos en el navegador.

### 4. Quitar favoritos desde `/favorites`

Cuando se quite un favorito desde esta página:

- completar la operación mediante `DELETE /api/favorites/{workId}`;
- actualizar el estado de la tarjeta sin recargar la página completa;
- retirar la tarjeta de los resultados de `/favorites` inmediatamente después de confirmar el éxito;
- conservar la posición y continuidad del scroll siempre que sea posible;
- mantener coherentes los resultados y metadatos de paginación con los mecanismos existentes.

Si la operación falla, no retirar definitivamente la tarjeta ni presentar el cambio como persistido.

### 5. Estado compartido

El estado de favoritos debe mantenerse coherente entre las distintas instancias de `WorkCard` y las páginas que muestran Works.

Si el proyecto dispone de un mecanismo compartido de caché o estado, reutilizarlo. Evitar incorporar una segunda solución global cuando la existente sea suficiente.

Al agregar o quitar un favorito, actualizar las vistas afectadas mediante los mecanismos existentes, sin introducir recargas completas ni solicitudes individuales innecesarias.

### 6. Componentización y documentación

- Reutilizar `WorkCard`, `WorksPage` y los servicios existentes.
- Evitar duplicación de lógica, estilos y markup.
- No introducir abstracciones innecesarias.
- Actualizar `pages.md` para documentar `/favorites`.
- Actualizar `components.md` si cambia la responsabilidad, API o composición de componentes existentes, o si se incorpora un componente reutilizable.
- Actualizar la documentación adicional que corresponda si cambian contratos internos, rutas o convenciones.
- No modificar documentación sin necesidad: mantener los cambios acotados a la funcionalidad.

## Restricciones

- Todas las páginas y funcionalidades requieren autenticación. No implementar comportamiento para usuarios no autenticados.
- No modificar el Backend/API salvo que se detecte una incompatibilidad real de contrato. En ese caso, documentarla y seguir `communication.md`.
- No implementar listas, ratings, historial ni progreso de lectura como parte de esta task.
- No duplicar `WorksPage` ni `WorkCard`.
- No introducir datos ficticios, persistencia local sustitutiva ni filtros de favoritos exclusivamente en el frontend.

## Criterios de aceptación

- La estrella coincide visualmente con la referencia HTML.
- El estado visual corresponde al `isFavorite` devuelto por la API.
- Agregar y quitar favoritos utiliza los endpoints existentes.
- El clic en la estrella no activa la navegación de la tarjeta.
- Los errores no dejan un estado visual que contradiga la persistencia.
- `/favorites` reutiliza `WorksPage` con `isFavorite=true`.
- La búsqueda, los filtros, el ordenamiento y el scroll infinito siguen funcionando.
- Al quitar un favorito desde `/favorites`, su tarjeta desaparece sin recarga completa.
- Las vistas reutilizan componentes y mecanismos de estado existentes.
- `pages.md` y `components.md` quedan actualizados si corresponde.
- La implementación funciona en mobile, tablet y desktop.
- No se introducen regresiones detectables en el catálogo ni en otras páginas que usan `WorkCard`.

## Git y ejecución

1. `git checkout main` → `git pull`.
2. Comprobar la rama:

   `git branch --list "feature/us-0035-public-web"`

   Si existe: cambiar a ella y ejecutar `git merge main`.

   Si no existe: crearla desde `main`.

3. Implementar los cambios de esta task.
4. Revisar `git diff`.
5. Ejecutar las validaciones disponibles y comprobar compilación y regresiones detectables.
6. Crear commits y publicar los cambios en la rama de trabajo.
7. Registrar el resultado en esta misma task mediante **append**, sin sobrescribir el contenido previo.
8. Mover el archivo a `finished` o `blocked` conforme a `communication.md`, documentando resultados y pendientes.
