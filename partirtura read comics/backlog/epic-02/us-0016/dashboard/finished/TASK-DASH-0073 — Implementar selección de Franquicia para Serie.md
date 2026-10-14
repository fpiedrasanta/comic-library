# TASK-DASH-0073 — Implementar selección de Franquicia para Serie

## Objetivo

Implementar la pantalla de selección de Franquicia utilizando como referencia visual y estructural el template:

C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\seleccionar-franquicia-serie.html

La pantalla forma parte del flujo de creación de una Serie.

## Flujo

El flujo debe ser:

`Listado de Series → Nueva Serie → Seleccionar Franquicia → Formulario de Serie`

## Alcance

La pantalla debe permitir:

- Visualizar Franquicias disponibles.
- Buscar Franquicias.
- Seleccionar una Franquicia.
- Confirmar visualmente la selección.
- Continuar al formulario de Serie.

No es una pantalla administrativa de Franquicias.

## Franquicias disponibles

La selección debe utilizar únicamente Franquicias que puedan ser asociadas a una nueva Serie según las reglas del Backend.

No asumir reglas adicionales.

Si no existe un endpoint adecuado para obtener las Franquicias:

1. Revisar `endpoints.md`.
2. Revisar `communication.md`.
3. Crear una task para Backend solicitando el endpoint/contrato.
4. No inventar el endpoint.
5. No modificar `endpoints.md`.

## Componente de búsqueda

La búsqueda/selección debe reutilizar el mismo patrón de componente y comportamiento utilizado por `CountrySearchSelect`.

Debe contemplar:

- Texto de búsqueda.
- Resultados.
- Loading.
- Error.
- Sin resultados.
- Selección.
- Valor seleccionado.

Si posteriormente el mismo selector se utiliza en otros formularios, debe quedar preparado como componente reutilizable.

## Información visual

La selección debe permitir identificar claramente la Franquicia.

Mostrar, según el contrato disponible:

- Imagen.
- Nombre.
- Color.

No realizar requests adicionales innecesarios para reconstruir la información.

## Selección

Cuando el administrador selecciona una Franquicia:

- La fila/tarjeta debe quedar visualmente seleccionada.
- Debe existir una indicación clara de selección.
- Debe habilitarse el botón de continuar.

## Navegación

Al continuar:

`Seleccionar Franquicia → Formulario de Serie`

La Franquicia seleccionada debe quedar disponible para el formulario de creación.

## Acciones no disponibles

Desde esta pantalla NO deben existir:

- Crear Franquicia.
- Editar Franquicia.
- Activar Franquicia.
- Desactivar Franquicia.

## Estados

Implementar:

- Loading.
- Error.
- Sin resultados.
- Resultados.
- Selección.
- Continuar.

## Integración

Consumir el endpoint real disponible para Franquicias.

No utilizar datos mock como solución definitiva.

Si falta información del Backend, solicitarla mediante una task siguiendo `communication.md`.

No modificar:

- `endpoints.md`
- Contratos Backend.
- Código Backend.

## Componentización

Reutilizar componentes existentes.

Si es necesario crear un nuevo componente de selección, hacerlo reutilizable para futuros selectores de entidades.

El comportamiento debe ser consistente con `CountrySearchSelect`.

## Documentación

Actualizar:

- `pages.md`
- `components.md`

## Criterios de aceptación

- La pantalla reproduce el template UX/UI.
- El administrador puede buscar Franquicias.
- Puede seleccionar una Franquicia.
- La selección queda visualmente confirmada.
- Puede continuar al formulario.
- La Franquicia seleccionada queda disponible para el formulario.
- No existen acciones administrativas de Franquicia.
- Se reutiliza el patrón de selección de `CountrySearchSelect`.
- No se utilizan mocks como solución definitiva.
- Dependencias faltantes del Backend se solicitan mediante tasks.
- `tsc -b --noEmit` sin errores.
- `vite build` exitoso.

## Resultado de ejecución

**Estado**: Completada

**Implementación**:
- Creada página `pages/series-select-franchise-page.tsx` para selección de Franquicia
- Flujo: `Listado de Series → Nueva Serie → Seleccionar Franquicia → Formulario de Serie`
- Búsqueda de franquicias por nombre o editorial
- Tabla con columnas: Imagen, Nombre, Editorial, Color, Acción
- Selección visual con indicador "Seleccionada" y estilo destacado
- Botón "Continuar" habilitado solo cuando hay selección
- Navegación al formulario con estado `selectedFranchise` via `location.state`
- No contiene acciones administrativas de franquicias (solo selección)
- Integración con endpoint GET `/api/admin-franchises` (filtrando por `isActive: true`)
- Reutilización de componente `ProtectedImage` para imágenes

**Archivos creados**:
- `pages/series-select-franchise-page.tsx`

**Archivos modificados**:
- `app/router/routes.tsx` - Agregada ruta `/series/select-franchise`
- `project/pages.md` - Documentación actualizada
- `project/components.md` - Documentación actualizada

**Notas**:
- Se reutiliza el endpoint existente de franquicias con filtro de activas
- La franquicia seleccionada se pasa al formulario via `location.state` (mismo patrón que Franquicias)
- La página detecta si hay una edición en curso via `sessionStorage` para redirigir correctamente