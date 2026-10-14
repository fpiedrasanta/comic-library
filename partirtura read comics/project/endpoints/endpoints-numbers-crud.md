# Endpoints — Numbers CRUD

Controllers covered:
- AdminNumbersController — Number CRUD (list, detail, create, update, deactivate, activate)

## GET /api/admin-numbers

Description:
Returns a paginated list of numbers for the Dashboard.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: Number, Title, PublicationDate, CreatedAt, Language)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on NumberValue or Title)
- seriesId: long (optional, filter by series)
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
                  "numberValue": "1",
                  "title": "Batman #1",
                  "languageId": 1,
                  "languageName": "English",
                  "coverId": 100,
                  "urlCover": "/images/100",
                  "isActive": true,
                  "publicationDate": "2026-01-01T00:00:00Z",
                  "createdAt": "2026-01-01T12:00:00Z",
                  "contentStatus": 2,
                  "previousNumberValue": null,
                  "nextNumberValue": "2"
              }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<NumberListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- contentStatus maps to: 0 = Missing, 1 = Processing, 2 = Completed, 3 = Error.
- Default ordering is NumberValue ASC.
- The list view shows processing status from the contentStatus field.

---

## GET /api/admin-numbers/{numberId}

Description:
Returns the full detail of a number, including series, franchise, publisher, language, cover, continuity references, persons/roles, tags, and pages.

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
      "message": "Number detail retrieved successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "numberValue": "1",
          "title": "Batman #1",
          "description": "First appearance of Batman.",
          "languageId": 1,
          "languageName": "English",
          "coverId": 100,
          "urlCover": "/images/100",
          "isActive": true,
          "publicationDate": "2026-01-01T00:00:00Z",
          "createdAt": "2026-01-01T12:00:00Z",
          "contentStatus": 2,
          "contentError": null,
          "seriesId": 5,
          "seriesName": "Batman (2016)",
          "franchiseId": 2,
          "franchiseName": "Batman",
          "publisherId": 1,
          "publisherName": "DC Comics",
          "publisherCountryName": "United States",
          "previousNumber": null,
          "nextNumber": {
              "id": 2,
              "numberValue": "2",
              "title": "Batman #2"
          },
          "personByRoles": [
              { "personId": 1, "personName": "Bob Kane", "roleId": 2, "roleName": "Artist" }
          ],
          "tags": [
              { "id": 10, "name": "Superhero" }
          ]
      }
  }

Response Type:
ApiResponse<NumberDetailDto>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "El número no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- The detail response includes publisher, franchise, and series names for header display in the editor.
- contentStatus and contentError reflect the current state of CBR/CBZ processing.
- This endpoint is used both for the editor screen and to poll the contentStatus during processing.

---

## POST /api/admin-numbers

Description:
Creates a new number. The number is created with ContentStatus = Missing and can later receive a CBR/CBZ file via POST /content.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Form fields:
  - SeriesId (long, required)
  - NumberValue (string, required)
  - Title (string, required)
  - Description (string, optional)
  - LanguageId (long, required)
  - ImageId (long, optional, for cover; when 0 + Cover file → creates new image; when existingId + no file → keeps; when 0 + no file → no cover)
  - PublicationDate (date, required, UTC)
  - PreviousNumberId (long, optional)
  - NextNumberId (long, optional)
  - PersonByRoles (array of { PersonId, RoleId }, optional)
  - Tags (array of { Id, Name }, optional)
  - Cover (file, optional)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Number created successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "numberValue": "1",
          "title": "Batman #1",
          "contentStatus": 0,
          "..."
      }
  }

Response Type:
ApiResponse<NumberDetailDto>

Errors:
- 400 Bad Request (validation errors: missing required fields)
- 404 Not Found (series, language, previous/next number do not exist)
- 409 Conflict (NumberValue + SeriesId already exists)

Notes:
- Requires authentication.
- Requires Administrator role.
- NumberValue is free text and unique within a series.
- Tags with Id = 0 will be created if Name does not match an existing tag.
- Cover, if provided, is stored as an Image and associated as the Number's cover.

---

## POST /api/admin-numbers/with-content

Description:
Creates a new number with minimal metadata (SeriesId + Title) and, if provided, uploads a CBR or CBZ file in the same request. The file is stored temporarily, a Hangfire background job is enqueued, and the number transitions to ContentStatus = Processing. The job extracts images, converts them to WebP, and persists Page + Image records. This endpoint is intended for quick creation + upload flows where only basic identification is available.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Form fields:
  - SeriesId (long, required)
  - Title (string, required)
  - Content (file, optional, the .cbr or .cbz file)

Response:
- 201 Created
  Body:
  {
      "success": true,
      "message": "Number created successfully.",
      "code": 201,
      "payload": {
          "id": 1,
          "numberValue": "",
          "title": "Batman #1",
          "contentStatus": 1,
          "..."
      }
  }

Response Type:
ApiResponse<NumberDetailDto>

Errors:
- 400 Bad Request (validation errors: missing required fields)
- 404 Not Found (series does not exist or is not active)

Notes:
- Requires authentication.
- Requires Administrator role.
- When Content is provided, the Number is created first, then ContentStatus is set to Processing and the file is uploaded to a temporary location before the background job is enqueued.
- When Content is not provided, the Number is created with ContentStatus = Missing. The admin can later upload content via POST /{numberId}/content.
- NumberValue is left empty; it should be set later via PUT /{numberId}.
- LanguageId and PublicationDate are not set during creation; they are optional and can be updated later via PUT /{numberId}.
- The CBR/CBZ processing follows the same workflow as POST /{numberId}/content. The Dashboard should poll GET /{numberId} and watch contentStatus for progress.

---

## PUT /api/admin-numbers/{numberId}

Description:
Updates an existing number. Used by the editor after the admin has reviewed the AI suggestion and modified any field.

Controller:
AdminNumbersController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Form fields: same as POST except SeriesId (immutable, taken from the existing number).
- Route parameter: numberId (long)

Response:
- 200 OK
  Body: same shape as POST (NumberDetailDto)

Response Type:
ApiResponse<NumberDetailDto>

Errors:
- 400 Bad Request
- 404 Not Found
- 409 Conflict

Notes:
- Requires authentication.
- Requires Administrator role.
- SeriesId is immutable; the update applies to the existing series.
- PersonByRoles and Tags are fully synchronized: existing entries not in the request are removed.
- Cover behavior follows the standard image semantics (imageId=0 + new file → create; existing id + no file → keep; 0 + no file → remove).

---

## PATCH /api/admin-numbers/{numberId}/deactivate

Description:
Logically deactivates a number by setting IsActive = false.

Controller:
AdminNumbersController

Response:
- 200 OK
  Body: { "success": true, "message": "Number deactivated successfully.", "code": 200, "payload": null }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request (invalid numberId)
- 404 Not Found

---

## PATCH /api/admin-numbers/{numberId}/activate

Description:
Reactivates a previously deactivated number.

Controller:
AdminNumbersController

Response:
- 200 OK
  Body: { "success": true, "message": "Number activated successfully.", "code": 200, "payload": null }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
- 404 Not Found

---
