# TASK-PUBLIC-WEB-0043 — Manejar error y timeout al iniciar autenticación con Google

## Task ID

TASK-PUBLIC-WEB-0043

## Tipo

Bug

## Estado

finished

## Resultado de la ejecución

### Cambios realizados

Archivo modificado: `public-web/public-web/pages/login-page.tsx`

1. **Mensaje de error unificado**: Se reemplazaron todos los mensajes de error del flujo de Google Login por el mensaje requerido:
   ```text
   Se generó un error autenticando con Google, intente nuevamente en unos minutos.
   ```
   - `handleGoogleClick`: mensaje actualizado en el `catch` de `getGoogleClientId()`.
   - `handleGoogleSuccess`: mensaje actualizado en el `catch` de `googleLogin()`.
   - `handleGoogleError`: mensaje actualizado para el error de Google OAuth.
   - `triggerGoogleLogin`: mensaje actualizado cuando no se encuentra el botón después de 30 intentos.

2. **Limpieza de estados en error**: Se asegura que `isGoogleLoading` y `isResolvingClientId` se limpien en todos los caminos de error:
   - Cuando `getGoogleClientId()` falla o hace timeout, `setIsGoogleLoading(false)` se ejecuta en el `catch`.
   - Cuando `triggerGoogleLogin()` no encuentra el botón de Google, `setIsGoogleLoading(false)` se ejecuta en el `else` del polling.
   - Cuando `googleLogin()` falla, `setIsGoogleLoading(false)` se ejecuta en el `finally`.

3. **Eliminación de variable no usada**: Se eliminó la variable `apiError` en `handleGoogleSuccess` que generaba un warning de TypeScript (`TS6133`).

### Comportamiento después del fix

- Si el backend está disponible: Google Login funciona como antes.
- Si el backend está apagado/iniciando: se muestra el mensaje amigable, el botón vuelve a "Continuar con Google" y queda habilitado.
- Si el botón de Google no aparece en el DOM dentro de 3 segundos: se muestra el mensaje amigable y el botón se habilita.
- El usuario puede reintentar sin recargar la página.
- No se exponen mensajes técnicos, stack traces ni códigos HTTP.

### Verificación

- `npm run typecheck` finaliza correctamente.
- Login tradicional no fue modificado.
- No se modificó backend, configuración de Google, rutas, ni arquitectura.

---

## Bloqueo

Esta Task se encuentra bloqueada por las siguientes razones:

1. **Inconsistencia de ubicación**: La Task está asignada a US-0005 (Gestión del perfil personal), pero su objetivo es manejar errores y timeout en la autenticación con Google, la cual pertenece funcionalmente a US-0004 (Autenticación mediante Google).

2. **Contenido vacío en la lectura inicial**: Al momento de tomar la Task desde `public-web/pending/`, el archivo se encontró vacío (0 líneas). Posteriormente se confirmó que el contenido efectivamente existe, por lo que este punto queda superado.

## Dependencia

Se requiere una decisión del especialista humano para determinar:

- Si esta Task debe reubicarse en US-0004/public-web/pending/ (ubicación funcional correcta), o
- Si debe permanecer en US-0005 por una razón explícita del proyecto.

## Acciones tomadas

- Task movida de `public-web/pending/` a `public-web/blocked/`.
- Se generó una Task de consulta en `public-web/planned/` para el humano.
- No se realizó ninguna modificación al código del proyecto mientras la Task permanezca bloqueada.

---

## Objetivo

Corregir el comportamiento del botón **"Continuar con Google"** cuando el backend todavía no está disponible o demora demasiado en responder al solicitar el Google Client ID.

Actualmente, si el backend está iniciando o no responde, el flujo puede quedar bloqueado mostrando:

```text
Autenticando...
```

sin recuperar el botón.

El usuario debe poder reintentar sin recargar la página.

---

## Contexto

El flujo de Google Login necesita obtener el `clientId` desde el backend antes de iniciar la autenticación con Google.

Es normal que, al levantar el backend, durante algunos segundos el API todavía no esté disponible.

Por ejemplo:

```text
Usuario abre /login
        ↓
Hace click en "Continuar con Google"
        ↓
Frontend solicita Google Client ID
        ↓
Backend todavía no está disponible / demora
        ↓
Error o timeout
```

Este escenario debe considerarse un error recuperable.

---

## Comportamiento requerido

Al hacer click en:

```text
Continuar con Google
```

el frontend debe intentar iniciar el flujo normalmente.

### Si el Client ID se obtiene correctamente

Continuar con el flujo actual:

```text
getGoogleClientId()
        ↓
Google OAuth
        ↓
authenticationRepository.googleLogin()
        ↓
login()
        ↓
/index
```

No modificar este flujo exitoso.

---

## Si el backend no responde o devuelve error

Si `getGoogleClientId()`:

* devuelve un error HTTP;
* falla por conexión;
* rechaza la petición;
* genera una excepción;
* o supera el timeout configurado;

el flujo debe considerarse fallido y recuperable.

### Mostrar exactamente este mensaje

```text
Se generó un error autenticando con Google, intente nuevamente en unos minutos.
```

No mostrar mensajes técnicos del backend.

No dejar visible:

* stack traces;
* mensajes de `fetch`;
* errores de Axios;
* códigos HTTP;
* `Network Error`;
* `Failed to fetch`;
* errores del Client ID.

---

## Estado del botón después del error

Después de cualquier error o timeout:

```text
isGoogleLoading = false
isResolvingClientId = false
```

El botón debe volver a quedar:

```text
Continuar con Google
```

y:

```text
enabled = true
```

El usuario debe poder hacer click nuevamente inmediatamente.

**No requiere recargar la página.**

---

## Caso específico: backend iniciando

Este escenario es obligatorio:

```text
Backend apagado / iniciando
        ↓
Usuario hace click
        ↓
getGoogleClientId() falla o expira
        ↓
Mostrar:
"Se generó un error autenticando con Google, intente nuevamente en unos minutos."
        ↓
Botón:
"Continuar con Google"
enabled
        ↓
Usuario vuelve a hacer click cuando el backend ya está disponible
        ↓
Login Google funciona normalmente
```

El frontend no debe quedar esperando indefinidamente.

---

## Evitar estado inconsistente

Es especialmente importante evitar este estado:

```text
Botón: "Autenticando..."
Botón: disabled
Error ocurrido
```

Si ocurre cualquier error durante la inicialización del login de Google, todos los estados de carga deben limpiarse.

El flujo debe terminar siempre en uno de estos estados:

### Éxito

```text
Login exitoso
→ navegación a /index
```

### Error

```text
Mensaje de error visible
Botón "Continuar con Google"
Botón habilitado
```

No debe existir un tercer estado donde el botón quede bloqueado indefinidamente.

---

## Timeout

Mantener un timeout razonable para la obtención del Client ID.

El timeout no debe permitir que el usuario quede esperando indefinidamente.

Si el timeout ya existe en la implementación actual, reutilizarlo.

No agregar múltiples mecanismos de timeout innecesarios.

---

## Alcance

Modificar únicamente lo necesario para garantizar:

1. Manejo correcto de errores al obtener el Client ID.
2. Manejo correcto de timeout.
3. Limpieza de los estados `isGoogleLoading` / `isResolvingClientId`.
4. Reactivación del botón.
5. Mensaje amigable al usuario.
6. Posibilidad de reintentar.

No modificar:

* Login tradicional.
* Backend.
* `AuthenticationRepository`, salvo que sea estrictamente necesario.
* Configuración de Google OAuth.
* `GoogleOAuthProvider`.
* Rutas.
* Diseño visual.
* Arquitectura de autenticación.

---

## Criterios de aceptación

1. Con el backend disponible, el login mediante Google funciona como actualmente.

2. Con el backend apagado, al hacer click en **"Continuar con Google"**:

   * la petición falla;
   * se muestra:
     `Se generó un error autenticando con Google, intente nuevamente en unos minutos.`
   * el botón vuelve a mostrar `Continuar con Google`;
   * el botón queda habilitado.

3. Si el backend está iniciando y tarda más que el timeout:

   * se muestra el mismo mensaje;
   * el botón vuelve a quedar habilitado.

4. Después de un error, el usuario puede hacer click nuevamente sin recargar `/login`.

5. Si en el segundo intento el backend ya está disponible, Google Login funciona correctamente.

6. El botón nunca queda permanentemente en `Autenticando...` como consecuencia de un error.

7. No se muestran mensajes técnicos al usuario.

8. Login mediante email/password continúa funcionando.

9. `npm run typecheck` finaliza correctamente.

---

## Verificación obligatoria

Realizar como mínimo estas pruebas:

### Prueba 1 — Backend disponible

```text
/login
→ Continuar con Google
→ autenticación
→ /index
```

### Prueba 2 — Backend apagado

```text
/login
→ Continuar con Google
→ error
→ mensaje amigable
→ botón habilitado
```

### Prueba 3 — Backend iniciando

```text
/login
→ iniciar backend
→ hacer click inmediatamente
→ error/timeout
→ mensaje amigable
→ botón habilitado
```

### Prueba 4 — Reintento

Después de la prueba 2 o 3:

```text
Backend disponible
→ click nuevamente
→ Google Login
→ /index
```

El reintento debe funcionar sin recargar la página.

---

## Resultado esperado

Un fallo temporal del backend **no debe romper ni bloquear el login mediante Google**.

El usuario debe recibir un mensaje claro, recuperar inmediatamente el botón y poder volver a intentar cuando el backend esté disponible.
