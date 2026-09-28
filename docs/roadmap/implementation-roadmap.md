# C-Service Hub — Implementation Roadmap

**Roadmap status:** discovery baseline created; no backend implementation is claimed complete.

## Phase 0 — Discovery & Architecture

**Completed in this increment:** repository inventory, current-state report, target architecture, domain map, frontend/backend/auth/testing/CI review, technical-debt register, and risk identification.

**Exit criteria:** these documents reviewed; the team agrees that the existing UI is a prototype and the next work establishes foundation rather than adding disconnected screens.

## Phase 1 — Platform Foundation

Create the modular-monolith backend boundary, environment schema, structured logging, request correlation, OpenAPI/JSON Schema contract, error taxonomy, database migration tooling, and CI quality gates. Introduce PostgreSQL, Redis abstractions, an outbox contract, and a test harness. Normalize package-manager configuration and add unit/integration/accessibility test scripts.

## Phase 2 — Identity, Tenancy & Organization

Implement authenticated principal context, tenant resolution, organization hierarchy, membership, RBAC/permission model, locale/timezone preferences, session security, and audit events for access changes. Add tenant-scoped repositories and authorization tests before exposing sensitive data.

## Phase 3 — Commercial & Catalog Foundation

Implement customers, contracts, entitlements, products, modules, services, service catalog, request types, dynamic form definitions, publication/versioning, and tenant-visible catalog browsing. Replace Customer Portal mock service cards with read APIs.

## Phase 4 — Request & Case Foundation

Implement case numbering, localized fields, requester/organization/service relations, internal/customer statuses, priority/impact, case lifecycle, comments, customer visibility, attachments, and search-safe list/detail APIs. Replace the current Case Workspace mock adapter with server data and persistence.

## Phase 5 — Work Orchestration & SLA

Implement queues, skills, assignment, routing rules, business calendars, SLA policies, timers, escalations, approvals, saved views, and agent workload. Persist Workflow Builder definitions with immutable versions, validation, publish permissions, and execution history.

## Phase 6 — ITSM Operations

Add incident, major incident, incident communications, problem, known error, change, risk assessment, change approvals, relations, and operational dashboards. Support government support hierarchies and major-incident communication templates in both locales.

## Phase 7 — Customer, Agent & Knowledge Experiences

Harden Customer Portal navigation and request flows, Agent Workspace actions, Knowledge Center, announcements, service status, notification preferences, email templates, and email-to-case ingestion. Add Arabic/English validation, notifications, reports, and accessible keyboard workflows.

## Phase 8 — Automation & Integrations

Persist and execute workflow rules through workers/outbox, add webhooks, external ID mappings, integration connectors, signed callbacks, retry/dead-letter handling, and idempotency. Add audit coverage for every automation mutation and execution.

## Phase 9 — Search, Reporting & AI Assistance

Implement permission-aware search across cases, knowledge, customers, organizations, services, and products. Add report definitions, exports, dashboards, scheduled delivery, and AI assistance for summaries/classification/recommendations with source attribution, redaction, policy checks, and human confirmation.

## Phase 10 — Enterprise Hardening

Complete security classification, retention, soft-delete controls, access reviews, impersonation/emergency-access governance, rate limiting, malware scanning, disaster recovery, backup/restore, observability, performance testing, load testing, threat modeling, accessibility certification, localization coverage checks, and government readiness evidence.

## Work item definition of done

Every feature must have a domain contract, permission decision, tenant-isolation test, localized English/Arabic copy, RTL/LTR verification, loading/empty/error/permission states, audit behavior, API validation, unit/integration coverage, accessible interaction, documentation, and a clear statement of whether it is persisted or preview-only.

## Immediate next increment after Phase 0

Implement Phase 1 foundation artifacts without changing the existing visual product surface: add a backend module skeleton and API contract, introduce environment validation and error/correlation conventions, add database migration scaffolding, and establish automated tests for locale switching, tenant context, and case list behavior. Only after those foundations exist should preview routes be connected to live data.
