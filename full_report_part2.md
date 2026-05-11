# تقرير SmartTrafficManagement — الجزء 2: React Web Frontend

## التقنيات
| Stack | الإصدار |
|-------|---------|
| React | 19.2.4 |
| Vite | 8.0.4 |
| TailwindCSS | 4.2.2 |
| React Router DOM | 7.14.0 |
| i18n | Custom (AR/EN) |

## الهيكل
```
my-project/my-project/src/
├── App.jsx                    ← Router + Lazy Loading + ProtectedRoute
├── main.jsx                   ← Entry point
├── index.css                  ← 14KB CSS Variables (Dark/Light)
├── api/
│   ├── apiClient.js           ← HTTP + Auto JWT Refresh + Queue
│   ├── config.js              ← BASE_URL = VITE_API_URL
│   ├── services/
│   │   ├── authService.js     ← Login, Register, Logout, Profile CRUD
│   │   ├── adminService.js    ← 698 سطر: Dashboard, Users, Approvals...
│   │   ├── sellerService.js   ← 600 سطر: Products, Orders, Analytics...
│   │   ├── providerService.js ← Dashboard, History, Earnings, Mission
│   │   ├── csService.js       ← Tickets, Drivers, Chat, Escalate
│   │   └── publicService.js   ← Stats (⚠️ endpoint غير موجود)
│   ├── contracts/README.md    ← API documentation
│   └── mock/                  ← 6 mock files (يشتغل بدون backend)
├── auth/authHelpers.js        ← Session Management (localStorage)
├── components/
│   ├── ProtectedRoute.jsx     ← Role-based Guard
│   ├── TopBar.jsx             ← شريط علوي مشترك
│   ├── ThemeToggle.jsx        ← Dark/Light
│   ├── LanguageToggle.jsx     ← AR/EN
│   ├── Modal.jsx              ← مودال مشترك
│   └── UserDetailModal.jsx    ← تفاصيل المستخدم
├── hooks/
│   ├── useDarkMode.js         ← CSS class toggle
│   ├── useModal.js            ← open/close state
│   └── useToast.jsx           ← Toast notifications
├── i18n/
│   ├── LanguageContext.jsx    ← React Context للغة
│   └── translations.js        ← 24KB ترجمات AR+EN
└── pages/
    ├── Landing.jsx            ← 70KB: Login Form + Hero + Stats
    ├── Admin.jsx              ← 119KB: 10 Tabs لوحة تحكم كاملة
    ├── Seller.jsx             ← 91KB: 7 Tabs لوحة بائع
    ├── CsAgent.jsx            ← 53KB: 4 Tabs خدمة عملاء
    ├── Provider.jsx           ← 35KB: 5 Tabs مقدم خدمة
    ├── NotFound.jsx           ← 404
    └── Unauthorized.jsx       ← صفحة غير مصرح
```

## الصفحات والأدوار
| Route | الصفحة | الدور | الحجم |
|-------|--------|-------|-------|
| `/` | Landing + Login | عام | 70KB |
| `/admin` | لوحة المدير | admin | 119KB |
| `/seller` | لوحة البائع | seller | 91KB |
| `/cs-agent` | لوحة CS | cs/csagent | 53KB |
| `/provider` | لوحة المقدم | provider | 35KB |
| `/unauthorized` | غير مصرح | - | 2KB |

## apiClient.js — ميزات مميزة
```javascript
// Auto Token Refresh مع Queue System
if (response.status === 401 && !isRetry) {
  if (isRefreshing) {
    // أضف الطلب للـ queue وانتظر
    return new Promise((resolve, reject) => refreshQueue.push({resolve, reject}))
  }
  isRefreshing = true
  const newToken = await tryRefreshToken()  // POST /Auth/refresh-token
  processQueue(null, newToken)              // حرّر كل الطلبات المنتظرة
  return request(method, path, body, true) // أعد الطلب الأصلي
}

// Mock Mode Detection
if (!API_CONFIG.BASE_URL) return MOCK_DATA  // في كل service
```

## Flow كل دور

### 1️⃣ Login Flow (مشترك)
```
Landing → Login Form
  POST /Auth/login {email, password}
  ↓ نجح
  extractToken(data) → localStorage: token, refreshToken
  extractRole(data) → localStorage: role, email, user
  normalizeRole(): "CSAgent" → "cs", "Administrator" → "admin"
  redirect: admin→/admin | seller→/seller | provider→/provider | cs→/cs-agent
```

### 2️⃣ Admin Flow
```
/admin → GET /admin/dashboard/summary → 8 بطاقات
  ├── [Users Tab]     → GET /admin/users?page=1&pageSize=20 → CRUD
  ├── [Analytics]     → GET /admin/analytics/orders/monthly → Bar Chart
  ├── [Approvals]     → GET /admin/approvals → Approve/Reject
  ├── [Urgent SOS]    → GET /admin/urgent → Assign → GET /admin/providers
  ├── [Tickets]       → GET /admin/tickets/recent + /tickets/stats
  ├── [CS Agents]     → GET /admin/cs-agents → Create → POST /cs-agents/{id}/activate
  ├── [Ratings]       → GET /admin/ratings (Paged)
  ├── [Operations]    → GET /admin/sos/recent
  ├── [Sensors]       → GET /admin/sensors
  └── [About/Status]  → GET /admin/system-status → Version, DB, Uptime
```

### 3️⃣ Seller Flow
```
/seller → GET /seller/dashboard → Revenue, Orders, Products, Rating
  ├── [Products]  → GET /seller/products → Add(FormData)/Edit/Delete/Restock
  ├── [Categories]→ GET /seller/categories → Add/Edit/Delete
  ├── [Orders]    → GET /seller/orders + /orders/stats → POST /orders/{id}/prepare
  ├── [Analytics] → Promise.all([/analytics, /dashboard, /orders]) → Charts
  ├── [Store]     → GET /seller/store → PUT /seller/store
  ├── [Reviews]   → GET /seller/reviews
  └── [Settings]  → GET/PUT /seller/settings (emailNotifications, smsNotifications, autoAcceptOrders)
```

### 4️⃣ Provider Flow
```
/provider → GET /provider/dashboard → Stats (4 بطاقات)
  ├── [History]  → GET /provider/jobs/history → قائمة مهام
  ├── [Earnings] → GET /provider/earnings + Promise.all([/earnings/weekly]) → Bar Chart
  ├── [Mission]  → GET /provider/active-mission → Update Status → Call/SOS
  │   ⚠️ Call/SOS يستدعيان endpoints غير موجودة في Backend
  ├── [Profile]  → GET /provider/profile
  └── [Toggle]   → POST /provider/status {online: true/false}
```

### 5️⃣ CS Agent Flow
```
/cs-agent → GET /support/tickets/stats → Open, Closed, Pending, AvgResponse
  ├── [Tickets Tab] → Search (ID أو Username) → View → Escalate
  │   Search: if(UUID) → /support/tickets/{id} else → يجرب 5 endpoints!
  ├── [Chat Tab]    → GET /chat/history/{ticketId} → Send → يجرب 4 endpoints!
  ├── [Drivers Tab] → GET /cs/drivers/search?q=... → Block
  └── [Profile Tab] → GET /Auth/me → Agent info
```

## ملاحظات تقنية مهمة

### ✅ شغال صح
- **Mock Mode:** كل service يكشف `API_CONFIG.BASE_URL` — لو فاضي يرجع mock data
- **Auto Refresh:** Queue system ممتاز — طلبات متعددة تنتظر refresh واحد
- **Role Normalization:** `CSAgent`, `cs-agent`, `cs_agent` → كلهم `cs`
- **RTL Support:** `lang="ar" dir="rtl"` في HTML
- **i18n:** ترجمة كاملة AR/EN (24KB)
- **Dark/Light Mode:** CSS variables system
- **Lazy Loading:** كل page تُحمَّل عند الطلب فقط

### ❌ مش شغال
| المشكلة | السبب | الحل |
|---------|-------|------|
| Provider accept/reject | `/provider/requests/{id}/accept` ≠ Backend `/provider/jobs/accept/{id}` | صحّح URL في providerService.js |
| Provider callDriver/sendSOS | `/provider/active-mission/call` مافيش في Backend | أضف endpoints أو احذف من Frontend |
| Public Stats | `/public/stats` مافيش Controller | أنشئ PublicController |
| CS Chat - endpoint غير ثابت | يجرب 4 endpoints بـ trial-and-error | استخدم `/chat/send` فقط |
| CS Ticket Search | يجرب 5 endpoints | أضف `GET /support/tickets?search=` |
| Admin Notifications | `MOCK_ADMIN_NOTIFICATIONS` دايماً | اربطه بـ `/notifications` |
| Admin Event Log | mock دايماً | اربطه بـ `/admin/activity` |
| Admin Traffic Map | `{ markers: [], _raw: {} }` | اربطه بـ `/trafficincidents` |
