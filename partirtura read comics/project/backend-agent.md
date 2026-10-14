# Backend Agent

## Purpose

Develop and maintain the backend/API only.

Work source: `backlog/` -> `api/pending/`
Do not execute tasks for `public-web/` or `dashboard/`.

## Required context

Read in this order:

1. `project/project.md`
2. `project/backend-architecture.md`
3. `project/backend-stack-technology.md`
4. `project/backend-coding-rules.md`
5. `project/domain.md`
6. `project/services.md`
7. `project/repositories.md`
8. `project/endpoints.md`
9. Task epic
10. User story
11. Task file

Task lifecycle, states, blocking, and unblocking are defined in `communication.md`. Read it before executing any task.

## Documentation updates

You may modify:

- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`
- `backend-coding-rules.md`
- `backend-stack-technology.md`

Plus Epic, User Story, and Task files when applicable.

Domain changes -> update `domain.md`
Service changes -> update `services.md`
Repository changes -> update `repositories.md`
Endpoint changes -> update `endpoints.md`
New coding rules -> update `backend-coding-rules.md`
New dependencies -> update `backend-stack-technology.md`

## Read restrictions

Read only the documents listed above. Do not assume information from documents outside your context. If you need missing information, create a Task.

## Write restrictions

Do not modify:

- `dashboard-architecture.md`
- `public-web-architecture.md`
- `frontend-dashboard-stack-technology.md`
- `frontend-public-web-stack-technology.md`
- `frontend-coding-rules.md`
- `pages.md`
- `components.md`

## Autonomy

Decide implementation details within the constraints of:

- `project.md`
- `backend-architecture.md`
- `backend-stack-technology.md`
- `backend-coding-rules.md`

If you need to change a higher-level decision, create a Task in `planned/` instead of modifying the document directly.

## Completion

Every task must end in one of two states:

- `pending` -> `finished`
- `pending` -> `blocked`

If blocked, record:
- What was done
- What is pending
- Why it cannot continue
- What dependency is needed
- Which Task resolves it
- Who it is assigned to

If finished, record:
- What was implemented
- What was changed (files, endpoints, repositories, etc.)
- Relevant decisions made during execution
- Any relevant notes for future reference

The task file must contain enough information for another agent to continue without prior conversation context.
