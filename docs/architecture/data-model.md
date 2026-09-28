# C-Service Hub — Initial Data Model

**Status:** Phase 1 logical model; migrations and repositories are not implemented yet.

## Modeling rules

PostgreSQL is the planned system of record. Tenant-owned records use UUID primary keys, `tenant_id`, `created_at`, `updated_at`, actor references, and explicit lifecycle fields. Business deletes are soft deletes where retention or audit requirements apply. Every repository method must require tenant context; unscoped access is a design error.

## Core tables

| Table | Ownership | Important relationships |
|---|---|---|
| `tenants` | Global | Owns all tenant-scoped records |
| `organizations` | Tenant | Parent/child government or enterprise hierarchy |
| `users` | Global/identity | Linked to memberships and external identity providers |
| `tenant_memberships` | Tenant | User, organization scope, role, status |
| `roles` / `permissions` | Tenant or platform | RBAC grants and policy mapping |
| `customers` | Tenant | Person or organization customer profile |
| `contracts` / `entitlements` | Tenant | Customer access to products/services and support levels |
| `products` / `modules` / `services` | Tenant | Catalog hierarchy and service ownership |
| `request_types` / `form_definitions` | Tenant | Versioned service intake configuration |
| `cases` | Tenant | Requester, organization, service, queue, SLA, parent relation |
| `case_events` / `case_comments` | Tenant | Timeline, visibility, actor, localized content references |
| `attachments` | Tenant | Resource reference, classification, scan state, metadata |
| `sla_policies` / `sla_instances` | Tenant | Policy version, timers, pauses, breaches, escalation |
| `queues` / `routing_rules` | Tenant | Skills, assignment, priority and organization scope |
| `workflows` / `workflow_versions` | Tenant | Immutable configuration versions and publication state |
| `workflow_runs` | Tenant | Execution state, idempotency, node transitions, failures |
| `approvals` | Tenant | Resource, approver policy, decision, reason, timestamps |
| `knowledge_articles` | Tenant | Localized content, audience, publication and classification |
| `notifications` / `notification_preferences` | Tenant | Channel, locale, delivery state, user preferences |
| `audit_events` | Tenant/global | Actor, action, resource, request, immutable details |
| `outbox_events` | Tenant/global | Reliable event publication and retry metadata |

## Required indexes

At minimum, index `(tenant_id, updated_at)` on operational resources, `(tenant_id, status, priority)` on cases, `(tenant_id, organization_id)` on organization-scoped resources, `(tenant_id, case_number)` for case lookup, `(tenant_id, workflow_id, version)` for configuration, and `(tenant_id, occurred_at)` on audit events. Partial indexes should exclude soft-deleted rows from normal reads.

## Retention and integrity

Foreign keys must protect tenant boundaries and prevent orphaned configuration. Configuration publication creates immutable versions instead of overwriting live rules. Audit and outbox records use append-only semantics. Retention policies must be explicit by resource type and jurisdiction; hard deletion requires a controlled, audited process.

## Migration order

Create tenant and identity tables first, then organizations and membership, then catalog/commercial records, then cases and operational extensions, then workflow/SLA/approval, and finally communication, reporting, search projections, and integrations. Each migration should be reversible where safe and validated in CI against a clean database.
