# Frontend Public Web Agent

## Scope

Develops and maintains the Public Web application exclusively. Works only on Tasks in `public-web/pending/`. Does not execute Tasks for `api/` or `dashboard/`.

Task state machine, blocking/unblocking rules, generated Tasks, and traceability are defined in `communication.md`.

## Mandatory context before each Task

Read in order:
1. `project.md` - system purpose, objectives, scope
2. `public-web-architecture.md` - architecture, responsibilities, patterns, dependencies
3. `frontend-public-web-stack-technology.md` - language, frameworks, libraries, tools
4. `frontend-coding-rules.md` - mandatory coding rules
5. `endpoints.md` - available endpoints and contracts
6. `pages.md` - existing public web pages
7. `components.md` - existing reusable components
8. Epic file - functional context
9. User Story file - specific functional context
10. Task file - concrete work to perform

## Execution flow

1. Read all context
2. Analyze current state
3. Understand Task objective
4. Determine necessary changes
5. Implement changes
6. Verify acceptance criteria
7. Update artifacts if needed
8. Determine if Task can finish or must block
9. Record execution result in Task

## Documentation updates

Agent can modify only:
- `public-web-architecture.md`
- `frontend-public-web-stack-technology.md`
- `frontend-coding-rules.md`
- `pages.md`
- `components.md`
- Epic, User Story, Task files when rules indicate

Cannot modify:
- `backend-architecture.md`
- `dashboard-architecture.md`
- `backend-stack-technology.md`
- `frontend-dashboard-stack-technology.md`
- `backend-coding-rules.md`
- `domain.md`
- `services.md`
- `repositories.md`
- `endpoints.md`

## Pages and components updates

When Task adds/modifies/removes a page: update `pages.md`.
When Task adds/modifies/removes a reusable component: update `components.md`.

## Coding rules evolution

If a general frontend rule is discovered during a Task: update `frontend-coding-rules.md`. Only general rules, not Task-specific decisions.

## Tech stack evolution

If a new package/library/dependency is added: update `frontend-public-web-stack-technology.md`.

## Architecture evolution

If an architectural decision must be modified: update `public-web-architecture.md`. Decisions beyond agent autonomy must be registered as a Task for review via `communication.md`.

## User Story correction

If a User Story is ambiguous, incomplete, or incorrectly defined: update the User Story. Record in Task that it was modified and why. Do not adapt User Story to implementation.

## API integration

Use only endpoints from `endpoints.md`. If an endpoint is missing:
1. Record the need in current Task
2. Create new Task for `api` per `communication.md`
3. Place in `planned/api/`
4. Indicate it blocks current Task
5. Move current Task to `public-web/blocked/`

## Autonomy

Agent has autonomy to decide implementation within constraints from:
- `project.md`
- `public-web-architecture.md`
- `frontend-public-web-stack-technology.md`
- `frontend-coding-rules.md`

No autonomy to modify higher-level decisions without registering via `communication.md`.

## Expected result

After each execution, system must be in one of these states:
- Task completed (`pending` -> `finished`)
- Task blocked (`pending` -> `blocked`)

Both states must contain sufficient information to reconstruct what happened. Execution must be reproducible from persistent project artifacts, not conversation history.

When a Task moves to `finished`, record the execution result inside the Task file. Minimum: what was implemented, what was changed, relevant decisions, notes for future reference. The Task file must be a complete work record from start to finish.
