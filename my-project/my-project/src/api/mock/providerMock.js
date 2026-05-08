// ═══ PROVIDER MOCK DATA ═══
// Extracted from Provider.jsx inline data — components never import this file directly.

export const MOCK_PROVIDER_DASHBOARD = {
  stats: [
    { icon: '💰', label: 'أرباح اليوم', val: '1,850', color: 'var(--neon)', delta: '↑ 18% عن الأمس' },
    { icon: '📋', label: 'مهام اليوم', val: '6', color: 'var(--amber)', delta: '4 مكتملة · 1 نشطة' },
    { icon: '⭐', label: 'متوسط التقييم', val: '4.9', color: 'var(--blue)', delta: 'من 128 تقييم' },
    { icon: '✅', label: 'معدل الإنجاز', val: '97%', color: 'var(--emerald)', delta: 'مزود متميز' },
  ],
};

export const MOCK_PROVIDER_EARNINGS_WEEKLY = [
  { day: 'إثنين', val: 850, pct: 46 }, { day: 'ثلاثاء', val: '1,200', pct: 65 },
  { day: 'أربعاء', val: 980, pct: 53 }, { day: 'خميس', val: '1,550', pct: 84 },
  { day: 'جمعة', val: '1,850', pct: 100 }, { day: 'سبت', val: 600, pct: 32 },
  { day: 'أحد', val: 0, pct: 2 },
];

export const MOCK_PROVIDER_LOCATION = {
  label: 'القاهرة الجديدة · التجمع السادس',
  lat: 30.0194,
  lng: 31.4156,
  trackingActive: true,
};

export const MOCK_PROVIDER_SCHEDULE = [
  { name: 'أحد', date: 9, status: 'إجازة', off: true },
  { name: 'إثنين', date: 10, status: '08-20' },
  { name: 'ثلاثاء', date: 11, status: '08-20' },
  { name: 'أربعاء', date: 12, status: '08-20' },
  { name: 'خميس', date: 13, status: '08-20' },
  { name: 'جمعة', date: 14, status: 'اليوم', today: true },
  { name: 'سبت', date: 15, status: 'إجازة', off: true },
];

export const MOCK_PROVIDER_NOTIFICATIONS = [
  { icon: '⭐', text: 'تقييم 5★ جديد', sub: 'السائق: ليلى إبراهيم', time: '5 د', color: 'var(--neon-dim)' },
  { icon: '💰', text: 'تحويل 3,200 جنيه', sub: 'تحويل بنكي فوري', time: '2 س', color: 'var(--amber-dim)' },
  { icon: '📋', text: 'تم توسيع المنطقة — مصر الجديدة', sub: 'تتلقى الآن طلبات من مصر الجديدة', time: '1 ي', color: 'var(--blue-dim)' },
];

export const MOCK_PROVIDER_RATINGS = {
  average: 4.9,
  total: 128,
  breakdown: [
    { star: '5★', pct: 88, count: 113 },
    { star: '4★', pct: 8, count: 10 },
    { star: '3★', pct: 3, count: 4 },
    { star: '2★', pct: 1, count: 1 },
    { star: '1★', pct: 0, count: 0 },
  ],
};

export const MOCK_PROVIDER_INCOMING = {
  type: 'ونش — مسطحة مطلوبة',
  location: 'المعادي، الطريق الدائري',
  driver: 'محمد حسن',
  price: '300 جنيه',
  distance: '2.4 كم',
};

export const MOCK_PROVIDER_PENDING = [
  { icon: '🚗', type: 'ونش — مسطحة', price: '300 جنيه', loc: 'المعادي، الدائري', driver: 'محمد حسن', dist: '2.4 كم', color: 'var(--neon-dim)' },
  { icon: '🔧', type: 'دعم ميكانيكي', price: '250 جنيه', loc: 'مصر الجديدة', driver: 'سارة أحمد', dist: '5.1 كم', color: 'var(--amber-dim)' },
  { icon: '🛞', type: 'تغيير إطار', price: '180 جنيه', loc: 'مدينة نصر', driver: 'خالد علي', dist: '7.8 كم', color: 'var(--blue-dim)' },
];

export const MOCK_PROVIDER_REQUESTS_STATS = [
  { icon: '⏳', label: 'قيد الانتظار', val: 3, color: 'var(--amber)' },
  { icon: '🚗', label: 'مقبول', val: 1, color: 'var(--blue)' },
  { icon: '✅', label: 'مكتمل اليوم', val: 4, color: 'var(--neon)' },
  { icon: '🏅', label: 'معدل القبول', val: '94%', color: 'var(--emerald)' },
];

export const MOCK_PROVIDER_ACTIVE_MISSION = {
  reqId: 'REQ-4417',
  type: 'ونش — استرداد مسطحة',
  driver: 'محمد حسن',
  phone: '+20 112 345 6789',
  distance: '2.4 كم',
  eta: '8 د',
  fare: '300 جنيه',
  driverRating: '4.8 ★',
  currentStep: 2, // 0-based index into steps
  steps: ['مقبول', 'في الطريق', 'وصل', 'جاري العمل', 'مكتمل'],
};

export const MOCK_PROVIDER_EARNINGS = {
  total: '7,030',
  currency: 'جنيه مصري',
  period: 'هذا الأسبوع',
  totalJobs: '23',
  avgPerJob: '305',
  nextTransfer: { amount: '3,200 جنيه', date: 'الأحد 16 مارس' },
};

export const MOCK_PROVIDER_HISTORY = [
  { id: 4416, type: 'ونش', driver: 'ليلى إبراهيم', fare: '350 جنيه', rating: '5★', status: 'مكتمل' },
  { id: 4415, type: 'وقود', driver: 'أحمد مصطفى', fare: '180 جنيه', rating: '5★', status: 'مكتمل' },
  { id: 4414, type: 'ميكانيكي', driver: 'سارة أحمد', fare: '250 جنيه', rating: '4★', status: 'مكتمل' },
  { id: 4413, type: 'إطار', driver: 'خالد علي', fare: '200 جنيه', rating: '5★', status: 'مكتمل' },
];

export const MOCK_PROVIDER_VEHICLE = {
  model: 'ميتسوبيشي كانتر 2021',
  plate: 'ق ر م - 7845',
  type: 'مسطحة هيدروليكية',
  fuel: 'ديزل',
  capacity: '5 طن',
};
