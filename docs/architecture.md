# C-Service Hub — Architecture Baseline

**Status:** Phase 0 — repository audit and implementation kickoff  
**Date:** 2026-09-28  
**Scope:** Frontend baseline only; no backend functionality is claimed.

## 1. Product context

C-Service Hub is intended to become a multi-tenant enterprise service-management platform combining ITSM, customer service, incident operations, service catalog, SLA management, knowledge, approvals, audit, security, and AI-assisted operations.

The current project is a **high-fidelity frontend command-center prototype** for Classera Global. It is not yet a production service-management system and does not currently connect to a database, API, identity provider, search engine, queue, or object store.

## 2. Current repository findings

### Runtime and structure

- **Frontend:** React 19 + TypeScript + Vite 7.
- **Styling:** Tailwind CSS 4 with a hand-authored CSS design system in `client/src/index.css`.
- **Routing:** Wouter with a root dashboard route and a not-found route.
- **Components:** shadcn/Radix primitives are available under `client/src/components/ui/`; the dashboard currently uses a small number of custom composed primitives in `Home.tsx`.
- **Server:** `server/index.ts` is a static Express file server used to serve the built frontend. It is not an application API.
- **Shared layer:** `shared/` contains compatibility placeholders, not domain contracts yet.
- **State:** dashboard state is local React state. Mock cases, queues, metrics, experiences, and notifications are defined in the page module.
- **Validation:** `pnpm check` and `pnpm build` pass. The live preview and responsive desktop/mobile views have been verified.

### Working functionality already present

- Command-center dashboard with metrics, incident pulse, queue health, live case stream, escalation watch, and signal insight.
- Four experience previews: Command Center, Customer Portal, Agent Workspace, and Administration.
- Arabic/English switch with RTL/LTR direction handling.
- Smooth language-transition motion and `prefers-reduced-motion` fallback.
- Arabic translations for navigation, dynamic cases, queues, statuses, notifications, escalations, filters, and signal insights.
- Global search filtering and case filters.
- New-case draft modal with a clearly labeled UI-only draft flow.
- Responsive sidebar/content behavior and mobile case cards.

## 3. Architectural gaps and constraints

The following are intentionally **not implemented yet**:

- Authentication, SSO, MFA, OIDC, SAML, sessions, and tenant-aware authorization.
- Real tenant isolation and organization hierarchy.
- API endpoints, database migrations, PostgreSQL persistence, Redis, object storage, or search.
- Real case creation, assignment, routing, SLA timers, escalation jobs, notifications, or audit event persistence.
- Server-side validation and permission checks.
- Production observability, rate limiting, security headers, and deployment infrastructure.
- Unit, integration, and API test suites beyond the current TypeScript/build validation.

The frontend must not present mock actions as completed backend operations. New UI actions should continue to use explicit preview/draft language until the corresponding backend capability exists.

## 4. Decisions for the next phases

### Decision A — Preserve the current frontend scaffold

We will keep the current React/Vite static project instead of migrating to Next.js immediately. The current WebDev environment is already stable, the dashboard is working, and a migration would add risk without enabling a user-requested capability. The code will be organized so domain contracts and API adapters can be introduced later without replacing the visual system.

### Decision B — Introduce domain boundaries before adding more screens

The next implementation work should extract reusable models and view components from the monolithic dashboard page:

- `domain/cases` — case type, state, priority, owner, tenant, and presentation copy.
- `domain/queues` — queue health and routing metadata.
- `domain/incidents` — incident pulse, major-incident signals, and escalation windows.
- `domain/experiences` — command, customer, agent, and administration experiences.
- `i18n` — shared translation dictionaries and locale helpers rather than page-local translation objects.

### Decision C — API-first contracts without fake integrations

Before connecting a backend, define TypeScript DTOs and UI states for loading, empty, error, permission denied, and success. Until an API exists, use a clearly named `mock`/`preview` adapter. Do not imply that local state is persisted.

### Decision D — Tenant context is a first-class boundary

All future data contracts should carry tenant/organization context explicitly. UI copy and navigation should treat the active workspace as context, not as a hard-coded global assumption.

### Decision E — Arabic and English remain first-class

New features must ship with both locales, preserve semantic status values, support RTL/LTR layout, and include transition/reduced-motion behavior where the interaction changes the page direction.

## 5. Proposed implementation sequence

### Phase 1 — Frontend domain foundation

1. Extract shared TypeScript domain types and mock adapters from `Home.tsx`.
2. Extract translation dictionaries and locale utilities.
3. Add reusable loading, empty, error, and permission-denied states.
4. Preserve visual parity and existing interactions.

### Phase 2 — Case workspace vertical slice

1. Build a real case-list route using the domain adapter.
2. Add case details, activity timeline, assignment, status, priority, and tenant context.
3. Keep mutations as preview/draft actions until an API is available.
4. Add Arabic/English coverage and responsive states.

### Phase 3 — Customer and agent experiences

1. Turn the existing experience previews into navigable, distinct UI surfaces.
2. Add customer request intake and agent queue ownership flows using mock adapters.
3. Add permission-aware UI states and audit-preview events.

### Phase 4 — Backend-ready contracts

1. Define API DTOs, error envelopes, pagination, filters, and idempotency expectations.
2. Add backend modules only when the environment and scope explicitly require them.
3. Add database migration, authorization, audit, and integration tests alongside each capability.

### Phase 5 — Enterprise hardening

1. Tenant isolation and policy evaluation.
2. SSO/MFA readiness and security controls.
3. Search, files, workflow automation, SLA timers, notification delivery, observability, and deployment controls.

## 6. Completion criteria for each future feature

Every feature should include, as applicable:

- Domain model and UI contract.
- Arabic and English copy with RTL/LTR verification.
- Loading, empty, error, and permission-denied states.
- Responsive desktop and mobile behavior.
- Clear distinction between preview/mock and persisted behavior.
- Validation and permissions.
- Audit event design.
- Unit or integration tests appropriate to the layer.
- Updated documentation and a meaningful checkpoint/commit.

## 7. Current phase result

Phase 0 has established the baseline, documented the architecture decision to preserve the current frontend scaffold, and defined a staged path toward a domain-driven enterprise platform without claiming backend functionality that does not exist yet.
