# Domain — Catalog

## Country

- **Location**: `Domain/Entities/Country.cs`
- **Fields**:
  - `long Id`
  - `string Code` (ISO 3166-1 alpha-3, unique at DB level)
  - `string Name` (unique at DB level)
  - `bool IsActive` (default `true`)
- **Notes**: Read-mostly entity. Used as a foreign key for `Publisher`. There is **no** `IsFeatured` column on Country.

## Publisher

- **Location**: `Domain/Entities/Publisher.cs`
- **Fields**:
  - `long Id`
  - `string Name` (unique at DB level)
  - `string? Description`
  - `string? Website`
  - `int? FoundedYear`
  - `string? History`
  - `bool IsAlive`
  - `string? Color`
  - `bool IsFeatured`
  - `bool IsActive` (default `true`)
  - `DateTime CreatedAt`
  - `virtual Country? Country`
  - `virtual Image? Image`
- **Notes**: Image optional. Country optional. Helper methods: `GetCountryName()`. **Indexes**: `Name` (unique), `CountryId`, `ImageId`.

## Image

- **Location**: `Domain/Entities/Image.cs`
- **Fields**:
  - Inherits from `File`: `long Id`, `string FileName`, `string ContentType`, `long Size`, `string StoragePath`, `DateTime CreatedAt`, `bool IsActive`
  - `int? Width`
  - `int? Height`
  - `ImageType Type` (enum)
- **Notes**: Logical deletion only — no soft-delete column beyond `IsActive` from `File`. There is no `Image.OwnerEntityType` / `OwnerEntityId` polymorphic ownership. The model uses a single `Files` table with a discriminator (`File` / `Image`) and a `Type` enum. There is **no** `Cover` flag on Image; "cover" is determined by `Work.Cover`.

## File (abstract)

- **Location**: `Domain/Entities/File.cs`
- **Fields**:
  - `long Id`
  - `string FileName`
  - `string ContentType`
  - `long Size`
  - `string StoragePath`
  - `DateTime CreatedAt`
  - `bool IsActive` (default `true`)
- **Notes**: Abstract base. The CBR/CBZ upload payload is stored as a `File` entity; pages are extracted as `Image` entities in `CbrProcessingJob`. The model uses table-per-type with a discriminator `File` / `Image`. Image-specific metadata (Width, Height, Type) lives on `Image`.

## Franchise

- **Location**: `Domain/Entities/Franchise.cs`
- **Fields**:
  - `long Id`
  - `string Name`
  - `string? Description`
  - `bool IsFeatured`
  - `bool IsOngoing`
  - `bool IsActive` (default `true`)
  - `string? Color`
  - `DateTime CreatedAt`
  - `virtual Publisher Publisher`
  - `virtual Image? Image`
- **Notes**: Belongs to a Publisher. Helper methods: `GetPublisherId()`, `GetPublisherName()`, `GetPublisherCountryName()`. **Indexes**: `Name`, `IsActive`, `IsFeatured`, `IsOngoing`, `PublisherId`.

## Series

- **Location**: `Domain/Entities/Series.cs`
- **Fields**:
  - `long Id`
  - `string Name`
  - `string? Description` (added 2026-10, `varchar(1000)` nullable; same pattern as Publisher and Franchise)
  - `bool IsFeatured`
  - `bool IsOngoing`
  - `bool IsActive` (default `true`)
  - `string? Color`
  - `DateTime CreatedAt`
  - `virtual Franchise Franchise`
  - `virtual Image? Image`
- **Notes**: Belongs to a Franchise. Helper methods: `GetFranchiseId()`, `GetFranchiseName()`, `GetPublisherId()`, `GetPublisherName()`, `GetPublisherCountryName()`. `Description` is optional and trimmed on write; sending `null` clears it. **Indexes**: `Name`, `IsActive`, `IsFeatured`, `IsOngoing`, `FranchiseId`, `ImageId`.

## WorkType

- **Location**: `Domain/Entities/WorkType.cs`
- **Fields**:
  - `long Id`
  - `string Name` (unique at DB level)
  - `bool IsActive` (default `true`)
  - `DateTime CreatedAt`
- **Notes**: Catalog entity for classifying works (e.g., "Number", "Graphic Novel", "Annual", "Special"). No structural rules depend on this value. **Indexes**: `Name` (unique), `IsActive`.

## Language

- **Location**: `Domain/Entities/Language.cs`
- **Fields**:
  - `long Id`
  - `string Name`
  - `string Code` (ISO 639-1, unique at DB level)
- **Notes**: Read-mostly entity. Seeded directly in the DB; no CRUD endpoints. No `IsActive` — all languages are always active. **Indexes**: `Code` (unique), `Name` (unique).

## Person

- **Location**: `Domain/Entities/Person.cs`
- **Fields**:
  - `long Id`
  - `string Name`
  - `bool IsActive` (default `true`)
  - `DateTime CreatedAt`
- **Notes**: Soft-delete via `IsActive`. No `Biography` field. Name is not unique. Persons can be deactivated and reactivated. Deactivation preserves existing `PersonByRole` relationships.

## Role

- **Location**: `Domain/Entities/Role.cs`
- **Fields**:
  - `long Id`
  - `string Name` (unique at DB level)
  - `bool IsActive` (default `true`)
  - `DateTime CreatedAt`
- **Notes**: Roles are user-managed (admin creates them). There is **no** `Role.Type` field; roles are a free-form taxonomy. Soft-delete via `IsActive`. `Id` is inmutable. Deactivation does not modify `PersonByRole` relationships.

## PersonByRole

- **Location**: `Domain/Entities/PersonByRole.cs`
- **Fields**:
  - `long Id`
  - `virtual Work Work`
  - `virtual Person Person`
  - `virtual Role Role`
- **Notes**: Join entity (Person, Role, Work) used to express "Person P was Role R on Work W". Many-to-many with a payload. Helper methods: `GetPersonId()`, `GetPersonName()`, `GetRoleId()`, `GetRoleName()`.

## Tag

- **Location**: `Domain/Entities/Tag.cs`
- **Fields**:
  - `long Id`
  - `string Name` (unique at DB level)
  - `DateTime CreatedAt`
- **Notes**: Free-form tags. No `IsActive` — tags are never deactivated. Used by `AdminTagsController` autocomplete.

## TagByWork

- **Location**: `Domain/Entities/TagByWork.cs`
- **Fields**:
  - `long Id`
  - `virtual Work Work`
  - `virtual Tag Tag`
- **Notes**: Join entity (Tag, Work) used to attach a tag to a work. Helper methods: `GetTagId()`, `GetTagName()`.

## WorkList

- **Location**: `Domain/Entities/WorkList.cs`
- **Fields**:
  - `long Id`
  - `string Name`
  - `string? Description`
  - `virtual Image? Cover`
  - `string? Color`
  - `virtual ListType? ListType`
  - `OwnerType OwnerType`
  - `virtual User? Owner`
  - `Visibility Visibility`
  - `bool IsActive` (default `true`)
  - `DateTime CreatedAt`
  - `int RatingCount` (default `0`)
  - `double AverageRating` (default `0`)
- **Navigation Properties**:
  - `virtual ICollection<WorkListItem> WorkListItems`
- **Notes**: Logical deletion via `IsActive`. Navigation properties are `virtual` for lazy loading. `OwnerType` determines whether `Owner` (User) is null (`System`) or set (`User`). Database check constraint enforces that `System` lists have no owner and `User` lists have an owner. `Name` is indexed for catalog searches. **Rating accumulators**: `RatingCount` (active ratings) and `AverageRating` (average of the active ratings on a 1-5 scale) are stored on the list to avoid recalculating them on every read; they are maintained when a `ListRating` is created or edited. A list without ratings has `RatingCount = 0` and `AverageRating = 0`. **`ListType` is optional** (added 2026-10 for US-0036): system lists always have a type, personal lists (`OwnerType = User`) have none, so the `ListTypeId` column is nullable. Personal lists are not rated, so their accumulators stay at `0`.

## WorkListItem

- **Location**: `Domain/Entities/WorkListItem.cs`
- **Fields**:
  - `long Id`
  - `virtual WorkList WorkList`
  - `virtual Work Work`
  - `int Position`
- **Notes**: Position determines order of works within a list. Foreign keys (`WorkListId`, `WorkId`) are shadow properties in EF Core configuration. Navigation properties are `virtual` for lazy loading. Unique database indexes enforce one row per work per list and one work per position per list. No physical deletion of works when removed from a list. **Positions are 0-based** and may contain gaps: removing a work from a list does not renumber the remaining ones, and the position only determines the order. When the order of a personal list is updated, the affected rows are first moved to a temporary negative offset and then to their final position, so the unique `(WorkListId, Position)` index is never violated while the rows swap places.