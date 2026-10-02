import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleDot,
  Clock3,
  Command,
  FileText,
  Filter,
  Gauge,
  Inbox,
  Layers3,
  LifeBuoy,
  ListFilter,
  LockKeyhole,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { StateNotice } from "@/components/StateNotice";
import { caseArabic, dashboardCases as cases, dashboardFilterTabs as filterTabs, dashboardQueues as queueRows, queueArabic } from "@/domain";
import { experienceArabic, navArabic as navTranslations, t, type Locale } from "@/lib/i18n";

const navSections: { label: string; items: { name: string; icon: LucideIcon; count?: string; active?: boolean }[] }[] = [
  {
    label: "Control room",
    items: [
      { name: "Overview", icon: Gauge, active: true },
      { name: "Case workspace", icon: Inbox, count: "248" },
      { name: "Major incidents", icon: Radio, count: "03" },
      { name: "Customer health", icon: Activity },
    ],
  },
  {
    label: "Service operations",
    items: [
      { name: "Service catalog", icon: Layers3 },
      { name: "Queues & routing", icon: ListFilter },
      { name: "SLA & escalations", icon: Clock3, count: "12" },
      { name: "Knowledge base", icon: FileText },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Organizations", icon: Building2 },
      { name: "Team & access", icon: Users },
      { name: "Automation", icon: Bot },
      { name: "Audit log", icon: LockKeyhole },
    ],
  },
];

const metricCards = [
  { label: "Open cases", value: "248", delta: "+8.4%", note: "vs last week", color: "teal", icon: Inbox, bars: [42, 48, 43, 52, 56, 61, 58, 67, 73, 71, 78, 84] },
  { label: "SLA at risk", value: "12", delta: "−3", note: "since yesterday", color: "amber", icon: AlertTriangle, bars: [70, 61, 64, 58, 55, 50, 46, 48, 39, 43, 35, 31] },
  { label: "First response", value: "92.6%", delta: "+2.1%", note: "this month", color: "blue", icon: Zap, bars: [54, 58, 61, 60, 66, 67, 72, 70, 76, 78, 81, 86] },
  { label: "Customer health", value: "84", delta: "+4 pts", note: "portfolio score", color: "violet", icon: ShieldCheck, bars: [51, 56, 53, 62, 64, 67, 69, 73, 72, 77, 81, 84] },
];

const experienceModes = [
  { id: "command", label: "Command Center", kicker: "Management", icon: Gauge, headline: "See the operating picture at a glance.", description: "Portfolio health, SLA exposure, major incidents, and customer signals for service leaders.", tags: ["Portfolio health", "SLA & escalation", "Incident command"] },
  { id: "customer", label: "Customer Portal", kicker: "External", icon: LifeBuoy, headline: "Help customers reach the right service faster.", description: "A calm, guided front door for asking questions, tracking requests, and seeing service status.", tags: ["Ask / search", "My requests", "Service status"] },
  { id: "agent", label: "Agent Workspace", kicker: "Operations", icon: TicketCheck, headline: "Put priority work before charts.", description: "A focused workspace for queue ownership, SLA risk, customer replies, and next actions.", tags: ["My priority work", "Queue views", "Case context"] },
  { id: "admin", label: "Administration", kicker: "Platform", icon: Settings2, headline: "Configure the service operating system.", description: "Govern tenants, organizations, roles, forms, workflows, routing, and audit controls.", tags: ["Tenant setup", "Workflow builder", "Audit & access"] },
];

function SparkBars({ values, color }: { values: number[]; color: string }) {
  return (
    <div className="metric-bars" aria-hidden="true">
      {values.map((value, index) => (
        <span key={index} style={{ height: `${value}%`, background: color, opacity: index > values.length - 4 ? 1 : 0.45 + index / (values.length * 2) }} />
      ))}
    </div>
  );
}

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "teal" | "amber" | "rose" | "violet" }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>;
}

function AppMark() {
  return <div className="app-mark"><span>c</span><i /></div>;
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState("All cases");
  const [experience, setExperience] = useState("command");
  const [isArabic, setIsArabic] = useState(false);
  const [languageSwitching, setLanguageSwitching] = useState(false);
  const locale: Locale = isArabic ? "ar" : "en";
  const tx = (en: string, ar: string) => t(locale, en, ar);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("global-search")?.focus();
      }
      if (event.key === "Escape") {
        setNewCaseOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic]);

  const visibleCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesQuery = !normalized || [item.id, item.title, item.tenant, item.type, item.state].some((field) => field.toLowerCase().includes(normalized));
      const matchesFilter = activeFilter === "All cases" || (activeFilter === "At risk" && item.risk) || (activeFilter === "Major incidents" && item.type === "Major incident") || (activeFilter === "My queue" && ["Nadia K.", "Omar T.", "Hala R."].includes(item.owner));
      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, query]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2600);
  };

  const selectNav = (name: string) => {
    setActiveNav(name);
    setMobileOpen(false);
    if (name === "Case workspace") {
      setLocation("/cases");
      return;
    }
    if (name === "Automation") {
      setLocation("/automation");
      return;
    }
    if (name === "SLA & escalations") {
      setLocation("/sla");
      return;
    }
    if (name === "Queues & routing") {
      setLocation("/queues");
      return;
    }
    if (name === "Service catalog") {
      setLocation("/catalog");
      return;
    }
    if (name === "Knowledge base") {
      setLocation("/knowledge");
      return;
    }
    if (name === "Organizations") {
      setLocation("/organizations");
      return;
    }
    if (name === "Team & access") {
      setLocation("/team");
      return;
    }
    if (name !== "Overview") toast(`${name} is ready in the next workspace view.`);
  };

  const toggleLanguage = () => {
    setLanguageSwitching(true);
    window.setTimeout(() => setIsArabic((value) => !value), 90);
    window.setTimeout(() => setLanguageSwitching(false), 360);
  };

  const submitNewCase = (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseTitle.trim()) return;
    setNewCaseOpen(false);
    setCaseTitle("");
    toast("Draft case created — assignment rules are ready to run.");
  };

  return (
    <div className={`app-shell ${languageSwitching ? "language-switching" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand-lockup">
            <AppMark />
            <div><strong>C-Service</strong><span>Service OS</span></div>
          </div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><PanelLeftClose size={17} /></button>
        </div>

        <div className="tenant-switcher">
          <div className="tenant-avatar">C</div>
          <div className="tenant-copy"><span>Workspace</span><strong>Classera Global</strong></div>
          <ChevronDown size={15} />
        </div>

        <nav className="nav-groups" aria-label="Primary navigation">
          {navSections.map((section) => (
            <div className="nav-section" key={section.label}>
              <span className="nav-label">{isArabic ? navTranslations[section.label] ?? section.label : section.label}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.name;
                return <button key={item.name} className={`nav-item ${isActive ? "nav-item-active" : ""}`} onClick={() => selectNav(item.name)}><Icon size={17} strokeWidth={isActive ? 2.25 : 1.8} /><span>{isArabic ? navTranslations[item.name] ?? item.name : item.name}</span>{item.count && <em>{item.count}</em>}</button>;
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-callout">
            <div className="ai-callout-icon"><Sparkles size={15} /></div>
            <div><strong>Copilot is ready</strong><span>Summarize the queue or find a known fix.</span></div>
            <ChevronRight size={15} />
          </div>
          <button className="sidebar-footer-link" onClick={() => toast("Help center opened in a new workspace.")}><CircleHelp size={16} /><span>Help center</span><ArrowUpRight size={13} /></button>
          <div className="profile-row"><div className="profile-avatar">SA</div><div className="profile-copy"><strong>Sarah Al-Mansour</strong><span>Service manager</span></div><MoreHorizontal size={16} /></div>
        </div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button><div className="breadcrumb"><span>{tx("Control room", "غرفة التحكم")}</span><ChevronRight size={14} /><strong>{isArabic ? navTranslations[activeNav] ?? activeNav : activeNav}</strong></div></div>
          <div className="topbar-actions">
            <div className="global-search"><Search size={16} /><input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx("Search cases, customers, services…", "ابحث في الحالات والعملاء والخدمات…")} /><kbd><Command size={12} /> K</kbd></div>
            <div className="topbar-divider" />
            <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} /><span /></button>{notificationsOpen && <div className="notification-popover"><div className="popover-heading"><div><span className="eyebrow">{tx("Live feed", "التنبيهات المباشرة")}</span><strong>{tx("Notifications", "التنبيهات")}</strong></div><button onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div><div className="notification-item"><span className="notification-icon rose"><AlertTriangle size={15} /></span><div><strong>{tx("Major incident detected", "تم اكتشاف حادث كبير")}</strong><p>{tx("INC-2026-001842 crossed the P1 threshold.", "تجاوزت الحالة INC-2026-001842 حد الأولوية P1.")}</p><small>{tx("11 min ago", "منذ 11 دقيقة")}</small></div></div><div className="notification-item"><span className="notification-icon teal"><CheckCircle2 size={15} /></span><div><strong>{tx("SLA recovered", "تمت استعادة SLA")}</strong><p>{tx("12 cases returned to healthy timing.", "عادت 12 حالة إلى التوقيت السليم.")}</p><small>{tx("34 min ago", "منذ 34 دقيقة")}</small></div></div><button className="popover-link" onClick={() => toast(tx("All notifications are marked as read.", "تم تعليم كل التنبيهات كمقروءة."))}>{tx("Mark all as read", "تعليم الكل كمقروء")}</button></div>}</div>
            <button className="language-toggle" onClick={toggleLanguage} aria-label={tx("Switch to Arabic", "التبديل إلى الإنجليزية")}><span>{isArabic ? "EN" : "عربي"}</span></button><button className="user-mini"><span>SA</span><ChevronDown size={14} /></button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading animate-in"><div><span className="eyebrow">{tx("Monday · 28 September 2026 · 08:42 UTC", "الاثنين · 28 سبتمبر 2026 · 08:42 بالتوقيت العالمي")}</span><h1>{tx("Good morning, Sarah.", "صباح الخير، سارة.")}</h1><p>{tx("Here’s the operating picture across your service portfolio.", "إليك صورة تشغيلية شاملة لمحفظة خدماتك.")}</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => toast(tx("Date range selector is ready for live data.", "محدد النطاق الزمني جاهز للبيانات الحية."))}><CalendarDays size={16} /> {tx("Last 30 days", "آخر 30 يومًا")} <ChevronDown size={14} /></button><button className="primary-button" onClick={() => setNewCaseOpen(true)}><Plus size={17} /> {tx("New case", "حالة جديدة")}</button></div></section>

          <section className="experience-strip animate-in delay-1" aria-label="C-Service Hub experiences">
            <div className="experience-strip-head"><div><span className="eyebrow">{tx("Experience switcher", "مبدّل التجارب")}</span><strong>{tx("One case engine. Four ways to work.", "محرك حالات واحد. أربع طرق للعمل.")}</strong></div><span className="experience-note">{tx("Choose a role to preview its home experience", "اختر دورًا لمعاينة تجربة العمل الخاصة به")}</span></div>
            <div className="experience-tabs">{experienceModes.map((mode) => { const Icon = mode.icon; const copy = isArabic ? experienceArabic[mode.id] : mode; return <button key={mode.id} className={`experience-tab ${experience === mode.id ? "experience-tab-active" : ""}`} onClick={() => { setExperience(mode.id); toast(`${copy.label} ${tx("preview selected.", "تم اختيار المعاينة.")}`); }}><span className="experience-tab-icon"><Icon size={15} /></span><span><strong>{copy.label}</strong><small>{copy.kicker}</small></span>{experience === mode.id && <CheckCircle2 className="experience-check" size={15} />}</button>; })}</div>
            {(() => { const selected = experienceModes.find((mode) => mode.id === experience) ?? experienceModes[0]; const copy = isArabic ? experienceArabic[selected.id] : selected; const PreviewIcon = selected.icon; return <div className={`experience-preview experience-preview-${selected.id}`}><div className="experience-preview-icon"><PreviewIcon size={18} /></div><div className="experience-preview-copy"><span className="eyebrow">{copy.kicker} {tx("experience", "تجربة")}</span><strong>{copy.headline}</strong><p>{copy.description}</p></div><div className="experience-preview-tags">{copy.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{selected.id === "customer" ? <button className="experience-action" onClick={() => setLocation("/portal")}>{tx("Open customer portal", "فتح بوابة العميل")} <ArrowUpRight size={14} /></button> : selected.id === "agent" ? <button className="experience-action" onClick={() => setLocation("/agent")}>{tx("Open agent workspace", "فتح مساحة الموظف")} <ArrowUpRight size={14} /></button> : selected.id === "admin" ? <button className="experience-action" onClick={() => setLocation("/admin")}>{tx("Open administration", "فتح الإدارة")} <ArrowUpRight size={14} /></button> : <button className="experience-action" onClick={() => toast(`${copy.label} ${tx("workspace is ready for the next build step.", "مساحة العمل جاهزة للخطوة التالية.")}`)}>{tx("Explore workspace", "استكشف مساحة العمل")} <ArrowUpRight size={14} /></button>}</div>; })()}
          </section>

          <section className="metric-grid animate-in delay-2" aria-label="Key performance indicators">
            {metricCards.map((metric) => { const Icon = metric.icon; const palette = { teal: { icon: "#18b9a5", soft: "rgba(24,185,165,.11)" }, amber: { icon: "#e3a538", soft: "rgba(227,165,56,.13)" }, blue: { icon: "#6c7cff", soft: "rgba(108,124,255,.12)" }, violet: { icon: "#b276dc", soft: "rgba(178,118,220,.12)" } }[metric.color as "teal" | "amber" | "blue" | "violet"]; return <article className="metric-card" key={metric.label}><div className="metric-card-top"><div className="metric-icon" style={{ color: palette.icon, background: palette.soft }}><Icon size={17} /></div><button className="quiet-menu" aria-label={`More about ${metric.label}`}><MoreHorizontal size={16} /></button></div><div className="metric-value-row"><div><span>{isArabic ? ({"Open cases":"الحالات المفتوحة", "SLA at risk":"الحالات المعرضة لخرق SLA", "First response":"الاستجابة الأولى", "Customer health":"صحة العملاء"} as Record<string,string>)[metric.label] : metric.label}</span><strong>{metric.value}</strong></div><SparkBars values={metric.bars} color={palette.icon} /></div><div className="metric-foot"><span className="metric-delta" style={{ color: palette.icon }}>{metric.delta}</span><span>{isArabic ? ({"vs last week":"مقارنة بالأسبوع الماضي", "since yesterday":"منذ أمس", "this month":"هذا الشهر", "portfolio score":"مؤشر المحفظة"} as Record<string,string>)[metric.note] : metric.note}</span><ArrowUpRight size={13} /></div></article>; })}
          </section>

          <section className="overview-grid animate-in delay-2">
            <article className="panel incident-panel"><div className="panel-heading light-heading"><div><span className="eyebrow eyebrow-light">{tx("Service pulse", "نبض الخدمة")}</span><h2>{tx("Incident activity", "نشاط الحوادث")}</h2></div><div className="live-chip"><span /> {tx("Live", "مباشر")}</div></div><div className="incident-summary"><div><strong>−18%</strong><span>{tx("fewer incidents this week", "حوادث أقل هذا الأسبوع")}</span></div><div className="incident-summary-divider" /><div><strong>97.8%</strong><span>{tx("platform availability", "توافر المنصة")}</span></div></div><div className="line-chart" aria-label="Incident activity trending down"><div className="chart-lines"><span /><span /><span /><span /></div><svg viewBox="0 0 640 190" preserveAspectRatio="none" role="img"><defs><linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#65e1cf" stopOpacity=".28" /><stop offset="100%" stopColor="#65e1cf" stopOpacity="0" /></linearGradient></defs><path d="M0,138 C40,128 62,142 90,117 S138,92 168,110 S213,137 244,101 S290,82 318,94 S360,68 389,81 S438,112 472,79 S512,65 540,48 S588,71 640,33 L640,190 L0,190 Z" fill="url(#pulseFill)" /><path d="M0,138 C40,128 62,142 90,117 S138,92 168,110 S213,137 244,101 S290,82 318,94 S360,68 389,81 S438,112 472,79 S512,65 540,48 S588,71 640,33" fill="none" stroke="#74ead8" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-axis"><span>01 Sep</span><span>08 Sep</span><span>15 Sep</span><span>22 Sep</span><span>28 Sep</span></div></div><div className="pulse-footer"><div><span className="mini-icon"><CheckCircle2 size={14} /></span><span><strong>{tx("All core services operational", "جميع الخدمات الأساسية تعمل")}</strong><small>{tx("Last checked 2 minutes ago", "آخر فحص منذ دقيقتين")}</small></span></div><button className="text-button" onClick={() => toast(tx("Service health map is opening.", "سيتم فتح خريطة صحة الخدمات."))}>{tx("View service health", "عرض صحة الخدمات")} <ArrowUpRight size={14} /></button></div></article>

            <article className="panel queue-panel"><div className="panel-heading"><div><span className="eyebrow">{tx("Workload balance", "توازن أعباء العمل")}</span><h2>{tx("Queue health", "صحة قوائم الانتظار")}</h2></div><button className="quiet-menu"><MoreHorizontal size={17} /></button></div><div className="queue-list">{queueRows.map((queue) => <div className="queue-row" key={queue.name}><div className="queue-row-top"><div className="queue-name"><span className="queue-dot" style={{ background: queue.color }} /><div><strong>{isArabic ? queueArabic[queue.name].name : queue.name}</strong><small>{isArabic ? queueArabic[queue.name].team : queue.team}</small></div></div><div className="queue-meta"><strong>{queue.count}</strong><span>{isArabic ? queueArabic[queue.name].status : queue.status}</span></div></div><div className="queue-progress"><span style={{ width: `${queue.progress}%`, background: queue.color }} /></div></div>)}</div><button className="panel-footer-link" onClick={() => toast(tx("Queue routing workspace is ready.", "مساحة توجيه القوائم جاهزة."))}>{tx("Open queue manager", "فتح مدير القوائم")} <ArrowUpRight size={14} /></button></article>
          </section>

          <section className="lower-grid animate-in delay-3">
            <article className="panel cases-panel"><div className="panel-heading cases-heading"><div><span className="eyebrow">{tx("Triage stream", "مسار الفرز")}</span><h2>{tx("Live case workspace", "مساحة الحالات المباشرة")}</h2></div><div className="case-heading-actions"><button className="filter-button" onClick={() => toast(tx("Advanced filters are ready for your queue.", "الفلاتر المتقدمة جاهزة لقائمتك."))}><Filter size={15} /> {tx("Filter", "تصفية")}</button><button className="quiet-menu"><MoreHorizontal size={17} /></button></div></div><div className="filter-tabs">{filterTabs.map((tab) => <button key={tab} className={activeFilter === tab ? "filter-tab-active" : ""} onClick={() => setActiveFilter(tab)}>{isArabic ? ({"All cases":"كل الحالات", "My queue":"قائمتي", "At risk":"معرضة للخطر", "Major incidents":"الحوادث الكبرى"} as Record<string,string>)[tab] : tab}{tab === "At risk" && <span>12</span>}</button>)}</div><div className="case-table"><div className="case-table-head"><span>{tx("Case", "الحالة")}</span><span>{tx("Tenant", "الجهة")}</span><span>{tx("State", "الحالة")}</span><span>{tx("Owner", "المسؤول")}</span><span>{tx("Age", "العمر")}</span></div>{visibleCases.length ? visibleCases.map((item) => <div className="case-row" key={item.id} onClick={() => toast(`${item.id} opened in case workspace.`)}><div className="case-main"><div className={`case-type-icon ${item.type === "Major incident" ? "major" : ""}`}>{item.type === "Major incident" ? <Radio size={15} /> : item.type === "Change" ? <Settings2 size={15} /> : item.type === "Problem" ? <CircleDot size={15} /> : <MessageSquare size={15} />}</div><div className="case-copy"><strong>{isArabic ? caseArabic[item.id].title : item.title}</strong><span>{item.id} <i /> {isArabic ? caseArabic[item.id].type : item.type}</span></div><span className={`priority-tag ${item.tag.toLowerCase()}`}>{item.tag}</span></div><div className="case-tenant"><strong>{isArabic ? caseArabic[item.id].tenant : item.tenant}</strong><span>{isArabic ? caseArabic[item.id].channel : item.type === "Major incident" ? "Government hierarchy" : "Enterprise support"}</span></div><div><StatusPill tone={item.risk ? "rose" : item.state === "Scheduled" ? "violet" : item.state === "In progress" ? "teal" : "neutral"}>{isArabic ? caseArabic[item.id].state : item.state}</StatusPill></div><div className="case-owner"><span className="owner-avatar" style={{ background: item.color }}>{item.initials}</span><span>{isArabic ? caseArabic[item.id].owner : item.owner}</span></div><span className="case-age">{isArabic ? caseArabic[item.id].age : item.age}</span><ChevronRight className="row-chevron" size={16} /></div>) : <StateNotice kind="empty" title={tx("No cases match this view", "لا توجد حالات مطابقة")} description={tx("Try another filter or search term.", "جرّب فلترًا أو عبارة بحث أخرى.")} />}</div><div className="cases-footer"><span>{tx(`Showing ${visibleCases.length} of 248 open cases`, `عرض ${visibleCases.length} من أصل 248 حالة مفتوحة`)}</span><button className="text-button" onClick={() => toast(tx("Full case workspace is opening.", "سيتم فتح مساحة الحالات الكاملة."))}>{tx("View all cases", "عرض كل الحالات")} <ArrowUpRight size={14} /></button></div></article>

            <article className="panel escalation-panel"><div className="panel-heading"><div><span className="eyebrow">{tx("Next action", "الإجراء التالي")}</span><h2>{tx("Escalation watch", "مراقبة التصعيد")}</h2></div><div className="escalation-count">03</div></div><div className="escalation-list"><div className="escalation-item"><div className="escalation-time"><strong>09:15</strong><span>{tx("in 33 min", "خلال 33 دقيقة")}</span></div><div className="timeline-line"><span className="timeline-dot rose-dot" /></div><div className="escalation-copy"><strong>INC-2026-001842</strong><span>{tx("Executive update due", "موعد تحديث الإدارة")}</span><small>{tx("Ministry of Education · P1", "وزارة التعليم · P1")}</small></div></div><div className="escalation-item"><div className="escalation-time"><strong>10:00</strong><span>{tx("in 1 hr", "خلال ساعة")}</span></div><div className="timeline-line"><span className="timeline-dot amber-dot" /></div><div className="escalation-copy"><strong>SR-2026-004531</strong><span>{tx("Assignment review", "مراجعة الإسناد")}</span><small>{tx("Al Noor University · P3", "جامعة النور · P3")}</small></div></div><div className="escalation-item"><div className="escalation-time"><strong>11:40</strong><span>{tx("in 2 hrs", "خلال ساعتين")}</span></div><div className="timeline-line"><span className="timeline-dot teal-dot" /></div><div className="escalation-copy"><strong>CHG-2026-001422</strong><span>{tx("Change approval window", "نافذة اعتماد التغيير")}</span><small>{tx("Classera global · P2", "كلاسيرا العالمية · P2")}</small></div></div></div><button className="panel-footer-link" onClick={() => toast(tx("Escalation calendar is opening.", "سيتم فتح تقويم التصعيد."))}>{tx("Open escalation calendar", "فتح تقويم التصعيد")} <ArrowUpRight size={14} /></button></article>
          </section>

          <section className="bottom-insight animate-in delay-4"><div className="insight-icon"><TrendingUp size={18} /></div><div><strong>{tx("Signal detected: repeated SSO timeouts", "تم رصد إشارة: تكرار مهلات SSO")}</strong><p>{tx("3 incidents across 2 tenants may be linked to the same known error. Create a problem record and notify the product team.", "قد تكون 3 حوادث عبر جهتين مرتبطة بالخطأ نفسه. أنشئ سجل مشكلة وأبلغ فريق المنتج.")}</p></div><button className="secondary-button" onClick={() => toast(tx("Problem record draft created.", "تم إنشاء مسودة سجل المشكلة."))}>{tx("Review signal", "مراجعة الإشارة")} <ArrowUpRight size={14} /></button></section>
        </div>
      </main>

      {newCaseOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setNewCaseOpen(false)}><div className="new-case-modal" role="dialog" aria-modal="true" aria-labelledby="new-case-title"><div className="modal-header"><div><span className="eyebrow">Case intake</span><h2 id="new-case-title">Create a new case</h2><p>Capture the request, then let routing and SLA rules do the work.</p></div><button className="icon-button" onClick={() => setNewCaseOpen(false)}><X size={18} /></button></div><form onSubmit={submitNewCase}><label>Subject<input autoFocus value={caseTitle} onChange={(event) => setCaseTitle(event.target.value)} placeholder="What does the customer need help with?" /></label><div className="form-grid"><label>Case type<select defaultValue="incident"><option value="incident">Incident</option><option value="request">Service request</option><option value="problem">Problem</option><option value="change">Change</option></select></label><label>Priority<select defaultValue="p2"><option value="p1">P1 · Critical</option><option value="p2">P2 · High</option><option value="p3">P3 · Normal</option><option value="p4">P4 · Low</option></select></label></div><div className="modal-foot"><span><Sparkles size={14} /> AI classification will suggest a queue</span><div><button type="button" className="secondary-button" onClick={() => setNewCaseOpen(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={16} /> Create draft</button></div></div></form></div></div>}
      {toastMessage && <div className="custom-toast"><CheckCircle2 size={16} />{toastMessage}</div>}
    </div>
  );
}
