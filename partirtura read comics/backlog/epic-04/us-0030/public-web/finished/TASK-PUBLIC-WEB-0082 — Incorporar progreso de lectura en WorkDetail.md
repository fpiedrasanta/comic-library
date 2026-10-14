# TASK-PUBLIC-WEB-0082 — Incorporar progreso de lectura en WorkDetail

## Objetivo

Incorporar el indicador de progreso de lectura y la acción contextual correspondiente en la página `WorkDetail` existente.

La portada, la numeración, la clasificación y el resto de la página ya están implementados. **No deben recrearse ni modificarse como parte de esta tarea**, salvo ajustes estrictamente necesarios para integrar el progreso.

## Referencias

- **Referencia visual:** `C:\Users\fpiedrasanta\Desktop\read comics\partirtura read comics\ux_ui\progreso-lectura.html`
- **Endpoint:** `GET /api/works/{id}`.
- **Contrato:** `myReadingProgress`, definido en `TASK-API-0296`.

Se asume que el endpoint y el contrato estarán disponibles cuando Backend finalice `TASK-API-0296`. El Front puede comenzar esta tarea a partir de ese momento.

El HTML es únicamente una referencia visual del indicador de progreso.

## Comportamiento

Utilizar `myReadingProgress` de la respuesta de `GET /api/works/{id}`.

### Sin progreso

Cuando `myReadingProgress` sea `null`:

- No mostrar el indicador de progreso.
- Mostrar el botón **Leer**.

### Lectura iniciada

Cuando `myReadingProgress.status` sea `Reading`:

- Mostrar el porcentaje de avance.
- Mostrar la barra de progreso.
- Mostrar la página actual y el total de páginas.
- Mostrar el botón **Continuar**.

### Lectura completada

Cuando `myReadingProgress.status` sea `Completed`:

- Mostrar el progreso al 100%.
- Mostrar la página y el total de páginas.
- Mostrar el botón **Recomenzar**.

El botón **Recomenzar** debe navegar al Reader existente sin reiniciar ni modificar el progreso persistido. Se conserva el comportamiento actual del Reader para una lectura completada.

## Integración

- Integrar el indicador en la página `WorkDetail` existente.
- Reutilizar componentes y estilos existentes cuando corresponda.
- Navegar a `/works/{id}/read` mediante el mecanismo de navegación actual.
- Respetar las reglas de autenticación y acceso del proyecto.
- No implementar un endpoint nuevo ni persistencia del progreso en Front.

## Responsive

El indicador debe adaptarse a Mobile, Tablet y Desktop, respetando la referencia visual y la estructura actual de `WorkDetail`.

## Fuera de alcance

No recrear `WorkDetail` ni modificar la portada, numeración o clasificación existentes.

No implementar el reinicio real del progreso, cambios en el Reader ni funcionalidades adicionales.

## Criterios de aceptación

- Se incorpora el progreso en `WorkDetail` sin recrear la página.
- Sin progreso, el indicador se oculta y la acción es **Leer**.
- Con estado `Reading`, se muestra el avance y la acción es **Continuar**.
- Con estado `Completed`, se muestra el 100% y la acción es **Recomenzar**.
- Las acciones navegan al Reader existente.
- El diseño sigue `progreso-lectura.html`.
- La implementación es responsive y no duplica lógica innecesariamente.

---

## Resultado de ejecución

### Estado

**finished** — implementación de Front completada. No se bloquea: `myReadingProgress` llega como
`null` hasta que Backend finalice `TASK-API-0296`, y ese caso ya está resuelto (sin indicador,
acción **Leer**). Queda una validación visual con el endpoint real cuando el humano lo indique.

### Implementado

- Nuevo componente reutilizable `WorkReadingProgress` (`features/catalog/components/work-reading-progress.tsx`):
  - `progress === null`: solo acción **Leer**.
  - `status = Reading`: tarjeta de avance (porcentaje, barra, `Pág X de Y`) + acción **Continuar**.
  - `status = Completed`: tarjeta al 100% (`Pág totalPages de totalPages`) + acción **Recomenzar**.
  - Las tres acciones navegan a `/works/{id}/read` con el `useNavigate` actual. No se reinicia ni
    persiste progreso desde Front.
- Integración en `WorkHeader`: el botón "Leer" hardcodeado fue reemplazado por
  `<WorkReadingProgress workId={work.id} progress={work.myReadingProgress ?? null} />`, dentro del
  bloque existente bajo la portada. Se eliminó el `useNavigate`/`navigate` ahora sin uso.
- Tipo `MyReadingProgressDto` + `myReadingProgress` agregados a `CatalogWorkDetailDto`
  (`features/catalog/types/work-detail.ts`).

### Archivos modificados

- `public-web/public-web/features/catalog/types/work-detail.ts` — `ReadingProgressStatus`,
  `MyReadingProgressDto`, campo `myReadingProgress`.
- `public-web/public-web/features/catalog/components/work-reading-progress.tsx` — nuevo componente.
- `public-web/public-web/features/catalog/components/work-header.tsx` — integración.
- `project/components.md` — sección "work detail components": fila nueva para `WorkReadingProgress`,
  y `WorkHeader` menciona el bloque de progreso.
- `project/pages.md` — fila `Work` actualizada con el comportamiento por estado.

### Decisiones

- Se implementó la **Propuesta 1** de la referencia (`progreso-lectura.html`): tarjeta de progreso bajo
  la portada, que cubre todos los requisitos funcionales. No se agregó la "Propuesta 2" (pill en la fila
  de metadatos) porque no la piden los criterios de aceptación y se evita trabajo extra.
- **No se muestra "Faltan ~3 min"** de la referencia: el endpoint no expone tiempo estimado y no debe
  inventarse información.
- La página mostrada se acota con `Math.min(currentPage, totalPages)` porque el estado `Completed`
  guarda `currentPage = totalPages + 1`; así se ve `Pág 32 de 32` y no `Pág 33 de 32`.
- El porcentaje se clampea a 0..100 para el ancho de la barra y se redondea solo para mostrar; el valor
  crudo sigue siendo el del backend.
- Se reutilizó el estilo de botón existente de la página (marca `brand-500/10`) en lugar del botón
  sólido del HTML, por la indicación explícita de reutilizar estilos existentes.
- Los textos de acción son los del objetivo: **Leer**, **Continuar**, **Recomenzar**.
- `progress={work.myReadingProgress ?? null}` por defensa frente a respuestas sin el campo.

### Notas para el futuro

- Cuando `TASK-API-0296` aterrice, verificar en runtime: casos `Reading`/`Completed`, `null`, anónimo
  (no aplica: el endpoint exige autenticación) y que la consulta no modifique el progreso.
- Si se quiere el pill de estado de la Propuesta 2, se puede agregar después al aislar el marcado.

### Verificación

- `npm run typecheck`: sin errores.
- `npm run build`: sin errores (warnings preexistentes de chunking, no relacionados).
- No hay script de lint configurado (`"lint": "echo \"No lint configured yet\""`).