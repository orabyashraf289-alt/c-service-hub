import type { Id, TenantContext } from "./contracts";

export type PermissionCheck = {
  permission: string;
  resourceTenantId?: Id;
  resourceOrganizationId?: Id;
};

export function assertTenantScope(context: TenantContext, resourceTenantId: Id): void {
  if (context.tenantId !== resourceTenantId) {
    throw new Error("TENANT_SCOPE_VIOLATION");
  }
}

export function canAccess(context: TenantContext, check: PermissionCheck): boolean {
  if (!context.permissions.includes(check.permission)) return false;
  if (check.resourceTenantId && check.resourceTenantId !== context.tenantId) return false;
  if (check.resourceOrganizationId && context.organizationId && check.resourceOrganizationId !== context.organizationId) return false;
  return true;
}

export function requirePermission(context: TenantContext, check: PermissionCheck): void {
  if (!canAccess(context, check)) {
    throw new Error("PERMISSION_DENIED");
  }
}
