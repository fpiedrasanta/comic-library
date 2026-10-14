# TASK-PUBLIC-WEB-0083 — Refrescar el progreso de lectura en WorkDetail al salir del Reader

## Objetivo

Corregir que el progreso de lectura mostrado en `WorkDetail` quede desactualizado después de leer en
el Reader. Al volver de la lectura debe reflejarse el avance real persistido, no el valor cacheado.

## Contexto

- Continuación de TASK-PUBLIC-WEB-0082 (indicador de progreso en `WorkDetail`).
- Reporte directo del humano: al entrar al Reader, avanzar un par de páginas y salir, el avance seguía
  siendo el mismo.

## Causa raíz

`useUpdateReadingProgress` (llamado en cada cambio de página del Reader) solo hacía `setQueryData`
sobre `['reader','work-pages',workId]`. El progreso también se expone en `GET /api/works/{id}`
(`myReadingProgress`) mediante el query `['catalog','work-detail',workId]`, que tiene `staleTime` de
5 minutos (`useEntityDetail`). Como nada invalidaba ese query, al volver a `/works/{id}` React Query
servía el dato cacheado.

Además, el literal `['reader','work-pages',workId]` estaba duplicado, cuando ya existe
`readerWorkPagesKey`.

## Solución

- Invalidar `['catalog','work-detail',workId]` en el `onSuccess` de `useUpdateReadingProgress`.
- Reutilizar `readerWorkPagesKey(workId)` en lugar del literal duplicado.

## Criterios de aceptación

- [x] Al volver al detalle después de leer, el indicador muestra el progreso actualizado.
- [x] Sin progreso, sigue mostrando solo la acción **Leer**.
- [x] No se altera el comportamiento del Reader ni del indicador existente.
- [x] `npm run typecheck` y `npm run build` pasan sin errores.

## Fuera de alcance

- Cambiar el `staleTime` global de los detalles de entidad (afectaría Publisher/Franchise/Series).
- Reintentar la persistencia del progreso ante fallos.

---

## Resultado de ejecución

### Implementado

`features/reader/hooks/use-reading-progress.ts`:

- `onSuccess` ahora actualiza el cache del Reader con `readerWorkPagesKey(workId)` e invalida
  `['catalog', 'work-detail', workId]`, de modo que al desmontar el Reader y montar `WorkDetailPage`
  el query queda stale y se refetch (comportamiento por defecto de `refetchOnMount`).
- Se eliminó el literal `['reader','work-pages',workId]` duplicado.

### Archivos modificados

- `public-web/public-web/features/reader/hooks/use-reading-progress.ts`

### Decisiones

- La invalidación se hace en el mutation que escribe (patrón correcto de React Query: quien escribe
  invalida), no cambiando el `staleTime` compartido de `useEntityDetail`, que afectaría a los detalles
  de Publisher/Franchise/Series.
- Invalidar repetidamente en cada cambio de página es inocuo: React Query solo marca la query como
  stale; el refetch ocurre cuando hay un observer, es decir al abrir el detalle.

### Notas para el futuro

- No aplica a otras vistas: no existen queries de historial ni de "Continuar leyendo"; esas secciones
  usan datos mock actualmente.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking).
