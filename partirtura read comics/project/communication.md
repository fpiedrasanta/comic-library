# Communication

## Purpose

Defines communication and coordination mechanism between humans and agents. Persistent project communication uses **Tasks stored in the filesystem**. No separate messaging system. Filesystem is the persistent work record.

## Core principle

All work is represented by a Task. A Task has a single responsible agent. Task location in the filesystem determines its state. State is not stored inside the Task file.

## States

- **planned**: Defined but not yet authorized for execution. Requires human review before moving to `pending`. Agents must not start `planned` Tasks.
- **pending**: Authorized for execution. Agent can take when appropriate.
- **blocked**: Cannot continue because it depends on unfinished work. Must indicate: blocking Task, that Task's assignee, completed work, pending work. Can become blocked at any point. Previous work is preserved.
- **finished**: Completed. Can only move to `finished` when all acceptance criteria are met.

## Task hierarchy

```
backlog/
└── epic-01/
    └── us-0001/
        ├── api/
        │   ├── planned/
        │   ├── pending/
        │   ├── blocked/
        │   └── finished/
        ├── public-web/
        └── dashboard/
```

Projects: `api`, `public-web`, `dashboard`.

## Task as work unit

A Task represents concrete work an agent can understand, execute, verify, and complete. Too-large Tasks must be decomposed.

## Task identification

Unique format: `TASK-0001`. ID never changes when state changes. File moves between folders.

## Task content

Minimum required:
- Task ID
- Title
- Description
- Expected result
- Relevant context
- Dependencies
- Acceptance criteria

Must preserve progress info when blocked. State is not part of file content.

## State transitions

Normal: `planned` -> `pending` -> `finished`.
Blocked: `pending` -> `blocked` -> `pending` -> `finished`.

## Human authorization

`planned` -> `pending` requires human approval. Agents must not automatically take `planned` Tasks.

## Agent-generated Tasks

Agents can create new Tasks when discovering necessary work. New Tasks start in `planned`. The creating agent must not move it directly to `pending`. Must include: reason, origin Task, requested work, expected result, necessary info, known dependencies, acceptance criteria.

## Dependencies

A Task can depend on another Task. If dependency is unavailable, the dependent Task moves to `blocked` AND a new Task must be created in `planned` for the missing dependency.

## Blocked Tasks

When a Task becomes blocked, the agent MUST create a new Task in `planned` for the work needed to unblock it. This is not optional.

The blocking Task must indicate:
- Blocking Task
- Blocking Task assignee
- Completed work
- Pending work

Destination:
- If for the human: same project folder in `planned` with `Assignee: Human`.
- If for another agent: corresponding project folder in `planned` with `Assignee: Agent`.

Must be comprehensible by reading the Task alone.

## Unblocking

When blocking Task is finished, blocked Task returns to `pending`. Agent continues from registered progress. No repeated work.

## Bugs

Defects found during testing are represented as Tasks. Specialized Task format: `BUG-001`. Uses same state system. Tester creates Bug with: expected behavior, observed behavior, reproduction steps, expected result, obtained result, affected project, responsible assignee.

## Human communication

Human primarily controls `planned` Tasks. Agents propose work by creating Tasks in `planned`. Human decides: `planned` -> `pending`.

## Chat is not source of truth

Chat is interactive communication only. Instructions that generate work must become persistent Tasks. Project must not depend on conversation history.

## Traceability

All Tasks originating from another Task must reference their origin. Traceability must be maintained across state changes.

## Movement rules

- `planned` -> `pending`: Requires human authorization.
- `pending` -> `blocked`: Agent can do when real dependency detected.
- `blocked` -> `pending`: Agent can do when dependency resolved.
- `pending` -> `finished`: Agent can do when acceptance criteria met.

Never move a Task to `finished` to hide pending work. Never move Tasks to hide problems. If stuck: `pending` -> `blocked` or create new Task in `planned`.

## Task completion record

When a Task moves to `finished`, the agent MUST record the execution result inside the Task file. This is not optional.

Minimum required:
- What was implemented
- What was changed (files, endpoints, components, etc.)
- Relevant decisions made during execution
- Any relevant notes for future reference

The Task file must remain a complete work record from start to finish, not just from start to blocking.

## Final principle

Work moves by filesystem.

```
PLANNED -> (human approval) -> PENDING -> (dependency) -> BLOCKED
PENDING -> (finished) -> FINISHED
BLOCKED -> (dependency resolved) -> PENDING
```

Agents read available Tasks, perform work, record necessary progress, and move to corresponding state. Filesystem allows knowing what work is defined, authorized, blocked, and finished without conversation history.
