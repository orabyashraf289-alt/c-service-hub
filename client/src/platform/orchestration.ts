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

export type ServiceDefinition = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  status: "available" | "degraded" | "maintenance";
  requestCount: number;
  healthScore: number;
};

export type KnowledgeArticle = {
  id: string;
  tenantId: string;
  title: string;
  summary: string;
  category: string;
  status: "published" | "review" | "draft";
  owner: string;
  updatedAt: string;
  helpfulRate: number;
  linkedService: string;
};

export type OrganizationDefinition = {
  id: string;
  tenantId: string;
  name: string;
  sector: string;
  region: string;
  members: number;
  openCases: number;
  healthScore: number;
  status: "active" | "watch" | "onboarding";
};

export type TeamMember = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent" | "viewer";
  status: "active" | "invited" | "suspended";
  lastActive: string;
  assignedCases: number;
  mfaEnabled: boolean;
};

export interface QueueRepository {
  listQueues(context: TenantContext): Promise<ApiResult<QueueDefinition[]>>;
}

export interface ServiceCatalogRepository {
  listServices(context: TenantContext): Promise<ApiResult<ServiceDefinition[]>>;
}

export interface KnowledgeRepository {
  listArticles(context: TenantContext): Promise<ApiResult<KnowledgeArticle[]>>;
}

export interface OrganizationRepository {
  listOrganizations(context: TenantContext): Promise<ApiResult<OrganizationDefinition[]>>;
}

export interface TeamRepository {
  listMembers(context: TenantContext): Promise<ApiResult<TeamMember[]>>;
}

export interface WorkflowRepository {
  listPublished(context: TenantContext): Promise<ApiResult<WorkflowVersion[]>>;
}

export interface SlaRepository {
  list(context: TenantContext): Promise<ApiResult<SlaPolicy[]>>;
}

export class InMemoryOrchestrationRepository implements WorkflowRepository, SlaRepository, QueueRepository, ServiceCatalogRepository, KnowledgeRepository, OrganizationRepository, TeamRepository {
  constructor(private readonly workflows: WorkflowVersion[], private readonly policies: SlaPolicy[], private readonly queues: QueueDefinition[] = [], private readonly services: ServiceDefinition[] = [], private readonly articles: KnowledgeArticle[] = [], private readonly organizations: OrganizationDefinition[] = [], private readonly members: TeamMember[] = []) {}

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

  async listServices(context: TenantContext): Promise<ApiResult<ServiceDefinition[]>> {
    if (!context.permissions.includes("catalog.read")) return failureResult(context.locale, "CATALOG_FORBIDDEN", "errors.catalog.forbidden");
    return { ok: true, data: this.services.filter((item) => item.tenantId === context.tenantId), meta: createApiMeta(context.locale) };
  }

  async listArticles(context: TenantContext): Promise<ApiResult<KnowledgeArticle[]>> {
    if (!context.permissions.includes("knowledge.read")) return failureResult(context.locale, "KNOWLEDGE_FORBIDDEN", "errors.knowledge.forbidden");
    return { ok: true, data: this.articles.filter((item) => item.tenantId === context.tenantId), meta: createApiMeta(context.locale) };
  }

  async listOrganizations(context: TenantContext): Promise<ApiResult<OrganizationDefinition[]>> {
    if (!context.permissions.includes("organizations.read")) return failureResult(context.locale, "ORGANIZATIONS_FORBIDDEN", "errors.organizations.forbidden");
    return { ok: true, data: this.organizations.filter((item) => item.tenantId === context.tenantId), meta: createApiMeta(context.locale) };
  }

  async listMembers(context: TenantContext): Promise<ApiResult<TeamMember[]>> {
    if (!context.permissions.includes("team.read")) return failureResult(context.locale, "TEAM_FORBIDDEN", "errors.team.forbidden");
    return { ok: true, data: this.members.filter((item) => item.tenantId === context.tenantId), meta: createApiMeta(context.locale) };
  }
}
