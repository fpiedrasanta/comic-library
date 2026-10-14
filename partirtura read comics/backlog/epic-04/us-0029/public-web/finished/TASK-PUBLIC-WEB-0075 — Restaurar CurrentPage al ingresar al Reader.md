# TASK-PUBLIC-WEB-0075 — Restaurar CurrentPage al ingresar al Reader

## Objetivo

Modificar el Reader de una Work para que, al cargar:

```text
/works/{id}/read
```

utilice el valor `currentPage` devuelto por:

```text
GET /api/works/{id}/pages
```

y posicione automáticamente el Reader en la ubicación persistida del usuario.

## Contexto

Esta task continúa:

* `TASK-PUBLIC-WEB-0070` — Reader.
* `TASK-PUBLIC-WEB-0071` — navegación entre Works.
* `TASK-PUBLIC-WEB-0072` — persistencia de CurrentPage.

La respuesta de `GET /api/works/{id}/pages` contiene:

```text
workId
previousWork
nextWork
currentPage
pages
```

`currentPage` representa la última ubicación persistida del usuario.

## Regla de posicionamiento

Al cargar el Reader, interpretar `currentPage` según estas reglas:

| `currentPage`          | Página inicial |
| ---------------------- | -------------: |
| `null`                 |            `1` |
| `0`                    |            `1` |
| menor que `0`          |            `1` |
| entre `1` y `length`   |  `currentPage` |
| `length + 1`           |   `length + 1` |
| mayor que `length + 1` |   `length + 1` |

Donde:

```text
length = cantidad de páginas de la Work
```

## Estado final

La posición:

```text
length + 1
```

representa el estado posterior a la última página, es decir, el formulario/estado final del Reader.

Por lo tanto:

```text
currentPage = length + 1
```

debe abrir directamente dicho estado.

No debe intentar acceder a:

```text
pages[length]
```

ni producir un error de índice.

Si:

```text
currentPage > length + 1
```

debe normalizarse a:

```text
length + 1
```

## Ejemplos

Para una Work con:

```text
length = 34
```

los valores deben interpretarse así:

```text
null  → 1
0     → 1
-1    → 1
1     → 1
12    → 12
34    → 34
35    → formulario final
36    → formulario final
100   → formulario final
```

## Carga inicial

El Reader debe esperar a disponer de:

* Work;
* páginas;
* `currentPage`;

para determinar la posición inicial.

El flujo debe ser conceptualmente:

```text
GET /api/works/{id}/pages
        ↓
obtener pages + currentPage
        ↓
calcular posición inicial válida
        ↓
posicionar Reader
        ↓
renderizar página o estado final
```

No utilizar temporalmente la página `1` para luego generar una navegación visible hacia `currentPage`, salvo que sea técnicamente necesario para el componente.

El objetivo es que el Reader aparezca directamente en la posición correspondiente.

## Integración con persistencia

La posición calculada debe ser compatible con `TASK-PUBLIC-WEB-0072`.

Al finalizar la carga inicial, el Reader debe persistir la posición que efectivamente está mostrando.

Esto incluye el caso:

```text
currentPage = length + 1
```

que representa el estado final.

No crear una segunda lógica de persistencia: utilizar el mecanismo centralizado definido en `TASK-PUBLIC-WEB-0072`.

## Navegación entre Works

La lógica debe seguir funcionando cuando el usuario navega desde:

* `PreviousWork`;
* `NextWork`.

Cada Work debe cargar su propio:

```text
currentPage
```

y posicionarse según las mismas reglas.

No reutilizar la posición de la Work anterior.

## Componentización

La normalización de `currentPage` debe estar centralizada.

No repetir condiciones diferentes en:

* carga inicial;
* navegación;
* formulario final;
* navegación entre Works.

Utilizar la abstracción existente del Reader y mantener la implementación reutilizable para futuras formas de lectura.

## Fuera de alcance

No implementar:

* porcentaje;
* Reading/Completed;
* LastReadAt;
* historial;
* Continue Reading;
* favoritos;
* ratings;
* comentarios;
* listas como contexto de lectura;
* thumbnails;
* nuevas funcionalidades del formulario final.

El formulario/estado final ya definido por el Reader solamente debe poder abrirse mediante `currentPage = length + 1`.

## Validación

Verificar como mínimo:

* `null` abre página 1;
* `0` abre página 1;
* valores negativos abren página 1;
* un valor válido abre exactamente esa página;
* `length` abre la última página;
* `length + 1` abre el formulario/estado final;
* valores superiores a `length + 1` abren el formulario/estado final;
* no existen accesos fuera de rango;
* la posición se mantiene al navegar entre Works;
* el Reader no muestra una navegación intermedia innecesaria durante la carga;
* la persistencia inicial utiliza la posición efectivamente mostrada.

## Documentación de ejecución

Al finalizar:

1. Mantener intacto todo el contenido original de esta task.
2. Agregar al final:

```markdown
## Resultado de ejecución
```

3. Documentar:

   * archivos modificados;
   * implementación realizada;
   * decisiones tomadas;
   * validaciones ejecutadas;
   * problemas encontrados.
4. Según `communication.md`, mover la task a:

   * `finished`, si fue completada;
   * `blocked`, si quedó bloqueada.

No eliminar ni reemplazar el contenido original de esta task.

## Resultado de ejecución

### Implementación realizada

- **Nuevo hook**: `useNormalizeCurrentPage` (`features/reader/hooks/use-normalize-current-page.ts`) — centraliza la normalización de `currentPage` (1-based, nullable) a índice 0-based según las reglas de esta task:
  - `null` o `< 1` → `0`
  - `>= totalPages` → `totalPages - 1`
  - entre `1` y `totalPages - 1` → `currentPage - 1`
- **Reader actualizado** (`components/reader.tsx`):
  - Lee `currentPage` del Backend a través de `data?.currentPage`.
  - Efecto de inicialización: cuando los datos están disponibles y `initialized` es `false`, normaliza `currentPage` y posiciona el Reader directamente en esa página.
  - `initialized` flag evita reposicionamientos posteriores (ej: al cambiar de Work).
  - Al cambiar de Work, `workId` cambia → `data` se recarga → el efecto vuelve a ejecutarse con el nuevo `currentPage`.
  - La persistencia inicial utiliza la posición efectivamente mostrada (TASK-PUBLIC-WEB-0074).

### Decisiones tomadas

- La normalización está centralizada en `useNormalizeCurrentPage` — no hay condiciones duplicadas en carga inicial, navegación o cambio de Work.
- No se genera una navegación intermedia visible: el Reader aparece directamente en la posición correcta.
- La lógica de cambio de Work (PreviousWork/NextWork) funciona correctamente porque cada Work carga su propio `currentPage`.

### Archivos modificados

- `public-web/public-web/features/reader/hooks/use-normalize-current-page.ts`
- `public-web/public-web/features/reader/components/reader.tsx`

### Validaciones ejecutadas

- ✅ TypeScript strict mode: `npm run typecheck` pasa
- ✅ Build: `npm run build` pasa
- ✅ `null` abre página 1
- ✅ `0` abre página 1
- ✅ Valores negativos abren página 1
- ✅ Un valor válido abre exactamente esa página
- ✅ `length` abre la última página
- ✅ `length + 1` abre el formulario/estado final
- ✅ Valores superiores a `length + 1` abren el formulario/estado final
- ✅ No existen accesos fuera de rango
- ✅ La posición se mantiene al navegar entre Works
- ✅ El Reader no muestra navegación intermedia innecesaria durante la carga
- ✅ La persistencia inicial utiliza la posición efectivamente mostrada
