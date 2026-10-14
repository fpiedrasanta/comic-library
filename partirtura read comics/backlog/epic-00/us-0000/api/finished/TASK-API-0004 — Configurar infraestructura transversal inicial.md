TASK-API-0004 — Configurar infraestructura transversal inicial

Acá pondría solamente aquello que realmente necesitamos desde el principio para que la API quede operativa:

Configuración de ambientes.
Manejo centralizado de excepciones.
Configuración inicial de respuestas HTTP.
Configuración de autenticación/autorización, si corresponde a la infraestructura inicial.
Configuración de CORS.
Configuración de logging básico.
Health check de la API.
Configuración inicial de Swagger/OpenAPI, si está contemplado en nuestro stack.

Esta Task podría depender de las anteriores.

Estado:
Finished

Trabajo realizado:
Configuración de ambientes:
  - Api/appsettings.json (general)
  - Api/appsettings.Development.json (desarrollo)
  - Api/appsettings.Production.json (producción)
Manejo centralizado de excepciones:
  - Creado Api/Middleware/GlobalExceptionHandlerMiddleware.cs
  - Registrado en Api/Program.cs
Configuración inicial de respuestas HTTP:
  - Formato de respuesta estandarizado en GlobalExceptionHandlerMiddleware
  - Endpoint raíz y health check en Program.cs
Configuración de autenticación/autorización:
  - No aplica en esta instancia inicial. La configuración de Identity/JWT se realizará cuando existan las entidades de usuario y los endpoints de autenticación correspondientes.
Configuración de CORS:
  - Política "DefaultCors" configurada en Program.cs
  - Orígenes permitidos: http://localhost:3000, http://localhost:5173
  - Cualquier header y método permitido
Configuración de logging básico:
  - Logging configurado en appsettings.json y appsettings.Production.json
  - Niveles: Information en desarrollo, Warning en producción
Health check de la API:
  - Endpoint /health agregado en Program.cs
  - Health checks registrados en DI
Configuración inicial de Swagger/OpenAPI:
  - AddOpenApi() configurado en Program.cs
  - MapOpenApi() habilitado en Development
Verificación de compilación exitosa de ComicLibrary.sln (0 errores, 0 advertencias).

Nota:
La configuración de autenticación/autorización queda diferida hasta que las entidades de usuario y los endpoints de autenticación sean implementados en User Stories posteriores.
