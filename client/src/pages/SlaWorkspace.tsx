import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Bell, CheckCircle2, Clock3, Filter, Gauge, LockKeyhole, Plus, ShieldCheck, Timer, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { StateNotice } from "@/components/StateNotice";
import type { SlaPolicy, TenantContext } from "@/platform";
import { InMemoryOrchestrationRepository } from "@/platform/orchestration";
import { t, type Locale } from "@/lib/i18n";

const context: TenantContext = { tenantId: "tenant-classera", tenantSlug: "classera", organizationId: "org-global", userId: "user-sarah", locale: "en", timezone: "Asia/Riyadh", permissions: ["sla.read"], securityClassification: "internal" };
const repository = new InMemoryOrchestrationRepository([], [
  { id: "sla-p1", tenantId: "tenant-classera", name: "P1 critical response", priority: "p1", firstResponseMinutes: 15, resolutionMinutes: 240, escalationMinutes: 30 },
  { id: "sla-p2", tenantId: "tenant-classera", name: "P2 priority response", priority: "p2", firstResponseMinutes: 30, resolutionMinutes: 480, escalationMinutes: 90 },
  { id: "sla-p3", tenantId: "tenant-classera", name: "P3 standard response", priority: "p3", firstResponseMinutes: 120, resolutionMinutes: 1440, escalationMinutes: 240 },
]);

function policyTone(priority: SlaPolicy["priority"]) {
  return priority === "p1" ? "rose" : priority === "p2" ? "amber" : "teal";
}

export default function SlaWorkspace() {
  const [locale, setLocale] = useState<Locale>("en");
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [selectedId, setSelectedId] = useState("sla-p1");
  const isArabic = locale === "ar";
  const tx = (english: string, arabic: string) => t(locale, english, arabic);
  const selected = policies.find((policy) => policy.id === selectedId) ?? policies[0];
  const healthyRate = useMemo(() => policies.length ? Math.round((policies.filter((policy) => policy.priority !== "p1").length / policies.length) * 100) : 0, [policies]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    repository.list({ ...context, locale, permissions: hasPermission ? ["sla.read"] : [] }).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setPolicies([]);
        setHasPermission(false);
      } else {
        setPolicies(result.data);
      }
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [locale, hasPermission]);

  const toggleLocale = () => setLocale((value) => value === "en" ? "ar" : "en");
  const togglePermissionPreview = () => setHasPermission((value) => !value);

  return <div className={`sla-page ${isArabic ? "sla-page-rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
    <header className="sla-topbar"><div className="sla-brand"><span>c</span><div><strong>C-Service</strong><small>Service OS</small></div></div><div className="sla-topbar-center"><span className="sla-live-dot" />{tx("Service operations · Live policy view", "عمليات الخدمة · عرض السياسات المباشر")}</div><div className="sla-topbar-actions"><button onClick={() => toast(tx("No new updates.", "لا توجد تحديثات جديدة."))}><Bell size={16} /></button><button className="sla-language" onClick={toggleLocale}>{isArabic ? "EN" : "عربي"}</button><button className="sla-avatar">SA</button></div></header>
    <main className="sla-content">
      <div className="sla-breadcrumb"><Link href="/">{tx("Control room", "غرفة التحكم")}</Link><span>/</span><strong>{tx("SLA & escalations", "اتفاقيات الخدمة والتصعيد")}</strong></div>
      <section className="sla-heading"><div><span className="eyebrow">{tx("Service operations", "عمليات الخدمة")}</span><h1>{tx("SLA & escalations", "اتفاقيات الخدمة والتصعيد")}</h1><p>{tx("Make response commitments visible, measurable, and ready to act on.", "اجعل التزامات الاستجابة واضحة وقابلة للقياس وجاهزة للتنفيذ.")}</p></div><div className="sla-heading-actions"><button className="secondary-button" onClick={togglePermissionPreview}><LockKeyhole size={15} />{hasPermission ? tx("Preview permission state", "معاينة حالة الصلاحية") : tx("Restore SLA access", "استعادة الوصول إلى SLA")}</button><button className="primary-button" onClick={() => toast(tx("New SLA policy draft opened.", "تم فتح مسودة سياسة SLA جديدة."))}><Plus size={16} />{tx("New policy", "سياسة جديدة")}</button></div></section>
      <section className="sla-metrics"><article><span className="sla-metric-icon teal"><Gauge size={17} /></span><div><small>{tx("Active policies", "السياسات النشطة")}</small><strong>{isLoading ? "—" : policies.length}</strong><span>{tx("Tenant-scoped", "ضمن نطاق الجهة")}</span></div></article><article><span className="sla-metric-icon amber"><AlertTriangle size={17} /></span><div><small>{tx("Cases at risk", "الحالات المعرضة للخطر")}</small><strong>12</strong><span>{tx("Needs attention today", "تحتاج إلى متابعة اليوم")}</span></div></article><article><span className="sla-metric-icon violet"><TrendingUp size={17} /></span><div><small>{tx("Healthy coverage", "التغطية السليمة")}</small><strong>{isLoading ? "—" : `${healthyRate}%`}</strong><span>{tx("Across configured tiers", "عبر المستويات المهيأة")}</span></div></article></section>
      <section className="sla-grid"><article className="sla-policy-panel"><div className="sla-panel-heading"><div><span className="eyebrow">{tx("Policy catalog", "كتالوج السياسات")}</span><h2>{tx("Response commitments", "التزامات الاستجابة")}</h2></div><button className="sla-filter" onClick={() => toast(tx("Policy filters are ready for live data.", "فلاتر السياسات جاهزة للبيانات الحية."))}><Filter size={15} />{tx("Filter", "تصفية")}</button></div>{isLoading ? <StateNotice kind="loading" title={tx("Loading SLA policies", "جارٍ تحميل سياسات SLA")} description={tx("Applying tenant scope and permission checks.", "يتم تطبيق نطاق الجهة وفحوص الصلاحيات.")} /> : !hasPermission ? <StateNotice kind="permission" title={tx("SLA access is restricted", "الوصول إلى SLA مقيّد")} description={tx("You need the sla.read permission to view policy configuration.", "تحتاج إلى صلاحية sla.read لعرض إعدادات السياسات.")} action={<button className="sla-notice-action" onClick={togglePermissionPreview}>{tx("Restore preview access", "استعادة وصول المعاينة")}</button>} /> : policies.length ? <div className="sla-policy-list">{policies.map((policy) => <button key={policy.id} className={`sla-policy-row ${selected?.id === policy.id ? "sla-policy-row-active" : ""}`} onClick={() => setSelectedId(policy.id)}><span className={`sla-policy-icon ${policyTone(policy.priority)}`}><Timer size={17} /></span><span className="sla-policy-copy"><strong>{policy.name}</strong><small>{tx("Priority", "الأولوية")} {policy.priority.toUpperCase()} · {policy.firstResponseMinutes}m {tx("first response", "استجابة أولى")}</small></span><span className="sla-policy-state"><CheckCircle2 size={14} />{tx("Active", "نشطة")}</span><ArrowRight size={15} /></button>)}</div> : <StateNotice kind="empty" title={tx("No SLA policies configured", "لا توجد سياسات SLA مهيأة")} description={tx("Create a policy to start tracking response commitments.", "أنشئ سياسة لبدء تتبع التزامات الاستجابة.")} />}</article>
        <aside className="sla-detail-panel">{selected && hasPermission ? <><div className="sla-detail-heading"><div><span className="eyebrow">{tx("Policy detail", "تفاصيل السياسة")}</span><h2>{selected.priority.toUpperCase()} · {selected.name}</h2></div><ShieldCheck size={22} /></div><div className="sla-detail-status"><span className="sla-live-dot" />{tx("Active and tenant-scoped", "نشطة وضمن نطاق الجهة")}</div><div className="sla-timer-grid"><div><small>{tx("First response", "الاستجابة الأولى")}</small><strong>{selected.firstResponseMinutes}<em>m</em></strong></div><div><small>{tx("Escalation", "التصعيد")}</small><strong>{selected.escalationMinutes}<em>m</em></strong></div><div><small>{tx("Resolution", "الحل")}</small><strong>{selected.resolutionMinutes >= 1440 ? `${selected.resolutionMinutes / 1440}` : `${selected.resolutionMinutes}`}<em>{selected.resolutionMinutes >= 1440 ? "d" : "m"}</em></strong></div></div><div className="sla-detail-callout"><Clock3 size={17} /><div><strong>{tx("Next escalation window", "نافذة التصعيد التالية")}</strong><span>{tx(`P1 cases escalate after ${selected.escalationMinutes} minutes without an owner update.`, `يتم تصعيد حالات P1 بعد ${selected.escalationMinutes} دقيقة دون تحديث من المسؤول.`)}</span></div></div><div className="sla-detail-actions"><button className="secondary-button" onClick={() => toast(tx("Policy history is ready for the audit phase.", "سجل السياسة جاهز لمرحلة التدقيق."))}>{tx("View history", "عرض السجل")}</button><button className="primary-button" onClick={() => toast(tx("Policy editing will connect to the API phase.", "سيتم ربط تعديل السياسة بمرحلة API."))}>{tx("Edit policy", "تعديل السياسة")}</button></div></> : <StateNotice kind="permission" title={tx("Select an accessible policy", "اختر سياسة متاحة")} description={tx("Policy details appear after access is restored.", "تظهر تفاصيل السياسة بعد استعادة الوصول.")} />}</aside>
      </section>
      <div className="sla-footnote"><span><ShieldCheck size={15} />{tx("Every policy change will require permission checks and an audit event.", "يتطلب كل تغيير في السياسة فحوص الصلاحيات وحدث تدقيق.")}</span><Link href="/cases">{tx("Open case workspace", "فتح مساحة الحالات")} {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}</Link></div>
    </main>
  </div>;
}
