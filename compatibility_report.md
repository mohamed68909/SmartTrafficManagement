# تقرير توافق الـ Backend مع الـ UI
> آخر تحديث: 2026-04-18 — يعكس **جميع التعديلات الأخيرة**

---

## ملخص سريع

| المنطقة | التوافق | ملاحظات |
|---|---|---|
| 🔐 Auth (Login/Register/OTP/Password) | ✅ متوافق بالكامل | كل الـ endpoints موجودة + Forgot/Reset Password + Google Login |
| 🚗 Garage (إضافة/عرض سيارات) | ✅ متوافق بالكامل | CRUD كامل |
| 🗺️ Map / خريطة | ✅ متوافق | Search يعمل عبر Google Places API (يحتاج API Key) |
| 🛒 Store / Cart / Orders | ✅ متوافق بالكامل | Products + Search + Cart + Checkout + Orders |
| 💳 Payment (Stripe) | ✅ متوافق بالكامل | Cards + History + Refund + Webhook (بدون تكرار) |
| 🆘 Emergency / SOS | ✅ متوافق بالكامل | Request + Status + History + Cancel + Provider Accept |
| 📊 Traffic Reports | ✅ متوافق | Report + Active incidents + By-location |
| 💬 Support / Chat | ✅ متوافق بالكامل | Tickets + Chat + SignalR Realtime |
| 🔔 Notifications | ✅ متوافق بالكامل | Get + MarkRead + Delete |
| ⭐ Ratings | ✅ **مُنجز** | `POST /api/ratings` + `GET /api/ratings/my` — [Authorize] مفعّل |
| 🌤️ Weather | ✅ **مُنجز** | `GET /api/weather` (بالإحداثيات) + `GET /api/weather/city` — OpenWeather API |
| 👤 Admin Dashboard | ✅ متوافق بالكامل | Summary + Analytics + Users + Tickets + SOS + **Providers** |
| 🏪 Seller Portal | ✅ متوافق بالكامل | Products CRUD + Orders |
| 🔧 Provider Portal | ✅ متوافق بالكامل | Dashboard + Jobs (Available/Accept/Status) + Location update |
| 🎧 CS Agent View | ✅ متوافق بالكامل | Tickets + Chat |
| 🔒 Authentication & CORS | ✅ **مُنجز** | `[Authorize]` مفعّل على كل Controllers + CORS مضبوط |
| 🔑 Role-Based Registration | ✅ **مُنجز** | Mobile = Client دائماً / Web = Client\|Provider\|Seller عبر `RequestedRole` |

---

## 📱 Mobile UI — تفصيل شاشة بشاشة

### ✅ شاشات Auth (مغطاة بالكامل)
| الشاشة | الـ Endpoint | ملاحظات |
|---|---|---|
| `onboarding` | لا يحتاج API | — |
| `login` | `POST /api/auth/login` | — |
| `sign up` (Mobile) | `POST /api/auth/register` + Header `X-Platform: Mobile` | Role مقيّد بـ Client |
| `sign up` (Web) | `POST /api/auth/register` + حقل `RequestedRole` | Client / Provider / Seller |
| `OTP` | `POST /api/auth/verify-otp` | MVP: كود ثابت `123456` |
| `forgot password` | `POST /api/auth/forgot-password` | يرجع دائماً 200 (أمان) |
| `reset password` | `POST /api/auth/reset-password` | Token بصلاحية 15 دقيقة |
| `google login` | `POST /api/auth/google-login` | يدعم Mobile و Web |
| `profile` | `GET /api/auth/me` أو `GET /api/auth/profile` | — |
| `edit profile` | `PUT /api/auth/profile` | يشمل Address + ProfilePicture |
| `change password` | `PATCH /api/auth/change-password` | — |

---

### ✅ شاشات الـ Garage (مغطاة بالكامل)
| الشاشة | الـ Endpoint |
|---|---|
| `grage` (عرض السيارات) | `GET /api/garage` |
| `add vehicle` | `POST /api/garage` |
| `vehicle information` | `GET /api/garage/{id}` |

---

### ✅ شاشات الـ Map (مغطاة + ملاحظة)
| الشاشة | الـ Endpoint |
|---|---|
| `map` (عرض الخريطة) | **Google Maps SDK — محلي في الـ App** |
| `map search` | `GET /api/map/search?query=...` |
| `address` | `GET /api/map/search` |
| `report hazard/accident/jam/road works/police` | `POST /api/traffic/report` |

> [!NOTE]
> الـ `MapSearchService` يتصل بـ **Google Places API** — يحتاج `GoogleMaps:ApiKey` صحيح في `appsettings.json`. إذا لم يُضبط الـ Key، يرجع الـ endpoint خطأ 503.

---

### ✅ شاشات Store / Tires / Payment (مغطاة بالكامل)
| الشاشة | الـ Endpoint |
|---|---|
| `store` (قائمة المنتجات) | `GET /api/store/products` (AllowAnonymous + Search + Pagination) |
| `store maintenance` | `GET /api/store/products?categoryId=...` |
| `Tires` | `GET /api/store/products?categoryId=...` |
| `my card` | `GET /api/payments/cards` |
| `add card` | `POST /api/payments/cards` |
| `delete card` | `DELETE /api/payments/cards/{id}` |
| `payment` (checkout) | `POST /api/store/checkout` |
| `payment success` | Stripe Webhook → `POST /api/payments/stripe/webhook` |
| `payment history` | `GET /api/payments/history` |
| `refund` | `POST /api/payments/refund` |
| `order history` | `GET /api/orders/my` |

---

### ✅ شاشات Emergency / SOS (مغطاة بالكامل)
| الشاشة | الـ Endpoint |
|---|---|
| `emergency` (طلب عام) | `POST /api/sos/request` |
| `emergency winch` | `POST /api/sos/request` (type = Winch) |
| `emergency fuel` | `POST /api/sos/request` (type = Fuel) |
| `emergency video support` | `POST /api/sos/request` (type = Video) |
| `emergency tracking` | `GET /api/sos/status/{id}` |
| SOS History | `GET /api/sos/history` |
| Cancel SOS | `PATCH /api/sos/cancel/{id}` |

---

### ✅ شاشة Ratings (مُنجزة حديثاً)
| الشاشة | الـ Endpoint |
|---|---|
| `rate` (تقييم خدمة أو طلب) | `POST /api/ratings` |
| عرض تقييماتي | `GET /api/ratings/my` |

**الـ Body لـ `POST /api/ratings`:**
```json
{
  "stars": 5,
  "comment": "ممتاز جداً",
  "serviceRequestId": "guid | null",
  "orderId": "guid | null"
}
```
> يمنع التقييم المكرر (409 Conflict). يجب تحديد `serviceRequestId` أو `orderId` على الأقل.

---

### ✅ شاشة Weather (مُنجزة حديثاً)
| الشاشة | الـ Endpoint |
|---|---|
| `weather` (بالموقع الحالي) | `GET /api/weather?lat=30.0&lng=31.2` |
| `weather` (بالمدينة) | `GET /api/weather/city?name=Cairo` |

> [!NOTE]
> يتصل بـ **OpenWeatherMap API** — يحتاج `OpenWeather:ApiKey` في `appsettings.json`. يتضمن الاستجابة: درجة الحرارة، الرطوبة، سرعة الرياح، الوصف، الأيقونة.

---

### ✅ شاشات Support / Chat (مغطاة بالكامل)
| الشاشة | الـ Endpoint |
|---|---|
| `help` (فتح تذكرة) | `POST /api/support/tickets/open` |
| Chat realtime | `POST /api/chat/send` + SignalR `/hubs/traffic` |

---

### ✅ شاشات متفرقة
| الشاشة | الـ Endpoint |
|---|---|
| `dashboard` | `GET /api/auth/me` + local stats |
| `notifications` | `GET /api/notifications` |
| `settings` | `PATCH /api/auth/change-password` |

---

## 🖥️ Front UI — Admin Dashboard (مغطى بالكامل)

| الشاشة | الـ Endpoint |
|---|---|
| Dashboard KPIs | `GET /api/admin/dashboard/summary` |
| Monthly Analytics | `GET /api/admin/analytics/orders/monthly` |
| Users Table | `GET /api/admin/users` |
| Recent Tickets | `GET /api/admin/tickets/recent` |
| Recent SOS | `GET /api/admin/sos/recent` |
| **Providers Management** | `GET /api/admin/providers` *(جديد)* |

> [!NOTE]
> الـ `AdminController` محمي بـ `[Authorize(Roles = "Admin")]` — لا يمكن الوصول إليه إلا بـ Token لمستخدم Admin.

---

## 🏪 Front UI — Seller Portal (مغطى بالكامل)

| الشاشة | الـ Endpoint |
|---|---|
| Products List | `GET /api/seller/products` |
| Add Product | `POST /api/seller/products` |
| Edit Product | `PUT /api/seller/products/{id}` |
| Delete Product | `DELETE /api/seller/products/{id}` |
| Orders View | `GET /api/seller/orders` |

> [!NOTE]
> الـ `SellerController` محمي بـ `[Authorize(Roles = "Seller")]`.

---

## 🔧 Front UI — Provider Portal (مغطى بالكامل)

| الشاشة | الـ Endpoint |
|---|---|
| Dashboard | `GET /api/provider/dashboard` |
| Job History | `GET /api/provider/jobs/history` |
| Available Jobs | `GET /api/provider/jobs/available` |
| Accept Job | `PATCH /api/provider/jobs/accept/{requestId}` |
| Update Job Status | `PATCH /api/provider/jobs/status` |
| Update Location | `PATCH /api/provider/jobs/location` |

> [!NOTE]
> الـ `ProviderController` محمي بـ `[Authorize(Roles = "Provider")]`.

---

## 🎧 Front UI — CS Agent (مغطى بالكامل)

| الشاشة | الـ Endpoint |
|---|---|
| My Tickets | `GET /api/support/tickets/my` |
| Chat History | `GET /api/chat/history/{ticketId}` |
| Send Message | `POST /api/chat/send` |
| Close Ticket | `PATCH /api/support/close/{id}` |

---

## 🔐 Role-Based Registration — آلية العمل

```
Mobile  (X-Platform: Mobile) → Role = Client (دائماً، لا يمكن تغييره)
Web     (بدون header)        → Role = Client | Provider | Seller (حسب RequestedRole)
                             → إذا لم يُرسل RequestedRole → Client تلقائياً
                             → إذا أُرسل role غير مسموح به → 400 + يُحذف المستخدم
```

**الـ Roles المسموحة للـ Web Registration:**
- `Client`
- `Provider`
- `Seller`

> [!WARNING]
> `Admin` و`CSAgent` لا يمكن تسجيلهم عبر الـ API — يُضافون عبر `DatabaseSeeder` فقط.

---

## ✅ الـ Stripe — حالة التكامل

```
✅ PaymentsController  → Cards CRUD (Add/Get/Delete)
✅ PaymentsController  → Payment History
✅ PaymentsController  → Refund
✅ PaymentsController  → Webhook (payment_intent.succeeded)
✅ StoreController     → Checkout (ينشئ PaymentIntent) — بدون webhook مكرر
✅ PaymentManagementService → Stripe SDK مدمج بالكامل
✅ DI Registration     → StripeConfiguration.ApiKey مضبوطة
✅ Webhook مُنظَّف    → محذوف من StoreController، موجود في PaymentsController فقط
```

---

## ✅ الـ Google Maps — حالة التكامل

```
✅ MapController       → GET /api/map/search (endpoint موجود + [Authorize])
✅ IMapSearchService   → Interface محدد
✅ MapSearchService    → Implementation يتصل بـ Google Places API
⚠️  يحتاج              → GoogleMaps:ApiKey صحيح في appsettings.json
📌 الخريطة نفسها      → بتتعرض على الـ Mobile باستخدام Google Maps SDK مباشرةً
```

---

## ✅ OpenWeather — حالة التكامل

```
✅ WeatherController   → GET /api/weather (بالإحداثيات)
✅ WeatherController   → GET /api/weather/city (بالاسم)
✅ IWeatherService     → Interface + Implementation
✅ [Authorize]         → مفعّل
⚠️  يحتاج              → OpenWeather:ApiKey صحيح في appsettings.json
```

---

## ✅ الـ CORS — حالة الإعداد

```
✅ Policy: "AllowFrontend"
✅ Origins: localhost:3000, localhost:5173, localhost:4200
✅ AllowAnyHeader + AllowAnyMethod + AllowCredentials
✅ مطبّق على HTTP pipeline + SignalR Hub
```

---

## ⚠️ الفجوات المتبقية (أولوية منخفضة)

| # | الموضوع | التأثير | الحل |
|---|---|---|---|
| 1 | **OTP = Mock (123456)** | لا يُرسل OTP حقيقي | ربط بـ SMS Service (Twilio/Firebase) قبل الـ production |
| 2 | **Forgot Password = Log فقط** | Token يُطبع في الـ log، لا يُرسل بالبريد | إضافة Email Service قبل الـ production |
| 3 | **Google Maps API Key** | بدون Key يرجع 503 | إضافة `GoogleMaps:ApiKey` في appsettings |
| 4 | **OpenWeather API Key** | بدون Key يرجع 503 | إضافة `OpenWeather:ApiKey` في appsettings |

---

## 🏗️ الـ Settings المطلوبة في `appsettings.json`

```json
{
  "ConnectionStrings": { "DefaultConnection": "..." },
  "Jwt": { "Key": "...", "Issuer": "...", "Audience": "..." },
  "Stripe": { "SecretKey": "sk_...", "WebhookSecret": "whsec_..." },
  "GoogleMaps": { "ApiKey": "AIza..." },
  "OpenWeather": { "ApiKey": "..." },
  "Google": { "ClientId": "..." }
}
```

---

## الخلاصة

> الـ Backend **متوافق ~98%** مع الـ UI.
> جميع المشاكل الجوهرية تم حلها:
> - ✅ Ratings endpoint مُنجز
> - ✅ Weather endpoint مُنجز (OpenWeather API)
> - ✅ Stripe webhook مُنظَّف (لم يعد مكرراً)
> - ✅ `[Authorize]` مفعّل على كل الـ Controllers
> - ✅ CORS مضبوط + SignalR يدعمه
> - ✅ Role-Based Registration يعمل (Mobile vs Web)
> - ✅ Admin Providers endpoint مُضاف
> - ✅ Forgot/Reset Password endpoints مُنجزة
> - ✅ Google Login مُنجز
>
> المتبقي فقط: إضافة API Keys الحقيقية في الـ production settings، وربط OTP/Email بخدمات خارجية.
