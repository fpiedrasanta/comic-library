# Endpoints

## GET /api/admin-tags

Description:
Returns a paginated list of tags for autocomplete and selection in the Dashboard. Used by the Number editor to show existing tags and to seed the suggestion chips.

Controller:
AdminTagsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional; sortable fields: `name`, `createdAt`, `isActive`)
- orderDir: string (default `ASC`, optional `DESC`)
- search: string (optional, partial case-insensitive match on Name)
- isActive: boolean (optional; filter by active/inactive status)

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
              { "id": 1, "name": "Action", "isActive": true },
              { "id": 2, "name": "Comedy", "isActive": true }
          ]
      }
  }

Response Type:
ApiResponse<ListResponse<TagListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden

Notes:
- Requires authentication.
- Requires Administrator role.
- search is a partial case-insensitive match on Name.
- Default ordering is Name ASC.
- The operation is read-only.
- Typically used to populate the tag autocomplete before the admin types.

---

## POST /api/admin-tags

Description:
Creates a new tag. Used when the admin types a tag name that does not yet exist.

Controller:
AdminTagsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Cyberpunk"
  }

Response:
- 201 Created
  Headers:
  Location: /api/admin-tags?currentPage=1&pageSize=12&search=Cyberpunk
  Body:
  {
      "success": true,
      "message": "Tag created successfully.",
      "code": 201,
      "payload": {
          "id": 61,
          "name": "Cyberpunk",
          "isActive": true
      }
  }

Response Type:
ApiResponse<TagListItemDto>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El nombre es obligatorio.",
      "code": 400,
      "payload": { "detail": "El nombre es obligatorio." }
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe una etiqueta con ese nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Name is required and must be unique at the database level.
- The new tag is created with IsActive = true.
- Tags are reusable across multiple Numbers.
- The new tag becomes immediately available for autocomplete and assignment.
- Alternatively, the Number update flow (PUT /api/admin-numbers/{id}) accepts new tag names and creates them implicitly when saving.

---

## PUT /api/admin-tags/{tagId}

Description:
Updates the name of an existing tag.

Controller:
AdminTagsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- tagId: long (path)

Request:
- Content-Type: application/json
- Body:
  {
      "name": "Sci-Fi"
  }

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Tag updated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 400 Bad Request
  {
      "success": false,
      "message": "El nombre es obligatorio.",
      "code": 400,
      "payload": { "detail": "El nombre es obligatorio." }
  }
- 404 Not Found
  {
      "success": false,
      "message": "La etiqueta no existe.",
      "code": 404,
      "payload": null
  }
- 409 Conflict
  {
      "success": false,
      "message": "Ya existe una etiqueta con ese nombre.",
      "code": 409,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Name is required and must be unique.
- The tag Id cannot be modified.

---

## POST /api/admin-tags/{tagId}/deactivate

Description:
Deactivates a tag using logical deletion via `IsActive = false`. Existing relationships with works (Numbers, GraphicNovels) are preserved unchanged.

Controller:
AdminTagsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- tagId: long (path)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Tag deactivated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "La etiqueta no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Deactivation is logical — no records are deleted.
- Existing relations with works are preserved.
- Already-deactivated tags return 200 without error (idempotent).

---

## POST /api/admin-tags/{tagId}/activate

Description:
Reactivates a previously deactivated tag by setting `IsActive = true`.

Controller:
AdminTagsController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- tagId: long (path)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Tag activated successfully.",
      "code": 200,
      "payload": null
  }

Response Type:
ApiResponse<object>

Errors:
- 404 Not Found
  {
      "success": false,
      "message": "La etiqueta no existe.",
      "code": 404,
      "payload": null
  }

Notes:
- Requires authentication.
- Requires Administrator role.
- Already-active tags return 200 without error (idempotent).
