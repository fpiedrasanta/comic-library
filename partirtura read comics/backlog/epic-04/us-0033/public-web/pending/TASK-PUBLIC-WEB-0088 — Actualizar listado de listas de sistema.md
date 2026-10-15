# TASK-PUBLIC-WEB-0088 — Actualizar listado de listas de sistema

## Objetivo

Actualizar la presentación del listado de listas de Works de sistema para incorporar las métricas de lectura y valoración devueltas por el Backend/API.

La implementación debe reutilizar los componentes existentes y mantener la coherencia visual con las `WorkCards` del catálogo.

## Alcance

Modificar la vista que lista las listas de sistema para mostrar, además de la información que ya existe:

- **Avance de lectura:** porcentaje de progreso de lectura de la lista.
- **Valoración:** promedio de votos y cantidad de valoraciones, siguiendo el criterio visual de las `WorkCards`.

No crear una tarjeta independiente si el componente existente puede reutilizarse o extenderse sin introducir responsabilidades ajenas a su propósito.

## Reglas funcionales

### Avance de lectura

- Utilizar el valor de progreso devuelto por la API.
- Si el valor es `null`, no mostrar un porcentaje ficticio ni interpretarlo como `0 %`.
- Si el valor es `0`, mostrar `0 %`.
- Mostrar los demás porcentajes válidos según el contrato de la API.
- No recalcular el progreso en el frontend si la API ya proporciona el valor.

### Valoraciones

- Mostrar el promedio y la cantidad de votos siguiendo el diseño de las `WorkCards`.
- Mostrar ambos únicamente cuando `AverageRating` sea mayor o igual que `1` y menor o igual que `5`.
- Si `AverageRating` es `0`, `null` o está fuera del rango válido, no mostrar información de valoración.
- No inventar promedios ni recalcularlos a partir de valoraciones individuales.

### Contexto

Esta task corresponde exclusivamente al listado de **listas de sistema**. No implementar ni modificar el comportamiento del listado de listas personales.

## Contratos y documentación de referencia

Para determinar cómo consumir los endpoints, consultar:

- `TASK-API-0304 — Implementar endpoints de consultas de listas de lectura.md`.
- `endpoints.md` y la documentación específica de endpoints del catálogo.
- `components.md`.
- `pages.md`.

Leer `components.md` y `pages.md` antes de implementar para identificar componentes y páginas existentes. Actualizarlos si los cambios modifican los componentes reutilizables, la estructura de las páginas o su documentación.

La API y los contratos existentes son la fuente funcional. No inventar endpoints ni propiedades.

## Diseño y responsive

- Mantener la identidad visual de las `WorkCards`.
- Reutilizar los componentes y estilos existentes siempre que corresponda.
- Adaptar la presentación a Mobile, Tablet y Desktop.
- No introducir cambios de diseño ajenos a esta funcionalidad.

## Fuera de alcance

- Listas personales.
- Crear, editar o eliminar listas.
- Crear o modificar valoraciones.
- Reordenar Works.
- Modificar endpoints o contratos del Backend/API.

## Git y ejecución

1. `git checkout main` → `git pull`
2. `git branch --list "feature/us-0034-app-list-reading-and-ratings"`

   Si existe: `git switch feature/us-0034-app-list-reading-and-ratings` → `git merge main`.

   Si no existe: `git switch -c feature/us-0034-app-list-reading-and-ratings`.

3. Implementar los cambios de esta task.
4. Revisar los cambios con `git diff`.
5. Ejecutar las validaciones disponibles para comprobar que el dominio compila y que no se introdujeron regresiones detectables en esta etapa.
6. Crear uno o más commits y realizar el push de los cambios a la rama de trabajo.
7. Incorporar el resultado de ejecución en esta misma task mediante **append**, sin sobrescribir su contenido previo.
8. Mover el archivo según `communication.md` a `finished` si se cumplen los criterios, o a `blocked` si existe un bloqueo real, documentando la causa y el trabajo pendiente.

## Criterios de aceptación

- El listado de listas de sistema muestra el avance de lectura proporcionado por la API.
- `null` no se presenta como `0 %`.
- El promedio y la cantidad de votos se muestran únicamente cuando el promedio está entre `1` y `5`, inclusive.
- La presentación mantiene coherencia visual con las `WorkCards`.
- Se reutilizan los componentes existentes y se evita duplicar lógica.
- La vista es responsive.
- `components.md` y `pages.md` se revisaron y se actualizaron si correspondía.
- Las validaciones disponibles se ejecutaron y sus resultados quedaron documentados.
- Los cambios están committeados y publicados en la rama de trabajo.
