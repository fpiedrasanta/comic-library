# TASK-API-0052 — Exponer Google Client ID para el Public Web

## Objetivo

Crear un endpoint de solo lectura que permita al Public Web obtener el Google Client ID necesario para inicializar Google Identity Services.

El Client ID debe continuar centralizado en la configuración del Backend y no debe duplicarse en archivos `.env` del frontend.

Esta Task **no debe exponer ni devolver el Google Client Secret**.

---

## 1. Configuración

El valor debe obtenerse exclusivamente desde:

```text
Google:ClientId
```

configurado en:

```text
Api/appsettings.json
Api/appsettings.Development.json
```

y sus correspondientes mecanismos de configuración por ambiente.

No hardcodear el Client ID en el código.

No crear una segunda configuración específica para el endpoint.

El Client Secret:

```text
Google:ClientSecret
```

nunca debe formar parte de la respuesta.

---

## 2. Endpoint

Crear un endpoint de solo lectura para obtener el Google Client ID.

Utilizar la convención de endpoints existente del proyecto y documentar el contrato en:

```text
project/endpoints.md
```

La ruta definitiva debe seguir las convenciones existentes para `UsersController` y autenticación.

Como referencia conceptual:

```text
GET /api/users/google-client-id
```

No requiere autenticación.

El Public Web necesita poder obtener el Client ID antes de que el usuario se autentique.

---

## 3. Response

La respuesta debe utilizar el formato estándar:

```text
ApiResponse<T>
```

El contenido debe contener exclusivamente el Client ID necesario para inicializar Google Identity Services.

No devolver:

- Client Secret.
- Configuración interna de Google.
- Tokens.
- Información de usuarios.
- Información de autenticación.
- Configuración de Refresh Tokens.

Ejemplo conceptual:

```json
{
  "success": true,
  "message": "Google Client ID retrieved successfully.",
  "statusCode": 200,
  "data": {
    "clientId": "..."
  }
}
```

Utilizar un DTO específico si las reglas del proyecto lo requieren. No utilizar `object` como contrato público si existe un tipo concreto apropiado.

---

## 4. Arquitectura

El Controller no debe acceder directamente a `IConfiguration`.

La obtención de configuración debe respetar la arquitectura existente.

Si se requiere una abstracción para obtener el Client ID:

```text
Application
    ↓
IGoogleClientSettingsProvider
    ↓
Infrastructure
    ↓
IConfiguration
```

La implementación concreta debe permanecer en Infrastructure.

El Controller debe limitarse a:

1. Invocar la dependencia correspondiente.
2. Obtener el Client ID.
3. Construir `ApiResponse<T>`.
4. Retornar la respuesta HTTP.

No debe contener lógica de negocio.

---

## 5. Seguridad

El Google Client ID **no es un secreto** y puede ser entregado al frontend.

Sin embargo:

```text
Google:ClientSecret
```

es información confidencial y nunca debe:

- aparecer en la respuesta;
- aparecer en logs;
- aparecer en excepciones;
- aparecer en documentación pública del endpoint;
- ser enviada al Public Web.

No registrar el Client ID innecesariamente en logs.

---

## 6. Manejo de configuración faltante

Si `Google:ClientId` no está configurado correctamente:

- No devolver el Client Secret como fallback.
- No inventar un Client ID.
- No utilizar un valor hardcodeado.
- Devolver un error manejado mediante el mecanismo global existente.

El error no debe revelar información sensible de configuración.

---

## 7. Documentación

Actualizar:

```text
project/endpoints.md
```

Documentar:

- método HTTP;
- ruta;
- autenticación requerida;
- request;
- response;
- errores posibles;
- propósito del endpoint.

Si se incorpora un nuevo servicio técnico:

```text
project/services.md
```

Si se incorpora una nueva regla arquitectónica reutilizable:

```text
project/backend-coding-rules.md
```

No agregar esta configuración a:

```text
project/backend-stack-technology.md
```

`Google:ClientId` es configuración de aplicación, no una tecnología ni una dependencia.

---

## 8. Compatibilidad

Esta Task no debe modificar:

- Login tradicional.
- Login mediante Google.
- Refresh Token.
- Refresh Token Cookie.
- Registro de usuarios.
- Password Reset.
- Validación de email.

El endpoint solamente debe exponer el Client ID que el Public Web necesita para inicializar Google Identity Services.

---

## Criterios de finalización

1. Existe un endpoint `GET` para obtener el Google Client ID.
2. El endpoint no requiere autenticación.
3. El Client ID se obtiene desde `Google:ClientId`.
4. No existe ningún valor hardcodeado.
5. El Client Secret nunca forma parte de la respuesta.
6. El Controller no accede directamente a `IConfiguration`.
7. La implementación respeta la arquitectura del proyecto.
8. La respuesta utiliza `ApiResponse<T>`.
9. El contrato utiliza un tipo concreto y no `object` innecesariamente.
10. Los errores utilizan el mecanismo global existente.
11. Una configuración faltante no expone información sensible.
12. `endpoints.md` está actualizado.
13. `services.md` se actualiza si corresponde.
14. No se modifica `backend-stack-technology.md` por esta configuración.
15. Login tradicional continúa funcionando.
16. Google Login existente continúa funcionando.
17. Refresh Token continúa funcionando.
18. `Application`, `Infrastructure` y `Api` compilan correctamente.

---

# Resultado de la ejecución

## Estado

Finished

## Trabajo realizado

- Se creó la interfaz `IGoogleClientSettingsProvider` en `Application/Interfaces/`.
- Se creó el DTO `GoogleClientIdResponse` en `Application/DTOs/`.
- Se creó la implementación `GoogleClientSettingsProvider` en `Infrastructure/Settings/`.
- Se agregó el endpoint `GET /api/users/google-client-id` en `UsersController`.
- Se registró `IGoogleClientSettingsProvider` en el contenedor de dependencias.
- Se actualizó `project/endpoints.md` con el contrato del nuevo endpoint.
- Se actualizó `project/services.md` con el nuevo servicio técnico.

## Verificación

- Build exitoso: 0 errores, 0 advertencias.

## Notas

- El endpoint no requiere autenticación.
- El Client ID se obtiene desde `Google:ClientId`.
- El Client Secret nunca se expone.
- Si `Google:ClientId` no está configurado, se lanza `BusinessNotFoundException` manejada por el middleware global.