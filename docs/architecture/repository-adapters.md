
## Orchestration extensions

`client/src/platform/orchestration.ts` adds preview contracts for published workflow versions and SLA policies. Both are tenant-scoped; SLA reads additionally require `sla.read`. These interfaces are intended to be replaced by PostgreSQL-backed repositories while preserving API envelopes and authorization decisions.
