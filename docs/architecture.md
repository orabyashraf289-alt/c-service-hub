
## 8. Phase 1 implementation note

Phase 1 has started with a backward-compatible frontend domain foundation:

- `client/src/domain/dashboard.ts` now owns dashboard case and queue types, mock adapter data, filter definitions, and Arabic presentation copies.
- `client/src/domain/index.ts` provides a stable import boundary for future domain modules.
- `client/src/components/StateNotice.tsx` provides reusable loading, empty, error, and permission-denied presentation states. The case stream now uses the empty-state variant.
- The existing dashboard visuals, Arabic/English switching, RTL/LTR behavior, filters, search, and preview-only actions remain intact.
- The current data adapter is intentionally local/mock and is not presented as persisted backend functionality.

The next step is to extract the remaining visual data (metrics and experience metadata), centralize locale helpers, and then build the first navigable Case Workspace slice on top of the domain contracts.

## 9. Incremental delivery: Case Workspace slice

The first navigable vertical slice is now available at the `/cases` route. It uses the shared dashboard case contracts, supports case search and queue filters, keeps a selected case detail panel visible for triage, and includes an activity timeline with explicit preview-only messaging for actions that still require an API. The existing dashboard navigation now opens this route instead of showing only a placeholder toast.

Locale behavior is being moved into `client/src/lib/i18n.ts`. The new helper exposes a typed locale, a small `t` function, shared navigation copy, experience copy, and reusable case type/state translations. This keeps the current UI stable while making future pages use the same Arabic/English vocabulary.

## 10. Incremental delivery: customer and agent experiences

The Customer Portal and Agent Workspace now have dedicated routes and share one reusable experience-page implementation. The customer route focuses on guided service discovery, service-intake paths, and request history. The agent route focuses on priority work, SLA watch, resolution counts, queue balance, and a Copilot summary entry point.

Both routes use the same domain cases, locale helper, Arabic translations, preview-only action messaging, responsive layout rules, and RTL/LTR direction. They intentionally stop short of persistence, customer identity, agent permissions, or live routing because those require the future API and authorization phases.

## 11. Incremental delivery: detail tabs and administration

Case Workspace now includes localized Activity, Attachments, and Approvals tabs. Activity keeps the current timeline and reply affordance; Attachments and Approvals provide explicit, useful preview states until storage and approval APIs exist.

Administration now has a dedicated route with tenant configuration, organization hierarchy, service catalog, workflow controls, SLA policies, team roles, and audit readiness. The screen is intentionally a safe read-oriented preview: mutation actions surface the next API/permissions phase rather than pretending to persist changes.

## 12. Incremental delivery: visual Workflow Builder

Automation now has a dedicated `/automation` route with a visual incident-priority workflow canvas. The slice supports selectable trigger, condition, action, and approval nodes; an inspector for the selected rule; draft publishing feedback; add/remove step interactions; guardrail messaging; and linked SLA context.

The builder remains a frontend preview by design. Publishing is represented as a reversible local state and toast until workflow persistence, permission checks, versioning, and audit events are backed by the API layer.

## 13. Phase 0 discovery and architecture baseline

The attached enterprise brief required a formal discovery pass before adding more product screens. Phase 0 is now documented in:

- `docs/architecture/current-state.md`
- `docs/architecture/target-architecture.md`
- `docs/architecture/domain-map.md`
- `docs/roadmap/implementation-roadmap.md`

The findings confirm that the current repository is a strong bilingual frontend prototype with navigable vertical slices, but it does not yet contain backend persistence, identity, authorization, tenant isolation, database models, API contracts, workers, search, storage, notifications, or CI/CD. The roadmap therefore prioritizes platform foundation and security boundaries before replacing preview adapters with live data.

### Completed

Repository and frontend module inventory, backend boundary review, localization review, authentication/authorization review, testing and CI/CD review, reusable-component inventory, technical-debt register, target architecture, domain map, and phased implementation roadmap.

### Risks

The largest risks are treating preview interactions as real persistence, building additional screens before tenant and permission boundaries exist, and allowing localization to remain a helper instead of a complete message/formatting contract. These are recorded as explicit exit criteria in the roadmap.

### Recommended next step

Begin Phase 1 with backend/module scaffolding, environment validation, API/error conventions, database migration tooling, outbox/audit contracts, and automated tests while preserving the current UI as the reference surface.

## 14. Phase 1 foundation: contracts and security baseline

The first Phase 1 slice adds a typed platform boundary without pretending that a backend exists. `client/src/platform/` now defines tenant/request context, API success and failure envelopes, cursor pagination, case summaries, workflow versions, audit events, stable API error handling, and preview-safe permission/tenant-scope helpers.

The supporting architecture documents are now available at `docs/architecture/api-contracts.md`, `docs/architecture/data-model.md`, and `docs/architecture/security-model.md`. They define the contract and guardrails for the future modular monolith, PostgreSQL migrations, tenant isolation, audit stream, outbox, attachment security, and authorization pipeline. The existing domain export boundary was intentionally left unchanged after validation to avoid coupling platform contracts to presentation-domain inference.

This remains a foundation contract only. No authentication, database, API endpoint, permission enforcement, or persistence claim is made in the static project.
