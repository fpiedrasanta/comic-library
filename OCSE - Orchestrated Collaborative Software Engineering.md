# OCSE - Orchestrated Collaborative Software Engineering

## Purpose

Methodology for collaborative software development between human specialists and AI agents. Defines how work is organized, communicated, and executed.

## Core concept

Software is not written. It is composed.

The engineer's role: design, specify, direct construction.
The agent's role: interpret specifications and produce artifacts.

Code is a consequence of specifications, not the source of truth.

## Fundamental values

- **Composition over production**: Humans compose specifications. Agents produce artifacts.
- **Orchestration over direct production**: Specialists define, supervise, validate. Agents execute.
- **Knowledge as primary asset**: Quality of product depends on quality of specifications.
- **Specification limits**: Good implementation cannot fix ambiguous or incomplete specifications.

## Principles

### Philosophical

- **Abstraction**: High-level specifications replace manual code. Next natural step in abstraction evolution.
- **Competence**: Agents amplify human capability but never replace domain knowledge.
- **Composition**: All development starts with solid specification. Source code is a technical consequence.

### Engineering

- **Artifact homogeneity**: All project artifacts produced by agents under human supervision. Consistency in style, structure, and comprehension.
- **Specialization**: Each specialist defines specifications for their discipline. Agents interpret directives. Technical responsibility remains with humans.
- **Continuous validation**: Every agent-produced artifact must be reviewed and approved by responsible specialist before integration.

### Evolution

- **Continuous improvement**: Methodology evolves through project iterations. Specifications, agent interaction, and communication protocols are refined continuously.

## Orchestra model

- **Composer**: Defines vision, structure, intention (Product Owner, Architect).
- **Conductor**: Coordinates interpretation, ensures harmony (Scrum Master, Tech Lead).
- **Interpreters**: Execute their part within established framework (Agents).
- **Score**: Shared representation of intent (project documentation).
- **Work**: Final deliverable experienced by users (software product).

## Lifecycle

### 1. Composition

Build the score before development. No code is written yet.

Artifacts produced:
- `project.md` - Product vision, objectives, scope
- `architecture.md` - System structure, components, relationships, layer boundaries
- `technology-stack.md` - Languages, frameworks, databases, external services
- `coding-rules.md` - Naming, organization, patterns, error handling, security, testing
- `agents.md` - Agent definitions, responsibilities, input/output
- `communication.md` - Agent collaboration protocols
- `epic-xx.md` - Functional capabilities, acceptance criteria
- `user-story-xx.md` - Expected behavior, business rules, flows, error scenarios

Composition is a living asset. All documents evolve with the project.

### 2. Movements

Divide the work into functional deliveries. Each movement represents a complete capability.

- Not arbitrary feature collections
- Each movement forms a coherent functional unit
- Product is measured by movement evolution, not individual task completion

### 3. Rehearsals (Sprints)

Iterative refinement of a movement.

Ceremonies:
- **Planning**: Select User Stories for the rehearsal (Priority, Dependencies, Capacity). No detailed technical decomposition.
- **Tasks**: Specialists translate User Stories into execution specifications for agents. Defines expected result, constraints, validation criteria.
- **Interpretation**: Agents receive Task and score context to produce artifacts (code, UX, tests). Specialist supervises, validates, adjusts specification if deviations occur.
- **Daily**: Focus on coordination problems, specification ambiguities, missing context. Not activity reporting.
- **Review**: Present functional behavior to Product Owner and stakeholders. Validate if interpretation matches product intent.
- **Retrospective**: Evaluate human process, agent communication, score evolution. Incorporate learnings.

### 4. Presentation

When a movement reaches maturity, it is presented to users. This is not the end of work - it is the beginning of the next movement.

### 5. Evolution

Post-production: new needs emerge, business changes, technology evolves. Every change is an opportunity to improve the work starting from the score.

## Roles

### Human roles

- **Product Owner**: Product vision, business priorities, movement value.
- **Scrum Master**: Facilitate process, remove impediments, drive continuous improvement.
- **Functional Analyst**: Domain understanding, business needs, functional specifications.
- **Architect / Tech Lead**: System architecture, construction rules, technical decisions, score evolution.
- **UX/UI Specialist**: User experience, interaction design, functional requirements.
- **Frontend Specialist**: UI specifications, supervise generated client implementations.
- **Backend Specialist**: Business logic, APIs, persistence specifications, supervise generated server implementations.
- **QA Specialist**: Quality strategy, validation criteria, testing.

### Agents

Interpreters of the work. Each agent has a specialization and receives a score fragment plus context. Produce or update artifacts respecting specialist-defined rules. No business decisions. No architecture definition.

## Score structure

### Permanent knowledge

- `project.md` - Product vision
- `architecture.md` - System structure
- `coding-rules.md` - Technical standards
- `technology-stack.md` - Tech ecosystem
- `agents.md` - Agent definitions
- `communication.md` - Collaboration protocols
- `api-contract.md` - Unified API contract

### Evolutionary knowledge

- `decision-log.md` - Architectural and technical decisions
- `api-changelog.md` - API contract changes
- `release-notes.md` - Version notes by movement
- `sprint-retrospective.md` - Iteration learnings
- `api-request.md` - Formal API change requests

### Operational knowledge

- `epic-xx.md` - Functional capabilities
- `user-story-xx.md` - Detailed behavior specifications
- `task.md` - Concrete execution specifications for agents

## Communication

Deterministic protocols between agents. No informal communication. All coordination through filesystem-based score artifacts.

## Key rules

1. Specifications first. Code follows.
2. All artifacts produced by agents under human supervision.
3. Human specialists define, validate, and approve.
4. Agents interpret, never decide business or architecture.
5. Every change starts in the score, propagates to artifacts.
6. Movement-based delivery, not task-based.
7. Continuous validation before integration.
8. Score is living documentation, not snapshot.
