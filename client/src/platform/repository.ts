import type { ApiResult, CaseListQuery, CaseSummary, CursorPage, TenantContext } from "./contracts";
import { createApiMeta, failureResult } from "./errors";
import { assertTenantScope } from "./tenant";

export interface CaseRepository {
  list(context: TenantContext, query?: CaseListQuery): Promise<ApiResult<CursorPage<CaseSummary>>>;
  get(context: TenantContext, caseId: string): Promise<ApiResult<CaseSummary>>;
}

export class InMemoryCaseRepository implements CaseRepository {
  constructor(private readonly records: CaseSummary[]) {}

  async list(context: TenantContext, query: CaseListQuery = {}): Promise<ApiResult<CursorPage<CaseSummary>>> {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100);
    const normalizedSearch = query.search?.trim().toLowerCase();
    const scoped = this.records
      .filter((record) => record.tenantId === context.tenantId)
      .filter((record) => !query.status || record.status === query.status)
      .filter((record) => !query.priority || record.priority === query.priority)
      .filter((record) => !query.serviceId || record.serviceId === query.serviceId)
      .filter((record) => !normalizedSearch || `${record.caseNumber} ${record.title}`.toLowerCase().includes(normalizedSearch));

    const start = query.cursor ? Math.max(Number.parseInt(query.cursor, 10) || 0, 0) : 0;
    const items = scoped.slice(start, start + limit);
    const nextCursor = start + items.length < scoped.length ? String(start + items.length) : undefined;
    return { ok: true, data: { items, nextCursor, totalEstimate: scoped.length }, meta: createApiMeta(context.locale) };
  }

  async get(context: TenantContext, caseId: string): Promise<ApiResult<CaseSummary>> {
    const record = this.records.find((candidate) => candidate.id === caseId);
    if (!record || record.tenantId !== context.tenantId) {
      return failureResult(context.locale, "CASE_NOT_FOUND", "errors.case.notFound");
    }
    assertTenantScope(context, record.tenantId);
    return { ok: true, data: record, meta: createApiMeta(context.locale) };
  }
}
