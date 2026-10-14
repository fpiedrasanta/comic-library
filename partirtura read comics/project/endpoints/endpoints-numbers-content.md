# Endpoints — Numbers Content

Controllers covered:
- AdminNumbersController — CBR/CBZ upload, content status, images, cover selection, retry, delete

## POST /api/admin-numbers/{numberId}/content

Description:
Uploads a CBR or CBZ file for the number. The file is stored temporarily, a Hangfire background job is enqueued, and the number transitions to ContentStatus = Processing. The job extracts images, converts them to WebP, and persists Page + Image records.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Route parameter: numberId (long)
- Form field: file (binary, required, the .cbr or .cbz file)

Response:
- 200 OK
  Body: { "success": true, "message": "Contenido cargado correctamente. El procesamiento iniciará en segundo plano.", "code": 200, "payload": null }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El archivo CBR es obligatorio.",
      "code": 400,
      "payload": null
  }
- 404 Not Found (number does not exist)

Notes:
- Requires authentication.
- Requires Administrator role.
- The response is immediate; processing happens asynchronously.
- The Dashboard should poll GET /{numberId} and watch contentStatus: 1 = Processing, 2 = Completed, 3 = Error.
- If status becomes 3 (Error), contentError will contain diagnostic information.
- Re-uploading is supported: existing Pages and their associated Images are cleaned up before the new job processes the file.
- The original CBR/CBZ file is treated as a temporary artifact and is deleted after processing (success or failure).

---

## GET /api/admin-numbers/{numberId}/content/status

Description:
Returns the current processing status of the digital content (CBR/CBZ) for a number, including the error message when the status is Error. Used by the Dashboard to poll processing progress and to surface diagnostic information when something fails.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: numberId (long)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Content status retrieved successfully.",
      "code": 200,
      "payload": {
          "status": "Processing",
          "error": null,
          "startedAt": null,
          "completedAt": null,
          "pageCount": 0
      }
  }

  When status is Error:
  {
      "success": true,
      "message": "Content status retrieved successfully.",
      "code": 200,
      "payload": {
          "status": "Error",
          "error": "No fue posible procesar una de las páginas.",
          "startedAt": null,
          "completedAt": null,
          "pageCount": 4
      }
  }

Response Type:
ApiResponse<ContentStatusDto>

`ContentStatusDto` shape (record):

```csharp
public record ContentStatusDto(
    string Status,         // "Missing" | "Processing" | "Completed" | "Error"
    string? Error,         // populated only when Status == "Error"; otherwise null
    DateTime? StartedAt,
    DateTime? CompletedAt,
    int PageCount);
```

Errors:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found (number does not exist)

Notes:
- Requires authentication.
- Requires Administrator role.
- `status` values: `Missing`, `Processing`, `Completed`, `Error`.
- `error` is a single human-readable string; null when not in Error.
- Content status is independent of `Number.IsActive`.
- The Dashboard should poll this endpoint to track transitions while `status == "Processing"`.

---

## POST /api/admin-numbers/{numberId}/content/retry

Description:
Re-enqueues CBR/CBZ processing for a number whose previous processing finished in `Error`. The HTTP request returns immediately; processing happens in the background via the existing worker mechanism.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Route parameter: numberId (long)
- Form field: file (binary, required, the .cbr or .cbz file)

Response:
- 200 OK
  Body: { "success": true, "message": "Reintento encolado correctamente. El procesamiento iniciará en segundo plano.", "code": 200, "payload": null }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request (file missing or empty)
- 404 Not Found (number does not exist)
- 409 Conflict (current status is not `Error`; the message is "Solo se puede reintentar un procesamiento en estado Error.")

Notes:
- Requires authentication.
- Requires Administrator role.
- Retry is only permitted when current `ContentStatus` is `Error`. Returns 409 otherwise.
- The endpoint does not start processing synchronously; the file is enqueued and the worker takes over.
- On success the status transitions to `Processing` and `ContentError` is reset.
- Content status is independent of `Number.IsActive`.

---

## DELETE /api/admin-numbers/{numberId}/content

Description:
Deletes all digital content (pages and their associated images) for a number and resets `ContentStatus` to `Missing`. The `Number` itself, its metadata, persons, roles, tags, continuity references and `IsActive` flag are not modified.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: numberId (long)

Response:
- 200 OK
  Body: { "success": true, "message": "Contenido eliminado correctamente.", "code": 200, "payload": null }

Response Type:
ApiResponse<object>

Errors:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found (number does not exist)
- 409 Conflict (cannot delete while `ContentStatus` is `Processing`; message: "No se puede eliminar el contenido mientras se está procesando.")

Notes:
- Requires authentication.
- Requires Administrator role.
- Allowed when `ContentStatus` is `Missing` (idempotent), `Completed` or `Error`.
- Rejected (409) when `ContentStatus` is `Processing`; the running worker is not cancelled.
- Deletes Page records, their associated Image records and underlying file storage for those images.
- Does NOT delete: the `Number`, `PersonByRole` relations, `TagByNumber` relations, `Language`, continuity references or any other editorial metadata.
- Does NOT modify `Number.IsActive`.
- After a successful deletion, `ContentStatus` is `Missing` and `ContentError` is cleared. The Number is ready to receive a new CBR/CBZ via `POST /{numberId}/content`.

---

## GET /api/admin-numbers/{numberId}/images

Description:
Returns the list of images (Pages) extracted from the uploaded CBR/CBZ, in natural order. Used by the cover selector and the AI image selector carousels.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Route parameter: numberId (long)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Images retrieved successfully.",
      "code": 200,
      "payload": {
          "images": [
              { "id": 101, "url": "/images/101" },
              { "id": 102, "url": "/images/102" },
              { "id": 103, "url": "/images/103" }
          ]
      }
  }

Response Type:
ApiResponse<NumberImagesResponse>

Errors:
- 404 Not Found (number does not exist)

Notes:
- Requires authentication.
- Requires Administrator role.
- The endpoint is read-only.
- Does NOT persist any selection. The admin's cover and AI image choices are sent to separate endpoints.
- Empty list if no CBR/CBZ has been processed yet, or if processing has not yet produced pages.
- Images are returned in natural sort order (page2 before page10).

---

## PATCH /api/admin-numbers/{numberId}/cover

Description:
Sets the cover of the number to one of its existing page images. The image must already be associated with the number via a Page; no file is re-uploaded.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Route parameter: numberId (long)
- Body:
  {
      "imageId": 101
  }

Response:
- 200 OK
  Body: { "success": true, "message": "Cover updated successfully.", "code": 200, "payload": null }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
- 404 Not Found
  - The number does not exist
  - The image does not exist
  - The image does not belong to the number (not present in any Page)

Notes:
- Requires authentication.
- Requires Administrator role.
- This operation does not require a file upload; it references an existing image.
- The first page is NOT automatically selected as cover. The admin must explicitly choose.

---
