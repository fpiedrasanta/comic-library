# TASK-API-0083 — Implementar endpoints de baja de cuenta

## Task ID

TASK-API-0083

## Title

Implementar endpoints de baja de cuenta

## Description

Implementar los endpoints necesarios para soportar el flujo de baja de cuenta del Dashboard.

El flujo requiere:
1. Solicitar código de baja.
2. Validar código de baja.
3. Confirmar baja de cuenta.

El usuario autenticado debe ser identificado por la sesión, no por parámetros del request.

## Expected Result

El backend expone endpoints para:
- POST /api/users/account-deletion/request
- POST /api/users/account-deletion/confirm

Nota: La validación del código está integrada en el endpoint de confirmación. No existe un endpoint separado de validación.

## Relevant Context

User Story: US-0009 — Dar de baja la cuenta

Tasks bloqueadas:
- TASK-DASH-0014
- TASK-DASH-0015
- TASK-DASH-0016
- TASK-DASH-0017

## Dependencies

- US-0009
- Endpoints de autenticación existentes

## Acceptance Criteria

- [x] POST /api/users/account-deletion/request envía código de baja al email del usuario autenticado.
- [x] POST /api/users/account-deletion/confirm confirma la baja con código válido.
- [x] El usuario se identifica por sesión autenticada, no por request body.
- [x] No se exponen datos sensibles en las respuestas.
- [x] El contrato respeta ApiResponse envelope.

## Execution Result

### Status
Finished

### Completed Work
- Se implementaron los endpoints POST /api/users/account-deletion/request y POST /api/users/account-deletion/confirm en UsersController.
- Ambos endpoints requieren autenticación y obtienen el usuario desde el claim sub del JWT.
- El endpoint de confirmación valida el código de 6 dígitos, establece IsActive = false y revoca todos los refresh tokens activos.
- Los contratos quedaron documentados en project/endpoints.md.

### Files Modified
- api/Api/Controllers/UsersController.cs
- api/Application/Services/AccountDeletionService.cs
- api/Application/Interfaces/IAccountDeletionService.cs
- api/Application/DTOs/RequestAccountDeletionResponse.cs
- api/Application/DTOs/ConfirmAccountDeletionResponse.cs
- api/Application/DTOs/ConfirmAccountDeletionApiRequest.cs
- api/Domain/Entities/AccountDeletionToken.cs
- api/Infrastructure/Repositories/AccountDeletionTokenRepository.cs
- api/Infrastructure/Services/AccountDeletionCodeService.cs
- api/Infrastructure/Services/EmailService.cs
- api/Infrastructure/Persistence/Configurations/AccountDeletionTokenConfiguration.cs
- project/endpoints.md
- project/services.md
- project/repositories.md
- project/domain.md

### Observations

Las rutas implementadas difieren de las originalmente planeadas en TASK-API-0083:
- Se implementó POST /api/users/account-deletion/request en lugar de POST /api/users/request-account-deletion
- Se implementó POST /api/users/account-deletion/confirm en lugar de POST /api/users/confirm-account-deletion
- No existe un endpoint separado POST /api/users/validate-account-deletion-code; la validación del código está integrada en el endpoint de confirmación.
