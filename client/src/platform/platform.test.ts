import { describe, expect, it } from "vitest";
import { createApiMeta, failureResult, unwrapApiResult } from "./errors";
import type { TenantContext } from "./contracts";
import { assertTenantScope, canAccess, requirePermission } from "./tenant";

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
