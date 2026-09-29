import type { ApiResult, TenantContext, WorkflowVersion } from "./contracts";
import { createApiMeta, failureResult } from "./errors";

export type SlaPolicy = {
  id: string;
  tenantId: string;
  name: string;
  priority: "p1" | "p2" | "p3" | "p4";
  firstResponseMinutes: number;
  resolutionMinutes: number;
  escalationMinutes: number;
};

export type QueueDefinition = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  owner: string;
  openCases: number;
  health: "healthy" | "watch" | "at_risk";
  routingRule: string;
};

export interface QueueRepository {
  listQueues(context: TenantContext): Promise<ApiResult<QueueDefinition[]>>;
}

export interface WorkflowRepository {
  listPublished(context: TenantContext): Promise<ApiResult<WorkflowVersion[]>>;
}

export interface SlaRepository {
  list(context: TenantContext): Promise<ApiResult<SlaPolicy[]>>;
}

export class InMemoryOrchestrationRepository implements WorkflowRepository, SlaRepository, QueueRepository {
  constructor(private readonly workflows: WorkflowVersion[], private readonly policies: SlaPolicy[], private readonly queues: QueueDefinition[] = []) {}

  async listPublished(context: TenantContext): Promise<ApiResult<WorkflowVersion[]>> {
    const items = this.workflows.filter((item) => item.tenantId === context.tenantId && item.status === "published");
    return { ok: true, data: items, meta: createApiMeta(context.locale) };
  }

  async list(context: TenantContext): Promise<ApiResult<SlaPolicy[]>> {
    if (!context.permissions.includes("sla.read")) return failureResult(context.locale, "SLA_FORBIDDEN", "errors.sla.forbidden");
    return { ok: true, data: this.policies.filter((item) => item.tenantId === context.tenantId), meta: createApiMeta(context.locale) };
  }

  async listQueues(context: TenantContext): Promise<ApiResult<QueueDefinition[]>> {
    if (!context.permissions.includes("queues.read")) return failureResult(context.locale, "QUEUES_FORBIDDEN", "errors.queues.forbidden");
    return { ok: true, data: this.queues.filter((item) => item.tenantId === context.tenantId), meta: createApiMeta(context.locale) };
  }
}
