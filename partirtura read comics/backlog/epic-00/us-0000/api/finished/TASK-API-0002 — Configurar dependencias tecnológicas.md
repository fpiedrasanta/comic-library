TASK-API-0002 — Configurar dependencias tecnológicas

Responsabilidad:

Instalar las dependencias iniciales definidas en backend-stack-technology.md.
Configurar EF Core.
Configurar el proveedor MySQL.
Configurar Identity/JWT.
Configurar las dependencias necesarias para la arquitectura.
Configurar DI.
Configurar las herramientas necesarias para migraciones/Code First.
Dejar el proyecto preparado para ejecutar.

Esta Task podría depender de TASK-API-0001.

Estado:
Finished

Bloqueo resuelto por:
TASK-API-DEC-0001

Decisión arquitectónica:
Se utilizará MySql.EntityFrameworkCore como proveedor de MySQL para EF Core 10 sobre .NET 10 LTS.
Pomelo.EntityFrameworkCore.MySql queda descartado para este proyecto por incompatibilidad de versiones.
La implementación deberá evitar dependencias innecesarias de APIs específicas del proveedor, manteniendo el acceso a datos abstraído dentro de Infrastructure.

Trabajo realizado:
Lectura del contexto obligatorio.
Instalación de paquetes compatibles con .NET 10:
  - Microsoft.EntityFrameworkCore 10.0.11
  - Microsoft.EntityFrameworkCore.Tools 10.0.11
  - Microsoft.AspNetCore.Identity.EntityFrameworkCore 10.0.11
  - Hangfire.Core 1.8.24
  - MySql.EntityFrameworkCore 10.0.9
  - MediatR 14.2.0 (Application)
  - Microsoft.AspNetCore.Authentication.JwtBearer 10.0.11 (Api)
  - Hangfire.AspNetCore 1.8.24 (Infrastructure)
  - SharpCompress 0.50.4 (Infrastructure)
  - Magick.NET-Q8-AnyCPU 14.16.0 (Infrastructure)
Identificación del conflicto de versiones con Pomelo.
Generación de TASK-API-DEC-0001 para resolver el bloqueo.
Actualización de backend-stack-technology.md para reflejar la nueva decisión sobre el proveedor MySQL.
Actualización de backend-stack-technology.md para reflejar Magick.NET-Q8-AnyCPU como paquete de procesamiento de imágenes.
Verificación de compilación exitosa de la solución ComicLibrary.sln (0 errores, 0 advertencias).

Configuración pendiente para Tasks siguientes:
Configuración de EF Core y el proveedor MySQL en Infrastructure.
Configuración de Identity/JWT en Api.
Configuración de DI en Api.
Configuración de herramientas de migración/Code First.

Nota:
La configuración específica de DI, Identity, JWT, EF Core y migraciones quedará a cargo de TASK-API-0003 y TASK-API-0004.
