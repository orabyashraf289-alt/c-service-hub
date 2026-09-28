import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Bell, Bot, Check, ChevronDown, GitBranch, GitMerge, History, MoreHorizontal, Play, Plus, Save, Settings2, ShieldCheck, Sparkles, Timer, Trash2, X, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { t, type Locale } from "@/lib/i18n";
import type { TenantContext } from "@/platform/contracts";
import { InMemoryOrchestrationRepository } from "@/platform/orchestration";

type NodeKind = "trigger" | "condition" | "action" | "approval";
type FlowNode = { id: string; kind: NodeKind; title: string; arabic: string; detail: string; arabicDetail: string; tone: string };

const initialNodes: FlowNode[] = [
  { id: "trigger", kind: "trigger", title: "Case created", arabic: "إنشاء حالة", detail: "When a new incident enters the service engine", arabicDetail: "عند دخول حادث جديد إلى محرك الخدمة", tone: "teal" },
  { id: "condition", kind: "condition", title: "Priority is P1", arabic: "الأولوية P1", detail: "Evaluate severity and tenant impact", arabicDetail: "تقييم الخطورة وتأثير الجهة", tone: "amber" },
  { id: "action", kind: "action", title: "Route to priority queue", arabic: "توجيه إلى قائمة الأولوية", detail: "Assign the incident command team", arabicDetail: "تعيين فريق قيادة الحادث", tone: "violet" },
  { id: "approval", kind: "approval", title: "Request executive approval", arabic: "طلب اعتماد الإدارة", detail: "Before sending an external update", arabicDetail: "قبل إرسال تحديث خارجي", tone: "rose" },
];

const workflowContext: TenantContext = { tenantId: "tenant-classera", tenantSlug: "classera", organizationId: "org-global", userId: "user-sarah", locale: "en", timezone: "Asia/Riyadh", permissions: ["workflow.read", "sla.read"], securityClassification: "internal" };
const orchestrationPreview = new InMemoryOrchestrationRepository([
  { id: "wf-incident-v2", workflowId: "workflow-incident", tenantId: "tenant-classera", version: 2, status: "published", nodes: [], createdBy: "user-sarah", createdAt: "2026-09-28T00:00:00Z", publishedAt: "2026-09-28T00:00:00Z" },
], [{ id: "sla-p1", tenantId: "tenant-classera", name: "P1 response", priority: "p1", firstResponseMinutes: 15, resolutionMinutes: 240, escalationMinutes: 30 }]);

function nodeIcon(kind: NodeKind) {
  if (kind === "trigger") return <Zap size={16} />;
  if (kind === "condition") return <GitBranch size={16} />;
  if (kind === "action") return <Bot size={16} />;
  return <ShieldCheck size={16} />;
}

export default function WorkflowBuilder() {
  const [locale, setLocale] = useState<Locale>("en");
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedId, setSelectedId] = useState("condition");
  const [published, setPublished] = useState(false);
  const [isLoadingContract, setIsLoadingContract] = useState(true);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [slaMinutes, setSlaMinutes] = useState<number | null>(null);
  const isArabic = locale === "ar";
  const tx = (english: string, arabic: string) => t(locale, english, arabic);
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const selectedTitle = isArabic ? selected.arabic : selected.title;
  const selectedDetail = isArabic ? selected.arabicDetail : selected.detail;
  const notify = (english: string, arabic: string) => toast(tx(english, arabic));
  useEffect(() => {
    let active = true;
    Promise.all([orchestrationPreview.listPublished({ ...workflowContext, locale }), orchestrationPreview.list({ ...workflowContext, locale })]).then(([workflowResult, slaResult]) => {
      if (!active) return;
      if (workflowResult.ok) setPublishedVersion(workflowResult.data[0]?.version ?? null);
      if (slaResult.ok) setSlaMinutes(slaResult.data[0]?.escalationMinutes ?? null);
      setIsLoadingContract(false);
    });
    return () => { active = false; };
  }, [locale]);
  const removeSelected = () => { if (nodes.length <= 2) return notify("A workflow needs at least a trigger and one action.", "يحتاج سير العمل إلى محفز وإجراء واحد على الأقل."); setNodes((items) => items.filter((item) => item.id !== selectedId)); setSelectedId(nodes.find((node) => node.id !== selectedId)?.id ?? "trigger"); };
  return <div className="workflow-page" dir={isArabic ? "rtl" : "ltr"}><header className="workflow-topbar"><div className="workflow-brand"><span>c</span><div><strong>C-Service</strong><small>Service OS</small></div></div><div className="workflow-topbar-center"><span className="workflow-status-dot" />{isLoadingContract ? tx("Loading contract…", "جارٍ تحميل العقد…") : tx(`Published v${publishedVersion ?? "—"} · Incident priority routing`, `الإصدار المنشور ${publishedVersion ?? "—"} · توجيه أولوية الحوادث`)}</div><div className="workflow-topbar-actions"><button onClick={() => notify("No new updates.", "لا توجد تحديثات جديدة.")}><Bell size={16} /></button><button className="workflow-language" onClick={() => setLocale((value) => value === "en" ? "ar" : "en")}>{isArabic ? "EN" : "عربي"}</button><button className="workflow-avatar">SA</button></div></header><main className="workflow-content"><div className="workflow-breadcrumb"><Link href="/">{tx("Control room", "غرفة التحكم")}</Link><span>/</span><Link href="/admin">{tx("Administration", "الإدارة")}</Link><span>/</span><strong>{tx("Workflow builder", "منشئ سير العمل")}</strong></div><section className="workflow-heading"><div><span className="eyebrow">{tx("Automation", "الأتمتة")}</span><h1>{tx("Incident priority routing", "توجيه أولوية الحوادث")}</h1><p>{tx("Make the next best action explicit, auditable, and safe to change.", "اجعل الإجراء التالي واضحًا وقابلًا للتدقيق وآمنًا للتغيير.")}</p></div><div className="workflow-heading-actions"><button className="secondary-button" onClick={() => notify("Version history is ready for the audit phase.", "سجل الإصدارات جاهز لمرحلة التدقيق.")}><History size={15} /> {tx("Version history", "سجل الإصدارات")}</button><button className="primary-button" onClick={() => { setPublished(true); notify("Workflow published to the draft environment.", "تم نشر سير العمل في بيئة المسودة."); }}><Save size={15} /> {published ? tx("Published", "تم النشر") : tx("Publish draft", "نشر المسودة")}</button></div></section><section className="workflow-toolbar"><div className="workflow-toolbar-group"><button className="workflow-toolbar-button workflow-toolbar-active"><GitMerge size={15} />{tx("Canvas", "المخطط")}</button><button className="workflow-toolbar-button" onClick={() => notify("Rule inspector is ready for configuration.", "مفتش القواعد جاهز للإعداد.")}><Settings2 size={15} />{tx("Rule inspector", "مفتش القواعد")}</button></div><div className="workflow-toolbar-group"><span className="workflow-autosave"><Check size={14} />{tx("Saved just now", "تم الحفظ الآن")}</span><button className="workflow-icon-button" onClick={() => notify("More workflow actions are coming in the next phase.", "إجراءات سير العمل الإضافية قادمة في المرحلة التالية.")}><MoreHorizontal size={16} /></button></div></section><section className="workflow-layout"><article className="workflow-canvas-panel"><div className="workflow-canvas-heading"><div><span className="eyebrow">{tx("Flow canvas", "مخطط التدفق")}</span><h2>{tx("When a P1 incident arrives", "عند وصول حادث P1")}</h2></div><span className="workflow-active-pill"><span />{tx("Active draft", "مسودة نشطة")}</span></div><div className="workflow-canvas"><div className="workflow-canvas-grid" />{nodes.map((node, index) => <div className="workflow-node-wrap" key={node.id}><button className={`workflow-node workflow-node-${node.tone} ${selectedId === node.id ? "workflow-node-selected" : ""}`} onClick={() => setSelectedId(node.id)}><span className="workflow-node-icon">{nodeIcon(node.kind)}</span><div><small>{node.kind === "trigger" ? tx("Trigger", "محفز") : node.kind === "condition" ? tx("Condition", "شرط") : node.kind === "action" ? tx("Action", "إجراء") : tx("Approval", "اعتماد")}</small><strong>{isArabic ? node.arabic : node.title}</strong><span>{isArabic ? node.arabicDetail : node.detail}</span></div><MoreHorizontal size={15} /></button>{index < nodes.length - 1 && <div className="workflow-connector"><span /><ArrowDown size={15} /></div>}</div>)}<button className="workflow-add-node" onClick={() => { const id = `step-${nodes.length + 1}`; setNodes((items) => [...items, { id, kind: "action", title: "Notify stakeholder", arabic: "إشعار صاحب المصلحة", detail: "Send a contextual update", arabicDetail: "إرسال تحديث مرتبط بالسياق", tone: "teal" }]); setSelectedId(id); }}><Plus size={15} />{tx("Add step", "إضافة خطوة")}</button></div></article><aside className="workflow-inspector"><div className="workflow-inspector-heading"><div><span className="eyebrow">{tx("Selected step", "الخطوة المحددة")}</span><h2>{selectedTitle}</h2></div><button onClick={() => notify("Step menu is ready for the next build phase.", "قائمة الخطوة جاهزة لمرحلة البناء التالية.")}><MoreHorizontal size={16} /></button></div><div className={`workflow-inspector-icon workflow-node-${selected.tone}`}>{nodeIcon(selected.kind)}</div><p className="workflow-inspector-detail">{selectedDetail}</p><label>{tx("Step type", "نوع الخطوة")}</label><div className="workflow-select"><span>{selected.kind === "trigger" ? tx("Trigger", "محفز") : selected.kind === "condition" ? tx("Condition", "شرط") : selected.kind === "action" ? tx("Action", "إجراء") : tx("Approval", "اعتماد")}</span><ChevronDown size={14} /></div><label>{tx("Rule expression", "تعبير القاعدة")}</label><div className="workflow-expression"><code>case.priority == <b>P1</b></code><button onClick={() => notify("Expression editor is ready for the rules phase.", "محرر التعبير جاهز لمرحلة القواعد.")}><Settings2 size={14} /></button></div><div className="workflow-inspector-note"><Sparkles size={15} /><span>{tx("Copilot suggestion: add a tenant-impact check before executive approval.", "اقتراح المساعد: أضف فحص تأثير الجهة قبل اعتماد الإدارة.")}</span></div><div className="workflow-inspector-actions"><button className="secondary-button" onClick={removeSelected}><Trash2 size={14} />{tx("Remove step", "إزالة الخطوة")}</button><button className="primary-button" onClick={() => notify("Step changes saved to this draft.", "تم حفظ تغييرات الخطوة في هذه المسودة.")}><Check size={14} />{tx("Save step", "حفظ الخطوة")}</button></div></aside></section><section className="workflow-bottom-grid"><article className="workflow-rule-card"><div><span className="eyebrow">{tx("Guardrails", "الضوابط")}</span><h2>{tx("Every mutation leaves a trace", "كل تغيير يترك أثرًا")}</h2><p>{tx("Publishing will require permission checks, a version note, and an auditable event.", "يتطلب النشر فحوص الصلاحيات وملاحظة إصدار وحدث تدقيق.")}</p></div><ShieldCheck size={27} /></article><article className="workflow-rule-card workflow-rule-card-light"><div><span className="eyebrow">{tx("SLA policy", "سياسة SLA")}</span><h2>{isLoadingContract ? tx("Loading P1 policy…", "جارٍ تحميل سياسة P1…") : tx(`Executive update due in ${slaMinutes ?? 33} min`, `تحديث الإدارة مستحق خلال ${slaMinutes ?? 33} دقيقة`)}</h2><p>{tx("This rule is linked to the P1 incident response policy.", "هذه القاعدة مرتبطة بسياسة الاستجابة لحوادث P1.")}</p></div><Timer size={27} /></article></section></main></div>;
}
