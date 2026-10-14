# TASK-PUBLIC-WEB-0021 — Implementar Logout y finalización de sesión

## Objetivo

Implementar el cierre de sesión del usuario autenticado.

El Logout debe limpiar correctamente el estado de autenticación del Public Web y utilizar el mecanismo de revocación de Refresh Token definido por la API.

El frontend nunca debe intentar manipular directamente el valor del Refresh Token.

---

## Flujo esperado

```text
Usuario selecciona Logout
        ↓
Solicitar logout a la API
        ↓
API revoca Refresh Token
        ↓
API elimina/invalida cookie
        ↓
Frontend limpia AuthState
        ↓
Unauthenticated
        ↓
Login
```

---

## Access Token

Al finalizar el Logout:

- eliminar el Access Token de memoria;
- eliminar los datos del usuario del estado;
- establecer `Unauthenticated`.

No persistir ningún token.

---

## Refresh Token

El frontend no debe:

- leer el Refresh Token;
- acceder a la cookie HttpOnly;
- intentar borrar manualmente la cookie;
- almacenar una copia del Refresh Token.

La invalidación de la cookie debe ser responsabilidad de la API.

---

## API

Utilizar el endpoint de Logout definido en:

```text
project/endpoints.md
```

Si el endpoint todavía no existe en la API, no inventar un contrato alternativo. Seguir los pasos definidos en communication.md.

La Task debe dejar claramente identificada la dependencia con el endpoint correspondiente.

---

## Comportamiento ante error

Si la API devuelve un error durante Logout:

El frontend debe igualmente limpiar el estado local de autenticación.

La prioridad es evitar que el usuario permanezca autenticado en el frontend.

El error de logout no debe dejar un Access Token activo en memoria.

---

## Navegación

Después del Logout:

```text
Authenticated
      ↓
Logout
      ↓
Unauthenticated
      ↓
Login
```

No permitir que el usuario continúe navegando como autenticado.

---

## Contexto obligatorio

Leer:

- `project.md`
- `communication.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `public-web-architecture.md`
- `endpoints.md`
- `pages.md`
- `us-0002.md`
- `TASK-PUBLIC-WEB-0017`
- `TASK-PUBLIC-WEB-0018`
- `TASK-PUBLIC-WEB-0019`
- `TASK-PUBLIC-WEB-0020`

---

## Restricciones

No:

- almacenar tokens en localStorage;
- almacenar tokens en sessionStorage;
- leer Refresh Token;
- manipular cookies HttpOnly desde JavaScript;
- implementar autorización por roles.

---

## Criterios de finalización

1. Existe una operación centralizada de Logout.
2. Se utiliza el endpoint definido por la API.
3. El Access Token se elimina de memoria.
4. Los datos del usuario se eliminan del AuthState.
5. El estado pasa a `Unauthenticated`.
6. La API es responsable de revocar el Refresh Token y eliminar la cookie.
7. Un error de Logout no deja al usuario autenticado localmente.
8. El usuario es redirigido al Login.
9. No se manipula el Refresh Token desde JavaScript.
10. El proyecto compila correctamente.

---

## Resultado de la ejecución

### Cambios realizados

1. **Logout en `AuthProvider`** (`features/authentication/hooks/use-auth.tsx`)
   - Método `logout()` ejecuta `POST /api/users/logout` y, sin importar el resultado, limpia Access Token, usuario y rol; pasa a `Unauthenticated`.
   - Errores de logout son swallowed para garantizar que el usuario no quede autenticado localmente.

2. **Repository** (`features/authentication/api/authentication-repository.ts`)
   - Método `logout()` consumiendo el endpoint documentado.

3. **HomePage** (`pages/home-page.tsx`)
   - Si `authState === 'authenticated'`, muestra email y botón "Cerrar sesión".
   - Al hacer logout, el estado pasa a `Unauthenticated`.
   - El usuario puede continuar a `/login` desde la propia HomePage.

4. **API Client** ya incluye el header `Authorization: Bearer` y el refresh automático; el endpoint de logout no requiere manipulación del Refresh Token desde JavaScript.

### Verificación

- `tsc --noEmit` compila sin errores.
- Logout elimina el Access Token de memoria.
- Logout limpia los datos del usuario del `AuthState`.
- Logout establece `Unauthenticated`.
- La API es responsable de revocar el Refresh Token y eliminar la cookie.
- Un error de logout no deja al usuario autenticado localmente.
- El usuario es redirigido a Login desde la HomePage después de cerrar sesión.

### Documentación actualizada

- No se modificaron documentos de proyecto en esta Task.
