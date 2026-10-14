# TASK-API-0045 — Incorporar configuración y dependencia para Google Authentication

## Objetivo

Preparar el backend para integrar autenticación mediante Google, incorporando únicamente la configuración y las dependencias técnicas necesarias.

Esta Task **no debe implementar todavía el flujo completo de Login con Google**.

---

## Contexto

La User Story correspondiente es:

```text
US-0004 — Autenticación mediante Google: /partirtura read comics/backlog/epic-01/us-0004/us-0004.md
```

El sistema actualmente dispone de:

- Registro mediante email/password.
- Validación de email.
- Login mediante email/password.
- JWT Access Token.
- Refresh Token.
- Refresh Token mediante cookie HttpOnly.
- `AuthService`.
- Manejo de configuración por ambiente.

La autenticación mediante Google debe integrarse sobre estos mecanismos existentes y no crear un mecanismo de sesión paralelo.

---

## Requerimientos

### 1. Dependencia tecnológica

Incorporar la dependencia necesaria para validar/autenticar usuarios mediante Google.

Utilizar una librería oficial o ampliamente soportada para .NET que permita validar de forma segura la identidad proporcionada por Google.

No implementar manualmente la validación criptográfica de tokens de Google.

No agregar dependencias innecesarias.

---

### 2. Configuración

Incorporar la configuración necesaria para Google Authentication.

Como mínimo debe contemplar:

```text
Google:
    ClientId
    ClientSecret
```

Los nombres definitivos deben respetar las convenciones de configuración existentes.

Los valores reales no deben almacenarse en código fuente.

---

### 3. Configuración por ambiente

La configuración debe poder modificarse por ambiente.

Como mínimo revisar:

```text
appsettings.json
appsettings.Development.json
```

No asumir que las credenciales reales deben quedar almacenadas en `appsettings.json`.

Utilizar los mecanismos de configuración existentes para permitir sobrescritura mediante variables de entorno u otros mecanismos ya definidos por el proyecto.

---

### 4. Separación entre configuración y tecnología

`Google:ClientId` y `Google:ClientSecret` son configuración de aplicación.

No documentarlos como tecnologías.

Si se incorpora una nueva dependencia tecnológica, actualizar:

```text
project/backend-stack-technology.md
```

Si solamente se agregan configuraciones, documentarlas en el lugar correspondiente de configuración y no como dependencia tecnológica.

---

## Restricciones

Esta Task NO debe:

- Crear endpoints.
- Modificar `AuthService` para implementar Login Google.
- Crear usuarios mediante Google.
- Generar JWT.
- Generar Refresh Tokens.
- Modificar cookies.
- Crear `ExternalIdentity`.
- Crear `GoogleData`.
- Modificar el flujo existente de Login.
- Modificar el flujo de Registro.

---

## Documentación

Actualizar únicamente los documentos que correspondan a los cambios realizados.

Si se incorpora una dependencia:

```text
backend-stack-technology.md
```

Si se establece una nueva regla de configuración:

```text
backend-coding-rules.md
```

No modificar documentación de endpoints si esta Task no incorpora endpoints.

---

## Criterios de finalización

1. La dependencia necesaria para Google Authentication está incorporada.
2. La dependencia es compatible con la versión actual de .NET del proyecto.
3. `Google:ClientId` puede configurarse por ambiente.
4. `Google:ClientSecret` puede configurarse por ambiente.
5. No existen credenciales hardcodeadas.
6. No se modificó el comportamiento del Login existente.
7. No se modificó el comportamiento del Registro existente.
8. No se creó `ExternalIdentity`.
9. No se creó `GoogleData`.
10. No se incorporaron endpoints.
11. La documentación tecnológica fue actualizada si corresponde.
12. `Application`, `Infrastructure` y `Api` compilan correctamente.

--

## BLOQUEOS

Por cualquier bloqueo o necesidad de información, generar una TASK en /planned para que sea revisada y evaluada por el humano, quién luego la moverá a /pending con el resultado de la definición.

## Execution Result

Completed successfully.

### Changes Made

- Added `Google:ClientId` and `Google:ClientSecret` configuration sections to `appsettings.json` and `appsettings.Development.json`.
- Installed `Microsoft.AspNetCore.Authentication.Google` version 10.0.0 in the `Api` project.
- Updated `backend-stack-technology.md` to document `Microsoft.AspNetCore.Authentication.Google` as the Google authentication library.

### Verification

- Solution builds successfully with no errors.
- No credentials are hardcoded; configuration uses placeholder values that can be overridden by environment variables.
- No existing login or registration behavior was modified.
- No `ExternalIdentity` or `GoogleData` entities were created.
- No endpoints were added.