# TASK-PUBLIC-WEB-0098 — Validar e integrar favoritos en Public Web

## Objetivo

Verificar la implementación de favoritos realizada en `TASK-PUBLIC-WEB-0097`, comprobar su integración con Backend/API y con las páginas que reutilizan `WorkCard` y `WorksPage`, y completar la integración en `main` únicamente si todas las validaciones son satisfactorias.

## Fuentes obligatorias

Leer y utilizar durante la revisión:

- `US-0035.md`.
- `TASK-PUBLIC-WEB-0097`.
- `pages.md`.
- `components.md`.
- `endpoints.md`.
- `communication.md`.
- `frontend-coding-rules.md`.
- `frontend-public-web-agent.md`.
- `public-web-architecture.md`.
- Las tasks `TASK-API-0313` a `TASK-API-0318` y los contratos de favoritos, catálogo, historial y recomendaciones.

Consultar los componentes, servicios, rutas y pruebas existentes que puedan verse afectados.

## Validaciones funcionales

### 1. Estrella en WorkCard

- Un Work con `isFavorite=false` muestra la estrella sin fondo.
- Un Work con `isFavorite=true` muestra la estrella amarilla con fondo amarillo.
- Agregar un favorito actualiza el estado visual después del éxito de la API.
- Quitar un favorito actualiza el estado visual después del éxito de la API.
- Un error de API no deja el estado presentado como persistido.
- El clic en la estrella no activa la navegación ni otras acciones de `WorkCard`.
- Las solicitudes repetidas no generan operaciones simultáneas para el mismo Work.

### 2. Contratos con Backend/API

- El alta utiliza `POST /api/favorites/{workId}`.
- La baja utiliza `DELETE /api/favorites/{workId}`.
- El catálogo de `/favorites` utiliza `isFavorite=true`.
- El estado inicial de cada tarjeta proviene de `isFavorite`.
- No se envía una identidad de usuario desde el cliente.
- La integración utiliza los mecanismos existentes de autenticación, cliente HTTP y tratamiento de errores.

### 3. Página `/favorites`

- La ruta está registrada y documentada en `pages.md`.
- Se reutiliza `WorksPage`, sin una implementación duplicada del catálogo.
- Los resultados contienen exclusivamente favoritos del usuario autenticado, según la respuesta del Backend/API.
- Búsqueda, filtros estructurales, WorkType y ordenamiento conservan su comportamiento.
- El scroll infinito funciona con `isFavorite=true`.
- Los estados de carga, error y vacío se muestran correctamente.
- Al quitar un favorito, la tarjeta desaparece sin recargar la página.
- El comportamiento sigue siendo correcto al cambiar de página y volver a consultar los resultados.

### 4. Regresiones

Verificar que la estrella y sus eventos no afecten:

- navegación desde `WorkCard`;
- páginas de Publisher, Franchise y Series;
- catálogo general;
- historial de lectura;
- recomendaciones;
- otros contextos que reutilicen `WorkCard`;
- responsive en mobile, tablet y desktop.

Comprobar también accesibilidad básica del control, nombre accesible, foco visible y operación por teclado según las convenciones del proyecto.

## Revisión técnica y documental

- Revisar `git diff` y confirmar que los cambios están limitados al alcance.
- Verificar la reutilización de componentes y servicios.
- Buscar lógica duplicada, solicitudes N+1, errores de estado y propagación accidental de eventos.
- Comprobar que `pages.md` documenta `/favorites`.
- Comprobar que `components.md` refleja los cambios de responsabilidades o composición, cuando corresponda.
- Confirmar que no se alteraron contratos de Backend/API ni funcionalidades fuera de alcance.
- Resolver los problemas detectados en la rama de trabajo y repetir las validaciones afectadas.

## Criterios de aceptación

- Todas las validaciones funcionales y técnicas pasan.
- No hay regresiones detectables en las páginas que reutilizan `WorkCard` o `WorksPage`.
- Los cambios de documentación necesarios están incorporados.
- No quedan errores de compilación ni pruebas fallidas atribuibles a la implementación.
- La integración con Backend/API respeta los contratos existentes.
- La integración final en `main` se realiza únicamente después de comprobar todos los criterios.

## Git y ejecución

1. Actualizar `main` desde el remoto.
2. Cambiar a `feature/us-0035-public-web` y verificar que los cambios de las tasks anteriores estén presentes.
3. Revisar `git status` y `git diff`; comprobar que no existan cambios accidentales o sin registrar.
4. Ejecutar las validaciones técnicas y funcionales descritas en esta task.
5. Si se requieren correcciones, implementarlas en la rama de trabajo, revisar el diff, ejecutar las validaciones afectadas, crear commits y publicar los cambios.
6. Incorporar los resultados de esta revisión en esta misma task mediante **append**, sin sobrescribir el contenido previo.
7. Si las validaciones fallan o existe un bloqueo real, documentar hallazgos, causa y trabajo pendiente, y mover la task a `blocked` conforme a `communication.md`. No integrar en `main`.
8. Si todas las validaciones pasan, actualizar `main`, integrar la rama mediante el mecanismo permitido por `communication.md`, resolver eventuales conflictos y repetir las validaciones pertinentes sobre `main`.
9. Publicar `main` y verificar la integración remota. Eliminar la rama local y remota de trabajo solamente después de confirmar que la integración final fue exitosa.
10. Registrar mediante **append** los commits, pruebas, resultados de integración, publicación y estado final. Mover esta task a `finished` conforme a `communication.md` solo cuando la integración haya sido verificada.
