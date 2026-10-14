# TASK-PUBLIC-WEB-0073 — Incorporar al Reader de una Work la navegación hacia la Work anterior y la Work siguiente

## Objetivo

Incorporar al Reader de una Work la navegación hacia la Work anterior y la Work siguiente utilizando la información devuelta por:

```text
GET /api/works/{id}/pages
```

La navegación debe ocupar el espacio actualmente utilizado por el indicador de página únicamente cuando el usuario se encuentra en el primer o último extremo del Reader.

---

## API

Consumir el contrato actualizado:

```text
GET /api/works/{id}/pages
```

La respuesta contiene:

```text
WorkId
PreviousWork
NextWork
Pages
```

Cada navegación contiene:

```text
Id
Title
NumberValue
```

`NumberValue` puede ser `null`.

---

# Navegación durante la lectura

La navegación entre Works debe ser independiente de la navegación entre páginas.

Los controles existentes de página continúan funcionando normalmente:

```text
← Página anterior
Página siguiente →
```

No convertirlos en botones de navegación entre Works.

---

# Primera página

Cuando el Reader esté mostrando la primera página y exista:

```text
PreviousWork != null
```

reemplazar visualmente el indicador:

```text
1 de 33
```

por una acción de navegación hacia la Work anterior.

La información debe mostrarse en formato equivalente a:

```text
← anterior - REGULAR - 0004 - Dios ama, el hombre mata
```

El valor mostrado debe utilizar directamente:

```text
PreviousWork.NumberValue
PreviousWork.Title
```

Si `NumberValue` es `null`, no mostrar placeholder ni texto ficticio.

Al seleccionar la acción, navegar directamente a:

```text
/works/{previousWork.id}/read
```

No navegar primero al detalle de la Work.

---

# Última página

Cuando el Reader esté mostrando la última página y exista:

```text
NextWork != null
```

reemplazar visualmente el indicador:

```text
33 de 33
```

por una acción de navegación hacia la Work siguiente.

La información debe mostrarse en formato equivalente a:

```text
REGULAR - 0004 - Dios ama, el hombre mata - siguiente →
```

El valor mostrado debe utilizar directamente:

```text
NextWork.NumberValue
NextWork.Title
```

Si `NumberValue` es `null`, no mostrar placeholder ni texto ficticio.

Al seleccionar la acción, navegar directamente a:

```text
/works/{nextWork.id}/read
```

No navegar primero al detalle de la Work.

---

# Páginas intermedias

Mientras el usuario esté entre la primera y última página, mantener exclusivamente el indicador:

```text
12 de 33
```

No mostrar PreviousWork ni NextWork.

---

# Cuando no existe navegación

Si el usuario está en la primera página pero:

```text
PreviousWork == null
```

mantener el indicador normal:

```text
1 de 33
```

Si el usuario está en la última página pero:

```text
NextWork == null
```

mantener:

```text
33 de 33
```

No mostrar acciones vacías ni placeholders.

---

# Navegación directa

Al cambiar de Work:

* utilizar el mismo componente Reader;
* cambiar la URL;
* solicitar las páginas de la nueva Work;
* utilizar su propio PreviousWork;
* utilizar su propio NextWork;
* comenzar en la primera página mientras todavía no exista persistencia de progreso.

No duplicar el Reader para la navegación.

---

# Relación con controles existentes

No agregar una nueva barra permanente para PreviousWork/NextWork.

La navegación entre Works utiliza el espacio contextual del indicador de página únicamente en los extremos.

Durante el resto de la lectura, el espacio continúa mostrando el indicador de página.

---

# Responsive

La navegación debe funcionar correctamente en:

* Mobile;
* Tablet;
* Desktop.

Debe conservar la jerarquía visual existente del Reader.

Las acciones deben ser suficientemente grandes para interacción táctil.

No deben generar overflow horizontal.

---

# Componentización

La implementación debe ser orientada a componentes.

No duplicar el markup de:

* navegación anterior;
* navegación siguiente;
* indicador;
* estado de primera página;
* estado de última página.

Crear o reutilizar componentes apropiados para representar el estado contextual del indicador/navegación.

El Reader debe continuar siendo un único componente reutilizable.

---

# Estados

Soportar correctamente:

1. Work con PreviousWork y NextWork.
2. Primera Work de una secuencia.
3. Work intermedia.
4. Última Work de una secuencia.
5. Work con solo PreviousWork.
6. Work con solo NextWork.
7. Work sin navegación.
8. PreviousWork/NextWork sin NumberValue.

---

# Fuera de alcance

No implementar:

* progreso de lectura;
* porcentaje;
* Reading/Completed;
* historial;
* Continue Reading;
* navegación automática al llegar al final;
* navegación basada en Number;
* inferencia de Works anterior/siguiente;
* navegación hacia el detalle de Work;
* List Reader;
* navegación por orden de Lists.

---

# Fuente visual

Mantener el estilo visual de:

```text
C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\reader.html
```

El archivo HTML es **únicamente referencia visual**.

No utilizar su comportamiento JavaScript como definición funcional.

La funcionalidad válida es la definida en esta task.

---

# Criterios de aceptación

* En la primera página, si existe PreviousWork, se muestra la acción de Work anterior en lugar del indicador.
* En la última página, si existe NextWork, se muestra la acción de Work siguiente en lugar del indicador.
* En páginas intermedias se mantiene el indicador.
* Si no existe navegación correspondiente, se mantiene el indicador.
* La información muestra `NumberValue` cuando existe y Title.
* `NumberValue` se muestra como un único valor, por ejemplo `REGULAR - 0001`.
* NumberValue inexistente no genera placeholder.
* PreviousWork navega directamente al Reader de la Work anterior.
* NextWork navega directamente al Reader de la Work siguiente.
* La nueva Work utiliza el mismo Reader.
* No se duplica código.
* No se implementa progreso ni historial.
* La implementación es responsive.

---

## Execution Result

### Implemented

- `ReaderWorkPagesDto` updated with `previousWork` and `nextWork` fields (`types/reader.ts`)
- `ReaderWorkNavigation` type added for `id`, `title`, `numberValue`
- `ReaderPageIndicator` component created (`features/reader/components/reader-page-indicator.tsx`) — renders the contextual indicator: page number in the middle, previous/next work action at the first/last page
- `ReaderFooter` updated to use `ReaderPageIndicator` and receive `previousWork`, `nextWork`, `onPreviousWork`, `onNextWork` props
- `Reader` updated with `useNavigate`, `goPreviousWork`, `goNextWork` functions that navigate directly to `/works/{id}/read`
- Total page count now includes the synthetic "end" page: `totalPages = pages.length + 1`
- Last page (index `pages.length`) renders `ReaderEnd` state instead of an image
- `goNext`, `goPrev`, `goFirst`, `goLast` simplified — sequential navigation through all pages including the end page
- Removed `goLastIntervalRef` (interval-based fast-forward) since `goLast` now jumps directly
- `viewState` simplified — no longer uses `'end'` state; the end page is just the last page index

### Files Changed

- `public-web/public-web/features/reader/types/reader.ts` — added `ReaderWorkNavigation` and `previousWork`/`nextWork` to `ReaderWorkPagesDto`
- `public-web/public-web/features/reader/components/reader-page-indicator.tsx` — new component
- `public-web/public-web/features/reader/components/reader-footer.tsx` — uses `ReaderPageIndicator`
- `public-web/public-web/features/reader/components/reader.tsx` — navigation logic, page count, end page handling
- `project/components.md` — updated reader component table

### Verified

- TypeScript strict mode: `npm run typecheck` passes
- Build: `npm run build` passes
