import { describe, expect, it } from "vitest";
import { createApiMeta, failureResult, unwrapApiResult } from "./errors";
import type { TenantContext } from "./contracts";
import { assertTenantScope, canAccess, requirePermission } from "./tenant";
import { InMemoryCaseRepository } from "./repository";

const context: TenantContext = {
  tenantId: "tenant-classera",
  tenantSlug: "classera",
  organizationId: "org-global",
  userId: "user-sarah",
  locale: "en",
  timezone: "Asia/Riyadh",
  permissions: ["cases.read", "workflow.read"],
  securityClassification: "internal",
};

describe("tenant and permission contract", () => {
  it("allows a resource inside the active tenant", () => {
    expect(() => assertTenantScope(context, "tenant-classera")).not.toThrow();
  });

  it("rejects a resource from another tenant", () => {
    expect(() => assertTenantScope(context, "tenant-other")).toThrow("TENANT_SCOPE_VIOLATION");
  });

  it("requires both permission and tenant scope", () => {
    expect(canAccess(context, { permission: "cases.read", resourceTenantId: "tenant-classera" })).toBe(true);
    expect(canAccess(context, { permission: "cases.update", resourceTenantId: "tenant-classera" })).toBe(false);
    expect(canAccess(context, { permission: "cases.read", resourceTenantId: "tenant-other" })).toBe(false);
    expect(() => requirePermission(context, { permission: "workflow.publish" })).toThrow("PERMISSION_DENIED");
  });
});

describe("API result contract", () => {
  it("creates a request-scoped metadata envelope", () => {
    const meta = createApiMeta("ar", "req-123");
    expect(meta).toEqual({ requestId: "req-123", generatedAt: expect.any(String), locale: "ar" });
  });

  it("unwraps success results", () => {
    expect(unwrapApiResult({ ok: true, data: { count: 3 }, meta: createApiMeta("en", "req-1") })).toEqual({ count: 3 });
  });

  it("turns failure results into stable PlatformApiError values", () => {
    const result = failureResult<{ id: string }>("ar", "CASE_FORBIDDEN", "errors.case.forbidden", { resourceId: "case-1" });
    expect(() => unwrapApiResult(result)).toThrow("errors.case.forbidden");
    try {
      unwrapApiResult(result);
    } catch (error) {
      expect(error).toMatchObject({ code: "CASE_FORBIDDEN", messageKey: "errors.case.forbidden", requestId: expect.any(String) });
    }
  });
});

describe("case repository contract", () => {
  const repository = new InMemoryCaseRepository([
    { id: "case-1", caseNumber: "CS-1001", tenantId: "tenant-classera", title: "Login issue", type: "incident", status: "new", priority: "p1", createdAt: "2026-09-28T00:00:00Z", updatedAt: "2026-09-28T00:00:00Z", securityClassification: "internal" },
    { id: "case-2", caseNumber: "CS-1002", tenantId: "tenant-classera", title: "Catalog request", type: "service_request", status: "in_progress", priority: "p2", createdAt: "2026-09-28T00:00:00Z", updatedAt: "2026-09-28T00:00:00Z", securityClassification: "internal" },
    { id: "case-other", caseNumber: "CS-9001", tenantId: "tenant-other", title: "Other tenant case", type: "incident", status: "new", priority: "p1", createdAt: "2026-09-28T00:00:00Z", updatedAt: "2026-09-28T00:00:00Z", securityClassification: "internal" },
  ]);

  it("never lists records from another tenant", async () => {
    const result = await repository.list(context, { limit: 100 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.items.map((item) => item.id)).toEqual(["case-1", "case-2"]);
  });

  it("returns a stable not-found result for an inaccessible record", async () => {
    const result = await repository.get(context, "case-other");
    expect(result).toMatchObject({ ok: false, error: { code: "CASE_NOT_FOUND", messageKey: "errors.case.notFound" } });
  });

  it("supports bounded filters and cursor pagination", async () => {
    const filtered = await repository.list(context, { search: "catalog", limit: 1 });
    expect(filtered.ok).toBe(true);
    if (filtered.ok) expect(filtered.data.items[0]?.caseNumber).toBe("CS-1002");
    const firstPage = await repository.list(context, { limit: 1 });
    expect(firstPage.ok).toBe(true);
    if (firstPage.ok) {
      expect(firstPage.data.nextCursor).toBe("1");
      const secondPage = await repository.list(context, { limit: 1, cursor: firstPage.data.nextCursor });
      expect(secondPage.ok).toBe(true);
      if (secondPage.ok) expect(secondPage.data.items[0]?.id).toBe("case-2");
    }
  });
});
