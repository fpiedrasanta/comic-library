# TASK-PUBLIC-WEB-0083 — Agregar barra de progreso de lectura a WorkCard

## Objetivo

Incorporar una barra de progreso de lectura en el componente `WorkCard` existente, utilizando los datos devueltos por `GET /api/works`.

**La pantalla ya está funcionando correctamente. El único cambio permitido en esta tarea es agregar la barra de progreso de lectura a las tarjetas.**

## Referencia visual

`C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\progreso-lectura-work-card.html`

El HTML contiene comentarios que indican los colores que deben utilizarse. Respetar esas indicaciones.

La referencia define exclusivamente la apariencia de la nueva barra. No debe utilizarse como motivo para modificar otros elementos de la interfaz.

## Fuente de datos

Utilizar `myReadingProgress`, incorporado a la respuesta de `GET /api/works` mediante `TASK-API-0297`.

Cada tarjeta debe utilizar exclusivamente el progreso correspondiente al Work que representa.

## Comportamiento

- **Sin progreso:** no mostrar la barra.
- **Lectura iniciada (`Reading`):** mostrar la barra con el porcentaje correspondiente.
- **Lectura completada (`Completed`):** mostrar la barra al 100%.

El ancho visual de la barra debe representar `myReadingProgress.percentage`, sin recalcular el porcentaje en Front.

Si `myReadingProgress` es `null`, la tarjeta debe conservar exactamente su comportamiento y apariencia actuales, sin reservar un espacio vacío para la barra.

## Implementación

- Modificar únicamente el componente `WorkCard` y los estilos estrictamente necesarios para incorporar la barra.
- Reutilizar `myReadingProgress` de los datos existentes, sin agregar llamadas adicionales a la API.
- Respetar los colores indicados en los comentarios del HTML de referencia.
- Adaptar la barra al ancho disponible de la tarjeta.
- Evitar que el nuevo elemento altere innecesariamente la distribución, las dimensiones o la alineación del contenido existente.
- Mantener el comportamiento responsive actual.

## Restricciones

**No modificar ningún otro aspecto de la aplicación.**

No cambiar:

- Diseño ni estructura actual de `WorkCard`, salvo el espacio estrictamente necesario para incorporar la barra.
- Portada, título, numeración, fechas ni pills.
- Filtros, búsqueda, ordenación ni paginación.
- Navegación ni comportamiento de las tarjetas.
- Contratos de API ni lógica de Backend.
- Otros componentes, páginas o funcionalidades.

No recrear la pantalla ni refactorizar código ajeno a esta incorporación.

## Criterios de aceptación

- La barra aparece únicamente cuando existe progreso de lectura.
- El porcentaje visual coincide con `myReadingProgress.percentage`.
- Las lecturas completadas muestran el 100%.
- Los colores respetan los comentarios de `progreso-lectura-work-card.html`.
- No se realizan llamadas adicionales a la API.
- Las tarjetas sin progreso mantienen su apariencia actual.
- No se producen regresiones visuales ni funcionales.
- El único cambio observable es la incorporación de la barra de progreso.

---

## Resultado de ejecución

### Estado

**finished.** Dependencia resuelta: TASK-API-0297 (Backend) finalizada y verificada.

### Implementado

1. **Tipo** (`features/catalog/types/works.ts`): `WorkCatalogItemDto` gana `myReadingProgress`,
   reutilizando `MyReadingProgressDto` de `types/work-detail.ts` (mismo `ReaderMyProgressDto` del
   Backend, no se redeclara el contrato). Es opcional a propósito: así ni `list-detail-page` ni
   cualquier otro constructor manual del DTO tienen que tocarse.
2. **Helper** (`features/catalog/utils/reading-progress-color.ts`): `readingProgressAppearance`
   devuelve `color`, `glow` y `percentage` (clampeado a 0-100).
3. **Componente** (`features/catalog/components/work-card.tsx`): dentro del contenedor de portada, al
   final, badge + barra absolutos. Sin progreso no se renderiza nada.
4. **`entity-color.ts`**: `toHex` pasó a exportarse para que el helper reutilice el parseo y el
   formateo existentes en lugar de duplicarlos.

### Colores (decisión del humano)

- **Interpolación continua** ámbar → naranja según `myReadingProgress.percentage`, sin umbrales
  inventados. La barra se va oscureciendo a medida que avanza la lectura.
- **Completado → verde** (`#34d399`), decidido por `status` del Backend, no por porcentaje.
- **Glow calculado desde el mismo color** con `colorWithAlpha(color, 0.6)`; **no** se agregaron las
  tres sombras estáticas a `tailwind.config.ts` porque no podrían seguir a un color continuo. Esto
  reemplaza el "con glow" de la referencia por un glow siempre sincronizado con la barra.

### Badge

- `Reading`: punto pulsante + `{percentage}%`.
- `Completed`: **`✓ LEÍDO`**, por indicación del humano, en lugar del `100%`.
- ⚠️ **Desviación documentada del criterio de aceptación:** la task pedía "Las lecturas completadas
  muestran el 100%". El humano indicó explícitamente `✓ LEÍDO`. Queda registrado aquí; el 100% sigue
  siendo visible porque el estado completado siempre es barra llena, y el texto del badge prevalece
  por decisión del dueño del producto.

### Archivos modificados

- `public-web/public-web/features/catalog/types/works.ts`
- `public-web/public-web/features/catalog/utils/reading-progress-color.ts` (nuevo)
- `public-web/public-web/features/catalog/components/work-card.tsx`
- `public-web/public-web/features/catalog/utils/entity-color.ts` (export de `toHex`)
- `project/components.md` (sección catalog + referencia a TASK-0083)
- `project/pages.md` (`/catalog` y `/lists/:id`)

### Decisiones

- El campo es opcional en el DTO para cumplir "no modificar otros componentes, páginas o
  funcionalidades": las listas no traen progreso y sus tarjetas quedan sin barra.
- El porcentaje mostrado y el ancho usan el mismo valor clampeado. No se recalcula el progreso: el
  clamp y el redondeo son de presentación (ancho CSS y texto), como en el indicador de `WorkDetail`.
- Barra y badge van con `absolute` y `pointer-events-none`, así que la distribución, dimensiones y
  alineación de la tarjeta no cambian y el clic del `Link` sigue funcionando en toda la portada.
- El badge se apoya en `z-20` para quedar por encima del overlay de pills (`z-10`), y no se pisa con
  el pill de WorkType (que está a `bottom-2`, 8px) porque la barra ocupa solo 4px.

### Notas para el futuro

- Si más adelante la lista de Works expone progreso para el contexto de listas, el mismo
  `WorkCatalogItemDto` ya lo acepta.
- El helper queda disponible si el indicador del detalle (`WorkReadingProgress`) adopta la misma
  escala de color.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking).
- No hay script de lint configurado en el proyecto.
- Pendiente de validación visual con datos reales del listado (el Backend ya devuelve el campo).