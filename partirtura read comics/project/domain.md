# Domain entities â€” Index

Domain entities are simple C# classes in `Domain/Entities/`. There is **no common base class**. Each entity declares its own `Id`, `CreatedAt`, and optionally `IsActive` properties directly.

## File index

| File | Contents |
| --- | --- |
| `domain/domain-overview.md` | Model structure, common patterns, inheritance, key conventions |
| `domain/domain-users.md` | User, Ban, RefreshToken, PasswordResetToken, PasswordResetAuthorization, AccountDeletionToken |
| `domain/domain-catalog.md` | Country, Publisher, Image, File, Franchise, Series, Language, Person, Role, PersonByRole, Tag, TagByWork, WorkList, WorkListItem |
| `domain/domain-content.md` | Work, Page, Work hierarchy, WorkReadingProgress, WorkRating, ListRating, ListReadingProgress, Favorite |

## Entity relationship summary

```mermaid
graph LR
    User["User"]
    Ban["Ban"]
    RefreshToken["RefreshToken"]
    PasswordResetToken["PasswordResetToken"]
    PasswordResetAuthorization["PasswordResetAuthorization"]
    AccountDeletionToken["AccountDeletionToken"]
    
    Country["Country"]
    Publisher["Publisher"]
    Image["Image"]
    File["File"]
    Franchise["Franchise"]
    Series["Series"]
    Language["Language"]
    Person["Person"]
    Role["Role"]
    PersonByRole["PersonByRole"]
    Tag["Tag"]
    TagByWork["TagByWork"]
    Work["Work"]
    Page["Page"]
    WorkList["WorkList"]
    WorkListItem["WorkListItem"]
    ListType["ListType"]
    WorkType["WorkType"]
    WorkRating["WorkRating"]
    WorkReadingProgress["WorkReadingProgress"]
    ListRating["ListRating"]
    ListReadingProgress["ListReadingProgress"]
    Favorite["Favorite"]
    
    User --> Ban
    User --> RefreshToken
    User --> PasswordResetToken
    User --> PasswordResetAuthorization
    User --> AccountDeletionToken
    User --> Image
    User --> WorkList
    User --> WorkRating
    User --> WorkReadingProgress
    User --> ListRating
    User --> ListReadingProgress
    User --> Favorite
    
    Country --> Publisher
    Publisher --> Franchise
    Publisher --> Image
    Franchise --> Series
    Franchise --> Image
    Series --> Image
    Language --> Work
    Person --> PersonByRole
    Role --> PersonByRole
    PersonByRole --> Work
    Tag --> TagByWork
    TagByWork --> Work
    Work --> Page
    Work --> Image
    Work --> File
    Work --> Language
    Work --> WorkType
    Work --> Series
    Work --> Franchise
    Work --> Publisher
    Work --> PreviousWork
    Work --> NextWork
    WorkList --> ListType
    WorkList --> User
    WorkList --> WorkListItem
    WorkListItem --> WorkList
    WorkListItem --> Work
    Page --> Image
    Work --> WorkRating
    Work --> WorkReadingProgress
    Work --> ListRating
    Work --> ListReadingProgress
    WorkList --> ListRating
    WorkList --> ListReadingProgress
    ListReadingProgress -->|"CurrentWork"| Work
    Work --> Favorite
    
    File <|-- Image
```

## Key relationships

| From | To | Type |
| --- | --- | --- |
| `User` | `Ban` | One-to-many |
| `User` | `RefreshToken` | One-to-many |
| `User` | `AccountDeletionToken` | One-to-many |
| `Country` | `Publisher` | One-to-many |
| `Publisher` | `Franchise` | One-to-many |
| `Franchise` | `Series` | One-to-many |
| `Series` | `Image` | Many-to-one |
| `Person` | `Role` | Many-to-many via `PersonByRole` (scoped to Work) |
| `Tag` | `Work` | Many-to-many via `TagByWork` |
| `Work` | `Page` | One-to-many |
| `Page` | `Image` | Many-to-one |
| `Work` | `WorkType` | Many-to-one (classification only; no semantic rules) |
| `Work` | `Series` / `Franchise` / `Publisher` | Many-to-one, mutually exclusive editorial context |
| `Work` | `Work` (PreviousWork / NextWork) | Self-referencing one-to-one through `PreviousNumberId` / `NextNumberId` shadow FKs |
| `User` | `WorkList` | One-to-many |
| `WorkList` | `WorkListItem` | One-to-many |
| `WorkListItem` | `Work` | Many-to-one |
| `WorkList` | `ListType` | Many-to-one, optional (a personal list has no list type) |
| `User` | `WorkRating` | One-to-many (one rating per Work) |
| `Work` | `WorkRating` | One-to-many (one rating per User) |
| `User` | `WorkReadingProgress` | One-to-many (one progress per Work) |
| `Work` | `WorkReadingProgress` | One-to-many (one progress per User) |
| `User` | `ListRating` | One-to-many (one rating per WorkList) |
| `WorkList` | `ListRating` | One-to-many (one rating per User) |
| `User` | `ListReadingProgress` | One-to-many (one progress per WorkList) |
| `WorkList` | `ListReadingProgress` | One-to-many (one progress per User) |
| `ListReadingProgress` | `Work` (CurrentWork) | Many-to-one, optional; must belong to the list |
| `User` | `Favorite` | One-to-many (one favorite per Work) |
| `Work` | `Favorite` | One-to-many (one favorite per User) |
| `File` (abstract) | `Image` | TPH inheritance (discriminator `FileType`) |

## Audit note (2026-09)

The previous version of this document listed fields that the model does not have:

- `Number.Number` â€” wrong. The field is `NumberValue` (free-form string).
- `Person.IsFeatured` â€” does not exist.
- `Role.Type` â€” does not exist. Roles are a free-form taxonomy.
- `Image.OwnerEntityType` / `OwnerEntityId` â€” does not exist. The model uses a single `Files` table with a discriminator (`File` / `Image`) and a `Type` enum.
- `Country.IsFeatured` â€” does not exist.
- `BaseEntity` / `BaseEntityActivation` â€” do not exist. There is no common base class. Each entity declares its own `Id`, `CreatedAt`, and optionally `IsActive` directly.
- `BaseEntity.DeletedAt` â€” does not exist. Deactivation uses `IsActive` where applicable.

These corrections were validated by re-reading the entity files during the 2026-09 audit.

## Audit note (2026-10)

The relationship summary and diagram were updated after re-reading the entities:

- `Number` and `GraphicNovel` â€” **no longer exist**. `Work` is a single non-abstract entity with `NumberValue` (free-form string) and `WorkType` (classification only). The `Work <|-- Number` / `Work <|-- GraphicNovel` TPH inheritance and their relationships were removed.
- `WorkReadingProgress` was missing from the diagram and from the key relationships (`User` â†” `WorkReadingProgress`, `Work` â†” `WorkReadingProgress`).
- `ListType`, `WorkList` and `WorkListItem` nodes were missing from the diagram (their edges were already present).
- `WorkType` and the `Work` â†’ `Series` / `Franchise` / `Publisher` editorial context relationships were added.
- The only TPH inheritance in the model is `File` â†’ `Image` (discriminator `FileType`).