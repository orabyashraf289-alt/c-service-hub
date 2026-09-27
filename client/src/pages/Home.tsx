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

const queueRows = [
  { name: "Classera LMS", team: "Product support", count: 82, progress: 78, color: "#16b8a6", status: "Healthy" },
  { name: "Government entities", team: "Priority desk", count: 41, progress: 64, color: "#6c7cff", status: "Stable" },
  { name: "C-Pay & billing", team: "Finance ops", count: 27, progress: 46, color: "#f3b64d", status: "Watch" },
  { name: "Integrations", team: "L2 specialists", count: 19, progress: 33, color: "#ef7d91", status: "Watch" },
];

const cases = [
  { id: "INC-2026-001842", title: "Learner login failures across Cairo Directorate", tenant: "Ministry of Education", type: "Major incident", tag: "P1", state: "Investigating", owner: "Nadia K.", initials: "NK", color: "#7c8cff", age: "11 min ago", risk: true },
  { id: "SR-2026-004531", title: "Provision 320 faculty accounts for new campus", tenant: "Al Noor University", type: "Service request", tag: "P3", state: "In progress", owner: "Omar T.", initials: "OT", color: "#33bfae", age: "24 min ago", risk: false },
  { id: "INC-2026-001839", title: "Attendance sync delayed for 14 schools", tenant: "Riyadh Schools Group", type: "Incident", tag: "P2", state: "Awaiting vendor", owner: "Maya S.", initials: "MS", color: "#f0aa46", age: "39 min ago", risk: true },
  { id: "CHG-2026-001422", title: "C-Pay gateway certificate rotation", tenant: "Classera global", type: "Change", tag: "P2", state: "Scheduled", owner: "Yousef A.", initials: "YA", color: "#de7d9e", age: "1 hr ago", risk: false },
  { id: "PRB-2026-000302", title: "Recurring SSO timeout on peak mornings", tenant: "Al Zahra University", type: "Problem", tag: "P2", state: "Root cause", owner: "Hala R.", initials: "HR", color: "#5db2c6", age: "2 hrs ago", risk: false },
];

const filterTabs = ["All cases", "My queue", "At risk", "Major incidents"];

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
  const [activeFilter, setActiveFilter] = useState("All cases");
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
    if (name !== "Overview") toast(`${name} is ready in the next workspace view.`);
  };

  const submitNewCase = (event: React.FormEvent) => {
    event.preventDefault();
    if (!caseTitle.trim()) return;
    setNewCaseOpen(false);
    setCaseTitle("");
    toast("Draft case created — assignment rules are ready to run.");
  };

  return (
    <div className="app-shell">
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
              <span className="nav-label">{section.label}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.name;
                return <button key={item.name} className={`nav-item ${isActive ? "nav-item-active" : ""}`} onClick={() => selectNav(item.name)}><Icon size={17} strokeWidth={isActive ? 2.25 : 1.8} /><span>{item.name}</span>{item.count && <em>{item.count}</em>}</button>;
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
          <div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button><div className="breadcrumb"><span>Control room</span><ChevronRight size={14} /><strong>{activeNav}</strong></div></div>
          <div className="topbar-actions">
            <div className="global-search"><Search size={16} /><input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases, customers, services…" /><kbd><Command size={12} /> K</kbd></div>
            <div className="topbar-divider" />
            <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} /><span /></button>{notificationsOpen && <div className="notification-popover"><div className="popover-heading"><div><span className="eyebrow">Live feed</span><strong>Notifications</strong></div><button onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div><div className="notification-item"><span className="notification-icon rose"><AlertTriangle size={15} /></span><div><strong>Major incident detected</strong><p>INC-2026-001842 crossed the P1 threshold.</p><small>11 min ago</small></div></div><div className="notification-item"><span className="notification-icon teal"><CheckCircle2 size={15} /></span><div><strong>SLA recovered</strong><p>12 cases returned to healthy timing.</p><small>34 min ago</small></div></div><button className="popover-link" onClick={() => toast("All notifications are marked as read.")}>Mark all as read</button></div>}</div>
            <button className="user-mini"><span>SA</span><ChevronDown size={14} /></button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading animate-in"><div><span className="eyebrow">Monday · 28 September 2026 · 08:42 UTC</span><h1>Good morning, Sarah.</h1><p>Here’s the operating picture across your service portfolio.</p></div><div className="heading-actions"><button className="secondary-button" onClick={() => toast("Date range selector is ready for live data.")}><CalendarDays size={16} /> Last 30 days <ChevronDown size={14} /></button><button className="primary-button" onClick={() => setNewCaseOpen(true)}><Plus size={17} /> New case</button></div></section>

          <section className="metric-grid animate-in delay-1" aria-label="Key performance indicators">
            {metricCards.map((metric) => { const Icon = metric.icon; const palette = { teal: { icon: "#18b9a5", soft: "rgba(24,185,165,.11)" }, amber: { icon: "#e3a538", soft: "rgba(227,165,56,.13)" }, blue: { icon: "#6c7cff", soft: "rgba(108,124,255,.12)" }, violet: { icon: "#b276dc", soft: "rgba(178,118,220,.12)" } }[metric.color as "teal" | "amber" | "blue" | "violet"]; return <article className="metric-card" key={metric.label}><div className="metric-card-top"><div className="metric-icon" style={{ color: palette.icon, background: palette.soft }}><Icon size={17} /></div><button className="quiet-menu" aria-label={`More about ${metric.label}`}><MoreHorizontal size={16} /></button></div><div className="metric-value-row"><div><span>{metric.label}</span><strong>{metric.value}</strong></div><SparkBars values={metric.bars} color={palette.icon} /></div><div className="metric-foot"><span className="metric-delta" style={{ color: palette.icon }}>{metric.delta}</span><span>{metric.note}</span><ArrowUpRight size={13} /></div></article>; })}
          </section>

          <section className="overview-grid animate-in delay-2">
            <article className="panel incident-panel"><div className="panel-heading light-heading"><div><span className="eyebrow eyebrow-light">Service pulse</span><h2>Incident activity</h2></div><div className="live-chip"><span /> Live</div></div><div className="incident-summary"><div><strong>−18%</strong><span>fewer incidents this week</span></div><div className="incident-summary-divider" /><div><strong>97.8%</strong><span>platform availability</span></div></div><div className="line-chart" aria-label="Incident activity trending down"><div className="chart-lines"><span /><span /><span /><span /></div><svg viewBox="0 0 640 190" preserveAspectRatio="none" role="img"><defs><linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#65e1cf" stopOpacity=".28" /><stop offset="100%" stopColor="#65e1cf" stopOpacity="0" /></linearGradient></defs><path d="M0,138 C40,128 62,142 90,117 S138,92 168,110 S213,137 244,101 S290,82 318,94 S360,68 389,81 S438,112 472,79 S512,65 540,48 S588,71 640,33 L640,190 L0,190 Z" fill="url(#pulseFill)" /><path d="M0,138 C40,128 62,142 90,117 S138,92 168,110 S213,137 244,101 S290,82 318,94 S360,68 389,81 S438,112 472,79 S512,65 540,48 S588,71 640,33" fill="none" stroke="#74ead8" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-axis"><span>01 Sep</span><span>08 Sep</span><span>15 Sep</span><span>22 Sep</span><span>28 Sep</span></div></div><div className="pulse-footer"><div><span className="mini-icon"><CheckCircle2 size={14} /></span><span><strong>All core services operational</strong><small>Last checked 2 minutes ago</small></span></div><button className="text-button" onClick={() => toast("Service health map is opening.")}>View service health <ArrowUpRight size={14} /></button></div></article>

            <article className="panel queue-panel"><div className="panel-heading"><div><span className="eyebrow">Workload balance</span><h2>Queue health</h2></div><button className="quiet-menu"><MoreHorizontal size={17} /></button></div><div className="queue-list">{queueRows.map((queue) => <div className="queue-row" key={queue.name}><div className="queue-row-top"><div className="queue-name"><span className="queue-dot" style={{ background: queue.color }} /><div><strong>{queue.name}</strong><small>{queue.team}</small></div></div><div className="queue-meta"><strong>{queue.count}</strong><span>{queue.status}</span></div></div><div className="queue-progress"><span style={{ width: `${queue.progress}%`, background: queue.color }} /></div></div>)}</div><button className="panel-footer-link" onClick={() => toast("Queue routing workspace is ready.")}>Open queue manager <ArrowUpRight size={14} /></button></article>
          </section>

          <section className="lower-grid animate-in delay-3">
            <article className="panel cases-panel"><div className="panel-heading cases-heading"><div><span className="eyebrow">Triage stream</span><h2>Live case workspace</h2></div><div className="case-heading-actions"><button className="filter-button" onClick={() => toast("Advanced filters are ready for your queue.")}><Filter size={15} /> Filter</button><button className="quiet-menu"><MoreHorizontal size={17} /></button></div></div><div className="filter-tabs">{filterTabs.map((tab) => <button key={tab} className={activeFilter === tab ? "filter-tab-active" : ""} onClick={() => setActiveFilter(tab)}>{tab}{tab === "At risk" && <span>12</span>}</button>)}</div><div className="case-table"><div className="case-table-head"><span>Case</span><span>Tenant</span><span>State</span><span>Owner</span><span>Age</span></div>{visibleCases.length ? visibleCases.map((item) => <div className="case-row" key={item.id} onClick={() => toast(`${item.id} opened in case workspace.`)}><div className="case-main"><div className={`case-type-icon ${item.type === "Major incident" ? "major" : ""}`}>{item.type === "Major incident" ? <Radio size={15} /> : item.type === "Change" ? <Settings2 size={15} /> : item.type === "Problem" ? <CircleDot size={15} /> : <MessageSquare size={15} />}</div><div className="case-copy"><strong>{item.title}</strong><span>{item.id} <i /> {item.type}</span></div><span className={`priority-tag ${item.tag.toLowerCase()}`}>{item.tag}</span></div><div className="case-tenant"><strong>{item.tenant}</strong><span>{item.type === "Major incident" ? "Government hierarchy" : "Enterprise support"}</span></div><div><StatusPill tone={item.risk ? "rose" : item.state === "Scheduled" ? "violet" : item.state === "In progress" ? "teal" : "neutral"}>{item.state}</StatusPill></div><div className="case-owner"><span className="owner-avatar" style={{ background: item.color }}>{item.initials}</span><span>{item.owner}</span></div><span className="case-age">{item.age}</span><ChevronRight className="row-chevron" size={16} /></div>) : <div className="empty-state"><Search size={20} /><strong>No cases match this view</strong><span>Try another filter or search term.</span></div>}</div><div className="cases-footer"><span>Showing {visibleCases.length} of 248 open cases</span><button className="text-button" onClick={() => toast("Full case workspace is opening.")}>View all cases <ArrowUpRight size={14} /></button></div></article>

            <article className="panel escalation-panel"><div className="panel-heading"><div><span className="eyebrow">Next action</span><h2>Escalation watch</h2></div><div className="escalation-count">03</div></div><div className="escalation-list"><div className="escalation-item"><div className="escalation-time"><strong>09:15</strong><span>in 33 min</span></div><div className="timeline-line"><span className="timeline-dot rose-dot" /></div><div className="escalation-copy"><strong>INC-2026-001842</strong><span>Executive update due</span><small>Ministry of Education · P1</small></div></div><div className="escalation-item"><div className="escalation-time"><strong>10:00</strong><span>in 1 hr</span></div><div className="timeline-line"><span className="timeline-dot amber-dot" /></div><div className="escalation-copy"><strong>SR-2026-004531</strong><span>Assignment review</span><small>Al Noor University · P3</small></div></div><div className="escalation-item"><div className="escalation-time"><strong>11:40</strong><span>in 2 hrs</span></div><div className="timeline-line"><span className="timeline-dot teal-dot" /></div><div className="escalation-copy"><strong>CHG-2026-001422</strong><span>Change approval window</span><small>Classera global · P2</small></div></div></div><button className="panel-footer-link" onClick={() => toast("Escalation calendar is opening.")}>Open escalation calendar <ArrowUpRight size={14} /></button></article>
          </section>

          <section className="bottom-insight animate-in delay-4"><div className="insight-icon"><TrendingUp size={18} /></div><div><strong>Signal detected: repeated SSO timeouts</strong><p>3 incidents across 2 tenants may be linked to the same known error. Create a problem record and notify the product team.</p></div><button className="secondary-button" onClick={() => toast("Problem record draft created.")}>Review signal <ArrowUpRight size={14} /></button></section>
        </div>
      </main>

      {newCaseOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setNewCaseOpen(false)}><div className="new-case-modal" role="dialog" aria-modal="true" aria-labelledby="new-case-title"><div className="modal-header"><div><span className="eyebrow">Case intake</span><h2 id="new-case-title">Create a new case</h2><p>Capture the request, then let routing and SLA rules do the work.</p></div><button className="icon-button" onClick={() => setNewCaseOpen(false)}><X size={18} /></button></div><form onSubmit={submitNewCase}><label>Subject<input autoFocus value={caseTitle} onChange={(event) => setCaseTitle(event.target.value)} placeholder="What does the customer need help with?" /></label><div className="form-grid"><label>Case type<select defaultValue="incident"><option value="incident">Incident</option><option value="request">Service request</option><option value="problem">Problem</option><option value="change">Change</option></select></label><label>Priority<select defaultValue="p2"><option value="p1">P1 · Critical</option><option value="p2">P2 · High</option><option value="p3">P3 · Normal</option><option value="p4">P4 · Low</option></select></label></div><div className="modal-foot"><span><Sparkles size={14} /> AI classification will suggest a queue</span><div><button type="button" className="secondary-button" onClick={() => setNewCaseOpen(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={16} /> Create draft</button></div></div></form></div></div>}
      {toastMessage && <div className="custom-toast"><CheckCircle2 size={16} />{toastMessage}</div>}
    </div>
  );
}
