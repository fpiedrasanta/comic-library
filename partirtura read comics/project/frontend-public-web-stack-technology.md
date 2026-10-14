# Frontend Public Web Stack Technology

## Tech stack

| Area | Technology |
|------|------------|
| Language | TypeScript (strict mode) |
| Framework | React 19 (functional components + Hooks) |
| Build Tool | Vite |
| App Type | SPA + PWA |
| Routing | React Router |
| Server State | TanStack Query |
| Client State | Zustand |
| Forms | React Hook Form |
| Validation | Zod |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| API Contract | OpenAPI |
| API Client | Generated TypeScript client |
| Unit Testing | Vitest |
| Component Testing | React Testing Library |
| E2E Testing | Playwright |
| Comic Pages Format | WebP |

## Principles

1. Static typing everywhere. No `any` except justified.
2. API is sole data source. No direct DB/storage/queue/worker access.
3. Business rules stay in backend.
4. Server state and UI state are separate responsibilities.
5. Centralized API communication.
6. Dependencies only when they add concrete value.
7. Generated code (OpenAPI client) stays separate from manual code. Never edit generated code manually. Regenerate on contract changes.
8. No technology replacement without explicit architectural decision. This document is the technology source of truth.

## Environment

- Only public values in frontend env vars. No secrets in bundle.
- API base URL from env var only.

## Independence

- Dashboard and Public Web are independent frontend applications.
- No direct imports between them. Shared code via explicit shared library only.
