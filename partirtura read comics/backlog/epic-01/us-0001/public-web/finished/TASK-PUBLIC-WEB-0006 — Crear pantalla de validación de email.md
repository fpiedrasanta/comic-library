# TASK-PUBLIC-WEB-0006 — Crear pantalla de validación de email

Crear la pantalla para ingresar el código de 6 dígitos recibido por email.

Utilizar como referencia visual el template:

`/partirtura read comics/ux_ui/verify-code-template.html`

La pantalla debe:

- Permitir ingresar un código de 6 dígitos.
- Validar el formato del código antes de enviarlo.
- Mostrar un temporizador indicando cuánto tiempo queda disponible para ingresar el código.
- Utilizar la información de expiración devuelta por la API para determinar la duración del temporizador.
- Informar al usuario cuando el código haya expirado.
- Permitir solicitar el reenvío del código.
- Consumir el endpoint correspondiente para reenviar el código.
- Reiniciar el temporizador cuando se genere un nuevo código.
- Enviar el código ingresado al endpoint correspondiente.
- Informar al usuario si el código es incorrecto o expiró.
- Continuar el flujo cuando la validación sea exitosa.

Cuando la API confirme correctamente la validación del email y genere el token de autenticación, el Public Web debe almacenar el token utilizando el mecanismo definido en la arquitectura y redirigir al index.

El diseño del index no forma parte de esta Task.

El endpoint de registro debe devolver la información necesaria para que el frontend pueda conocer cuánto tiempo permanece vigente el código de validación.

Si el endpoint de registro actualmente documentado en `endpoints.md` no devuelve dicha información, generar una nueva Task destinada a `api` solicitando la modificación correspondiente.

Si los endpoints necesarios para validar o reenviar el código no existen en `endpoints.md`, generar las Tasks correspondientes destinadas a `api` siguiendo el mecanismo definido en `communication.md`.

Antes de implementar la Task, leer:

- `communication.md`
- `components.md`
- `endpoints.md`
- `frontend-coding-rules.md`
- `frontend-public-web-agent.md`
- `frontend-public-web-stack-technology.md`
- `pages.md`
- `project.md`
- `public-web-architecture.md`
- `epic-01.md`
- `us-0001.md`

Actualizar `pages.md` y `components.md` cuando corresponda.

## Bloqueado por

- `TASK-API-0010` — Crear endpoint de nacionalidades (FINISHED)
- `TASK-API-0011` — Crear endpoint de validación de email (FINISHED)
- `TASK-API-0012` — Crear endpoint de reenvío de código de validación (FINISHED)
- `TASK-API-0013` — Modificar endpoint de registro para incluir `expiresInMinutes` (FINISHED)

## Estado

Pending.

## Desbloqueado por

TASK-API-0013 finalizó. El endpoint `POST /api/users/register` ahora devuelve `expiresInMinutes: 60`, por lo que el Public Web puede implementar el temporizador de expiración.

## Trabajo pendiente

- Implementación de la pantalla de validación de email.
- Integración con endpoint de validación.
- Integración con endpoint de reenvío.
- Implementación del temporizador basado en `expiresInMinutes` del backend.
- Manejo de expiración de código.
- Almacenamiento de token y redirección post-validación.

## Dependencias

Todas las dependencias de API están satisfechas.
