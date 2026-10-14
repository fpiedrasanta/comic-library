# Comic Library

## Purpose

Web app to catalog, organize, discover, and read comics. Admin-managed catalog. Registered users can read, track progress, rate, and favorite. Future evolution toward collaborative platform.

## Initial objectives

1. Structured comic catalog
2. Multi-criteria search and filtering
3. Page-by-page reading
4. Reading progress tracking
5. Favorites and history
6. Public ratings and reviews
7. Admin-managed story arcs and crossovers
8. Series and continuity navigation
9. Basic public statistics
10. Admin catalog management tools
11. AI assistance for admin content creation

## Users

- Authentication required. No anonymous readers.
- Registration via email/password or Google.
- Profile: name, surname, email, nationality, avatar.

## Domain concepts

- **Publisher**: comic publishing company (Marvel, DC, IDW). Admin-managed.
- **Franchise**: editorial/conceptual grouping of series (X-Men, Avengers, Batman). Not individual characters.
- **Series**: numbered publication within a franchise (Uncanny X-Men). Composed of numbers.
- **Number**: individual publication issue (Uncanny X-Men #74). Main reading unit. Has metadata, cover, file, pages, stats.
- **Graphic Novel**: standalone work not requiring series membership.
- **Person**: creator (Chris Claremont, John Romita Jr.). Can have multiple roles.
- **Role**: creator function (Writer, Penciller, Inker, Colorist, Cover Artist, Translator, Editor). Admin-managed.
- **Language**: work language. Admin-managed.
- **Tag**: thematic/narrative classification (Flashpoint, Dark Phoenix Saga).
- **Arc**: narrative grouping of numbers with explicit reading order.
- **Crossover**: event spanning multiple series with explicit reading order.

## Catalog and administration

- Admin-only catalog management. Users cannot create/modify content in v1.
- Admin manages: publishers, franchises, series, numbers, graphic novels, people, roles, languages, tags, lists, list types, continuity relationships.

## Import and storage

- Admin imports works via CBR file.
- Flow: CBR -> decompression -> page extraction -> WebP conversion -> storage -> page registration.
- Pages stored individually. CBR not needed after processing.
- Reader loads pages on demand, not full comic.

## Reader

- Sequential navigation: previous, next, current page indicator.
- Progress tracking, continuation of interrupted reading.
- Zoom, immersive mode.
- Keyboard navigation on desktop, touch gestures on mobile.
- Previous/next number navigation when valid continuity exists.

## Reading progress

- Server-persisted per user per work.
- Categories: Reading, Completed, Favorites.
- History separated from favorites and completion.

## Ratings and reviews

- Public rating with optional short review.
- Display: average score, vote count, read count.

## Recommendations

- Initial: 5 recommendations based on completed works and favorites.
- Recommendation algorithm is backend responsibility. No AI for users in v1.

## Search and navigation

- Backend-powered search. Frontend provides interface and state.
- Filters: name, franchise, series, publisher, language, type, person, role, year, tags.
- URL-based search state when appropriate for sharing and navigation.

## Statistics

- Basic: read count, rating count, average score.
- Available in public app and admin dashboard.

## Explicitly out of scope (v1)

- User-created lists
- Community lists
- Collaborative reading orders
- Community crossovers/arcs
- Page-level annotations/highlights
- User-facing AI
- Semantic search
- Personal reading assistant
- Advanced personal statistics

## Future vision

Evolve toward collaborative platform: community lists, reading orders, AI assistant, annotations, semantic search.

## Initial constraints

- Admin-only catalog
- Authentication required for reading
- Individual page serving
- CBR processing before reading
- Numbers as main reading unit
- Lists reference existing numbers with explicit order
- Admin-managed roles
- No user AI in v1

## Completion criteria

User can: register/login, access catalog, search/filter, navigate franchises/series, view number, open reader, read pages, continue reading, mark favorite, view history, view in-progress, view completed, rate, review, view stats, navigate previous/next, enter arcs/crossovers, read in list order.

Admin can: manage publishers, franchises, series, numbers, graphic novels, people, roles, languages, tags, list types, lists, continuity, import/process works, view stats, use AI for descriptions.

## Agent rules

Before implementing:
1. Verify functionality is in scope
2. Use correct domain terminology
3. Do not duplicate existing entities
4. Do not implement excluded features
5. Do not make architectural/technical decisions that belong to other artifacts

When a need is undefined, identify ambiguity and generate the corresponding specification artifact before implementing.

This document defines **what product to build**, not **how to build it**.
