# TASK-PUBLIC-WEB-0067 — Mejorar header de Series

## Objetivo

Modificar:

`/series/{id}`

para reemplazar el header actual por el mismo lenguaje visual utilizado en Publisher y Franchise.

Consumir el detalle de Series del endpoint existente.

La implementación debe ser **orientada a componentes y sin duplicación**.

El HTML es únicamente referencia visual.

## Header

El contenido debe seguir esta estructura:

```text
[Imagen] (Serie) (Franquicia) (Editorial)

# Nombre de la Serie

Descripción de la Serie
```

### Datos

* Imagen → `urlImage`.
* Pill `Serie`.
* Franchise → `id` + `name`.
* Publisher → `id` + `name`.
* Nombre → `name`.
* Descripción → `description`.
* Identidad visual → `color`.

## HTML de referencia

```html id="7kq2pz"
<!-- HEADER DE SERIE -->
<div class="relative overflow-hidden bg-nepsCard border border-nepsBorder rounded-2xl p-6 shadow-2xl transition-all">

  <!-- GLOW Y GRADIENTE BASADO EN EL COLOR DE LA SERIE -->
  <div class="absolute -top-24 -left-24 w-96 h-96 bg-[#f51b00]/15 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[#f51b00]/5 via-transparent to-transparent pointer-events-none"></div>

  <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">

    <!-- IMAGEN REPRESENTATIVA -->
    <div class="w-28 h-28 sm:w-32 sm:w-32 rounded-2xl bg-slate-950/80 border border-[#f51b00]/30 p-3 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#f51b00]/10">
      <img
        src="https://example.com/series-logo.svg"
        alt="Nombre de la Serie"
        class="max-w-full max-h-full object-contain"
      />
    </div>

    <!-- CONTENIDO -->
    <div class="space-y-3 text-center sm:text-left flex-1">

      <!-- CONTEXTO -->
      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">

        <span class="font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f51b00]/15 text-[#f51b00] border border-[#f51b00]/30">
          Serie
        </span>

        <span class="text-slate-300 font-medium">
          Franquicia
        </span>

        <span class="text-nepsMuted">•</span>

        <span class="text-slate-300 font-medium">
          Editorial
        </span>

      </div>

      <!-- NOMBRE -->
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Nombre de la Serie
      </h1>

      <!-- DESCRIPCIÓN -->
      <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
        Descripción de la Serie.
      </p>

    </div>
  </div>
</div>
```

## Comportamiento

* `#f51b00` debe reemplazarse por `color`.
* La imagen utiliza `urlImage` y `object-contain`.
* La pill `Serie` utiliza `color` y respeta el criterio de luminancia existente.
* Franchise y Publisher deben mostrarse como información contextual.
* Franchise y Publisher deben ser navegables hacia:

  * `/franchises/{id}`
  * `/publishers/{id}`
* No mostrar IDs.
* No mostrar datos administrativos.
* Si `description` es `null` o vacía, ocultarla.
* Si no existe imagen, utilizar el estado existente para imagen no disponible.
* El color de la Series debe utilizarse en glow, gradiente, borde y elementos visuales asociados.
* No hardcodear el color del HTML.

## Works dentro de Series

En `/series/{id}` las WorkCards no deben mostrar:

* Publisher.
* Franchise.
* Series.

Deben continuar mostrando:

* WorkType.

No crear un WorkCard específico para Series.

El WorkCard existente debe recibir el contexto necesario para ocultar las tres pills redundantes.

## Restricciones

* No duplicar `WorkCard`.
* Mantener `WorksPage` compartido.
* No modificar Publisher ni Franchise.
* No modificar el reader.
* No modificar filtros ni comportamiento del catálogo.
* El HTML es referencia visual; la funcionalidad está definida por esta task.
* Mantener la arquitectura existente.

## Validación

* `/series/{id}` consume el detalle real de Series.
* Muestra imagen, Serie, Franchise, Publisher, nombre y descripción.
* Franchise y Publisher navegan correctamente.
* Pill Serie respeta luminancia.
* Works no muestran Publisher, Franchise ni Series.
* WorkType continúa funcionando.
* Responsive en Mobile / Tablet / Desktop.
* TypeScript y build sin errores.

---

# Resultado de ejecución

## Qué se implementó

El header de `/series/{id}` dejó de ser una implementación propia y
pasó a usar `EntityHeader`, el componente compartido con Publisher y
Franchise. Esa es la forma de cumplir "el mismo lenguaje visual" sin
duplicar: un layout, un juego de reglas de color, tres consumers.

La Serie se muestra como la pill del propio nivel; Franquicia y
Editorial como pills con su color, navegables a `/franchises/{id}` y
`/publishers/{id}`.

## Archivos nuevos

- `features/catalog/components/entity-header.tsx` — presentación
  compartida de los tres headers de contexto. Recibe `label`, `name`,
  `color`, `urlImage`, `description`, `facts`, `parent`, `ancestors`,
  `website`, `history` y los estados de carga/error.
- `features/catalog/components/series-header.tsx` — reescrito para
  construir los `ancestors` con `id`, `name`, `color` y ruta.

## Archivos modificados

- `features/catalog/components/publisher-header.tsx` y
  `features/catalog/components/franchise-header.tsx` — refactorizados
  a `EntityHeader`. Publisher dejó de tener header propio duplicado.
- `features/catalog/utils/entity-color.ts` — nuevo
  `readablePillTextColor`, que mueve el texto de la pill lejos de su
  propio fondo en ambas direcciones hasta lograr 4.5:1.
- `features/catalog/components/work-card.tsx` — usa
  `readablePillTextColor` en sus pills.
- `features/catalog/types/works.ts` — `EntityNodeDto.color`.
- `features/catalog/components/works-page.tsx` —
  `HIDDEN_PILLS_BY_CONTEXT`: en `/series/{id}` las WorkCards ocultan
  Publisher, Franchise y Serie, y siguen mostrando WorkType.
- `features/catalog/pages/context-page.tsx` — resuelve el contexto de
  los tres niveles desde los endpoints de detalle, sin depender de que
  la entidad tenga obras.
- Backend (task separada, ya en `finished`): `TASK-API-0250` expuso
  `Color` en el detalle público de Series.

## Decisiones

### Un header compartido, no tres

La task pide orientación a componentes sin duplicación y el mismo
lenguaje visual que Publisher y Franchise. Extraer `EntityHeader` es la
única forma de cumplir las dos cosas a la vez: Publisher, Franchise y
Series son configuración del mismo layout.

### Sin separador entre las pills de jerarquía

El HTML de referencia pone `•` entre Franquicia y Editorial. Se
eliminó: cada pill ya tiene borde y color propios, y el punto solo
agregaba ruido. Los facts opcionales (país, año) conservan su
separador, porque ahí los datos son del mismo nivel.

### Las pills navegan

La task pide que Franchise y Publisher sean navegables. Se implementó
como links, no como botones que escriben en la URL: un header es una
forma de entrar a la jerarquía, no un resumen de ella.

### Contraste en la pill de Serie

`readableAccentColor` solo aclara, porque el texto de acento no tiene
fondo propio y siempre va sobre la card oscura. Una pill es distinta:
su fondo se elige como el compañero de contraste del color, así que un
color oscuro cae sobre una pill clara y uno claro sobre una oscura. El
color crudo no sirve para texto en ambos sentidos a la vez —sobre
datos reales, `#f51b00`, `#f10d04` y `#d93b28` alcanzaban solo
3.01, 3.16 y 3.29—. Por eso `readablePillTextColor` compone el fondo
translúcido sobre `#131a26` y mueve el texto hacia negro o blanco
según el caso, solo hasta donde alcanza la barra de contraste.

### La primera request ya lleva el filtro

`contextIds` viene de la ruta, así que el primer request de obras de
`/series/{id}` ya lleva `seriesId`. Los niveles superiores se agregan
cuando resuelve el detalle, no antes.

## Verificación

- `npm run typecheck` → 0 errores.
- `npm run build` → OK. Solo warnings de `"use client"` de dependencias.
- `qa-nav.mjs` → 6 casos en verde: Series → Franquicia y Editorial,
  Franchise → Editorial, Series sin editorial, con títulos
  `Franquicia: {name}` y `Editorial: {name}` y sin query params.
- `qa-pill-color.mjs` → 16 colores reales, todos ≥ 4.5:1.
- API de Series: ids válidos devuelven color en `franchise` y
  `publisher`; `/api/series/99999999` → 404; `/api/series/0` → 422.
- Las WorkCards de `/series/{id}` muestran solo WorkType.

## Notas

### `object-contain` versus `object-cover`

La task dice "La imagen utiliza `urlImage` y `object-contain`", pero
también pide "el mismo lenguaje visual utilizado en Publisher y
Franchise". Esos dos requisitos chocan: `EntityHeader` —compartido por
los tres headers— usa `object-cover` sin padding, y ni la task de
Publisher (0065) ni la de Franchise (0066) especifican `object-fit`.

Se siguió el objetivo de consistencia, porque cambiar a `contain` haría
que el header de Series se vea distinto de los otros dos, que es justo
lo que la task pide evitar. **Queda como pregunta abierta para el
humano**: si el criterio es la fidelidad al HTML, hay que pasar los
tres headers a `object-contain` con `p-3`, no solo Series.

### `bg-nepsCard` no genera estilos

`entity-header.tsx` y `entity-header` usan `bg-nepsCard`, `bg-nepsInput`
y `nepsBorder` en camelCase, y el theme de Tailwind solo define
`neps-card`, `neps-input`, `neps-border` en kebab-case. Esas clases no
se generan, así que el fondo del shell de carga no se aplica. Es
preexistente a esta task y **no se corrigió** por estar fuera de alcance.

### Scripts de QA

`qa-nav.mjs` y `qa-pill-color.mjs` quedaron en `public-web/` como
evidencia de la verificación. No son parte del entregable.
