import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, CheckCircle2, ChevronRight, Filter, ListFilter, LockKeyhole, Plus, Radio, Route, ShieldCheck, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { StateNotice } from "@/components/StateNotice";
import { InMemoryOrchestrationRepository, type QueueDefinition } from "@/platform/orchestration";
import type { TenantContext } from "@/platform/contracts";
import { t, type Locale } from "@/lib/i18n";

const context: TenantContext = { tenantId: "tenant-classera", tenantSlug: "classera", organizationId: "org-global", userId: "user-sarah", locale: "en", timezone: "Asia/Riyadh", permissions: ["queues.read"], securityClassification: "internal" };
const repository = new InMemoryOrchestrationRepository([], [], [
  { id: "queue-product", tenantId: "tenant-classera", name: "Classera LMS", description: "Product support", owner: "Nadia K.", openCases: 82, health: "healthy", routingRule: "Service = LMS" },
  { id: "queue-government", tenantId: "tenant-classera", name: "Government entities", description: "Priority desk", owner: "Omar T.", openCases: 41, health: "watch", routingRule: "Segment = Government" },
  { id: "queue-finance", tenantId: "tenant-classera", name: "C-Pay & billing", description: "Finance ops", owner: "Hala R.", openCases: 27, health: "watch", routingRule: "Service = Payments" },
  { id: "queue-incidents", tenantId: "tenant-classera", name: "Major incidents", description: "Incident command", owner: "Sarah A.", openCases: 3, health: "at_risk", routingRule: "Priority = P1" },
]);

function healthCopy(queue: QueueDefinition, locale: Locale) {
  if (queue.health === "healthy") return t(locale, "Healthy", "سليمة");
  if (queue.health === "watch") return t(locale, "Watch", "تحت المراقبة");
  return t(locale, "At risk", "معرضة للخطر");
}

export default function QueuesWorkspace() {
  const [locale, setLocale] = useState<Locale>("en");
  const [queues, setQueues] = useState<QueueDefinition[]>([]);
  const [selectedId, setSelectedId] = useState("queue-product");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const isArabic = locale === "ar";
  const tx = (english: string, arabic: string) => t(locale, english, arabic);
  const selected = queues.find((queue) => queue.id === selectedId) ?? queues[0];
  const totalOpen = useMemo(() => queues.reduce((sum, queue) => sum + queue.openCases, 0), [queues]);
  const atRisk = queues.filter((queue) => queue.health === "at_risk").length;

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    repository.listQueues({ ...context, locale, permissions: hasPermission ? ["queues.read"] : [] }).then((result) => {
      if (!active) return;
      if (!result.ok) { setQueues([]); setHasPermission(false); } else setQueues(result.data);
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [locale, hasPermission]);

  return <div className="queues-page" dir={isArabic ? "rtl" : "ltr"}>
    <header className="queues-topbar"><div className="queues-brand"><span>c</span><div><strong>C-Service</strong><small>Service OS</small></div></div><div className="queues-topbar-center"><span className="queues-live-dot" />{tx("Service operations · Routing control", "عمليات الخدمة · التحكم بالتوجيه")}</div><div className="queues-topbar-actions"><button onClick={() => toast(tx("No new routing updates.", "لا توجد تحديثات توجيه جديدة."))}><Bell size={16} /></button><button className="queues-language" onClick={() => setLocale((value) => value === "en" ? "ar" : "en")}>{isArabic ? "EN" : "عربي"}</button><button className="queues-avatar">SA</button></div></header>
    <main className="queues-content"><div className="queues-breadcrumb"><Link href="/">{tx("Control room", "غرفة التحكم")}</Link><ChevronRight size={14} /><strong>{tx("Queues & routing", "الطوابير والتوجيه")}</strong></div>
      <section className="queues-heading"><div><span className="eyebrow">{tx("Service operations", "عمليات الخدمة")}</span><h1>{tx("Queues & routing", "الطوابير والتوجيه")}</h1><p>{tx("Balance workload, ownership, and routing rules across the service engine.", "وازن عبء العمل والملكية وقواعد التوجيه عبر محرك الخدمة.")}</p></div><div className="queues-heading-actions"><button className="secondary-button" onClick={() => setHasPermission((value) => !value)}><LockKeyhole size={15} />{hasPermission ? tx("Preview permission state", "معاينة حالة الصلاحية") : tx("Restore queue access", "استعادة الوصول للطوابير")}</button><button className="primary-button" onClick={() => toast(tx("New queue draft opened.", "تم فتح مسودة طابور جديد."))}><Plus size={16} />{tx("New queue", "طابور جديد")}</button></div></section>
      <section className="queues-metrics"><article><span className="queues-metric-icon teal"><ListFilter size={17} /></span><div><small>{tx("Active queues", "الطوابير النشطة")}</small><strong>{isLoading ? "—" : queues.length}</strong><span>{tx("Routing surfaces", "مساحات التوجيه")}</span></div></article><article><span className="queues-metric-icon blue"><Users size={17} /></span><div><small>{tx("Open workload", "عبء العمل المفتوح")}</small><strong>{isLoading ? "—" : totalOpen}</strong><span>{tx("Cases across queues", "حالة عبر الطوابير")}</span></div></article><article><span className="queues-metric-icon amber"><Radio size={17} /></span><div><small>{tx("Queues at risk", "الطوابير المعرضة للخطر")}</small><strong>{isLoading ? "—" : atRisk}</strong><span>{tx("Need routing attention", "تحتاج إلى متابعة التوجيه")}</span></div></article></section>
      <section className="queues-grid"><article className="queues-list-panel"><div className="queues-panel-heading"><div><span className="eyebrow">{tx("Workload balance", "توازن عبء العمل")}</span><h2>{tx("Queue health", "صحة الطوابير")}</h2></div><button className="queues-filter" onClick={() => toast(tx("Queue filters are ready for live data.", "فلاتر الطوابير جاهزة للبيانات الحية."))}><Filter size={15} />{tx("Filter", "تصفية")}</button></div>{isLoading ? <StateNotice kind="loading" title={tx("Loading queues", "جارٍ تحميل الطوابير")} description={tx("Applying tenant scope and routing permissions.", "يتم تطبيق نطاق الجهة وصلاحيات التوجيه.")} /> : !hasPermission ? <StateNotice kind="permission" title={tx("Queue access is restricted", "الوصول إلى الطوابير مقيّد")} description={tx("You need queues.read to inspect workload and routing.", "تحتاج إلى queues.read لفحص عبء العمل والتوجيه.")} action={<button className="queues-notice-action" onClick={() => setHasPermission(true)}>{tx("Restore preview access", "استعادة وصول المعاينة")}</button>} /> : queues.length ? <div className="queues-list">{queues.map((queue) => <button key={queue.id} className={`queue-row ${selected?.id === queue.id ? "queue-row-active" : ""}`} onClick={() => setSelectedId(queue.id)}><span className={`queue-status-icon ${queue.health}`}><ListFilter size={16} /></span><span className="queue-row-copy"><strong>{queue.name}</strong><small>{queue.description} · {queue.owner}</small><span className="queue-progress"><i style={{ width: `${Math.min(100, queue.openCases)}%` }} /></span></span><span className={`queue-health ${queue.health}`}><CheckCircle2 size={13} />{healthCopy(queue, locale)}</span><ChevronRight size={15} /></button>)}</div> : <StateNotice kind="empty" title={tx("No queues configured", "لا توجد طوابير مهيأة")} description={tx("Create a queue to begin routing service work.", "أنشئ طابورًا لبدء توجيه أعمال الخدمة.")} />}</article>
        <aside className="queues-detail-panel">{selected && hasPermission ? <><div className="queues-detail-heading"><div><span className="eyebrow">{tx("Routing detail", "تفاصيل التوجيه")}</span><h2>{selected.name}</h2></div><Route size={23} /></div><div className={`queues-detail-health ${selected.health}`}><span />{healthCopy(selected, locale)} · {selected.openCases} {tx("open cases", "حالة مفتوحة")}</div><div className="queues-rule-card"><div className="queues-rule-icon"><Zap size={16} /></div><div><small>{tx("Active routing rule", "قاعدة التوجيه النشطة")}</small><strong>{selected.routingRule}</strong></div></div><div className="queues-owner"><span className="queues-owner-avatar">{selected.owner.split(" ").map((part) => part[0]).join("")}</span><div><small>{tx("Queue owner", "مالك الطابور")}</small><strong>{selected.owner}</strong></div><Users size={15} /></div><div className="queues-detail-callout"><ShieldCheck size={16} /><span>{tx("Assignment changes are tenant-scoped and will leave an auditable trace.", "تغييرات التعيين ضمن نطاق الجهة وتترك أثرًا قابلًا للتدقيق.")}</span></div><div className="queues-detail-actions"><button className="secondary-button" onClick={() => toast(tx("Routing history is ready for the audit phase.", "سجل التوجيه جاهز لمرحلة التدقيق."))}>{tx("View history", "عرض السجل")}</button><button className="primary-button" onClick={() => toast(tx("Queue editing will connect to the API phase.", "سيتم ربط تعديل الطابور بمرحلة API."))}>{tx("Edit routing", "تعديل التوجيه")}</button></div></> : <StateNotice kind="permission" title={tx("Select an accessible queue", "اختر طابورًا متاحًا")} description={tx("Routing details appear after access is restored.", "تظهر تفاصيل التوجيه بعد استعادة الوصول.")} />}</aside>
      </section><div className="queues-footnote"><span><ShieldCheck size={15} />{tx("Routing mutations require permission checks and audit events.", "تتطلب تغييرات التوجيه فحوص الصلاحيات وأحداث التدقيق.")}</span><Link href="/sla">{tx("Review SLA policies", "مراجعة سياسات SLA")} {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}</Link></div>
    </main></div>;
}
