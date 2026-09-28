# C-Service Hub — Current State

**Discovery date:** 2026-09-28  
**Repository:** `/home/ubuntu/c-service-hub`  
**Status:** Phase 0 discovery complete; implementation is currently a static React vertical-slice prototype.

## Executive summary

C-Service Hub currently delivers a polished client-only service-operations experience on top of the WebDev static React template. It contains bilingual English/Arabic presentation, RTL/LTR page direction, reusable UI primitives, local domain mock data, and several navigable preview slices:

- Management Command Center (`/`)
- Case Workspace (`/cases`)
- Customer Portal (`/portal`)
- Agent Workspace (`/agent`)
- Administration (`/admin`)
- Workflow Builder (`/automation`)

The repository is not yet an enterprise backend. There is no database, authentication provider, authorization enforcement, persistence layer, API module, job worker, object storage, search index, email channel, audit store, or CI/CD pipeline in this repository.

## Repository and runtime

- Vite + React 19 + TypeScript client.
- Wouter client-side routing.
- Tailwind 4 and shadcn-style Radix UI primitives.
- Express server placeholder that serves the built static client and handles SPA fallback.
- `pnpm check` passes TypeScript validation.
- `pnpm build` produces the client bundle and bundled Express static server.
- No test script is configured even though Vitest is present as a dependency.
- No `.github/workflows` directory was found.
- No environment schema or secrets-management contract was found.

## Frontend modules

### Application composition

- `client/src/App.tsx`: global providers and route table.
- `client/src/main.tsx`: React entry point.
- `client/src/index.css`: design tokens, base styles, responsive systems, and page-specific styles.
- `client/src/contexts/ThemeContext.tsx`: theme provider.
- `client/src/components/ErrorBoundary.tsx`: top-level render recovery.
- `client/src/components/StateNotice.tsx`: loading, empty, error, and permission presentation primitive.
- `client/src/components/Map.tsx`: prepared Maps integration component.
- `client/src/components/ui/*`: reusable Radix/shadcn component library.

### Pages and product slices

- `Home.tsx`: command center, experience switcher, metrics, queue health, alerts, bilingual dashboard data, and new-case preview modal.
- `CaseWorkspace.tsx`: case queue, search, filters, selected case detail, Activity/Attachments/Approvals tabs.
- `ExperienceWorkspace.tsx`: Customer Portal and Agent Workspace modes sharing one component boundary.
- `Administration.tsx`: tenant configuration, roles, workflows, SLA and audit-readiness preview.
- `WorkflowBuilder.tsx`: visual trigger/condition/action/approval workflow preview.
- `NotFound.tsx`: fallback route.

### Domain and localization

- `client/src/domain/dashboard.ts`: local case, queue, filter, and presentation data contracts.
- `client/src/domain/index.ts`: domain import boundary.
- `client/src/lib/i18n.ts`: typed `Locale`, small translation helper, navigation and experience dictionaries.
- Localization is currently presentation-oriented and partially centralized. It is not yet a message catalog with namespaces, interpolation, pluralization, date/number formatting, validation messages, server-side locale negotiation, or translation coverage checks.

## Backend, data, identity, and integrations

### Backend

`server/index.ts` only creates an Express server, serves static files, and falls back to `index.html`. It does not expose business APIs.

### Database/models

No PostgreSQL schema, ORM, migrations, entities, repositories, or models are present. The only shared constant is `COOKIE_NAME` in `shared/const.ts`; it is not connected to an authentication implementation.

### Authentication and authorization

No login, session validation, identity provider, MFA, SSO, tenant context, RBAC, ABAC, policy engine, permission middleware, impersonation, emergency-access flow, or audit enforcement exists in the repository. UI buttons are preview interactions and must not be treated as secure mutations.

### Files, search, notifications, and jobs

No S3 abstraction, malware scanning, OpenSearch/Elasticsearch adapter, email-to-case ingestion, notification preference store, event bus, queue worker, scheduled job, or background execution layer exists.

## Reusable assets and strengths

- Strong visual system already established: dark navy + mint operational palette, generous whitespace, responsive cards, subtle shadows, and consistent iconography.
- Reusable Radix UI primitives cover dialogs, forms, menus, tables, tabs, toasts, and accessibility foundations.
- `StateNotice` provides a useful starting point for explicit loading/empty/error/permission states.
- Domain data already has an import boundary rather than being spread across every page.
- Customer/agent experiences share a reusable implementation.
- Arabic/English switching and RTL/LTR have been verified on several routes.
- Static build and dev preview are healthy.

## Technical debt and architectural gaps

1. `index.css` has become a large page-style accumulation; feature styles should move toward colocated modules or a defined design-token layer.
2. `Home.tsx` remains a large orchestration component with embedded presentation data and preview behaviors.
3. `t(locale, english, arabic)` is a transitional helper, not a production i18n system.
4. Mock data and domain contracts are not separated into adapters and use-case services.
5. No API contract, schema validation boundary, error taxonomy, or request state model exists.
6. No tests cover routing, locale switching, RTL layout, case filtering, workflow editing, or permission states.
7. No persisted state means refresh loses workflow edits, language selection, case updates, and user context.
8. No tenant isolation can be enforced because tenant identity and storage are absent.
9. The static Express fallback is suitable for preview but not a production service boundary.
10. Dependency configuration contains a `pnpm` field warning under the installed pnpm version and should be normalized during foundation work.

## Phase 0 findings

The repository is a good frontend prototype foundation, not an enterprise platform foundation. The safest next phase is not to add more disconnected screens. It is to establish a modular-monolith backend contract, identity/tenant context, PostgreSQL migrations, API schemas, audit events, and a real localization contract while preserving the current UI as a reference implementation.
