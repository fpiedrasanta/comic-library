# TASK-PUBLIC-WEB-0018 — Implementar Login

## Objetivo

Implementar la funcionalidad de inicio de sesión del Public Web utilizando el endpoint:

```text
POST /api/users/login
```

La pantalla de Login ya existe visualmente y debe utilizarse como base.

La Task debe conectar la interfaz existente con la API y actualizar el estado centralizado de autenticación.

---

## Flujo esperado

```text
Usuario completa email y password
        ↓
Submit
        ↓
POST /api/users/login
        ↓
API valida credenciales
        ↓
Respuesta OK
        ↓
Guardar Access Token en memoria
        ↓
Guardar datos del usuario en AuthState
        ↓
Usuario autenticado
        ↓
Redirigir al index
```

El Refresh Token será administrado exclusivamente mediante cookie `HttpOnly`.

El frontend no debe intentar acceder a él.

---

## Request

Utilizar exactamente el contrato documentado en:

```text
project/endpoints.md
```

No inventar propiedades adicionales.

---

## Respuesta exitosa

Utilizar el `AuthResponse` definido por la API.

El frontend debe almacenar en el estado de autenticación:

- Access Token;
- UserId;
- Email;
- FullName;
- Role.

No debe intentar almacenar el Refresh Token.

---

## Errores

Ante credenciales inválidas, mostrar un mensaje apropiado al usuario.

El frontend no debe intentar determinar si el error corresponde a:

- email inexistente;
- password incorrecta;
- email no validado.

La API utiliza deliberadamente un error genérico.

El frontend debe respetar esa decisión de seguridad.

---

## Validaciones

El formulario debe validar como mínimo:

- email requerido;
- formato válido de email;
- password requerida.

Las validaciones deben respetar las reglas existentes del frontend.

No duplicar reglas de negocio pertenecientes al backend.

---

## Redirección

Cuando el Login sea exitoso:

```text
Login
  ↓
Authenticated
  ↓
Index
```

No implementar en esta Task autorización por roles.

---

## Estado de autenticación

Utilizar el mecanismo centralizado implementado en:

```text
TASK-PUBLIC-WEB-0017
```

No crear un estado paralelo dentro del componente Login.

---

## Contexto obligatorio

Leer:

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
- `TASK-PUBLIC-WEB-0017`

---

## Restricciones

No implementar:

- Refresh automático;
- HTTP interceptor;
- Logout;
- autorización por roles;
- almacenamiento persistente de tokens.

Estas funcionalidades corresponden a Tasks posteriores.

---

## Criterios de finalización

1. El formulario Login utiliza la interfaz existente.
2. Se realiza `POST /api/users/login`.
3. El request respeta el contrato de la API.
4. El Access Token se guarda únicamente en memoria.
5. El Refresh Token no es accesible desde JavaScript.
6. Los datos del usuario se almacenan en el estado centralizado.
7. Los errores de credenciales se muestran correctamente.
8. No se revela información sobre la existencia del usuario.
9. Login exitoso redirige al index.
10. No se implementa lógica de Refresh Token en esta Task.
11. El proyecto compila correctamente.

---

## Resultado de la ejecución

### Cambios realizados

1. **Login page conectada a la API** (`pages/login-page.tsx`)
   - Formulario con React Hook Form + Zod.
   - Validaciones: email requerido + formato válido, password requerida.
   - `POST /api/users/login` consumido mediante `authenticationRepository.login`.
   - Éxito: actualiza `AuthState` vía `useAuth().login(payload)` y redirige a `/`.
   - Error 401: muestra mensaje genérico "Credenciales inválidas." sin revelar detalles.
   - Otros errores: muestra `detail` o mensaje genérico.

2. **Types actualizados** (`types/api.ts`)
   - Agregada interfaz `AuthResponse` para Login/Refresh.
   - Agregada interfaz `LoginRequest`.

3. **Repository actualizado** (`features/authentication/api/authentication-repository.ts`)
   - Agregado método `login(request: LoginRequest): Promise<AuthResponse>`.

4. **AuthProvider** ya estaba implementado en TASK-0020 y reutiliza `login(payload)`.

### Verificación

- `tsc --noEmit` compila sin errores.
- Login exitoso actualiza el estado centralizado y redirige al index.
- Credenciales inválidas muestran error genérico.
- No se manipula Refresh Token desde el frontend.
- No se implementa lógica de refresh en esta Task.

### Documentación actualizada

- No se modificaron documentos de proyecto en esta Task.
