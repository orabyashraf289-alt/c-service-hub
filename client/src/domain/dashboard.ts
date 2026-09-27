export type CaseKind = "Major incident" | "Service request" | "Incident" | "Change" | "Problem";
export type CaseState = "Investigating" | "In progress" | "Awaiting vendor" | "Scheduled" | "Root cause";

export interface DashboardCase {
  id: string;
  title: string;
  tenant: string;
  type: CaseKind;
  tag: "P1" | "P2" | "P3" | "P4";
  state: CaseState;
  owner: string;
  initials: string;
  color: string;
  age: string;
  risk: boolean;
}

export interface QueueHealth {
  name: string;
  team: string;
  count: number;
  progress: number;
  color: string;
  status: "Healthy" | "Stable" | "Watch";
}

export interface LocalizedCaseCopy {
  title: string;
  tenant: string;
  type: string;
  state: string;
  owner: string;
  age: string;
  channel: string;
}

export interface LocalizedQueueCopy {
  name: string;
  team: string;
  status: string;
}

export const dashboardQueues: QueueHealth[] = [
  { name: "Classera LMS", team: "Product support", count: 82, progress: 78, color: "#16b8a6", status: "Healthy" },
  { name: "Government entities", team: "Priority desk", count: 41, progress: 64, color: "#6c7cff", status: "Stable" },
  { name: "C-Pay & billing", team: "Finance ops", count: 27, progress: 46, color: "#f3b64d", status: "Watch" },
  { name: "Integrations", team: "L2 specialists", count: 19, progress: 33, color: "#ef7d91", status: "Watch" },
];

export const dashboardCases: DashboardCase[] = [
  { id: "INC-2026-001842", title: "Learner login failures across Cairo Directorate", tenant: "Ministry of Education", type: "Major incident", tag: "P1", state: "Investigating", owner: "Nadia K.", initials: "NK", color: "#7c8cff", age: "11 min ago", risk: true },
  { id: "SR-2026-004531", title: "Provision 320 faculty accounts for new campus", tenant: "Al Noor University", type: "Service request", tag: "P3", state: "In progress", owner: "Omar T.", initials: "OT", color: "#33bfae", age: "24 min ago", risk: false },
  { id: "INC-2026-001839", title: "Attendance sync delayed for 14 schools", tenant: "Riyadh Schools Group", type: "Incident", tag: "P2", state: "Awaiting vendor", owner: "Maya S.", initials: "MS", color: "#f0aa46", age: "39 min ago", risk: true },
  { id: "CHG-2026-001422", title: "C-Pay gateway certificate rotation", tenant: "Classera global", type: "Change", tag: "P2", state: "Scheduled", owner: "Yousef A.", initials: "YA", color: "#de7d9e", age: "1 hr ago", risk: false },
  { id: "PRB-2026-000302", title: "Recurring SSO timeout on peak mornings", tenant: "Al Zahra University", type: "Problem", tag: "P2", state: "Root cause", owner: "Hala R.", initials: "HR", color: "#5db2c6", age: "2 hrs ago", risk: false },
];

export const dashboardFilterTabs = ["All cases", "My queue", "At risk", "Major incidents"] as const;

export const queueArabic: Record<string, LocalizedQueueCopy> = {
  "Classera LMS": { name: "كلاسيرا LMS", team: "دعم المنتجات", status: "سليمة" },
  "Government entities": { name: "الجهات الحكومية", team: "مكتب الأولوية", status: "مستقرة" },
  "C-Pay & billing": { name: "C-Pay والفوترة", team: "عمليات المالية", status: "تحت المراقبة" },
  Integrations: { name: "التكاملات", team: "متخصصو المستوى الثاني", status: "تحت المراقبة" },
};

export const caseArabic: Record<string, LocalizedCaseCopy> = {
  "INC-2026-001842": { title: "تعذر تسجيل دخول المتعلمين في مديرية القاهرة", tenant: "وزارة التعليم", type: "حادث كبير", state: "قيد التحقيق", owner: "نادية ك.", age: "منذ 11 دقيقة", channel: "الحكومة الهرمية" },
  "SR-2026-004531": { title: "تجهيز 320 حسابًا لأعضاء هيئة التدريس في الحرم الجديد", tenant: "جامعة النور", type: "طلب خدمة", state: "قيد التنفيذ", owner: "عمر ط.", age: "منذ 24 دقيقة", channel: "دعم المؤسسات" },
  "INC-2026-001839": { title: "تأخر مزامنة الحضور في 14 مدرسة", tenant: "مجموعة مدارس الرياض", type: "حادث", state: "بانتظار المورّد", owner: "مايا س.", age: "منذ 39 دقيقة", channel: "دعم المؤسسات" },
  "CHG-2026-001422": { title: "تدوير شهادة بوابة C-Pay", tenant: "كلاسيرا العالمية", type: "تغيير", state: "مجدول", owner: "يوسف أ.", age: "منذ ساعة", channel: "دعم المؤسسات" },
  "PRB-2026-000302": { title: "تكرار مهلة SSO في أوقات الذروة الصباحية", tenant: "جامعة الزهراء", type: "مشكلة", state: "تحليل السبب الجذري", owner: "هالة ر.", age: "منذ ساعتين", channel: "دعم المؤسسات" },
};

