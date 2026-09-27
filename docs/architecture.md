
## 8. Phase 1 implementation note

Phase 1 has started with a backward-compatible frontend domain foundation:

- `client/src/domain/dashboard.ts` now owns dashboard case and queue types, mock adapter data, filter definitions, and Arabic presentation copies.
- `client/src/domain/index.ts` provides a stable import boundary for future domain modules.
- `client/src/components/StateNotice.tsx` provides reusable loading, empty, error, and permission-denied presentation states. The case stream now uses the empty-state variant.
- The existing dashboard visuals, Arabic/English switching, RTL/LTR behavior, filters, search, and preview-only actions remain intact.
- The current data adapter is intentionally local/mock and is not presented as persisted backend functionality.

The next step is to extract the remaining visual data (metrics and experience metadata), centralize locale helpers, and then build the first navigable Case Workspace slice on top of the domain contracts.
