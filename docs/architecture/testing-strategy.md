# C-Service Hub — Foundation Testing Strategy

**Status:** Phase 1 contract tests; end-to-end backend coverage is still pending.

## Current quality gate

The project now exposes `pnpm test` for Vitest and `pnpm test:watch` for local iteration. The first suite lives beside the platform contract boundary and verifies:

- Tenant scope accepts same-tenant resources.
- Cross-tenant resources are rejected with a stable violation code.
- Permission checks require both a granted capability and valid tenant scope.
- API metadata includes request ID, timestamp, and locale.
- Success envelopes unwrap predictably.
- Failure envelopes become stable `PlatformApiError` instances with machine code, message key, and request ID.

These tests validate the contract helpers. They do not claim server-side authorization because no backend exists yet.

## Required gates as the platform grows

Every pull request should run formatting, TypeScript validation, unit tests, integration tests against a disposable PostgreSQL database, accessibility checks, production build, dependency scanning, migration validation, and route-level browser smoke tests. Security-sensitive modules additionally require tenant-isolation tests, permission matrix tests, audit-event assertions, and negative tests for IDOR and privilege escalation.

## Test layers

The unit layer covers pure domain rules, locale formatting, API schemas, policy decisions, and workflow validation. The integration layer covers repositories, transactions, outbox behavior, tenant predicates, and migration constraints. The contract layer validates API schemas and localized error keys. The browser layer covers customer, agent, management, and administration journeys in English/LTR and Arabic/RTL. Load tests cover large case lists, search, exports, SLA workers, and workflow execution.
