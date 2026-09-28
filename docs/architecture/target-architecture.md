# C-Service Hub — Target Architecture

**Target posture:** Arabic/English, multi-tenant, API-first, modular monolith with extraction seams.

## Architectural direction

C-Service Hub should evolve from the current static React prototype into a modular monolith first. The platform should keep clear domain boundaries and event contracts so high-scale workloads can later extract into services without prematurely introducing distributed-system complexity.

```mermaid
flowchart LR
  Web[React Web Experiences\nArabic / English / RTL / LTR] --> BFF[API / BFF Layer]
  BFF --> Identity[Identity & Tenant Context]
  BFF --> Domains[Domain Modules]
  Domains --> DB[(PostgreSQL)]
  Domains --> Cache[(Redis)]
  Domains --> Files[S3-compatible Files]
  Domains --> Search[Search Abstraction]
  Domains --> Events[Outbox / Event Bus]
  Events --> Workers[Workers & Notifications]
  Workers --> Email[Email / External Channels]
  Workers --> Reports[Reporting & Exports]
  AI[AI Assistance Gateway] --> BFF
  AI --> Domains
  Audit[Immutable Audit Stream] <-- Domains
```

## Frontend architecture

Keep React and TypeScript, but establish feature boundaries rather than page-only boundaries:

- `app`: providers, routing, error boundaries, locale negotiation, auth bootstrap.
- `features`: customer portal, case management, agent workspace, incidents, changes, knowledge, administration, reporting.
- `entities`: case, customer, organization, service, SLA, workflow, approval, attachment, audit event.
- `shared`: design system, API client, schemas, date/number formatting, accessibility, localization.
- `mocks`: explicit local adapters used only in preview/story mode.

The production client should consume typed API contracts. Every mutation should expose loading, success, validation, permission-denied, conflict, and server-error states. Locale must be a first-class request context and must format Arabic/English text, dates, numbers, relative time, and mixed identifiers consistently.

## Backend modular monolith

Preferred future backend modules are Identity, Tenancy, Organization, Customer, Contract, Entitlement, Product, Module, Service Catalog, Dynamic Forms, Case Management, Incident, Major Incident, Problem, Known Error, Change, Approval, Workflow, SLA, Assignment, Queues, Routing, Knowledge, Notification, Automation, Audit, Integration, Search, AI, and Reporting.

Each module should own application commands/queries, domain rules, persistence repositories, API DTOs, authorization checks, emitted domain events, and tests. Cross-module writes must go through application services or events rather than direct table access.

## Persistence and infrastructure

PostgreSQL is the system of record. All tenant-owned tables require `tenant_id`, UUID primary keys, audit timestamps, actor references, indexes for common query paths, and soft deletion where business retention requires it. Redis is reserved for rate limits, short-lived cache, idempotency keys, locks, and job coordination. Attachments use an S3-compatible abstraction with classification, malware-scan state, metadata, size/type controls, and signed download URLs. Search uses an OpenSearch/Elasticsearch-compatible abstraction and applies tenant, permission, and security-classification filters before returning results.

Use an outbox table and worker process for reliable integration events, notifications, SLA timers, escalations, report exports, and search indexing. Avoid sending email or publishing external events inside the same request transaction.

## Identity, tenancy, and authorization

The request context must resolve authenticated principal, tenant, organization scope, locale, timezone, roles, permissions, and security clearance before business handlers run. Authorization should combine RBAC for coarse access with resource/organization policies for tenant and government hierarchy boundaries. Every read and mutation should be auditable, and sensitive operations such as impersonation or emergency access require explicit reason, expiry, elevated permission, and immutable audit events.

## API contract

Use versioned REST or typed RPC endpoints with OpenAPI/JSON Schema artifacts. Validate all input at the boundary, return stable error codes with localized message keys, support idempotency for mutations, include correlation IDs, and implement cursor pagination for large collections. Webhooks and external integrations should use signed requests and replay protection.

## Observability and delivery

Production should emit structured logs, metrics, traces, correlation IDs, audit events, queue depth, SLA timer health, and integration failure signals. CI/CD should run formatting, type checks, unit tests, integration tests, accessibility checks, build, dependency/security scanning, migration validation, and preview deployment before promotion.

## Migration strategy from the prototype

Preserve the current UI as the visual reference and progressively replace local adapters with API adapters. Start with Identity/Tenancy and a read-only case endpoint, then add case mutations, attachments, approvals, SLA calculation, workflow persistence, and notifications. No screen should claim persistence until it is backed by a server contract and permission path.
