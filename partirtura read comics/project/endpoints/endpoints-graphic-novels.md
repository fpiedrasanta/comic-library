# Endpoints

Controllers covered:
- AdminGraphicNovelsController — Graphic Novel CRUD, CBR/CBZ upload, cover selection

## GET /api/admin-graphic-novels

Description:
Returns a paginated list of Graphic Novels for the Dashboard.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: Title, PublicationDate, CreatedAt, Language)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on Title)
- franchiseId: long (optional, filter by franchise)
- isActive: boolean (optional, filter by active state)
- languageId: long (optional, filter by language)
- contentStatus: integer (optional, filter by content status: 0 Missing, 1 Processing, 2 Completed, 3 Error)
- publicationDateFrom: date (optional, inclusive lower bound in UTC)
- publicationDateTo: date (optional, inclusive upper bound in UTC)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "currentPage": 1,
          "hasNextPage": true,
          "hasPriorPage": false,
          "totalPages": 5,
          "pageSize": 12,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 60,
          "items": [
              {
                  "id": 1,
                  "title": "Batman: The Dark Knight Returns",
                  "languageId": 1,
                  "languageName": "English",
                  "coverId": 100,
                  "urlCover": "/images/100",
                  "isActive": true,
                  "publicationDate": "2026-01-01T00:00:00Z",
                  "createdAt": "2026-01-01T12:00:00Z",
                  "contentStatus": 2,
                  "franchiseId": 1,
                  "franchiseName": "Batman"
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<GraphicNovelListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden
- 422 ValidationException (invalid filters)

Notes:
- Requires authentication.
- Requires Administrator role.
- franchiseId is optional; when provided, filters graphic novels by franchise.
- contentStatus maps to: 0 = Missing, 1 = Processing, 2 = Completed, 3 = Error.
- Default ordering is Title ASC.
- Used from franchise administration to access "Novelas / Single shot no canónico / Spin-off / Etc."

## GET /api/admin-graphic-novels/{graphicNovelId}

Description:
Returns the full detail of a Graphic Novel for editing.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Graphic novel detail retrieved successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "title": "Test Graphic Novel",
          "description": "Integration test",
          "languageId": 1,
          "languageName": "English",
          "coverId": 100,
          "urlCover": "/images/100",
          "isActive": true,
          "publicationDate": "2026-01-01T00:00:00Z",
          "createdAt": "2026-01-01T12:00:00Z",
          "contentStatus": 0,
          "contentError": null,
          "franchiseId": 1,
          "franchiseName": "Batman",
          "publisherId": 1,
          "publisherName": "DC Comics",
          "publisherCountryName": "USA",
          "fileId": null,
          "pageCount": 0,
          "personByRoles": [],
          "tags": []
      }
  }

Response Type:
ApiResponse<GraphicNovelDetailDto>

Errors:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

Notes:
- Does not expose Number-specific properties.
- Includes franchise, publisher, language, cover, persons/roles, tags, content status, and pages.

## POST /api/admin-graphic-novels

Description:
Creates a Graphic Novel with full editorial metadata.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
Content-Type: multipart/form-data

Fields:
- FranchiseId: required (form field)
- Title: required (form field)
- Description: optional (form field)
- LanguageId: required (form field)
- PublicationDate: required (form field)
- ImageId: optional (form field)
- PersonByRoles: optional (form field, JSON array)
- Tags: optional (form field, JSON array)
- Cover: optional (file)

Response:
- 201 Created
  Body:
  {
      "success": true,
      "message": "Graphic novel created successfully.",
      "code": 201,
      "payload": { ...GraphicNovelDetailDto }
  }

Response Type:
ApiResponse<GraphicNovelDetailDto>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity

Notes:
- Includes Location header via CreatedAtAction.
- Franchise is immutable after creation.
- Cover rules: ImageId=0 + file -> new image; ImageId existing + no file -> keep; ImageId=0 + no file -> remove cover.

## POST /api/admin-graphic-novels/with-content

Description:
Creates a Graphic Novel with minimal metadata and optional CBR/CBZ upload in the same request.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
Content-Type: multipart/form-data

Fields:
- FranchiseId: required (form field)
- Title: required (form field)
- Content: optional (file, .cbr or .cbz)

Response:
- 201 Created
  Body:
  {
      "success": true,
      "message": "Graphic novel created successfully.",
      "code": 201,
      "payload": { ...GraphicNovelDetailDto }
  }

Response Type:
ApiResponse<GraphicNovelDetailDto>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

Notes:
- When Content is present: creates Graphic Novel, sets ContentStatus=Processing, stores file temporarily, enqueues background job.
- When Content is absent: creates Graphic Novel with ContentStatus=Missing.
- Background processing uses the existing Work-based CBR/CBZ pipeline.

## PUT /api/admin-graphic-novels/{graphicNovelId}

Description:
Updates an existing Graphic Novel's editorial metadata.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
Content-Type: multipart/form-data

Fields:
- Title: required (form field)
- Description: optional (form field)
- LanguageId: required (form field)
- PublicationDate: required (form field)
- ImageId: optional (form field)
- PersonByRoles: optional (form field, JSON array)
- Tags: optional (form field, JSON array)
- Cover: optional (file)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Graphic novel updated successfully.",
      "code": 200,
      "payload": { ...GraphicNovelDetailDto }
  }

Response Type:
ApiResponse<GraphicNovelDetailDto>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity

Notes:
- FranchiseId is immutable during editing.
- PersonByRoles and Tags are fully synchronized (existing entries not in request are removed).
- Cover rules: ImageId=0 + file -> new image; ImageId existing + no file -> keep; ImageId=0 + no file -> remove cover.

## PATCH /api/admin-graphic-novels/{graphicNovelId}/deactivate

Description:
Logically deactivates a Graphic Novel (soft delete).

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Graphic novel deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

Notes:
- Sets IsActive = false.
- Does not delete the Graphic Novel, its relations, pages, images, files, or metadata.

## PATCH /api/admin-graphic-novels/{graphicNovelId}/activate

Description:
Reactivates a previously deactivated Graphic Novel.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Graphic novel activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

Notes:
- Sets IsActive = true.

## POST /api/admin-graphic-novels/{graphicNovelId}/content

Description:
Uploads digital content (CBR/CBZ) for an existing Graphic Novel.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
Content-Type: multipart/form-data

Fields:
- file: required (file, .cbr or .cbz)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Contenido cargado correctamente. El procesamiento iniciará en segundo plano.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict

Notes:
- Validates the Graphic Novel exists.
- Delegates to GraphicNovelContentService.
- Stores file temporarily.
- Sets ContentStatus = Processing.
- Enqueues background job.
- Returns immediately.
- Original file remains a temporary artifact.
- Processing uses the existing Work-based CBR/CBZ pipeline.

## GET /api/admin-graphic-novels/{graphicNovelId}/content/status

Description:
Returns the current digital content processing status.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

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
          "startedAt": "2026-01-01T12:00:00Z",
          "completedAt": null,
          "pageCount": 0
      }
  }

Response Type:
ApiResponse<ContentStatusDto>

Errors:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

Notes:
- Content status is independent of GraphicNovel.IsActive.
- Possible statuses: Missing, Processing, Completed, Error.

## POST /api/admin-graphic-novels/{graphicNovelId}/content/retry

Description:
Retries content processing when current status is Error.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
Content-Type: multipart/form-data

Fields:
- file: required (file, .cbr or .cbz)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Reintento encolado correctamente. El procesamiento iniciará en segundo plano.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict

Notes:
- Only allowed when ContentStatus == Error.
- Resets ContentError.
- Changes status to Processing.
- Stores new file temporarily.
- Enqueues processing.
- Returns immediately.

## DELETE /api/admin-graphic-novels/{graphicNovelId}/content

Description:
Deletes digital content from a Graphic Novel.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Contenido eliminado correctamente.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict

Notes:
- Deletes Pages, associated Images, and physical files.
- Resets ContentStatus = Missing and ContentError = null.
- Does not delete the Graphic Novel, its metadata, franchise, persons/roles, tags, language, publication date, or IsActive.
- Not allowed while ContentStatus == Processing.
- Idempotent when status is already Missing.

## GET /api/admin-graphic-novels/{graphicNovelId}/images

Description:
Returns extracted pages/images from the Graphic Novel's digital content in natural order.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Images retrieved successfully.",
      "code": 200,
      "payload": {
          "images": [
              {
                  "id": 101,
                  "url": "/images/101"
              }
          ]
      }
  }

Response Type:
ApiResponse<GraphicNovelImagesResponse>

Errors:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

Notes:
- Returns pages in natural order (page2, page10, not page10, page2).
- Used for cover selection and future administrative capabilities.
- Read-only operation.

## PATCH /api/admin-graphic-novels/{graphicNovelId}/cover

Description:
Sets an existing page image as the Graphic Novel's cover.

Controller:
AdminGraphicNovelsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
Content-Type: application/json

Body:
{
    "imageId": 101
}

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Cover updated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

Notes:
- Validates that the Graphic Novel exists.
- Validates that the image exists and belongs to a Page of this Graphic Novel.
- Does not allow using an image from another work.
- No upload is performed; only associates an existing image.
- The first page is not automatically selected as cover.
