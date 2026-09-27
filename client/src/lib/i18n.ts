export type Locale = "en" | "ar";

export function t(locale: Locale, english: string, arabic: string) {
  return locale === "ar" ? arabic : english;
}

export const navArabic: Record<string, string> = {
  "Control room": "غرفة التحكم",
  "Service operations": "عمليات الخدمة",
  Platform: "المنصة",
  Overview: "نظرة عامة",
  "Case workspace": "مساحة الحالات",
  "Major incidents": "الحوادث الكبرى",
  "Customer health": "صحة العملاء",
  "Service catalog": "كتالوج الخدمات",
  "Queues & routing": "قوائم الانتظار والتوجيه",
  "SLA & escalations": "اتفاقيات الخدمة والتصعيد",
  "Knowledge base": "قاعدة المعرفة",
  Organizations: "الجهات",
  "Team & access": "الفريق والصلاحيات",
  Automation: "الأتمتة",
  "Audit log": "سجل التدقيق",
};

export const experienceArabic: Record<string, { label: string; kicker: string; headline: string; description: string; tags: string[] }> = {
  command: { label: "مركز القيادة", kicker: "الإدارة", headline: "شاهد الصورة التشغيلية كاملة في لمحة.", description: "صحة المحفظة، مخاطر SLA، الحوادث الكبرى، وإشارات العملاء لقادة الخدمة.", tags: ["صحة المحفظة", "SLA والتصعيد", "قيادة الحوادث"] },
  customer: { label: "بوابة العميل", kicker: "خارجي", headline: "ساعد العملاء للوصول إلى الخدمة الصحيحة أسرع.", description: "واجهة هادئة وموجهة لطرح الأسئلة وتتبع الطلبات ومعرفة حالة الخدمة.", tags: ["اسأل / ابحث", "طلباتي", "حالة الخدمة"] },
  agent: { label: "مساحة الموظف", kicker: "العمليات", headline: "ضع الأعمال ذات الأولوية قبل الرسوم البيانية.", description: "مساحة مركزة لإدارة القوائم ومخاطر SLA وردود العملاء والخطوة التالية.", tags: ["أعمالي ذات الأولوية", "طرق عرض القوائم", "سياق الحالة"] },
  admin: { label: "الإدارة", kicker: "المنصة", headline: "اضبط نظام تشغيل الخدمة بالكامل.", description: "أدر الجهات والمؤسسات والأدوار والنماذج وسير العمل والتوجيه والتدقيق.", tags: ["إعداد الجهة", "منشئ سير العمل", "التدقيق والصلاحيات"] },
};

export const caseTypeArabic: Record<string, string> = {
  "Major incident": "حادث كبير",
  "Service request": "طلب خدمة",
  Incident: "حادث",
  Change: "تغيير",
  Problem: "مشكلة",
};

export const caseStateArabic: Record<string, string> = {
  Investigating: "قيد التحقيق",
  "In progress": "قيد التنفيذ",
  "Awaiting vendor": "بانتظار المورّد",
  Scheduled: "مجدول",
  "Root cause": "تحليل السبب الجذري",
};
