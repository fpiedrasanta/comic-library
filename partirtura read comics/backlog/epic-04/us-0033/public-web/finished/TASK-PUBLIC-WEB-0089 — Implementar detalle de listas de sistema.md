# TASK-PUBLIC-WEB-0089 — Implementar detalle de listas de sistema

## Objetivo

Actualizar la vista de detalle de una lista de Works de sistema para presentar sus Works como filas, mostrar el avance de lectura, permitir acceder al lector y exponer el promedio de valoraciones en el encabezado.

La implementación debe reutilizar los componentes existentes y seguir la referencia visual provista, sin tomar la maqueta como definición funcional.

## Referencia visual

Utilizar como referencia:

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\detalle-de-lista.html`

Este archivo es únicamente una maqueta visual. La funcionalidad debe respetar la US-0034, los contratos existentes y esta task.

No copiar literalmente el comportamiento JavaScript de la maqueta ni inventar operaciones que la API no soporte.

## Alcance

Modificar el detalle de una lista de sistema para mostrar:

### Encabezado

- La información de la lista que ya presenta la aplicación.
- El promedio y la cantidad de valoraciones, siguiendo el criterio visual de las `WorkCards`.
- El avance de lectura general de la lista.

### Filas de Works

Presentar los Works de la lista como filas ordenadas, conservando la información relevante que ya muestra la vista y agregando:

- Portada e información identificativa del Work, según los componentes y datos existentes.
- Avance de lectura individual.
- Botón para acceder al lector del Work.

Reutilizar `WorkCard` u otros componentes existentes cuando sea razonable. Si la presentación en filas necesita un componente diferente, implementarlo como componente reutilizable y documentarlo.

## Reglas funcionales

### Orden de las Works

- Respetar el orden recibido del backend, que corresponde a `WorkListItem.Position`.
- Si resulta necesario, se permite un ordenamiento defensivo en el frontend usando el criterio de orden existente.
- El drag & drop debe estar completamente deshabilitado para las listas de sistema.
- No permitir reordenamiento mediante interacción visual ni modificar posiciones localmente.
- No implementar persistencia de orden.
- El reordenamiento de listas personales queda fuera de esta task y corresponde a otro caso de uso.

### Avance de lectura

- Mostrar el porcentaje general de lectura de la lista.
- Mostrar el porcentaje individual de cada Work cuando esté disponible.
- Si el progreso es `null`, no mostrarlo como `0 %`.
- Si el progreso es `0`, mostrar `0 %`.
- No recalcular porcentajes en el frontend cuando la API ya proporciona esos valores.
- Respetar el contrato existente para listas vacías y Works sin progreso registrado.

### Valoraciones

- Mostrar el promedio y la cantidad de votos en el encabezado.
- Mostrar ambos únicamente cuando `AverageRating` sea mayor o igual que `1` y menor o igual que `5`.
- Si `AverageRating` es `0`, `null` o está fuera del rango válido, no mostrar información de valoración.
- No inventar promedios ni recalcularlos a partir de valoraciones individuales.

### Acceso al lector

- Todavia no hacer nada, solo mostrar el botón Leer/Continuar (cómo hoy en work-detail, revisar). Cómo se lee una lista es algo que veremos más adelante.
- Las works de la lista no acceden al lector tampoco, ni me llevan al detalle del work, no son navegables, si son drag&drop para reordenar (ver template).

## Contratos y documentación de referencia

Antes de implementar, consultar:

- `TASK-API-0304 — Implementar endpoints de consultas de listas de lectura.md`.
- `endpoints.md` y la documentación específica de endpoints del catálogo.
- `components.md`.
- `pages.md`.

Leer `components.md` y `pages.md` para conocer la implementación existente. Actualizarlos si se agregan o modifican componentes, páginas, navegación o responsabilidades documentadas.

No inventar endpoints ni propiedades. La API y los contratos existentes son la fuente funcional.

## Responsive

La vista debe adaptarse a Mobile, Tablet y Desktop sin perder:

- La jerarquía del encabezado.
- La legibilidad de las filas.
- El acceso al lector.
- La visibilidad del progreso y de las métricas cuando correspondan.

## Fuera de alcance

- Detalle de listas personales.
- Reordenamiento de Works en listas personales.
- Crear, editar o eliminar listas.
- Crear o modificar valoraciones.
- Modificar el lector.
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

- El detalle de una lista de sistema sigue la referencia visual sin convertirla en especificación funcional.
- El encabezado muestra el promedio y la cantidad de votos cuando el promedio está entre `1` y `5`, inclusive.
- El encabezado muestra el avance general de lectura respetando la diferencia entre `null` y `0`.
- Los Works se presentan como filas y conservan el orden recibido del backend.
- Cada fila muestra el avance individual cuando está disponible.
- Cada fila ofrece acceso al lector existente.
- El drag & drop está deshabilitado para listas de sistema.
- No se modifica ni se persiste el orden.
- No se implementa comportamiento de listas personales.
- La vista es responsive y reutiliza componentes existentes.
- `components.md` y `pages.md` se revisaron y se actualizaron si correspondía.
- Las validaciones disponibles se ejecutaron y sus resultados quedaron documentados.
- Los cambios están committeados y publicados en la rama de trabajo.

---

## Resultado de ejecución

### Estado

**finished.** Rama de trabajo `feature/us-0034-app-list-reading-and-ratings`, commit `c517bf0`.

### Implementado

1. **Tipos** (`features/catalog/types/lists.ts`): `CatalogListWorkDto` gana `readingProgressPercentage`
   y `CatalogListDetailDto` gana `readingProgressPercentage`, `averageRating` y `ratingCount`.
2. **Encabezado** (`features/catalog/components/list-header.tsx`): bloque "Avance de la lista" con el
   porcentaje, la barra y la acción de lectura (**Leer / Continuar leyendo / Recomenzar**, derivada del
   porcentaje de la lista), más la valoración de la lista (`StarRatingDisplay` + `n votos`) junto a la
   cantidad de obras. La valoración sólo se muestra si el promedio está entre 1 y 5; el bloque de avance
   sólo si la API devuelve un porcentaje.
3. **Filas** (`features/catalog/components/list-work-row.tsx`, nuevo reutilizable): número de orden,
   miniatura de portada (`ProtectedImage`), título, editorial y número, barra + porcentaje del avance
   individual y la acción de lectura de esa obra (**Leer / Continuar / Recomenzar**).
4. **Página** (`features/catalog/pages/list-detail-page.tsx`): las obras pasan de la grilla de
   `WorkCard` a filas, en el orden del backend. Se eliminaron el mapeo a `WorkCatalogItemDto`,
   `ResultsGrid` y el `handleSelectEntity`, que ya no aplican a una fila no navegable.

### Decisiones

- **Filas y no la grilla de la maqueta anterior**: la task pide filas y el humano confirmó el template
  nuevo `ux_ui/nueva-lista.html`. El encabezado sigue ese template.
- **Sin drag & drop**: no se renderiza el tirador, no hay `draggable`, el badge dice **Orden de lectura**
  y se eliminó el hint "arrastra para reordenar". El orden es siempre el del backend.
- **Las filas no navegan** (ni al lector ni al detalle de la obra) y los botones de lectura todavía no
  hacen nada. La task dice "Todavía no hacer nada, sólo mostrar el botón" y "las obras no acceden al
  lector tampoco, no son navegables", y el humano aclaró que retomar necesita `currentIdWork`, que la
  API aún no expone. Queda anotado en el código con comentarios.
  ⚠️ Esto contradice el criterio "cada fila ofrece acceso al lector existente": se siguió la regla
  explícita de la sección "Acceso al lector". Conectar la navegación es un cambio de una línea por botón
  cuando el contrato traiga el dato.
- **Sin "N de M obras completadas"**: el contrato da `workCount` y el porcentaje, pero no el conteo de
  completadas, así que no se muestra ni se deriva.
- **Sin "• 32 páginas"** en la fila: el contrato no trae páginas por obra. La línea muestra editorial y
  número cuando existe.
- **Progreso `null`**: no se muestra ni barra ni porcentaje. `0` se muestra como `0%` (con el porcentaje
  en gris, como la maqueta).
- **Colores**: se siguió la maqueta nueva (esmeralda) en el bloque de avance y las filas.

### Archivos modificados

- `public-web/public-web/features/catalog/types/lists.ts`
- `public-web/public-web/features/catalog/components/list-header.tsx`
- `public-web/public-web/features/catalog/components/list-work-row.tsx` (nuevo)
- `public-web/public-web/features/catalog/pages/list-detail-page.tsx` (reescrita)
- `project/components.md` (sección de listas)
- `project/pages.md` (filas `List`)

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking).
- No hay script de lint configurado.
- Pendiente validación visual contra el endpoint real.
