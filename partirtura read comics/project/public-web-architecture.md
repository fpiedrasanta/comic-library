# Public Web Architecture — Summary

## Architecture diagram

```mermaid
graph LR
    User["User<br/>(Browser)"]
    
    subgraph PublicWeb["Public Web Application"]
        subgraph Auth["authentication"]
            Login["Login"]
            Register["Register"]
            GoogleLogin["Google Login"]
            Session["Session Management"]
        end
        
        subgraph Catalog["catalog"]
            CatalogBrowse["Browse Catalog"]
            ComicDetail["Comic Detail"]
        end
        
        subgraph Search["search"]
            SearchBox["Search Interface"]
            Filters["Filters"]
            Results["Results"]
        end
        
        subgraph Reader["reading"]
            Reader["Reader"]
            PageNav["Page Navigation"]
            Progress["Progress Persistence"]
            Immersive["Immersive Mode"]
        end
        
        subgraph Library["library"]
            Reading["Reading"]
            Completed["Completed"]
            Favorites["Favorites"]
        end
        
        subgraph Ratings["ratings"]
            Ratings["Ratings & Reviews"]
        end
        
        subgraph Recs["recommendations"]
            Recs["Recommendations"]
        end
        
        subgraph Profile["profile"]
            Profile["Profile Edit"]
        end
    end
    
    API["Backend API<br/>(HTTP only)"]
    
    User --> PublicWeb
    PublicWeb --> API
```

## Key decisions

### Architecture style
- **Feature-Based Frontend Architecture** — organized by functionality, not technical type
- Features should be relatively autonomous
- Technical folders (`components/`, `hooks/`, `pages/`) can exist within features but must be subordinated to functional organization

### Core principle
Frontend manages interaction, presentation, and UI state. Backend manages business rules and persistent state. Frontend must not duplicate critical business rules. Backend is authority on validation, permissions, and data integrity.

### API only
Public Web communicates exclusively via API. No direct database, storage, worker, queue, or internal service access. API is the only communication boundary.

### State separation
- **Local UI state**: component-specific (modal open, expanded filter, selected tab, temp search field). Keep as close to UI as possible.
- **Feature state**: shared within a feature (search results, current filters, catalog state, reading session state). Stay within feature boundary.
- **Remote state**: backend is source of truth (comic info, persisted progress, favorites, history, ratings, recommendations, statistics). Frontend may cache temporarily but backend is authority.
- **Session state**: authenticated user, identity, permissions, auth status. Frontend uses for experience; real authorization always validated by backend.

### Shared UI
Shared components only for truly transversal elements: buttons, dialogs, loading indicators, error messages, navigation, layout. Components belonging conceptually to a feature must stay within that feature. No premature shared abstractions.

### Reader subsystem
Specialized subsystem, not just another catalog screen. Requirements: performance, navigation, preloading, temporal state, progress persistence, page handling, transitions, reading controls, immersive mode. Model: `Readable Work -> Ordered Pages`. Both numbered issues and graphic novels treated as works with ordered pages. Reader is independent of work type.

### Mandatory rules
1. Organize frontend by features.
2. No primary organization by technical type.
3. Each feature as autonomous as possible.
4. No direct database access.
5. No direct backend storage access.
6. API only for backend communication.
7. No critical business rule duplication.
8. Backend is authority on persistent state.
9. Separate local, feature, remote, and session state.
10. No auto-convert all state to global.
11. Feature-specific components within their feature.
12. Shared only for real cross-feature reuse.
13. Design around use cases and user experiences.
14. Not around backend internal entities.
15. Reader is specialized subsystem.
16. No full comic download before reading.
17. On-demand page loading.
18. Selective preloading when beneficial.
19. Persist progress via API.
20. No numeric continuity assumption for non-series works.
21. Use backend continuity and list information.
22. Separate public info from private user info.
23. Handle loading, success, empty, error states.
24. Catalog does not fit in memory.
25. No inter-feature dependencies without justification.
26. No architectural complexity for trends.
27. No architectural changes for local needs without explicit decision.

### Fundamental principle
Public Web designed around reader experience, not backend internal structure. Backend exposes capabilities via contracts. Frontend composes capabilities into experiences. Code must make evident: what functionality, what state, what API operation, what UI depends on it, what is persistent vs UI-only.