# TASK-PUBLIC-WEB-0017 — Implementar estado y servicio de autenticación

## Objetivo

Implementar en el Public Web la gestión centralizada del estado de autenticación del usuario.

La autenticación debe mantener el `AccessToken` exclusivamente en memoria.

El `RefreshToken` nunca debe ser leído, almacenado ni manipulado por JavaScript, ya que es administrado por la API mediante una cookie `HttpOnly`.

Esta Task debe crear la base sobre la cual se implementarán Login, renovación automática de sesión y Logout.

---

## Comportamiento esperado

El estado de autenticación debe contemplar como mínimo:

```text
Authenticated
Unauthenticated
Initializing
```

Debe permitir conocer:

- si existe una sesión autenticada;
- el Access Token actual;
- los datos del usuario autenticado;
- si la aplicación todavía está intentando restaurar una sesión.

Los datos del usuario corresponden al contrato definido por `AuthResponse`.

---

## Access Token

El Access Token:

- debe mantenerse exclusivamente en memoria;
- no debe almacenarse en `localStorage`;
- no debe almacenarse en `sessionStorage`;
- no debe almacenarse en IndexedDB;
- no debe persistirse mediante mecanismos accesibles por JavaScript.

Al recargar completamente la aplicación, el Access Token puede perderse.

La restauración de sesión se implementará mediante el endpoint de Refresh Token en la Task correspondiente.

---

## Refresh Token

El frontend no debe:

- recibirlo desde el response body;
- leerlo;
- almacenarlo;
- enviarlo manualmente;
- manipularlo;
- intentar eliminarlo desde JavaScript.

El navegador debe encargarse automáticamente de enviar la cookie `HttpOnly` al endpoint correspondiente.

---

## Responsabilidades

Crear o adaptar el mecanismo centralizado de autenticación del proyecto.

Debe proporcionar operaciones equivalentes a:

```text
login
logout
refresh
isAuthenticated
getAccessToken
getCurrentUser
```

Los nombres concretos deben respetar las convenciones tecnológicas existentes.

No distribuir esta lógica entre componentes de UI.

---

## Estado inicial

Al iniciar la aplicación debe existir un estado equivalente a:

```text
Initializing
```

hasta que se determine si existe una sesión válida.

La restauración de sesión será implementada en una Task posterior.

No asumir que la ausencia de Access Token en memoria significa inmediatamente que el usuario no está autenticado.

---

## Contexto obligatorio

Antes de implementar, leer:

- `project.md`
- `communication.md`
- `components.md`
- `pages.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `public-web-architecture.md`
- `endpoints.md`
- `epic-01.md`
- `us-0002.md`

Revisar también la implementación actual de autenticación existente en el Public Web.

---

## Restricciones

No implementar en esta Task:

- pantalla de Login;
- interceptor HTTP;
- renovación automática;
- Logout visual;
- autorización por roles;
- navegación protegida.

Estas responsabilidades corresponden a Tasks posteriores.

---

## Documentación

Si se introduce una regla general de arquitectura frontend relacionada con autenticación, actualizar:

```text
frontend-coding-rules.md
```

Si se modifica la arquitectura del Public Web, actualizar:

```text
public-web-architecture.md
```

No modificar `endpoints.md` NUNCA. Se se detecta una inconsistencia o necesidad, solicitar al backend-agent creando una task en planned en:
/epic-01/us-0002/api/planned.

---

## Criterios de finalización

1. Existe un mecanismo centralizado para mantener el estado de autenticación.
2. El Access Token se mantiene exclusivamente en memoria.
3. El Refresh Token no es accesible desde JavaScript.
4. No se utiliza `localStorage`, `sessionStorage` ni IndexedDB para tokens.
5. El estado contempla la inicialización de autenticación.
6. Los datos del usuario autenticado están disponibles desde el estado centralizado.
7. La lógica no está distribuida entre componentes.
8. No se implementan responsabilidades correspondientes a Tasks posteriores.
9. El proyecto compila correctamente.
10. Se respetan `frontend-coding-rules.md` y `public-web-architecture.md`.

---

## Resultado de la ejecución

Completar esta sección al finalizar la implementación.

### Cambios realizados

[Describir archivos y componentes modificados.]

### Verificación

[Describir compilación y pruebas realizadas.]

### Documentación actualizada

[Describir documentos modificados.]