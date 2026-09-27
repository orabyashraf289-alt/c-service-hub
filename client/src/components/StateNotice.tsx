import { AlertTriangle, Inbox, Loader2, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

type StateNoticeKind = "loading" | "empty" | "error" | "permission";

const icons = {
  loading: Loader2,
  empty: Inbox,
  error: AlertTriangle,
  permission: LockKeyhole,
};

export function StateNotice({
  kind,
  title,
  description,
  action,
}: {
  kind: StateNoticeKind;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const Icon = icons[kind];
  return (
    <div className={`state-notice state-notice-${kind}`} role={kind === "error" ? "alert" : undefined}>
      <span className="state-notice-icon"><Icon size={20} className={kind === "loading" ? "state-notice-spin" : undefined} /></span>
      <strong>{title}</strong>
      {description && <span>{description}</span>}
      {action}
    </div>
  );
}
