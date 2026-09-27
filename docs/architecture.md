
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
