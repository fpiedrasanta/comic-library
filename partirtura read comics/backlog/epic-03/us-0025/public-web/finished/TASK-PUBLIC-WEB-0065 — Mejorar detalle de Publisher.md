# TASK-PUBLIC-WEB-0065 — Mejorar detalle de Publisher

## Objetivo

Modificar `/publishers/{id}` para:

1. Reemplazar el header actual por el diseño HTML indicado abajo.
2. Obtener toda la información del header desde `GET /api/publishers/{id}`.
3. En el contexto `/publishers/{id}`, ocultar la pill `Publisher` de las WorkCards.
4. Hacer que la pill `Editorial` del header respete el criterio de luminancia/contraste existente.

La implementación debe ser **orientada a componentes y sin duplicación**.

El HTML es **referencia visual**. Los datos hardcodeados del ejemplo deben reemplazarse por los datos reales del endpoint.

## Endpoint

`GET /api/publishers/{id}`

Contrato:

```ts
{
  id: number;
  name: string;
  color: string;
  urlImage: string | null;
  countryName: string | null;
  foundedYear: number | null;
  website: string | null;
  description: string | null;
  history: string | null;
}
```

No mostrar `id`.

## HTML de referencia

Reemplazar el header actual por una implementación equivalente a este HTML:

```html
<!-- HEADER DE EDITORIAL MEJORADO -->
<div class="relative overflow-hidden bg-nepsCard border border-nepsBorder rounded-2xl p-6 shadow-2xl transition-all">

  <!-- GLOW Y GRADIENTE DE FONDO BASADO EN EL COLOR DE LA EDITORIAL -->
  <div class="absolute -top-24 -left-24 w-96 h-96 bg-[#f51b00]/15 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[#f51b00]/5 via-transparent to-transparent pointer-events-none"></div>

  <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">

    <!-- LOGO REPRESENTATIVO -->
    <div class="w-28 h-28 sm:w-32 sm:w-32 rounded-2xl bg-slate-950/80 border border-[#f51b00]/30 p-3 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#f51b00]/10">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg"
        alt="Marvel Comics"
        class="max-w-full max-h-full object-contain"
      />
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="space-y-3 text-center sm:text-left flex-1">

      <!-- BADGES Y DATOS -->
      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
        <span class="font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f51b00]/15 text-[#f51b00] border border-[#f51b00]/30">
          Editorial
        </span>

        <span class="text-slate-300 font-medium">🇺🇸 Estados Unidos</span>
        <span class="text-nepsMuted">•</span>
        <span class="text-slate-300 font-medium">Fundada en 1939</span>
      </div>

      <!-- NOMBRE Y SITIO WEB -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Marvel Comics
        </h1>

        <a
          href="https://marvel.com"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-nepsPrimary hover:underline bg-nepsInput border border-nepsBorder hover:border-nepsPrimary/50 px-3 py-1.5 rounded-lg transition-all self-center sm:self-auto"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          marvel.com
        </a>
      </div>

      <!-- DESCRIPCIÓN -->
      <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
        Es una de las editoriales de cómics más grandes y famosas del mundo.
      </p>

      <!-- HISTORIA -->
      <details class="group pt-1">
        <summary class="text-xs font-semibold text-[#f51b00] hover:text-[#f51b00]/80 cursor-pointer list-none inline-flex items-center gap-1 transition-colors">
          <span>Leer historia completa</span>

          <svg class="w-3.5 h-3.5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </summary>

        <div class="mt-3 p-3.5 bg-nepsInput/80 border border-nepsBorder rounded-xl text-xs text-slate-400 leading-relaxed max-w-3xl space-y-1">
          <p class="font-semibold text-slate-200">Historia de la Editorial:</p>
          <p>
            Nació en 1939 como Timely Comics de la mano de Martin Goodman.
          </p>
        </div>
      </details>

    </div>
  </div>
</div>
```

### Adaptaciones obligatorias del HTML

* `#f51b00` debe reemplazarse por el `color` del Publisher.
* `Marvel Comics` debe reemplazarse por `name`.
* La imagen debe utilizar `urlImage`.
* El país debe utilizar `countryName`.
* El año debe utilizar `foundedYear`.
* El enlace debe utilizar `website`.
* La descripción debe utilizar `description`.
* La historia debe utilizar `history`.
* No mostrar el ID.
* Si un dato opcional es `null`, ocultar ese elemento.
* La pill `Editorial` debe calcular texto/borde/fondo según luminancia para mantener contraste.
* El comportamiento responsive debe conservar la estructura del HTML.

## WorkCard en contexto Publisher

En `/publishers/{id}` no mostrar la pill de Publisher/Editorial en las WorkCards.

Mantener:

* Franchise.
* Series.
* WorkType.

No crear otro `WorkCard`: el componente existente debe recibir el contexto necesario para ocultar únicamente la pill redundante.

## Restricciones

* No modificar el endpoint.
* No modificar dominio ni base de datos.
* No implementar todavía los headers de Franchise ni Series.
* No crear páginas/componentes duplicados.
* El HTML anterior es referencia visual; el comportamiento funcional lo define esta task y US-0025.
* Mantener la arquitectura y componentes existentes.

## Validación

* `/publishers/{id}` carga los datos reales desde `GET /api/publishers/{id}`.
* Header visualmente equivalente al HTML.
* Logo correctamente contenido.
* Pill con contraste correcto para distintos colores.
* Website funciona como enlace externo.
* Historia se puede expandir/contraer.
* Campos `null` no generan elementos vacíos.
* WorkCards no muestran Publisher en contexto Publisher.
* Franchise, Series y WorkType continúan funcionando.
* Mobile / Tablet / Desktop.
* TypeScript y build sin errores.

## Resultado de ejecución

### Estado

finished

### Qué se implementó

* `types/works.ts` — `PublisherDetailDto` con `color`, `urlImage`, `countryName`, `foundedYear`, `website`, `description` e `history` como `string | number | null`, según el contrato real de `PublisherDetailDto.cs`.
* `api/catalog-repository.ts` — `getPublisherDetail(id)`.
* `hooks/use-publisher-detail.ts` — query con la misma clave que usa `ContextPage`, de modo que el header y el filtro de la página comparten una sola request.
* `components/publisher-header.tsx` — el header nuevo. Toma `publisherId` y carga sus propios datos, con skeleton de carga, estado 404 y estado de error.
* `components/works-page.tsx` — renderiza `PublisherHeader` en el contexto publisher y `ContextualHeader` en franchise/series, y pasa `hiddenPills` a la grilla.
* `components/work-card.tsx` / `results-grid.tsx` — prop `hiddenPills: HierarchyLevel[]`. No se creó otro `WorkCard`.
* `utils/entity-color.ts` — se agregó `readableAccentColor` y los helpers ahora aceptan un color ausente.
* `pages/context-page.tsx` — el nodo de publisher sale de `GET /api/publishers/{id}` en vez de derivarse de la primera obra.

### Decisiones

**El nodo de publisher dejó de derivarse de la primera obra.** Antes `ContextPage` sacaba nombre y color de `works[0].publisher`. Con el detalle disponible, una editorial sin obras deja de quedar sin header y sin filtro de publisher: el endpoint es autoritativo y `id` viene de la ruta, así que no hay ambigüedad. Las páginas de franchise y series siguen derivando sus nodos de la obra, porque sus headers no entran en esta tarea.

**El alpha de la pill es 0.85, no el `/15` del HTML de referencia.** El HTML proponía `bg-[#f51b00]/15 text-[#f51b00]`. Medido contra la superficie de la card (`#131a26`), a 0.15 el tinte apenas mueve la card y el color de entidad como texto queda ilegible: `#0d4a84` da 1.23:1 y `#7C3AED` 1.95:1. A 0.85, el mismo criterio de luminancia de `WorkCard`, la superficie es efectivamente negra o blanca y el texto lee en 10 de 10 colores de prueba. Se siguió el criterio existente, como pedía la tarea, y el `/15` del HTML quedó como referencia visual únicamente.

Contraste medido de la pill a 0.85 (texto = color de entidad, fondo = el negro o blanco que elige la luminancia):

| Color | Fondo | Superficie | Contraste |
| --- | --- | --- | --- |
| `#0d4a84` | blanco 0.85 | `#dcddde` | 6.63:1 |
| `#000000` | blanco 0.85 | `#dcddde` | 15.44:1 |
| `#8B4513` | blanco 0.85 | `#dcddde` | 5.22:1 |
| `#00CED1` | negro 0.85 | `#030406` | 10.50:1 |
| `#FFFF00` | negro 0.85 | `#030406` | 19.10:1 |
| `#7C3AED` | blanco 0.85 | `#dcddde` | 4.19:1 |
| `#f51b00` | blanco 0.85 | `#dcddde` | 3.06:1 |
| `#FF0000` | blanco 0.85 | `#dcddde` | 2.94:1 |

Los tres últimos quedan entre 2.9:1 y 4.2:1. Es la misma característica de las pills de `WorkCard`, que el usuario ya había aprobado, así que no se cambió el criterio para que el header se viera distinto de las cards. Si alguna vez se quiere llevar todas las pills por encima de 4.5:1, el camino es mover el texto a `readableAccentColor` y hacerlo en `WorkCard` y en el header juntos.

**`readableAccentColor` sí fue necesario.** El toggle "Leer historia completa" es texto de acento sobre la card, sin fondo propio que pueda moverse. Con el color crudo, `#0d4a84` sobre `#131a26` da 1.7:1. El helper calcula luminancia relativa WCAG y aclara el color lo mínimo necesario hasta 4.5:1; verificado en ≥4.5:1 para los diez colores de prueba, incluidos los extremos blanco y negro.

**Sólo se ocultó la pill de publisher, como pedía la tarea.** En `/franchises/:id` y `/series/:id` la pill de franchise y de serie también repiten el contexto, pero sus headers no entran en esta tarea, así que esas páginas quedaron intactas y verificadas.

### Validación

Chromium headless con sesión real, contra el backend corriendo.

`/publishers/3` (Marvel Comics, `#f51b00`):

* h1 "Marvel Comics", pill `Editorial` con fondo `rgba(255,255,255,0.85)`, borde `rgba(245,27,0,0.3)`, texto `rgb(245,27,0)`.
* "Estados Unidos" y "Fundada en 1939" con el separador `•` entre ambos.
* Website `marvel.com` → `https://marvel.com`, `target="_blank"`, `rel="noopener noreferrer"`.
* Logo de 256x256 renderizado a 102x102 dentro de su caja de 128x128, sin desbordar.
* Ningún ID visible.
* Cards: 0 pills de Editorial, 16 de Franquicia, 14 de Serie, 16 de WorkType.

`/publishers/8` (editorial de test con todos los datos): renderiza país, año, website, descripción e historia; la historia abre y muestra "Created for integration testing". Su logo no aparece porque `GET /images/997` responde 404 — es dato de test roto, no un defecto: `ProtectedImage` cae a la inicial "T" dentro de la misma caja de 128x128. Comprobado contra la API que el 404 es real.

`/publishers/99999999`: "La editorial no existe".

Responsive, con el logo contenido y sin scroll horizontal: mobile 390x844 (86x86 en caja de 112x112), tablet 820x1180 (102x102 en 128x128), desktop 1440x1000 (102x102 en 128x128).

Campos `null` sin elementos vacíos: en una corrida donde Marvel no tenía `description` ni `history`, no se renderizó ni el párrafo ni el `details`.

Regresión: `/catalog` sigue con sus 24 pills de Editorial; `/franchises/6` y `/series/8` siguen usando `ContextualHeader` con sus 3 pills por card; en `/publishers/3` la cadena de filtros sigue escribiendo `?idPublisher=3&idFranchise=6` y luego `&idSerie=8` sin cambiar de ruta, y la pill de Editorial sigue oculta al filtrar.

`npm run typecheck` exit 0. `npm run build` OK (172 módulos, 6.25s).

### Notas

* El backend no necesitó cambios: `GET /api/publishers/{id}` ya existía con el contrato pedido.
* `urlImage` es una ruta relativa (`/images/{id}`) bajo autenticación, por eso el logo va por `ProtectedImage` y no por un `img` directo.
* El 404 del logo en datos de test es un detalle de la base, no del frontend. Si se quiere, conviene revisar esos publishers de integración.
