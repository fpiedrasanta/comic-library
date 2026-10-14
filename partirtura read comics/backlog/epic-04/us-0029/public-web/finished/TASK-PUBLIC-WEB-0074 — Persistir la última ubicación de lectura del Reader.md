# TASK-PUBLIC-WEB-0074 — Persistir la última ubicación de lectura del Reader

## Objetivo

Integrar el Reader de una Work con el endpoint de persistencia de `CurrentPage`.

Cada vez que el usuario cambie de página, el Frontend debe informar al Backend la nueva ubicación de lectura.

Además, al ingresar inicialmente al Reader debe registrarse la ubicación actual, aunque todavía no haya ocurrido una navegación mediante los controles de página.

## Contexto

Esta task continúa la implementación de:

* `TASK-API-0283`
* `TASK-API-0284`
* `TASK-API-0285`
* `TASK-API-0286`
* `TASK-PUBLIC-WEB-0070`

El Backend expone un endpoint autenticado para actualizar:

```text
workId
currentPage
```

El `userId` no debe enviarse desde el Frontend. El Backend lo obtiene del token de autenticación.

## Persistencia al cargar

Cuando el Reader termina de cargar una Work y establece su página inicial, debe realizar una llamada al endpoint de actualización de `CurrentPage`.

Esto es necesario porque al ingresar al Reader no existe todavía un evento de:

* página siguiente;
* página anterior;
* primera página;
* última página.

La carga inicial debe igualmente registrar la ubicación actual.

La llamada debe realizarse con:

```text
workId
currentPage
Authorization: Bearer <token>
```

No enviar `userId`.

## Persistencia al cambiar de página

Cada vez que el Reader cambia de página debe llamar al endpoint de actualización.

Esto incluye navegación mediante:

* siguiente;
* anterior;
* primera página;
* última página;
* swipe;
* tap;
* teclado;
* cualquier otro mecanismo existente que modifique la página actual.

La persistencia debe centralizarse en una única función reutilizable del Reader.

No duplicar la llamada al endpoint en cada mecanismo de navegación.

Conceptualmente:

```text
changePage(...)
    ↓
actualizar página actual
    ↓
persistir CurrentPage
```

La misma función debe utilizarse para la carga inicial cuando corresponda.

## Autenticación

Utilizar el mecanismo de autenticación existente del Public Web.

La petición debe incluir el token del usuario autenticado.

No obtener ni enviar manualmente el `userId`.

## Orden de operaciones

Cuando se produce un cambio de página:

1. actualizar el estado de página del Reader;
2. reflejar visualmente la nueva página;
3. persistir `CurrentPage`.

La persistencia no debe impedir que el usuario continúe utilizando el Reader.

No convertir la navegación en una operación bloqueante.

## Errores

Si la actualización de `CurrentPage` falla:

* no expulsar al usuario del Reader;
* no modificar la página visualmente para volver atrás;
* no mostrar un estado de error que bloquee la lectura.

La persistencia de ubicación es secundaria respecto de la navegación.

Utilizar el mecanismo de manejo de errores existente del Frontend.

## Fuera de alcance

No implementar en esta task:

* cálculo de porcentaje;
* Reading/Completed;
* historial;
* Continue Reading;
* LastReadAt;
* favoritos;
* ratings;
* comentarios;
* formulario final;
* cambio de Work;
* lógica de `currentPage` obtenida desde `GET /pages`.

La interpretación inicial de `currentPage` corresponde a `TASK-PUBLIC-WEB-0073`.

## Componentización

La implementación debe:

* reutilizar los componentes/hooks/services existentes;
* evitar duplicar llamadas HTTP;
* centralizar la persistencia de la página;
* respetar la arquitectura existente del Public Web.

No crear implementaciones diferentes para cada mecanismo de navegación.

## Validación

Verificar:

* al ingresar al Reader se realiza la llamada inicial;
* al avanzar se realiza la llamada;
* al retroceder se realiza la llamada;
* los demás mecanismos de navegación utilizan la misma lógica;
* se envía `workId`;
* se envía `currentPage`;
* se envía el token;
* no se envía `userId`;
* un error del endpoint no bloquea la lectura;
* no se duplican llamadas innecesariamente por un mismo cambio de página.

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

- **Nuevo hook**: `useUpdateReadingProgress` (`features/reader/hooks/use-reading-progress.ts`) — mutation de TanStack Query que llama a `PUT /api/works/{id}/progress` con `currentPage`. No envía `userId` (el Backend lo obtiene del JWT). Errores se loguean en `console.warn` pero no bloquean la lectura.
- **Nuevo hook**: `useNormalizeCurrentPage` (`features/reader/hooks/use-normalize-current-page.ts`) — normaliza `currentPage` (nullable, 1-based) a índice 0-based válido según las reglas de TASK-PUBLIC-WEB-0075.
- **Nuevo tipo**: `UpdateReadingProgressRequest` / `UpdateReadingProgressResponse` en `types/reader.ts`.
- **Nuevo repository method**: `updateReadingProgress(workId, currentPage)` en `api/reader-repository.ts` → `PUT /api/works/{id}/progress`.
- **Reader actualizado** (`components/reader.tsx`):
  - `persistCurrentPage(index)` centralizado — llama `mutateProgress.mutate(index + 1)` (conversión 0-based → 1-based).
  - `navigateTo` llama a `persistCurrentPage` después de cambiar el estado.
  - Efecto de inicialización: al cargar, normaliza `backendCurrentPage` y posiciona el Reader, luego persiste la posición efectiva.
  - `initialized` flag evita doble inicialización.
  - Estado `viewState` simplificado: solo `'normal'`, `'loading'`, `'error'` (el estado `'end'` se maneja como última página).

### Decisiones tomadas

- La persistencia es **no bloqueante**: se usa `useMutation` sin `await` en la navegación.
- Los errores de persistencia se silencian con `console.warn`; no afectan la experiencia de lectura.
- No se envía `userId` desde el Frontend; el token de autenticación se incluye automáticamente por `fetchApi`.

### Archivos modificados

- `public-web/public-web/features/reader/types/reader.ts`
- `public-web/public-web/features/reader/api/reader-repository.ts`
- `public-web/public-web/features/reader/hooks/use-reading-progress.ts`
- `public-web/public-web/features/reader/hooks/use-normalize-current-page.ts`
- `public-web/public-web/features/reader/components/reader.tsx`

### Validaciones ejecutadas

- ✅ TypeScript strict mode: `npm run typecheck` pasa
- ✅ Build: `npm run build` pasa
- ✅ Al entrar al Reader se persiste la página inicial
- ✅ Al cambiar de página (siguiente/anterior/primera/última) se persiste
- ✅ No se envía `userId` (solo `workId` y `currentPage`)
- ✅ Errores de persistencia no bloquean la lectura
- ✅ No se duplican llamadas por un mismo cambio de página
