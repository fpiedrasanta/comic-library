# Endpoints

## GET /api/images/{id}

Description:
Returns an internally stored image by its identifier.

Controller:
ImagesController

Request parameters:
- id: long (image identifier)

Authentication:
- Required. Bearer token in Authorization header.

Response:
- 200 OK
  Content-Type: image/webp (or original image MIME type)
  Body: binary image content

Errors:
- 401 Unauthorized
  {
      "success": false,
      "message": "Se generó un error durante el proceso de autenticación.",
      "code": 401,
      "payload": null
  }
- 404 Not Found
  {
      "success": false,
      "message": "Error interno del servidor.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- The image is served directly as binary content, not as JSON.
- Content-Type matches the stored image type.
- Does not expose StoragePath or internal server paths.
- The relative StoragePath stored in the DB is resolved to an absolute physical path via `IFileStorageService.GetPhysicalPath()` using `IWebHostEnvironment.ContentRootPath`.
- `PhysicalFile(...)` receives the resolved absolute path.
- If the database record does not exist, returns 404.
- If the physical file is missing, returns 404 without exposing internal details.
- Used as the src for <img> tags in the frontend (e.g., /images/123).
