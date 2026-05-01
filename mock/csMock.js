// ═══ CS AGENT MOCK DATA ═══
// Extracted from CsAgent.jsx inline data — components never import this file directly.

export const MOCK_CS_TICKETS = [
  { id: 1045, name: 'محمد حسن', initials: 'مح', subject: 'لم يتم معالجة الدفع — فودافون كاش', priority: 'عاجل', status: 'مفتوح', time: 'منذ 2 دقيقة', pClass: 'p-urgent', unread: true },
  { id: 1044, name: 'خالد علي', initials: 'خع', subject: 'تأخر المزود 35 دقيقة', priority: 'عالي', status: 'قيد المعالجة', time: 'منذ 15 دقيقة', pClass: 'p-high' },
  { id: 1043, name: 'نور محمد', initials: 'نم', subject: 'نوع وقود خاطئ — أوكتان 95 بدلاً من 92', priority: 'عالي', status: 'قيد المعالجة', time: 'منذ 42 دقيقة', pClass: 'p-high', unread: true },
  { id: 1042, name: 'سارة أحمد', initials: 'سأ', subject: 'تعطل التطبيق أثناء الدفع', priority: 'متوسط', status: 'قيد المعالجة', time: 'منذ ساعة', pClass: 'p-medium' },
  { id: 1041, name: 'ليلى إبراهيم', initials: 'لإ', subject: 'مزود الونش ألغى طلبي فجأة', priority: 'عاجل', status: 'مفتوح', time: 'منذ ساعة', pClass: 'p-urgent', unread: true },
  { id: 1040, name: 'يوسف سالم', initials: 'يس', subject: 'لا يمكن تحديث رقم لوحة المركبة', priority: 'منخفض', status: 'مفتوح', time: 'منذ ساعتين', pClass: 'p-low' },
  { id: 1039, name: 'أحمد مصطفى', initials: 'أم', subject: 'طلب استرداد — تم الشحن مرتين', priority: 'عاجل', status: 'مفتوح', time: 'منذ 3 ساعات', pClass: 'p-urgent', unread: true },
  { id: 1038, name: 'رامي فؤاد', initials: 'رف', subject: 'انتهى الاشتراك لكن تم الشحن', priority: 'متوسط', status: 'مفتوح', time: 'منذ 4 ساعات', pClass: 'p-medium' },
];

export const MOCK_CS_TICKETS_STATS = {
  urgent: 3,
  inProgress: 5,
  resolved: 12,
};

export const MOCK_CS_MESSAGES = [
  { from: 'driver', initials: 'مح', text: 'مرحباً، دفعت 450 جنيه عبر فودافون كاش لاشتراك سمارت ترافيك بريميوم لكن لم يتم تفعيل حسابي. رقم العملية: VF-998342. رجاءً ساعدوني!', time: '10:42 ص' },
  { from: 'agent', initials: 'سك', text: 'مرحباً محمد! شكراً لتواصلك. أنا سارة من فريق دعم سمارت ترافيك. أبحث في عملية الدفع الآن — هل يمكنك تأكيد رقم الهاتف الذي استخدمته لدفع فودافون كاش؟', time: '10:44 ص' },
  { type: 'note', text: 'تم التحقق من بوابة الدفع — VF-998342 يظهر خصم ناجح من جانب السائق. على الأرجح فشل webhook تفعيل الاشتراك. تم التصعيد للفريق التقني.' },
  { from: 'driver', initials: 'مح', text: 'الرقم الذي استخدمته هو 01012345678. تم خصم المبلغ من محفظة فودافون كاش لكن لم يحدث شيء في التطبيق. مر ساعتين الآن.', time: '10:46 ص' },
  { type: 'system', text: '── تم تعيين التذكرة لـ سارة كمال ──' },
  { from: 'agent', initials: 'سك', text: 'شكراً محمد. تأكدت من الدفع — العملية تمت بنجاح. أقوم بتفعيل اشتراكك يدوياً الآن. يجب أن تتلقى تأكيداً خلال دقيقتين.', time: '10:48 ص' },
  { from: 'driver', initials: 'مح', text: 'شكراً جزيلاً! تحققت من التطبيق الآن ويظهر Premium. أقدر جداً المساعدة السريعة! 🙏', time: '10:52 ص' },
];

export const MOCK_CS_DRIVER_CONTEXT = {
  initials: 'مح',
  name: 'محمد حسن',
  plate: 'س ع أ - 2345',
  rating: '4.8',
  ticketCount: '23',
  phone: '+20 112 345 6789',
  email: 'mohamed@example.com',
  subscription: 'بريميوم',
  since: 'يناير 2024',
};

export const MOCK_CS_DRIVER_LOOKUP = {
  initials: 'مح',
  name: 'محمد حسن',
  email: 'mohamed.hassan@example.com',
  phone: '+20 112 345 6789',
  vehicle: 'تويوتا كامري 2023',
  plate: 'س ع أ - 2345',
  rating: '4.8 / 5.0',
  status: 'نشط',
  subscription: 'بريميوم',
};

export const MOCK_CS_REPORTS = {
  stats: [
    { icon: '📊', label: 'إجمالي التذاكر', val: '156', color: 'var(--neon)', delta: '↑ 12% هذا الشهر' },
    { icon: '⏱️', label: 'متوسط وقت الحل', val: '23 د', color: 'var(--blue)', delta: '↓ 15% أسرع' },
    { icon: '⭐', label: 'تقييم CSAT', val: '4.8', color: 'var(--amber)', delta: 'من 89 تقييم' },
    { icon: '🔥', label: 'معدل الحل', val: '94%', color: 'var(--neon)', delta: 'أعلى من المتوسط' },
  ],
  weeklyChart: [
    { label: 'سبت', val: 12, pct: 40 },
    { label: 'أحد', val: 18, pct: 60 },
    { label: 'إثنين', val: 24, pct: 80 },
    { label: 'ثلاثاء', val: 30, pct: 100 },
    { label: 'أربعاء', val: 22, pct: 73 },
    { label: 'خميس', val: 28, pct: 93 },
    { label: 'جمعة', val: 15, pct: 50 },
  ],
};
