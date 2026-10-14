# Admin Dashboard Architecture — Summary

## Architecture diagram

```mermaid
graph LR
    Admin["Administrator<br/>(Browser)"]
    
    subgraph Dashboard["Admin Dashboard Application"]
        subgraph Auth["authentication"]
            Login["Login"]
            Session["Session Management"]
        end
        
        subgraph Catalog["catalog"]
            Publishers["Publishers"]
            Franchises["Franchises"]
            Series["Series"]
            Numbers["Numbers"]
            People["People"]
            Roles["Roles"]
            Languages["Languages"]
            Tags["Tags"]
        end
        
        subgraph Lists["lists"]
            Arcs["Arcs"]
            Crossovers["Crossovers"]
        end
        
        subgraph Media["media"]
            Imports["Imports"]
        end
        
        subgraph Users["users"]
            UserMgmt["User Management"]
            Bans["Bans"]
        end
        
        subgraph Stats["statistics"]
            Stats["Statistics"]
        end
        
        subgraph AI["ai-assistance"]
            AIDesc["AI Description"]
            AITags["AI Tags"]
            AIAnalysis["AI Analysis"]
        end
    end
    
    API["Backend API<br/>(HTTP only)"]
    
    Admin --> Dashboard
    Dashboard --> API
```

## Key decisions

### Architecture style
- **Feature-Based Frontend Architecture** — organized by functionality, not technical type
- Each feature concentrates elements needed for an administrative capability
- The project is organized by feature folders, not by top-level technical folders
- Within each feature, technical folders ARE allowed when needed (`components/`, `hooks/`, `services/`, `pages/`, `types/`)

### Core principle
Administrators: find, create, modify, relate, import, supervise, correct, analyze, use AI assistance. Backend is authority on business rules, validations, permissions, data integrity, persistent state.

### API only
Dashboard communicates exclusively via API. No direct database, storage, queue, worker, or internal service access. All operations pass backend authorization.

### Shared components
Shared components only for truly transversal elements used by multiple features: forms, tables, paginators, dialogs, confirmations, selectors, autocomplete, messages, progress indicators, navigation, layout. No premature generic abstractions.

### Composition rule
Extract reusable pieces into components within the feature. If a component is used by 2+ features, promote it to `shared/`. Never duplicate code across pages because the agent avoided creating a component.

### Operations
Dashboard works with administrative operations: Create, Read, Update, Delete, Assign, Unassign, Import, Reorder, Publish, Process, Retry. Operations represent real admin intent, not generic CRUD.

### AI assistance
AI is assistance tool, not catalog authority. First use: generate/assist descriptions. Admin reviews, modifies, confirms. No auto-publish AI-generated content in first version. Distinguish: AI suggestion vs Administrator-approved content.

### Long operations
Do not block UI for potentially long operations: CBR import, page processing, image conversion, mass operations, AI generation. Represent as queryable processes.

### Mandatory rules
1. Organize frontend by features.
2. No primary organization by technical type.
3. Each feature as autonomous as possible.
4. API only for backend communication.
5. No direct database access.
6. No direct storage access.
7. No direct queue access.
8. No critical business rules in frontend.
9. Separate UI state from persistent state.
10. No auto-convert all state to global.
11. Specific components within their feature.
12. Shared only for truly transversal elements.
13. Operations designed around use cases.
14. Not all operations are CRUD.
15. Search and pagination for potentially large entities.
16. No full catalog loads for selectors.
17. Long operations represented as process states.
18. No UI blocking during imports or processing.
19. AI as assistance, not catalog authority.
20. No auto-publish AI content in first version.
21. Separate admin from public capabilities.
22. All operations protected by backend authorization.
23. Handle loading, success, error states.
24. Provide recovery mechanisms.
25. No unnecessary dependencies between features.
26. No generic abstractions just to follow patterns.
27. No architectural changes for local needs without explicit decision.

### Evolution
Must allow future incorporation of: advanced import, mass operations, audit, AI descriptions, AI classification, AI missing info detection, OCR, maintenance tools, community lists, crossovers, moderation tools, advanced analytics.

### Fundamental principle
Dashboard designed around administrator tasks, not backend internal entities. Favors productivity and reduces repetitive operations. Allows automation and AI without making them dependencies of fundamental operations.