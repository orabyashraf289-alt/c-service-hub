export type Id = string;
export type ISODate = string;
export type SecurityClassification = "public" | "internal" | "confidential" | "restricted";

export type TenantContext = {
  tenantId: Id;
  tenantSlug: string;
  organizationId?: Id;
  userId: Id;
  locale: "en" | "ar";
  timezone: string;
  permissions: string[];
  securityClassification: SecurityClassification;
};

export type ApiMeta = {
  requestId: string;
  generatedAt: ISODate;
  locale: "en" | "ar";
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    messageKey: string;
    details?: Record<string, unknown>;
    retryable?: boolean;
  };
  meta: ApiMeta;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type CursorPage<T> = {
  items: T[];
  nextCursor?: string;
  totalEstimate?: number;
};

export type CaseSummary = {
  id: Id;
  caseNumber: string;
  tenantId: Id;
  title: string;
  type: "incident" | "service_request" | "change" | "problem";
  status: "new" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "p1" | "p2" | "p3" | "p4";
  serviceId?: Id;
  organizationId?: Id;
  assigneeId?: Id;
  createdAt: ISODate;
  updatedAt: ISODate;
  securityClassification: SecurityClassification;
};

export type CaseListQuery = {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: CaseSummary["status"];
  priority?: CaseSummary["priority"];
  serviceId?: Id;
};

export type WorkflowNodeContract = {
  id: Id;
  kind: "trigger" | "condition" | "action" | "approval";
  config: Record<string, unknown>;
};

export type WorkflowVersion = {
  id: Id;
  workflowId: Id;
  tenantId: Id;
  version: number;
  status: "draft" | "published" | "archived";
  nodes: WorkflowNodeContract[];
  createdBy: Id;
  createdAt: ISODate;
  publishedAt?: ISODate;
};

export type AuditEvent = {
  id: Id;
  tenantId: Id;
  actorId: Id;
  action: string;
  resourceType: string;
  resourceId: Id;
  occurredAt: ISODate;
  requestId: string;
  details?: Record<string, unknown>;
};
