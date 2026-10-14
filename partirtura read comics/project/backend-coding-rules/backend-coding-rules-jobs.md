# Backend Coding Rules � Jobs & Guardrails

## Background jobs

- A Hangfire job that mutates persistent state must be **idempotent**. Add `[DisableConcurrentExecution(timeoutInSeconds)]` to the method. Verify the `ContentStatus` (or equivalent state machine) before doing work. If the work is already done, exit early.
- A Hangfire job must batch its `SaveChanges` calls. Use a `BatchSize` constant. Default is 20.
- A Hangfire job that processes a file must clean up the file in a `finally` block. Use a try/catch around the cleanup so cleanup failures do not throw.
- A Hangfire job that processes a file must validate the file path with `CbrFileValidator.IsPathWithinTempRoot(path, contentRootPath)` to prevent path traversal.
- A Hangfire job that takes dependencies on scoped services (anything from the DbContext) must use a `using` scope inside the method. Injecting scoped services in the constructor is a leak (the audit found this pattern; the design is intentionally a single service-provider constructor for `CbrProcessingJob`).
- Background jobs are tests, even when they look hard. At minimum, verify the policy attributes, the batch size, the disable-concurrent timeout, and the queue name. Use reflection (`GetCustomAttributes`) in the test, not integration with Hangfire.

## Refactor guardrails (learned the hard way)

These rules were added after the 2026-09-03 audit. They prevent the kinds of drift that produced 30 findings.

- **No silent `catch {}` blocks.** A catch that does not log is hiding a bug. If the catch is needed for control flow, document it in a comment and log at the appropriate level.
- **No new ad-hoc helpers when one already exists.** Check `Application/Helpers/`, `Infrastructure/Persistence/`, `Api/Helpers/`, `Api/Middleware/`. The audit found 6 helpers extracted that were not yet migrated to all call sites — do not add a duplicate.
- **No new public method on a service without a test.** If you cannot write a test for it (e.g. it requires a real DB), document that in the PR description and reference the corresponding `OPEN` item in `refactor-audit-2026-09-03.md`.
- **No service over 250 lines or with more than 7 dependencies.** Split it. The audit found `NumberService` at 691 lines / 13 dependencies; we split it into 4 services. Apply the same discipline proactively.
- **No new `try/catch` without `ILogger` injected.** Every service that has a try/catch must have access to a logger. The audit fixed 2/9 services. Apply the rule to new code without waiting for the migration.
- **No new EF query without `AsNoTracking` (reads) and `AsSplitQuery` (3+ Includes).** The default must be tracking-off and split-on. The audit added these to 5 existing queries; do not add new ones without them.
- **No new endpoint without the right HTTP status code.** POST creates → 201 with `Location`. Validation failure → 422. Auth failure → 401. The audit fixed `AdminNumbersController.Create` and the global exception handler; the other 8 admin POSTs still need migration.
- **No new FK without an index.** Every `HasOne(...).HasForeignKey("X")` must be followed by `HasIndex("X")` in the same configuration.
- **No `string.IsNullOrWhiteSpace(x) throw ValidationException(...)` in services.** Use `Guard.RequireNotEmpty(x, "x")`. The audit created the helper; use it.
- **No inline `$"/images/{image.Id}"`.** Use `ImageUrlBuilder.ToUrl(image)`.
- **No hardcoded retry counts, timeouts, magic numbers in jobs.** Use named constants at the top of the file (the audit added `BatchSize` and `DisableConcurrentExecutionTimeoutSeconds` to `CbrProcessingJob`).
- **No new top-level service that is really a partial of an existing one.** If you find yourself adding a method to a service that is unrelated to the service's name, you have a new service. Extract it.
- **No "while I'm here" refactors.** The rules say "minimal changes". A PR that fixes a bug in `NumberService` must not also reformat `FranchiseService`. If you see a refactor opportunity, write it down for the next task.

## Agent rules

- Respect these rules.
- Maintain existing architecture.
- No new patterns without justification.
- No replace existing abstractions without explicit decision.
- No arbitrary public contract changes.
- No duplicate existing logic.
- Consistent nomenclature.
- **Run tests after every change.** The minimum is `dotnet test` on the projects you touched. If you touched the API, also `dotnet build` on `api/Api/Api.csproj` to confirm 0 errors.
- Fix errors introduced by own changes.
- No unrelated modifications.
- No general refactors not needed for the task.
- Minimal changes. Minimize impact area.

## Code quality

Clarity, consistency, single responsibility, explicit naming, strong typing, predictable behavior, separation of concerns, minimal coupling, high cohesion, no hidden behavior, no unnecessary abstractions, no business logic in UI. Code must be understandable and maintainable by another developer or agent without knowing who wrote it.
