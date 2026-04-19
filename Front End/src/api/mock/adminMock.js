// ═══ ADMIN MOCK DATA ═══
// Extracted from Admin.jsx inline data — components never import this file directly.

export const MOCK_ADMIN_DASHBOARD = {
  stats: [
    { icon: '👥', label: 'إجمالي المستخدمين', val: '52,340', color: 'var(--blue)', delta: '↑ 34% هذا الشهر' },
    { icon: '🚗', label: 'مزودو الخدمة', val: '1,284', color: 'var(--neon)', delta: '↑ 22% نشط' },
    { icon: '🏪', label: 'البائعون', val: '342', color: 'var(--purple)', delta: '28 معلق' },
    { icon: '📡', label: 'أجهزة استشعار', val: '32', color: 'var(--amber)', delta: '30 نشط · 1 تحذير' },
  ],
  trafficMap: [
    { top: '25%', left: '30%', color: 'var(--neon)', label: 'التجمع', density: 72 },
    { top: '40%', left: '55%', color: 'var(--red)', label: 'الدقي', density: 95 },
    { top: '60%', left: '40%', color: 'var(--amber)', label: 'المعادي', density: 89 },
    { top: '30%', left: '65%', color: 'var(--neon)', label: 'مصر الجديدة', density: 58 },
    { top: '55%', left: '25%', color: 'var(--neon)', label: '6 أكتوبر', density: 44 },
    { top: '70%', left: '60%', color: 'var(--neon)', label: 'مدينة نصر', density: 65 },
  ],
  systemStatus: [
    { name: 'بوابة API', status: 'تعمل', uptime: '99.97%', color: 'var(--neon)' },
    { name: 'قاعدة البيانات', status: 'تعمل', uptime: '99.99%', color: 'var(--neon)' },
    { name: 'SignalR Hub', status: 'تعمل', uptime: '99.94%', color: 'var(--neon)' },
    { name: 'بوابة الدفع', status: 'تعمل', uptime: '99.91%', color: 'var(--neon)' },
    { name: 'شبكة IoT', status: 'تحذير', uptime: '98.2%', color: 'var(--amber)' },
  ],
  recentActivity: [
    { icon: '✅', text: 'تمت الموافقة على مزود خدمة: سريع للنقل', time: 'منذ 12 د', color: 'var(--neon-dim)' },
    { icon: '⚠️', text: 'تنبيه جهاز استشعار: الدقي — كثافة 95%', time: 'منذ 28 د', color: 'var(--amber-dim)' },
    { icon: '👤', text: 'مستخدم جديد: محمد حسن (سائق)', time: 'منذ 45 د', color: 'var(--blue-dim)' },
    { icon: '🚗', text: 'طلب طوارئ #4417 — تم التعيين', time: 'منذ ساعة', color: 'var(--red-dim)' },
    { icon: '💰', text: 'تحويل أرباح: 145,000 جنيه — 12 مزود', time: 'منذ 2 س', color: 'var(--neon-dim)' },
  ],
};

export const MOCK_ADMIN_ANALYTICS = {
  stats: [
    { label: 'إجمالي الإيراد', val: '1.4M جنيه', color: 'var(--neon)', delta: '↑ 12% هذا الشهر' },
    { label: 'طلبات هذا الشهر', val: '3,284', color: 'var(--blue)', delta: '↑ 8% عن الشهر السابق' },
    { label: 'متوسط التقييم', val: '4.7 ★', color: 'var(--yellow)', delta: 'من 1,284 تقييم' },
    { label: 'معدل إتمام الطلبات', val: '96.4%', color: 'var(--neon)', delta: '↑ 2.1% تحسن' },
  ],
  monthlyChart: [
    { m: 'يناير', v: 18400 }, { m: 'فبراير', v: 21200 }, { m: 'مارس', v: 24800 },
    { m: 'أبريل', v: 28400 }, { m: 'مايو', v: 32100 }, { m: 'يونيو', v: 29800 },
    { m: 'يوليو', v: 26500 }, { m: 'أغسطس', v: 24100 }, { m: 'سبتمبر', v: 27900 },
    { m: 'أكتوبر', v: 31400 }, { m: 'نوفمبر', v: 34200 }, { m: 'ديسمبر', v: 38500 },
  ],
  userActivity: [55, 72, 60, 88, 75, 95, 82],
};

export const MOCK_ADMIN_APPROVALS = [
  { id: 'APR-101', name: 'سريع للنقل', type: 'مزود خدمة', service: 'ونش', docs: 4, date: '10 مارس', img: '🚛' },
  { id: 'APR-102', name: 'متجر الأمان', type: 'بائع', service: 'قطع غيار', docs: 3, date: '11 مارس', img: '🏪' },
  { id: 'APR-103', name: 'وقود إكسبرس', type: 'مزود خدمة', service: 'توصيل وقود', docs: 5, date: '12 مارس', img: '⛽' },
  { id: 'APR-104', name: 'أحمد ميكانيك', type: 'مزود خدمة', service: 'ميكانيكي', docs: 3, date: '13 مارس', img: '🔧' },
];

export const MOCK_ADMIN_APPROVALS_STATS = [
  { icon: '⏳', label: 'معلق', val: 8, color: 'var(--amber)' },
  { icon: '✅', label: 'موافق عليه', val: 45, color: 'var(--neon)' },
  { icon: '❌', label: 'مرفوض', val: 3, color: 'var(--red)' },
];

export const MOCK_ADMIN_SENSORS = [
  { id: 'SNS-001', name: 'التجمع الخامس', status: 'نشط', density: 72, speed: 45, temp: 28, alerts: 0 },
  { id: 'SNS-002', name: 'المعادي', status: 'نشط', density: 89, speed: 22, temp: 31, alerts: 2 },
  { id: 'SNS-003', name: 'مدينة نصر', status: 'نشط', density: 65, speed: 55, temp: 27, alerts: 0 },
  { id: 'SNS-004', name: 'الدقي', status: 'تحذير', density: 95, speed: 12, temp: 33, alerts: 4 },
  { id: 'SNS-005', name: 'مصر الجديدة', status: 'نشط', density: 58, speed: 48, temp: 26, alerts: 1 },
  { id: 'SNS-006', name: '6 أكتوبر', status: 'نشط', density: 44, speed: 68, temp: 29, alerts: 0 },
  { id: 'SNS-007', name: 'شبرا', status: 'غير متصل', density: 0, speed: 0, temp: 0, alerts: 0 },
  { id: 'SNS-008', name: 'حلوان', status: 'نشط', density: 37, speed: 72, temp: 30, alerts: 0 },
];

export const MOCK_ADMIN_TRAFFIC = {
  legend: { smooth: 4, medium: 2, heavy: 1 },
  markers: [
    { top: '28%', left: '20%', color: 'var(--neon)', label: 'التجمع', size: 16 },
    { top: '58%', left: '45%', color: 'var(--red)', label: 'الدقي', size: 20 },
    { top: '35%', left: '70%', color: 'var(--amber)', label: 'المعادي', size: 18 },
    { top: '25%', left: '50%', color: 'var(--neon)', label: 'مصر الجديدة', size: 14 },
    { top: '65%', left: '25%', color: 'var(--neon)', label: '6 أكتوبر', size: 14 },
    { top: '70%', left: '65%', color: 'var(--amber)', label: 'مدينة نصر', size: 16 },
    { top: '45%', left: '35%', color: 'var(--text3)', label: 'شبرا · غير متصل', size: 10 },
  ],
};

export const MOCK_ADMIN_ABOUT = {
  cards: [
    { icon: '🖥️', title: 'إصدار المنصة', val: '3.4.1', sub: 'آخر تحديث: 9 أبريل 2026', valColor: 'var(--text)' },
    { icon: '🛡️', title: 'حالة الخادم', val: 'نشط', sub: 'وقت التشغيل: 99.98%', valColor: 'var(--neon)' },
    { icon: '📡', title: 'تكامل التطبيق', val: 'نشط', sub: 'ارتباط مع تطبيق السائقين', valColor: 'var(--cyan)' },
    { icon: '👥', title: 'إجمالي المستخدمين', val: '4,821', sub: 'مستخدمون مسجلون', valColor: 'var(--text)' },
    { icon: '🏪', title: 'البائعون النشطون', val: '38', sub: 'متجر معتمد', valColor: 'var(--yellow)' },
    { icon: '🔧', title: 'مزودو الخدمات', val: '124', sub: 'مزود معتمد', valColor: 'var(--blue)' },
  ],
  eventLog: [
    { icon: '🚨', iconBg: 'var(--red-dim)', title: 'طلب عاجل — محمد حسن', sub: 'كسر محور — الطريق الدائري', time: 'الآن' },
    { icon: '✅', iconBg: 'var(--neon-dim)', title: 'تم قبول مقدم خدمة', sub: 'QuickRescue LLC — مصر الجديدة', time: 'د 3' },
    { icon: '⏳', iconBg: 'var(--yellow-dim)', title: 'طلب تسجيل بائع جديد', sub: 'TireWorld Express — الجيزة', time: 'د 11' },
    { icon: '💬', iconBg: 'var(--blue-dim)', title: 'تذكرة دعم جديدة #1048', sub: 'مشكلة في الدفع — سارة أحمد', time: 'د 18' },
    { icon: '✅', iconBg: 'var(--neon-dim)', title: 'تم استكمال طلب #4428', sub: 'إنقاذ سيارة بنجاح — كوبري أكتوبر', time: 'ساعة 1' },
    { icon: '⚠️', iconBg: 'var(--red-dim)', title: 'تنبيه نظام: بطء استجابة المستشعر #07', sub: 'تم تحويل الاعتماد على بيانات تطبيق الموبايل', time: 'ساعتين' },
  ],
  techInfo: [
    { label: 'بيئة التشغيل', val: 'Production 3.4.1', color: 'var(--neon)' },
    { label: 'قاعدة البيانات', val: 'PostgreSQL 16.2', color: 'var(--blue)' },
    { label: 'معالج الخدمة', val: 'Node.js 20 LTS', color: 'var(--cyan)' },
    { label: 'الدعم الفني', val: 'support@smarttraffic.io', color: 'var(--yellow)' },
  ],
};

export const MOCK_ADMIN_URGENT = [
  { id: '#4431', name: 'محمد حسن', phone: '+20 100 123 4567', initials: 'مح', type: 'انكسار محور', location: 'الطريق الدائري — ناصر', wait: '14 دقيقة', waitColor: 'var(--red)', status: 'معلق', statusColor: 'var(--amber)', action: 'assign' },
  { id: '#4430', name: 'لينا أحمد', phone: '+20 111 987 6543', initials: 'لا', type: 'تسرب بنزين', location: 'أوتوستراد — التجمع', wait: '8 دقائق', waitColor: 'var(--yellow)', status: 'في الطريق', statusColor: 'var(--neon)', action: 'track' },
  { id: '#4428', name: 'يوسف سالم', phone: '+20 122 555 0099', initials: 'يو', type: 'حادث — رافع', location: 'كوبري أكتوبر', wait: '2 دقيقة', waitColor: 'var(--neon)', status: 'مكتمل', statusColor: 'var(--neon)', action: 'view' },
];

export const MOCK_ADMIN_USERS = {
  user: [
    { id: 'USR-001', initials: 'مح', name: 'محمد حسن', email: 'm.hassan@mail.eg', phone: '0100 123 4567', status: 'نشط', date: 'يناير 2024', orders: 12 },
    { id: 'USR-002', initials: 'لا', name: 'لينا أحمد', email: 'lina@mail.eg', phone: '0111 987 6543', status: 'نشط', date: 'فبراير 2024', orders: 5 },
    { id: 'USR-003', initials: 'يو', name: 'يوسف سالم', email: 'youssef@mail.eg', phone: '0122 555 0099', status: 'معلق', date: 'مارس 2024', orders: 3 },
    { id: 'USR-004', initials: 'سأ', name: 'سارة أحمد', email: 'sara@mail.eg', phone: '0100 333 2211', status: 'نشط', date: 'أبريل 2024', orders: 8 },
    { id: 'USR-005', initials: 'خع', name: 'خالد علي', email: 'khaled@mail.eg', phone: '0112 777 4455', status: 'محظور', date: 'مارس 2026', orders: 0 },
  ],
  seller: [
    { id: 'SLR-001', initials: 'عإ', name: 'عالم الإطارات', email: 'info@tireworld.eg', phone: '0100 200 3000', status: 'نشط', date: 'يناير 2024', orders: 320 },
    { id: 'SLR-002', initials: 'مأ', name: 'متجر الأمان', email: 'safety@store.eg', phone: '0111 400 5000', status: 'معلق', date: 'مارس 2024', orders: 0 },
    { id: 'SLR-003', initials: 'قغ', name: 'قطع الغيار بلس', email: 'parts@plus.eg', phone: '0122 600 7000', status: 'نشط', date: 'فبراير 2024', orders: 184 },
  ],
  provider: [
    { id: 'PRV-001', initials: 'إس', name: 'الإنقاذ السريع', email: 'quick@rescue.eg', phone: '0100 111 2222', status: 'نشط', date: 'يناير 2024', rating: '4.9' },
    { id: 'PRV-002', initials: 'أف', name: 'AutoFix Pro', email: 'auto@fix.eg', phone: '0111 333 4444', status: 'نشط', date: 'فبراير 2024', rating: '4.3' },
    { id: 'PRV-003', initials: 'مر', name: 'MegaRecovery', email: 'mega@recovery.eg', phone: '0122 555 6666', status: 'معلق', date: 'مارس 2024', rating: '3.1' },
    { id: 'PRV-004', initials: 'وإ', name: 'وقود إكسبرس', email: 'fuel@express.eg', phone: '0100 777 8888', status: 'معلق', date: 'مارس 2026', rating: '—' },
  ],
};

export const MOCK_ADMIN_TICKETS = [
  { id: '#1048', subject: 'مشكلة في الدفع', user: 'سارة أحمد', initials: 'سأ', agent: 'سارة كمال', status: 'مفتوح', date: '10 أبر' },
  { id: '#1047', subject: 'عدم ظهور موقع المزود', user: 'محمد حسن', initials: 'مح', agent: 'عمر فؤاد', status: 'قيد المعالجة', date: '9 أبر' },
  { id: '#1046', subject: 'حساب محظور بالخطأ', user: 'يوسف سالم', initials: 'يو', agent: 'سارة كمال', status: 'منجز', date: '8 أبر' },
];

export const MOCK_ADMIN_TICKETS_STATS = [
  { label: 'مفتوح', val: 1, color: 'var(--red)' },
  { label: 'قيد المعالجة', val: 1, color: 'var(--yellow)' },
  { label: 'منجز', val: 1, color: 'var(--neon)' },
];

export const MOCK_ADMIN_CS_AGENTS = [
  { id: 'AGT-001', initials: 'SK', name: 'سارة كمال', email: 'sara@smarttraffic.io', code: 'EMP-2401', open: 3, done: 12, status: 'نشط', avatarGrad: 'linear-gradient(135deg,var(--neon),#2eff80)', avatarColor: '#000' },
  { id: 'AGT-002', initials: 'OF', name: 'عمر فؤاد', email: 'omar@smarttraffic.io', code: 'EMP-2402', open: 2, done: 9, status: 'نشط', avatarGrad: 'linear-gradient(135deg,var(--blue),#0066ff)', avatarColor: '#fff' },
  { id: 'AGT-003', initials: 'RH', name: 'رنا حسام', email: 'rana@smarttraffic.io', code: 'EMP-2403', open: 0, done: 0, status: 'غير نشط', avatarGrad: 'var(--bg3)', avatarColor: 'var(--text3)' },
];

export const MOCK_ADMIN_RATINGS = {
  stats: [
    { label: 'متوسط التقييم', val: '4.7', color: 'var(--neon)', delta: '★★★★★' },
    { label: 'إجمالي التقييمات', val: '1,284', color: 'var(--blue)', delta: '↑ 18 هذا الأسبوع' },
    { label: 'مراجعات 5 نجوم', val: '78%', color: 'var(--yellow)', delta: 'من إجمالي المراجعات' },
    { label: 'مراجعات 1-2 نجمة', val: '4.2%', color: 'var(--red)', delta: 'بحاجة مراجعة' },
  ],
  starDistribution: [
    { stars: '5★', pct: 78, color: 'var(--yellow)' },
    { stars: '4★', pct: 14, color: 'rgba(255,204,0,.6)' },
    { stars: '3★', pct: 4, color: 'rgba(255,204,0,.4)' },
    { stars: '2★', pct: 2, color: 'rgba(255,61,87,.5)' },
    { stars: '1★', pct: 2, color: 'var(--red)' },
  ],
  topProviders: [
    { initials: 'QR', name: 'QuickRescue LLC', sub: '1,204 طلب مكتمل', rating: '4.9', color: 'var(--cyan)' },
    { initials: 'AF', name: 'AutoFix Pro', sub: '876 طلب مكتمل', rating: '4.3', color: 'var(--pink)' },
    { initials: 'MR', name: 'MegaRecovery', sub: '102 طلب مكتمل', rating: '3.1', color: 'var(--text3)' },
  ],
  list: [
    { id: 'RTG-001', userInitials: 'مح', userName: 'محمد حسن', provider: 'QuickRescue', stars: 5, comment: 'استجابة سريعة جداً!', order: '#4416', date: '15 مارس' },
    { id: 'RTG-002', userInitials: 'سا', userName: 'سارة أحمد', provider: 'FuelRush', stars: 4, comment: 'خدمة جيدة، بعض التأخير.', order: '#4420', date: '15 مارس' },
    { id: 'RTG-003', userInitials: 'يو', userName: 'يوسف سالم', provider: 'AutoFix Pro', stars: 2, comment: 'لم تُحل المشكلة.', order: '#4409', date: '13 مارس' },
  ],
};

export const MOCK_ADMIN_OPERATIONS = {
  stats: [
    { label: 'طلبات جارية', val: '14', color: 'var(--neon)', delta: '↑ 3 منذ الساعة الماضية' },
    { label: 'شحنات في الطريق', val: '7', color: 'var(--blue)', delta: '4 تصل اليوم' },
    { label: 'قيد المعالجة', val: '5', color: 'var(--yellow)', delta: 'طلبات بحاجة تأكيد' },
    { label: 'طلبات استرجاع', val: '3', color: 'var(--red)', delta: 'قيد المراجعة المالية' },
  ],
  rescue: [
    { id: '#4431', user: 'محمد حسن', initials: 'مح', type: 'انكسار محور', provider: 'QuickRescue', location: 'الدائري — ناصر', status: 'معلق', time: '14 د' },
    { id: '#4430', user: 'لينا أحمد', initials: 'لا', type: 'تسرب بنزين', provider: 'FuelRush', location: 'أوتوستراد التجمع', status: 'في الطريق', time: '8 د' },
    { id: '#4428', user: 'يوسف سالم', initials: 'يو', type: 'حادث — رافع', provider: 'AutoFix Pro', location: 'كوبري أكتوبر', status: 'مكتمل', time: '2 د' },
  ],
  fuel: [
    { id: '#F-201', user: 'أميرة خالد', initials: 'أخ', liters: '30L', provider: 'FuelRush', location: 'مدينة نصر', status: 'في الطريق', time: '5 د' },
    { id: '#F-202', user: 'طارق محمود', initials: 'طم', liters: '20L', provider: 'PetroLine', location: 'الدقي', status: 'معلق', time: '18 د' },
  ],
  products: [
    { id: '#P-301', seller: 'عالم الإطارات', item: 'إطار 205/55R16', qty: 2, buyer: 'خالد علي', status: 'في الطريق', eta: 'اليوم 3 م' },
    { id: '#P-302', seller: 'قطع الغيار بلس', item: 'زيت موتور 5W30', qty: 4, buyer: 'محمد حسن', status: 'جاهز', eta: 'غداً 10 ص' },
  ],
  returns: [
    { id: '#R-401', user: 'سارة أحمد', initials: 'سأ', item: 'إطار معيب', amount: '450 جنيه', status: 'قيد المراجعة', date: '10 أبر' },
    { id: '#R-402', user: 'يوسف سالم', initials: 'يو', item: 'زيت غير صحيح', amount: '180 جنيه', status: 'تم الاسترجاع', date: '9 أبر' },
  ],
};

export const MOCK_ADMIN_NOTIFICATIONS = [
  { icon: '🚨', iconBg: 'var(--red-dim)', title: 'طلب عاجل — محمد حسن', sub: 'كسر محور — الطريق الدائري', time: 'الآن' },
  { icon: '✅', iconBg: 'var(--neon-dim)', title: 'تم قبول مقدم خدمة', sub: 'QuickRescue LLC — مصر الجديدة', time: 'منذ 3 دقائق' },
  { icon: '⏳', iconBg: 'var(--yellow-dim)', title: 'طلب تسجيل بائع جديد', sub: 'TireWorld Express — الجيزة', time: 'منذ 11 دقيقة' },
  { icon: '💬', iconBg: 'var(--blue-dim)', title: 'تذكرة دعم جديدة #1048', sub: 'مشكلة في الدفع — سارة أحمد', time: 'منذ 18 دقيقة' },
  { icon: '✅', iconBg: 'var(--neon-dim)', title: 'تم استكمال طلب #4428', sub: 'إنقاذ سيارة — كوبري أكتوبر', time: 'منذ ساعة' },
];
