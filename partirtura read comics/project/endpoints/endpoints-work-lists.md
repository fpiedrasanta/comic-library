# Endpoints — Admin Work Lists

Administrative endpoints for managing official `WorkList` entities (reading orders, story arcs, curated collections).

## Controller

`Api.Controllers.AdminWorkListsController`

## Authentication

All endpoints require:
- Valid JWT Bearer token
- Role: `Administrator`

---

## List Work Lists

```http
GET /api/admin-work-lists
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | null | Search by list name, work title, or work number |
| `franchiseId` | long | null | Filter by franchise |
| `publisherId` | long | null | Filter by publisher |
| `listTypeId` | long | null | Filter by list type |
| `isActive` | bool | null | Filter by active status |
| `createdAtFrom` | datetime (UTC) | null | Filter by creation date (from) |
| `createdAtTo` | datetime (UTC) | null | Filter by creation date (to) |
| `orderBy` | string | null | Order field: `Name` or `CreatedAt` |
| `orderDirection` | string | `ASC` | Order direction: `ASC` or `DESC` |
| `page` | int | 1 | Page number (1-based) |
| `pageSize` | int | 12 | Items per page (max 100) |

### Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "OK",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "X-Men Reading Order",
        "createdAt": "2024-01-15T10:30:00Z",
        "type": "Reading Order",
        "coverId": 123,
        "urlCover": "/images/123",
        "isActive": true
      }
    ],
    "currentPage": 1,
    "pageSize": 12,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

### Notes

- Only returns lists with `OwnerType = System`.
- User-owned lists never appear.
- Grid consumes: `CreatedAt`, `Name`, `Type`, `IsActive`.

---

## Get Work List by ID

```http
GET /api/admin-work-lists/{workListId}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `workListId` | long | Work list identifier |

### Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "OK",
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "X-Men Reading Order",
    "description": "Complete X-Men reading order",
    "coverId": 123,
    "urlCover": "/images/123",
    "color": "#FF0000",
    "listTypeId": 1,
    "listTypeName": "Reading Order",
    "visibility": "Public",
    "ownerType": "System",
    "ownerUserId": null,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "works": [
      {
        "workId": 100,
        "position": 0,
        "work": {
          "id": 100,
          "title": "Uncanny X-Men #1",
          "numberValue": "1",
          "seriesId": 10,
          "seriesName": "Uncanny X-Men",
          "franchiseId": 5,
          "franchiseName": "X-Men",
          "publisherId": 1,
          "publisherName": "Marvel",
          "coverId": 456,
          "urlCover": "/images/456",
          "isActive": true
        }
      }
    ]
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 404 | WorkList not found |

### Notes

- Returns full detail for editing.
- Works are ordered by `Position`.
- Each work includes `Franchise`, `Publisher`, `Series`, and `Cover`.

---

## Create Work List

```http
POST /api/admin-work-lists
```

### Request Body

```json
{
  "name": "New Reading Order",
  "description": "Description text",
  "coverData": "base64-encoded-image-data",
  "coverFileName": "cover.webp",
  "color": "#FF0000",
  "listTypeId": 1,
  "visibility": "Public",
  "works": [
    { "workId": 100, "position": 0 },
    { "workId": 101, "position": 1 }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | List name (max 200 chars) |
| `description` | string | No | List description (max 2000 chars) |
| `coverData` | byte[] | No | Image binary data |
| `coverFileName` | string | No | Original file name |
| `color` | string | No | Hex color `#RRGGBB` |
| `listTypeId` | long | Yes | Existing active list type |
| `visibility` | enum | Yes | `Public` or `Private` |
| `works` | array | No | Array of work items with `workId` and `position` |

### Response

```http
201 Created
Location: /api/admin-work-lists/{newId}
```

```json
{
  "success": true,
  "message": "WorkList created successfully.",
  "statusCode": 201,
  "data": { /* WorkListDetailDto */ }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid data (empty name, invalid color format, invalid positions) |
| 404 | ListType not found or inactive |
| 404 | Work not found |
| 409 | Duplicate list name |
| 409 | Duplicate work in list |
| 409 | Duplicate position in list |

### Notes

- Backend sets: `OwnerType = System`, `OwnerUserId = null`, `IsActive = true`, `CreatedAt = UTC now`.
- Client must not send `OwnerType` or `OwnerUserId`.
- Positions must be unique and non-negative.
- Works must exist and be unique within the list.

---

## Update Work List

```http
PUT /api/admin-work-lists/{workListId}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `workListId` | long | Work list identifier |

### Request Body

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "coverData": "base64-encoded-image-data",
  "coverFileName": "new-cover.webp",
  "coverImageId": 123,
  "color": "#00FF00",
  "listTypeId": 2,
  "visibility": "Private",
  "works": [
    { "workId": 100, "position": 0 },
    { "workId": 102, "position": 1 }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | List name |
| `description` | string | No | List description |
| `coverData` | byte[] | No | New cover image data |
| `coverFileName` | string | No | New cover file name |
| `coverImageId` | long | No | Existing cover image ID (0 to remove, omit to keep current) |
| `color` | string | No | Hex color `#RRGGBB` |
| `listTypeId` | long | Yes | Existing active list type |
| `visibility` | enum | Yes | `Public` or `Private` |
| `works` | array | No | Complete replacement of work items |

### Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "WorkList updated successfully.",
  "statusCode": 200,
  "data": { /* WorkListDetailDto */ }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid data |
| 404 | WorkList not found |
| 404 | ListType not found or inactive |
| 404 | Work not found |
| 409 | Duplicate list name |
| 409 | Duplicate work in list |
| 409 | Duplicate position in list |

### Notes

- `works` array replaces the entire collection: items not included are removed, new items are added, existing items are updated.
- Cannot modify: `OwnerType`, `OwnerUserId`, `CreatedAt`.
- Removing a work from a list does not delete the work.

---

## Deactivate Work List (Logical Delete)

```http
DELETE /api/admin-work-lists/{workListId}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `workListId` | long | Work list identifier |

### Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "WorkList deactivated successfully.",
  "statusCode": 200,
  "data": null
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 404 | WorkList not found |

### Notes

- Logical deletion only: sets `IsActive = false`.
- Does not physically delete the `WorkList`, its `WorkListItems`, or the referenced `Work` entities.
- Idempotent: repeating on an already inactive list succeeds silently.

---

## Activate Work List

```http
POST /api/admin-work-lists/{workListId}/activate
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `workListId` | long | Work list identifier |

### Response

```http
200 OK
```

```json
{
  "success": true,
  "message": "WorkList activated successfully.",
  "statusCode": 200,
  "data": null
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 404 | WorkList not found |

### Notes

- Sets `IsActive = true`.
- Idempotent: repeating on an already active list succeeds silently.

---

## Common Errors

| Status | Exception | Description |
|--------|-----------|-------------|
| 400 | `ValidationException` | Malformed request, invalid color format, invalid date range, invalid ordering |
| 401 | — | Missing or invalid token |
| 403 | — | Authenticated but not Administrator |
| 404 | `BusinessNotFoundException` | WorkList, ListType, or Work not found |
| 409 | `BusinessConflictException` | Duplicate list name, duplicate work in list, duplicate position |
| 422 | `BusinessException` | Other business rule violations |
| 500 | — | Unexpected server error |

---

## Rate Limiting

| Endpoint | Policy |
|----------|--------|
| `POST /api/admin-work-lists` | `AdminWorkListCreate` (5/h by user) |