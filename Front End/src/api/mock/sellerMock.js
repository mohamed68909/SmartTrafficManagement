// ═══ SELLER MOCK DATA ═══
// Extracted from Seller.jsx inline data — components never import this file directly.

export const MOCK_SELLER_DASHBOARD = {
  stats: [
    { icon: '💰', label: 'مبيعات اليوم', val: '4,850', unit: 'جنيه', color: 'var(--neon)', delta: '↑ 22% عن الأمس' },
    { icon: '🛒', label: 'طلبات جديدة', val: '7', color: 'var(--amber)', delta: '3 بحاجة لتجهيز' },
    { icon: '📦', label: 'منتجات نشطة', val: '24', color: 'var(--blue)', delta: '2 مخزون منخفض' },
    { icon: '⭐', label: 'تقييم المتجر', val: '4.8', color: 'var(--amber)', delta: '89 تقييم جديد' },
  ],
};

export const MOCK_SELLER_PRODUCTS = [
  { name: 'إطار ميشلان بريماسي 4', cat: 'إطارات', price: '2,450', stock: 12, sold: 156, rating: 4.8, img: '🛞' },
  { name: 'زيت موبيل 1 سينثتيك 5W-30', cat: 'زيوت', price: '850', stock: 34, sold: 241, rating: 4.9, img: '🛢️' },
  { name: 'فلتر هواء بوش', cat: 'فلاتر', price: '320', stock: 56, sold: 89, rating: 4.6, img: '🔧' },
  { name: 'بطارية فارتا بلو', cat: 'بطاريات', price: '1,800', stock: 8, sold: 67, rating: 4.7, img: '🔋' },
  { name: 'تيل فرامل TRW', cat: 'فرامل', price: '580', stock: 22, sold: 134, rating: 4.5, img: '⚙️' },
  { name: 'شمعات إشعال NGK', cat: 'إشعال', price: '180', stock: 78, sold: 312, rating: 4.8, img: '⚡' },
];

export const MOCK_SELLER_ORDERS = [
  { id: 'ORD-8841', customer: 'محمد حسن', items: 2, total: '3,300', status: 'جديد', time: 'منذ 5 د', color: 'var(--neon)' },
  { id: 'ORD-8840', customer: 'سارة أحمد', items: 1, total: '850', status: 'تجهيز', time: 'منذ 22 د', color: 'var(--amber)' },
  { id: 'ORD-8839', customer: 'خالد علي', items: 3, total: '4,100', status: 'تم الشحن', time: 'منذ ساعة', color: 'var(--blue)' },
  { id: 'ORD-8838', customer: 'نور محمد', items: 1, total: '2,450', status: 'تم التوصيل', time: 'منذ 3 س', color: 'var(--emerald)' },
  { id: 'ORD-8837', customer: 'ليلى إبراهيم', items: 2, total: '1,160', status: 'تم التوصيل', time: 'منذ 5 س', color: 'var(--emerald)' },
  { id: 'ORD-8836', customer: 'أحمد مصطفى', items: 1, total: '580', status: 'ملغي', time: 'أمس', color: 'var(--red)' },
];

export const MOCK_SELLER_ORDERS_STATS = [
  { icon: '🆕', label: 'جديد', val: 2, color: 'var(--neon)' },
  { icon: '📦', label: 'تجهيز', val: 1, color: 'var(--amber)' },
  { icon: '🚚', label: 'تم الشحن', val: 1, color: 'var(--blue)' },
  { icon: '✅', label: 'تم التوصيل', val: 2, color: 'var(--emerald)' },
];

export const MOCK_SELLER_ANALYTICS = {
  stats: [
    { icon: '💰', label: 'إيراد الشهر', val: '45,200', unit: 'جنيه', color: 'var(--neon)', pct: '↑ 18%' },
    { icon: '🛒', label: 'طلبات الشهر', val: '89', color: 'var(--blue)', pct: '↑ 12%' },
    { icon: '👁️', label: 'مشاهدات المتجر', val: '2,340', color: 'var(--purple)', pct: '↑ 34%' },
  ],
  monthlyChart: [
    { m: 'يناير', v: 28000, p: 62 }, { m: 'فبراير', v: 32000, p: 71 },
    { m: 'مارس', v: 38000, p: 84 }, { m: 'أبريل', v: 45000, p: 100 },
    { m: 'مايو', v: 42000, p: 93 }, { m: 'يونيو', v: 35000, p: 78 },
    { m: 'يوليو', v: 31000, p: 69 }, { m: 'أغسطس', v: 29000, p: 64 },
    { m: 'سبتمبر', v: 34000, p: 76 }, { m: 'أكتوبر', v: 41000, p: 91 },
    { m: 'نوفمبر', v: 39000, p: 87 }, { m: 'ديسمبر', v: 45200, p: 100 },
  ],
};

export const MOCK_SELLER_STORE = {
  name: 'عالم الإطارات مصر',
  initials: 'عإ',
  desc: 'إطارات وزيوت وقطع غيار عالية الجودة لجميع أنواع المركبات.',
  fullDesc: 'إطارات وزيوت وقطع غيار عالية الجودة لجميع أنواع المركبات. خدمة التوصيل في نفس اليوم عبر القاهرة والجيزة.',
  location: 'القاهرة والجيزة',
  products: 24,
  rating: 4.8,
  reviews: 89,
  since: 'يناير 2024',
  phone: '+20 106 789 1234',
  email: 'info@tireworld.eg',
  verified: true,
};

export const MOCK_SELLER_REVIEWS = [
  { name: 'محمد حسن', stars: 5, text: 'إطارات ممتازة وتوصيل سريع! أفضل متجر في القاهرة.', time: 'منذ يومين', product: 'إطار ميشلان بريماسي 4' },
  { name: 'سارة أحمد', stars: 5, text: 'زيت موبيل أصلي 100% بأفضل سعر. شكراً!', time: 'منذ 4 أيام', product: 'زيت موبيل 1 سينثتيك' },
  { name: 'خالد علي', stars: 4, text: 'منتج جيد لكن التوصيل تأخر يوم واحد.', time: 'منذ أسبوع', product: 'تيل فرامل TRW' },
];

export const MOCK_SELLER_SETTINGS = [
  { label: 'الإشعارات', desc: 'تلقي إشعارات الطلبات الجديدة', on: true },
  { label: 'التوصيل في نفس اليوم', desc: 'عرض خيار التوصيل في نفس اليوم', on: true },
  { label: 'الرد التلقائي', desc: 'تأكيد تلقائي للطلبات الجديدة', on: false },
];
