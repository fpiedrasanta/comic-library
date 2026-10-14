# TASK-PUBLIC-WEB-0042 — Corregir visibilidad del botón de Google Login y estado de error

## Task ID

TASK-PUBLIC-WEB-0042

## Tipo

Bug

## Estado

planned

## Asignado a

Frontend Public Web Agent

---

## Objetivo

Corregir dos problemas en `pages/login-page.tsx` relacionados con el login mediante Google:

1. El mensaje rojo de error aparece mientras la autenticación está cargando, aunque el login termina correctamente.
2. El botón **"Continuar con Google"** puede no mostrarse si el backend demora o falla al obtener el Google Client ID.

No modificar el flujo de login tradicional.

---

## Archivo a modificar

```text
public-web/pages/login-page.tsx
```

No modificar la arquitectura de autenticación ni `@react-oauth/google`.

---

# 1. Corregir el mensaje de error durante la autenticación

Actualmente el error se muestra también cuando `isGoogleLoading === true`.

### Cambiar

La condición actual:

```tsx
{(isGoogleLoading || (googleError && !isLoadingClientId)) && (
```

debe dejar de utilizar `isGoogleLoading` como condición para mostrar un error.

### Debe quedar conceptualmente así

```tsx
{googleError && !isGoogleLoading && (
  <div>
    {googleError}
  </div>
)}
```

El mensaje rojo debe aparecer **únicamente cuando existe un error real**.

Durante la autenticación no debe mostrarse ningún mensaje de error.

### Estado del botón durante la autenticación

Usar estos estados:

```text
isResolvingClientId → "Preparando Google..."
isGoogleLoading     → "Autenticando..."
estado normal       → "Continuar con Google"
```

Mientras alguno de los dos primeros estados esté activo, el botón debe estar deshabilitado.

---

# 2. El botón Google debe estar siempre visible

Eliminar la dependencia del render inicial respecto de `getGoogleClientId()`.

Actualmente el botón depende de algo equivalente a:

```tsx
isLoadingClientId
  ? ...
  : googleClientId
    ? ...
    : null
```

Esto debe cambiar.

### Requisito

Al entrar a `/login`, el usuario debe ver inmediatamente:

```text
Continuar con Google
```

sin esperar ninguna respuesta del backend.

No ejecutar `getGoogleClientId()` desde un `useEffect` al montar la página.

Eliminar el estado `isLoadingClientId` si deja de ser necesario.

---

# 3. Obtener Google Client ID al hacer click

El flujo debe ser:

```text
Usuario hace click
        ↓
¿googleClientId ya existe?
   ├── Sí → iniciar Google Login
   └── No
        ↓
getGoogleClientId()
        ↓
timeout máximo 8 segundos
   ├── Éxito → guardar googleClientId → iniciar Google Login
   └── Error/timeout → mostrar error → permitir reintentar
```

Crear/usar un estado específico:

```tsx
isResolvingClientId
```

Durante esta operación:

* mostrar `"Preparando Google..."`
* deshabilitar el botón
* no mostrar el mensaje rojo de error

---

# 4. Timeout del Client ID

La llamada:

```tsx
authenticationRepository.getGoogleClientId()
```

debe tener un timeout máximo de **8 segundos**.

Puede utilizarse `Promise.race`.

Si la llamada supera el timeout, tratarla como error.

Mensaje de error:

```text
No se pudo iniciar sesión con Google. Asegurate de tener conexión e intentá nuevamente.
```

Después del error:

* `isResolvingClientId = false`
* `isGoogleLoading = false`
* mostrar el mensaje de error
* volver a habilitar el botón
* permitir otro intento

No dejar el botón permanentemente bloqueado.

---

# 5. Iniciar Google Login después de obtener el Client ID

Mantener la estrategia actual utilizada con `@react-oauth/google`.

No reemplazar `triggerGoogleLogin()` por otra estrategia.

Después de obtener correctamente `googleClientId`:

1. Guardar el Client ID en estado.
2. Renderizar `GoogleOAuthProvider`.
3. Renderizar el `GoogleLogin` oculto dentro de su container.
4. Ejecutar `triggerGoogleLogin()`.

Como `GoogleLogin` se renderiza de forma asíncrona, `triggerGoogleLogin()` debe buscar el elemento dentro de `googleLoginContainerRef` y reintentar durante un máximo aproximado de **3 segundos** antes de considerar que no pudo encontrarlo.

El retry puede mantener la estrategia DOM actual basada en:

```text
div[role="button"]
```

o:

```text
div[aria-label]
```

No introducir otra estrategia de integración.

---

# 6. Mantener el flujo exitoso existente

Cuando Google devuelve correctamente la credencial:

```text
Google credential
    ↓
authenticationRepository.googleLogin(...)
    ↓
login(payload)
    ↓
navigate("/index")
```

Debe mantenerse el comportamiento existente.

No modificar:

* `AuthenticationRepository.googleLogin()`
* `useAuth.login()`
* JWT
* refresh token
* rutas protegidas
* Google OAuth configuration

salvo que sea estrictamente necesario para corregir este bug.

---

# 7. Estados esperados

La UI debe comportarse así:

| Estado                     | Texto botón               | Habilitado | Error |
| -------------------------- | ------------------------- | ---------: | ----: |
| Inicial                    | `Continuar con Google`    |         Sí |    No |
| Obteniendo Client ID       | `Preparando Google...`    |         No |    No |
| Autenticando               | `Autenticando...`         |         No |    No |
| Error obteniendo Client ID | `Continuar con Google`    |         Sí |    Sí |
| Login exitoso              | La página navega al Index |          — |    No |

---

# Fuera de alcance

No hacer ninguno de estos cambios:

* No modificar el login email/password.
* No cambiar `@react-oauth/google`.
* No mover `GoogleOAuthProvider` a `app.tsx`.
* No modificar el backend.
* No modificar `AuthenticationRepository`, salvo que sea estrictamente necesario.
* No cambiar rutas.
* No cambiar estilos visuales del botón.
* No reemplazar la estrategia DOM de `triggerGoogleLogin()`.
* No crear una nueva arquitectura de autenticación.
* No agregar comentarios innecesarios.

---

# Criterios de aceptación

1. Al abrir `/login`, el botón **"Continuar con Google"** aparece inmediatamente sin esperar al backend.

2. `getGoogleClientId()` no se ejecuta automáticamente al montar `LoginPage`.

3. Al hacer click, si no existe `googleClientId`, se solicita al backend.

4. La solicitud del Client ID tiene un timeout máximo de 8 segundos.

5. Mientras se obtiene el Client ID, el botón muestra:
   `Preparando Google...`

6. Mientras se autentica con Google, el botón muestra:
   `Autenticando...`

7. Mientras cualquiera de esos estados está activo, el botón está deshabilitado.

8. Si obtener el Client ID falla o expira el timeout:

   * se muestra el mensaje de error amigable;
   * el botón vuelve a estar habilitado;
   * el usuario puede volver a intentarlo.

9. El mensaje rojo **nunca se muestra simplemente porque `isGoogleLoading === true`**.

10. Un login exitoso mediante Google continúa estableciendo la sesión y navegando al Index.

11. El login tradicional continúa funcionando sin cambios.

12. `npm run typecheck` finaliza correctamente sin errores.

---

# Verificación obligatoria

Antes de marcar la task como `Completed`, verificar manualmente estos escenarios:

### Escenario A — Backend rápido

```text
/login
→ botón visible inmediatamente
→ click
→ Google Login
→ login exitoso
→ /index
```

### Escenario B — Backend lento

Simular una demora en `getGoogleClientId()`.

Resultado esperado:

```text
/login
→ botón visible
→ click
→ "Preparando Google..."
→ timeout
→ mensaje de error
→ botón habilitado nuevamente
```

### Escenario C — Backend devuelve error

Resultado esperado:

```text
→ mensaje de error
→ botón habilitado
→ nuevo click permite reintentar
```

### Escenario D — Error durante autenticación

Si ocurre un error real durante `googleLogin()`:

```text
→ mensaje rojo
→ nunca mostrar mensaje rojo solamente por estar cargando
→ botón vuelve a quedar disponible
```

### Escenario E — Login tradicional

Verificar que:

```text
email/password
→ login
→ /index
```

continúa funcionando.

---

## Resultado esperado

El botón de Google debe ser siempre visible y accionable desde el inicio de la pantalla.

El estado de carga debe comunicarse mediante el propio botón.

El mensaje rojo debe representar exclusivamente errores reales, nunca estados de carga.
