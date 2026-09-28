# C-Service Hub — API Contract Foundation

**Status:** Phase 1 foundation contract; transport and persistence are not implemented yet.

## Contract goals

The current frontend prototype needs a stable boundary before local preview adapters are replaced with live data. The first contract slice lives in `client/src/platform/contracts.ts` and defines the shapes that future REST/RPC adapters must preserve.

## Envelope

Every response uses a discriminated result:

```ts
type ApiResult<T> =
  | { ok: true; data: T; meta: ApiMeta }
  | { ok: false; error: ApiError; meta: ApiMeta };
```

`ApiMeta` carries `requestId`, `generatedAt`, and the response locale. Errors carry a stable machine `code`, a localized `messageKey`, optional structured details, and a `retryable` hint. The UI must translate `messageKey` rather than display server-authored prose directly.

## Request context

The server-side implementation must resolve authenticated user, tenant, organization scope, locale, timezone, permissions, and security classification before a handler executes. The current TypeScript contract represents this as `TenantContext` so client adapters and future API middleware agree on the required dimensions.

## Initial resources

The foundation defines contracts for:

- Cursor-paginated case summaries and query filters.
- Versioned workflow nodes and publication state.
- Audit events with actor, tenant, resource, timestamp, request, and details.
- Security classification and locale values.

These are intentionally small contracts. They are not database models and do not authorize access by themselves.

## API rules for the next phase

1. Every tenant-owned endpoint requires tenant context and a permission decision.
2. List endpoints use cursor pagination and bounded limits.
3. Mutations accept an idempotency key and return a request ID.
4. Validation failures return stable field-level details and locale-aware message keys.
5. Permission failures do not reveal whether an inaccessible resource exists.
6. Optimistic concurrency uses a version or ETag and returns a conflict code.
7. Long-running exports, notifications, and workflow runs return a job reference and use the outbox/worker path.
8. API adapters must preserve the same envelope for success, domain failure, validation failure, and transport failure.
