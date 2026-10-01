import { describe, expect, it } from "vitest";
import { createApiMeta, failureResult, unwrapApiResult } from "./errors";
import type { TenantContext } from "./contracts";
import { assertTenantScope, canAccess, requirePermission } from "./tenant";
import { InMemoryCaseRepository } from "./repository";
import { InMemoryOrchestrationRepository } from "./orchestration";

const context: TenantContext = {
  tenantId: "tenant-classera",
  tenantSlug: "classera",
  organizationId: "org-global",
  userId: "user-sarah",
  locale: "en",
  timezone: "Asia/Riyadh",
  permissions: ["cases.read", "workflow.read", "queues.read", "catalog.read", "knowledge.read", "organizations.read"],
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

describe("workflow and SLA repository contracts", () => {
  const repository = new InMemoryOrchestrationRepository([
    { id: "wf-1", workflowId: "workflow-incident", tenantId: "tenant-classera", version: 2, status: "published", nodes: [], createdBy: "user-sarah", createdAt: "2026-09-28T00:00:00Z", publishedAt: "2026-09-28T00:00:00Z" },
    { id: "wf-other", workflowId: "workflow-other", tenantId: "tenant-other", version: 1, status: "published", nodes: [], createdBy: "user-other", createdAt: "2026-09-28T00:00:00Z" },
  ], [
    { id: "sla-1", tenantId: "tenant-classera", name: "P1 response", priority: "p1", firstResponseMinutes: 15, resolutionMinutes: 240, escalationMinutes: 30 },
    { id: "sla-other", tenantId: "tenant-other", name: "Other SLA", priority: "p1", firstResponseMinutes: 10, resolutionMinutes: 60, escalationMinutes: 15 },
  ]);

  it("returns only published workflows inside the active tenant", async () => {
    const result = await repository.listPublished(context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.map((item) => item.id)).toEqual(["wf-1"]);
  });

  it("requires SLA permission and tenant scope", async () => {
    const result = await repository.list({ ...context, permissions: ["cases.read"] });
    expect(result).toMatchObject({ ok: false, error: { code: "SLA_FORBIDDEN" } });
    const allowed = await repository.list({ ...context, permissions: ["sla.read"] });
    expect(allowed.ok).toBe(true);
    if (allowed.ok) expect(allowed.data.map((item) => item.id)).toEqual(["sla-1"]);
  });

  it("returns only queues inside the active tenant and requires queue permission", async () => {
    const queueRepository = new InMemoryOrchestrationRepository([], [], [
      { id: "queue-1", tenantId: "tenant-classera", name: "Product", description: "Product support", owner: "Nadia K.", openCases: 12, health: "healthy", routingRule: "Service = LMS" },
      { id: "queue-other", tenantId: "tenant-other", name: "Other", description: "Other tenant", owner: "Other", openCases: 4, health: "watch", routingRule: "Priority = P2" },
    ]);
    const result = await queueRepository.listQueues(context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.map((item) => item.id)).toEqual(["queue-1"]);
    const denied = await queueRepository.listQueues({ ...context, permissions: [] });
    expect(denied).toMatchObject({ ok: false, error: { code: "QUEUES_FORBIDDEN" } });
  });

  it("returns only service definitions inside the active tenant and requires catalog permission", async () => {
    const catalogRepository = new InMemoryOrchestrationRepository([], [], [], [
      { id: "service-1", tenantId: "tenant-classera", name: "LMS", description: "Product support", category: "Product", owner: "Nadia", status: "available", requestCount: 8, healthScore: 95 },
      { id: "service-other", tenantId: "tenant-other", name: "Other", description: "Other tenant", category: "Product", owner: "Other", status: "available", requestCount: 2, healthScore: 80 },
    ]);
    const result = await catalogRepository.listServices(context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.map((item) => item.id)).toEqual(["service-1"]);
    const denied = await catalogRepository.listServices({ ...context, permissions: [] });
    expect(denied).toMatchObject({ ok: false, error: { code: "CATALOG_FORBIDDEN" } });
  });

  it("returns only knowledge articles inside the active tenant and requires knowledge permission", async () => {
    const knowledgeRepository = new InMemoryOrchestrationRepository([], [], [], [], [
      { id: "article-1", tenantId: "tenant-classera", title: "SSO fix", summary: "Known fix", category: "Known fixes", status: "published", owner: "Hala", updatedAt: "Today", helpfulRate: 94, linkedService: "Identity" },
      { id: "article-other", tenantId: "tenant-other", title: "Other", summary: "Other tenant", category: "Runbooks", status: "draft", owner: "Other", updatedAt: "Today", helpfulRate: 0, linkedService: "Other" },
    ]);
    const result = await knowledgeRepository.listArticles(context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.map((item) => item.id)).toEqual(["article-1"]);
    const denied = await knowledgeRepository.listArticles({ ...context, permissions: [] });
    expect(denied).toMatchObject({ ok: false, error: { code: "KNOWLEDGE_FORBIDDEN" } });
  });

  it("returns only organizations inside the active tenant and requires organization permission", async () => {
    const organizationRepository = new InMemoryOrchestrationRepository([], [], [], [], [], [
      { id: "org-1", tenantId: "tenant-classera", name: "Classera", sector: "Education", region: "Riyadh", members: 12, openCases: 2, healthScore: 96, status: "active" },
      { id: "org-other", tenantId: "tenant-other", name: "Other", sector: "Education", region: "Dubai", members: 4, openCases: 1, healthScore: 80, status: "watch" },
    ]);
    const result = await organizationRepository.listOrganizations(context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.map((item) => item.id)).toEqual(["org-1"]);
    const denied = await organizationRepository.listOrganizations({ ...context, permissions: [] });
    expect(denied).toMatchObject({ ok: false, error: { code: "ORGANIZATIONS_FORBIDDEN" } });
  });
});
