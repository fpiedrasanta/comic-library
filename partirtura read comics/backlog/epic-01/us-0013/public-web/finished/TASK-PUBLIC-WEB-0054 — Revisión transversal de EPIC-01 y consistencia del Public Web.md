# TASK-PUBLIC-WEB-0054 — Revisión transversal de EPIC-01 y consistencia del Public Web

## Objetivo

Realizar una revisión transversal de todas las funcionalidades de identidad implementadas en Public Web durante EPIC-01 para verificar su consistencia con la arquitectura, coding rules, contratos del Backend, manejo de autenticación y documentación del proyecto.

La tarea es principalmente de auditoría y no debe utilizarse para introducir refactors de alcance abierto.

## Alcance

Revisar las funcionalidades relacionadas con:

- Registro.
- Validación de email.
- Login.
- Login con Google.
- Recuperación de contraseña.
- Cambio de contraseña.
- Perfil.
- Gestión de sesiones.
- Cierre de sesión.
- Eliminación de cuenta.
- Selección de país.
- Manejo de usuarios baneados.
- Manejo de fechas.

## Validaciones

### Arquitectura

Verificar:

- Cumplimiento de la arquitectura definida para Public Web.
- Separación entre páginas, hooks, servicios, utilidades y componentes.
- Uso correcto de servicios para comunicación con API.
- Reutilización de componentes.
- Ausencia de lógica de negocio perteneciente al Backend.
- Ausencia de duplicación innecesaria.

### Coding Rules

Verificar cumplimiento de:

- Coding rules del Frontend Public Web.
- Convenciones de nombres.
- Organización de archivos.
- Responsabilidad de componentes.
- Manejo de estados.
- Manejo de errores.
- Tipado.
- Ausencia de código muerto.
- Ausencia de mocks o datos hardcodeados que ya no correspondan.

### Autenticación

Revisar integralmente:

- Login tradicional.
- Login con Google.
- Access Token.
- Refresh Token.
- Refresh Token Rotation.
- Cookie HttpOnly cuando corresponda.
- Persistencia de sesión.
- Expiración.
- Renovación.
- Logout.
- Protección de rutas.
- Estado de autenticación.
- Recuperación ante errores de autenticación.

Verificar especialmente que las reglas de autenticación no estén duplicadas o reinterpretadas incorrectamente en diferentes páginas, hooks o servicios.

### Contratos con API

Verificar:

- Requests.
- Responses.
- `ApiResponse`.
- Manejo de códigos y mensajes.
- Contratos de autenticación.
- Contratos de usuario.
- Contratos de países.
- Manejo del mensaje de usuario baneado.

El frontend debe mostrar correctamente los errores funcionales enviados por Backend sin modificar indebidamente su semántica.

### Países

Verificar:

- Carga de países disponibles.
- Selección durante registro.
- Selección durante edición de perfil.
- Respeto de `IsActive`.
- Manejo de país previamente asociado que posteriormente haya sido desactivado.
- Ausencia de países hardcodeados cuando corresponda.

### Usuarios baneados

Verificar que:

- El frontend no derive `IsBanned`.
- El frontend no derive la vigencia del Ban.
- El frontend no utilice `BanCount` para determinar si un usuario está baneado.
- El mensaje de autenticación de usuario baneado se muestre correctamente.
- No se duplique en Public Web la lógica de vigencia existente en Backend.

### Fechas

Verificar:

- Utilización de `date-utils.ts`.
- Conversión UTC/local.
- Ausencia de conversiones duplicadas.
- Ausencia de zonas horarias hardcodeadas.
- Uso correcto de `sessionStorage` para temporizadores cuando corresponda.
- Consistencia entre valores mostrados al usuario y valores enviados a la API.

### Componentización

Revisar:

- Duplicación de componentes.
- Componentes que deberían reutilizarse.
- Lógica duplicada entre páginas.
- Hooks reutilizables.
- Utilidades compartidas.
- Consistencia con `pages.md` y `components.md`.

La revisión debe respetar las decisiones de componentización existentes y no introducir abstracciones innecesarias.

### Dependencias

Revisar:

- Dependencias utilizadas durante EPIC-01.
- Dependencias innecesarias.
- Código asociado a librerías que ya no se utilizan.
- Consistencia con el stack tecnológico definido.

### Documentación

Verificar consistencia con:

- Arquitectura del Public Web.
- `pages.md`.
- `components.md`.
- Coding rules.
- Documentación de servicios y contratos correspondiente.

Identificar documentación que haya quedado desactualizada durante EPIC-01.

## Criterio de ejecución

La revisión debe considerar el estado actual del Public Web.

Si se encuentra un problema menor y claramente aislado, puede corregirse dentro de esta task.

Si se identifica un problema que implique:

- refactoring significativo;
- cambio arquitectónico;
- modificación de contratos;
- cambio funcional;
- modificación importante de UX/UI;
- modificación de seguridad;

debe generarse una nueva task específica.

## Validación final

- `npm run build` debe finalizar correctamente.
- No deben quedar mocks relacionados con funcionalidades ya integradas.
- No deben existir conversiones de fechas duplicadas.
- No deben existir errores de TypeScript.
- No deben introducirse regresiones funcionales.
- La documentación debe reflejar la implementación actual.

## Resultado esperado

EPIC-01 debe quedar técnicamente consolidada desde el punto de vista del Public Web, con código, arquitectura, autenticación, integración, componentización, dependencias y documentación consistentes.

## Assigned to

Public Web Agent