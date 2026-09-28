# C-Service Hub — Repository Adapter Boundary

**Status:** Phase 1 preview adapter; PostgreSQL implementation is not present.

`client/src/platform/repository.ts` defines the first repository boundary for case reads. `CaseRepository` accepts a trusted `TenantContext`, supports bounded filtering and cursor pagination, and returns the shared `ApiResult` envelope. `InMemoryCaseRepository` is intentionally a preview implementation used to exercise the contract without claiming persistence.

The adapter enforces tenant filtering before returning list results and returns the same not-found shape for a missing or cross-tenant case. This avoids revealing whether an inaccessible resource exists. It also clamps list limits to a safe range and keeps cursor behavior explicit.

The future PostgreSQL adapter must preserve this interface while adding transaction boundaries, indexed tenant predicates, organization policy checks, classification filtering, optimistic concurrency, and repository integration tests against migrations. UI features should depend on `CaseRepository`, not on the in-memory class, so swapping data sources does not require rewriting the experience layer.

This is a contract and testing slice only. The current static app does not persist case changes and does not provide server-side security enforcement.
