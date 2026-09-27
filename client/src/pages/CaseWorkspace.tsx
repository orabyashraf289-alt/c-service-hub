import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, Clock3, FileText, Filter, LifeBuoy, MessageSquare, Radio, Search, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { caseArabic, dashboardCases } from "@/domain";
import { caseStateArabic, caseTypeArabic, t, type Locale } from "@/lib/i18n";
import { StateNotice } from "@/components/StateNotice";

const tabs = ["All cases", "My queue", "At risk", "Major incidents"] as const;

const tabCopy: Record<string, string> = { "All cases": "كل الحالات", "My queue": "قائمتي", "At risk": "معرضة للخطر", "Major incidents": "الحوادث الكبرى" };

function caseIcon(type: string) {
  if (type === "Major incident") return <Radio size={16} />;
  if (type === "Problem") return <AlertTriangle size={16} />;
  if (type === "Change") return <ShieldCheck size={16} />;
  return <MessageSquare size={16} />;
}

export default function CaseWorkspace() {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All cases");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(dashboardCases[0].id);
  const [detailTab, setDetailTab] = useState<"activity" | "attachments" | "approvals">("activity");
  const isArabic = locale === "ar";
  const tx = (english: string, arabic: string) => t(locale, english, arabic);
  const selected = dashboardCases.find((item) => item.id === selectedId) ?? dashboardCases[0];
  const selectedCopy = isArabic ? caseArabic[selected.id] : { title: selected.title, tenant: selected.tenant, type: selected.type, state: selected.state, owner: selected.owner, age: selected.age, channel: selected.type === "Major incident" ? "Government hierarchy" : "Enterprise support" };

  const visibleCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return dashboardCases.filter((item) => {
      const matchesQuery = !normalized || [item.id, item.title, item.tenant, item.type, item.state].some((field) => field.toLowerCase().includes(normalized));
      const matchesTab = activeTab === "All cases" || (activeTab === "At risk" && item.risk) || (activeTab === "Major incidents" && item.type === "Major incident") || (activeTab === "My queue" && ["Nadia K.", "Omar T.", "Hala R."].includes(item.owner));
      return matchesQuery && matchesTab;
    });
  }, [activeTab, query]);

  const toggleLocale = () => setLocale((value) => value === "en" ? "ar" : "en");

  return (
    <div className={`workspace-page ${isArabic ? "workspace-page-rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <header className="workspace-topbar">
        <div className="workspace-brand"><span className="workspace-brand-mark">c</span><div><strong>C-Service</strong><small>Service OS</small></div></div>
        <div className="workspace-topbar-actions"><button className="workspace-language" onClick={toggleLocale}>{isArabic ? "EN" : "عربي"}</button><button className="workspace-avatar">SA</button></div>
      </header>
      <main className="workspace-content">
        <div className="workspace-breadcrumb"><Link href="/">{tx("Control room", "غرفة التحكم")}</Link><span>/</span><strong>{tx("Case workspace", "مساحة الحالات")}</strong></div>
        <section className="workspace-heading"><div><span className="eyebrow">{tx("Service operations", "عمليات الخدمة")}</span><h1>{tx("Case workspace", "مساحة الحالات")}</h1><p>{tx("Own every request, incident, and next action from one focused queue.", "أدر كل طلب وحادث وخطوة تالية من قائمة عمل مركزة.")}</p></div><div className="workspace-heading-actions"><button className="secondary-button" onClick={() => toast(tx("Saved views are ready for configuration.", "طرق العرض المحفوظة جاهزة للإعداد."))}><Filter size={15} /> {tx("Saved views", "طرق العرض المحفوظة")} <ChevronDown size={14} /></button><button className="primary-button" onClick={() => toast(tx("New case draft opened from workspace.", "تم فتح مسودة حالة جديدة من مساحة العمل."))}><Sparkles size={15} /> {tx("New case", "حالة جديدة")}</button></div></section>
        <section className="workspace-summary-grid">
          <article className="workspace-summary-card"><span className="workspace-summary-icon teal"><FileText size={17} /></span><div><small>{tx("Open cases", "الحالات المفتوحة")}</small><strong>248</strong><span>{tx("Across 4 active queues", "عبر 4 قوائم نشطة")}</span></div></article>
          <article className="workspace-summary-card"><span className="workspace-summary-icon rose"><AlertTriangle size={17} /></span><div><small>{tx("SLA at risk", "معرضة لخرق SLA")}</small><strong>12</strong><span>{tx("Needs attention today", "تحتاج إلى متابعة اليوم")}</span></div></article>
          <article className="workspace-summary-card"><span className="workspace-summary-icon violet"><Clock3 size={17} /></span><div><small>{tx("Median first response", "متوسط الاستجابة الأولى")}</small><strong>18m</strong><span>{tx("−4m vs last week", "أقل بـ 4 دقائق من الأسبوع الماضي")}</span></div></article>
        </section>
        <section className="workspace-grid">
          <article className="workspace-list-panel">
            <div className="workspace-panel-heading"><div><span className="eyebrow">{tx("Triage stream", "مسار الفرز")}</span><h2>{tx("Live case queue", "قائمة الحالات المباشرة")}</h2></div><div className="workspace-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx("Search cases…", "ابحث في الحالات…")} /></div></div>
            <div className="workspace-tabs">{tabs.map((tab) => <button key={tab} className={activeTab === tab ? "workspace-tab-active" : ""} onClick={() => setActiveTab(tab)}>{isArabic ? tabCopy[tab] : tab}{tab === "At risk" && <span>12</span>}</button>)}</div>
            {visibleCases.length ? <div className="workspace-case-list">{visibleCases.map((item) => { const copy = isArabic ? caseArabic[item.id] : { title: item.title, tenant: item.tenant, type: item.type, state: item.state, owner: item.owner, age: item.age, channel: item.type === "Major incident" ? "Government hierarchy" : "Enterprise support" }; return <button className={`workspace-case-row ${selected.id === item.id ? "workspace-case-row-active" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)}><span className={`workspace-case-icon ${item.risk ? "workspace-case-icon-risk" : ""}`}>{caseIcon(item.type)}</span><span className="workspace-case-row-copy"><strong>{copy.title}</strong><small>{item.id} · {isArabic ? caseTypeArabic[item.type] : item.type} · {copy.tenant}</small></span><span className={`workspace-case-state ${item.risk ? "workspace-state-risk" : ""}`}>{isArabic ? caseStateArabic[item.state] : item.state}</span><span className="workspace-case-age">{copy.age}</span></button>; })}</div> : <StateNotice kind="empty" title={tx("No cases match this view", "لا توجد حالات مطابقة")} description={tx("Try a different filter or search term.", "جرّب فلترًا أو عبارة بحث مختلفة.")} />}
          </article>
          <aside className="workspace-detail-panel">
            <div className="workspace-detail-heading"><div><span className="eyebrow">{tx("Case detail", "تفاصيل الحالة")}</span><h2>{selected.id}</h2></div><button className="workspace-close" onClick={() => toast(tx("Detail panel stays pinned for triage.", "تبقى لوحة التفاصيل مثبتة أثناء الفرز."))}><X size={16} /></button></div>
            <div className="workspace-detail-title"><span className={`workspace-case-icon workspace-case-icon-large ${selected.risk ? "workspace-case-icon-risk" : ""}`}>{caseIcon(selected.type)}</span><div><h3>{selectedCopy.title}</h3><p>{selectedCopy.tenant} · {selectedCopy.channel}</p></div></div>
            <div className="workspace-detail-status"><span className="eyebrow">{tx("Current state", "الحالة الحالية")}</span><strong>{selectedCopy.state}</strong><span className={selected.risk ? "workspace-risk-label" : "workspace-healthy-label"}>{selected.risk ? tx("SLA requires attention", "SLA يحتاج إلى متابعة") : tx("Within healthy timing", "ضمن التوقيت السليم")}</span></div>
            <div className="workspace-detail-meta"><div><span>{tx("Owner", "المسؤول")}</span><strong><span className="workspace-owner-avatar" style={{ background: selected.color }}>{selected.initials}</span>{selectedCopy.owner}</strong></div><div><span>{tx("Priority", "الأولوية")}</span><strong>{selected.tag} · {selected.risk ? tx("Critical", "حرج") : tx("Normal", "عادي")}</strong></div><div><span>{tx("Age", "العمر")}</span><strong>{selectedCopy.age}</strong></div></div>
            <div className="workspace-detail-tabs">{(["activity", "attachments", "approvals"] as const).map((tab) => <button key={tab} className={detailTab === tab ? "workspace-detail-tab-active" : ""} onClick={() => setDetailTab(tab)}>{tab === "activity" ? tx("Activity", "النشاط") : tab === "attachments" ? tx("Attachments", "المرفقات") : tx("Approvals", "الاعتمادات")}</button>)}</div>
            {detailTab === "activity" && <div className="workspace-timeline"><div className="workspace-timeline-heading"><strong>{tx("Activity timeline", "الخط الزمني للنشاط")}</strong><button onClick={() => toast(tx("Activity composer is ready for the API phase.", "محرر النشاط جاهز لمرحلة API التالية."))}><MessageSquare size={14} /> {tx("Reply", "رد")}</button></div><div className="workspace-timeline-item"><span className="workspace-timeline-dot teal-dot" /><div><strong>{tx("Routing rules matched the priority queue", "طابقت قواعد التوجيه قائمة الأولوية")}</strong><small>{tx("12 minutes ago · Automation", "منذ 12 دقيقة · أتمتة")}</small></div></div><div className="workspace-timeline-item"><span className="workspace-timeline-dot rose-dot" /><div><strong>{tx("SLA risk threshold was crossed", "تم تجاوز حد مخاطر SLA")}</strong><small>{tx("18 minutes ago · System signal", "منذ 18 دقيقة · إشارة نظام")}</small></div></div></div>}
            {detailTab === "attachments" && <div className="workspace-tab-state"><div className="workspace-tab-state-icon"><FileText size={18} /></div><strong>{tx("No attachments yet", "لا توجد مرفقات بعد")}</strong><span>{tx("Attach evidence, screenshots, or customer files when the API is connected.", "أرفق الأدلة أو لقطات الشاشة أو ملفات العميل عند ربط API.")}</span><button onClick={() => toast(tx("Attachment upload is planned for the storage phase.", "رفع المرفقات مخطط له في مرحلة التخزين."))}>{tx("Add attachment", "إضافة مرفق")} <ArrowUpRight size={14} /></button></div>}
            {detailTab === "approvals" && <div className="workspace-approval-list"><div className="workspace-approval-row"><span className="workspace-approval-icon workspace-approval-done"><CheckCircle2 size={15} /></span><div><strong>{tx("Initial triage approved", "تم اعتماد الفرز الأولي")}</strong><small>{tx("Sarah Al-Mansour · 18 minutes ago", "سارة المنصور · منذ 18 دقيقة")}</small></div><span>{tx("Done", "مكتمل")}</span></div><div className="workspace-approval-row"><span className="workspace-approval-icon workspace-approval-wait"><Clock3 size={15} /></span><div><strong>{tx("Executive incident update", "تحديث الحادث للإدارة")}</strong><small>{tx("Due in 33 minutes", "مستحق خلال 33 دقيقة")}</small></div><span>{tx("Pending", "قيد الانتظار")}</span></div></div>}
            <button className="workspace-back-link" onClick={() => toast(tx("Case actions will connect to the API in the next phase.", "ستتصل إجراءات الحالة بـ API في المرحلة التالية."))}><LifeBuoy size={15} /> {tx("Open full case record", "فتح سجل الحالة الكامل")} {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}</button>
          </aside>
        </section>
      </main>
    </div>
  );
}
