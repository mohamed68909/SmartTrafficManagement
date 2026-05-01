# SmartTraffic Web/Admin API — Detailed Reference

> **Base URL:** `https://<host>/api`
> **Realtime Hub:** `/hubs/traffic` (SignalR)
> **Response Envelope:** كل الـ responses مغلفة في `Result<T>`:
> ```json
> { "isSuccess": true, "value": { ... }, "statusCode": 200, "error": null }
> ```

---

## 🔐 Shared Auth (All Portals)

### `POST /api/auth/login`
**Auth:** ❌  
**الوصف:** تسجيل دخول بالإيميل والباسورد لجميع أدوار الـ Web (Admin, Seller, Provider, CSAgent).

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "Admin@123"
}
```

**Response `200 OK`:** `Result<AuthResponseDto>`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "abc...",
  "expiresIn": 1800,
  "userId": "guid",
  "email": "admin@test.com",
  "role": "Admin"
}
```

**Response `401`:** بيانات خاطئة.

---

### `POST /api/auth/google-login`
**Auth:** ❌  
**الوصف:** تسجيل دخول بـ Google — **لا** ترسل `X-Platform: Mobile` حتى لا يتم قفل الدور على `Driver`.

**Request Body:**
```json
{
  "idToken": "eyJ..."
}
```

**Response `200 OK`:** `Result<AuthResponseDto>` — نفس شكل الـ login العادي.

---

### `POST /api/auth/refresh-token`
**Auth:** ❌  
**الوصف:** تجديد الـ access token.

**Request Body:**
```json
{
  "refreshToken": "abc123..."
}
```

**Response `200 OK`:** `Result<AuthResponseDto>` — token جديد.  
**Response `401`:** refresh token منتهي.

---

### `POST /api/auth/send-otp`
**Auth:** ❌  
**الوصف:** إرسال أو إعادة إرسال كود OTP لتأكيد الحساب.

**Request Body:**
```json
{
  "email": "admin@test.com"
}
```

**Response `200 OK`:** `Result<bool>`

---

### `POST /api/auth/forgot-password`
**Auth:** ❌  
**الوصف:** طلب إرسال كود إعادة تعيين كلمة المرور على الإيميل.

**Request Body:**
```json
{
  "email": "admin@test.com"
}
```

**Response `200 OK`:** `Result<bool>` — دائماً `true` لأسباب أمنية.

---

### `POST /api/auth/reset-password`
**Auth:** ❌  
**الوصف:** إعادة تعيين كلمة المرور بالتوكن المُرسل على الإيميل.

**Request Body:**
```json
{
  "email": "admin@test.com",
  "token": "ABC123...",
  "newPassword": "NewPass@456"
}
```

**Response `200 OK`:** `Result<bool>`  
**Response `400`:** توكن خاطئ أو منتهي.

---

### `POST /api/auth/logout`
**Auth:** ✅ Bearer Token  
**الوصف:** إلغاء صلاحية الـ refresh token الحالي.

**Request Body:**
```json
{
  "refreshToken": "abc123..."
}
```

**Response `200 OK`:** `Result<bool>`

---

### `GET /api/auth/me` أو `GET /api/auth/profile`
**Auth:** ✅  
**الوصف:** جلب بيانات المستخدم الحالي من الـ JWT.

**Response `200 OK`:** `Result<ProfileResponseDto>`
```json
{
  "id": "guid",
  "firstName": "System",
  "lastName": "Admin",
  "email": "admin@test.com",
  "phoneNumber": "",
  "role": "Admin",
  "avatarUrl": null
}
```

---

### `PUT /api/auth/profile`
**Auth:** ✅  
**الوصف:** تعديل بيانات الملف الشخصي.

**Request Body:**
```json
{
  "firstName": "System",
  "lastName": "Admin",
  "phoneNumber": "01012345678",
  "avatarUrl": "https://..."
}
```

**Response `200 OK`:** `Result<ProfileResponseDto>` — البيانات بعد التحديث.

---

### `PATCH /api/auth/change-password`
**Auth:** ✅  
**الوصف:** تغيير كلمة المرور مع التحقق من الحالية.

**Request Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewPass@456"
}
```

**Response `200 OK`:** `Result<bool>`  
**Response `400`:** كلمة المرور الحالية خاطئة.

---

## 🛠️ Admin Dashboard

> **الدور المطلوب:** `Admin` على جميع الـ endpoints

### `GET /api/admin/dashboard/summary`
**الوصف:** بيانات الـ KPI cards في الصفحة الرئيسية للادمن.

**Response `200 OK`:** `Result<AdminDashboardSummaryDto>`
```json
{
  "totalUsers": 52340,
  "totalProviders": 1284,
  "totalSellers": 342,
  "totalSensors": 32,
  "totalOrders": 1800,
  "pendingSosRequests": 5,
  "openTickets": 12,
  "totalPendingApprovals": 4,
  "totalRevenue": 45000.00
}
```

---

### `GET /api/admin/analytics/orders/monthly`
**الوصف:** إحصائيات الطلبات الشهرية للرسوم البيانية.

**Query Params:**
| Param | النوع | الوصف |
|-------|------|-------|
| `months` | int | عدد الأشهر للرجوع فيها (default: 12, max: 24) |

**Response `200 OK`:** `Result<IReadOnlyList<AdminMonthlyOrderStatsDto>>`
```json
[
  { "year": 2025, "month": 1, "ordersCount": 85, "totalAmount": 12500.00 },
  { "year": 2025, "month": 2, "ordersCount": 102, "totalAmount": 15800.00 }
]
```

---

### `GET /api/admin/system-status`
**الوصف:** حالة صحة النظام — يعمل ping حقيقي على قاعدة البيانات ويرجع قائمة بـ 5 services.

**Response `200 OK`:** `Result<AdminSystemStatusDto>`
```json
{
  "dbConnected": true,
  "activeConnections": 0,
  "uptime": "4h 32m",
  "version": "1.0.0",
  "services": [
    { "name": "API Gateway",   "status": "operational", "uptimePct": 99.97 },
    { "name": "قاعدة البيانات", "status": "operational", "uptimePct": 99.99 },
    { "name": "SignalR Hub",   "status": "operational", "uptimePct": 99.94 },
    { "name": "بوابة الدفع",  "status": "operational", "uptimePct": 99.91 },
    { "name": "شبكة IoT",     "status": "degraded",    "uptimePct": 98.20 }
  ]
}
```

> `status` قيمه: `"operational"` | `"degraded"` | `"down"`  
> `uptimePct` — نسبة مئوية (0–100). قاعدة البيانات تُفحص live؛ باقي الخدمات هيورستيك حتى يتم ربط health probes حقيقية.

---

### `GET /api/admin/activity`
**الوصف:** آخر 20 حدث في النظام من 4 مصادر: SOS requests، Support tickets، موافقات مزودين، مستخدمين جُدد.

**Response `200 OK`:** `Result<IReadOnlyList<AdminActivityDto>>`
```json
[
  {
    "type": "approval",
    "icon": "✅",
    "event": "تمت الموافقة على مزود خدمة: سريع للنقل",
    "timestamp": "2025-04-01T12:05:00Z"
  },
  {
    "type": "sos",
    "icon": "✅",
    "event": "طلب طوارئ #4417 — تم التعيين",
    "timestamp": "2025-04-01T11:50:00Z"
  },
  {
    "type": "user",
    "icon": "👤",
    "event": "مستخدم جديد: محمد حسن (سائق)",
    "timestamp": "2025-04-01T11:30:00Z"
  },
  {
    "type": "ticket",
    "icon": "🎫",
    "event": "Support ticket #ff001122 opened: مشكلة في الدفع",
    "timestamp": "2025-04-01T11:10:00Z"
  }
]
```

> `type` قيمه: `"sos"` | `"ticket"` | `"approval"` | `"user"`  
> الـ Frontend يستخدم `type` و`icon` لعرض الأيقونة والتنسيق المناسب لكل نوع.

---

## 👥 Users Management

### `GET /api/admin/users`
**الوصف:** جلب قائمة المستخدمين مع pagination وتصفية حسب الدور.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `pageNumber` | int | ✅ | رقم الصفحة |
| `pageSize` | int | ✅ | عدد العناصر (max: 100) |
| `role` | string | ❌ | تصفية: `Admin`, `Driver`, `Provider`, `Seller`, `CSAgent` |

**Response `200 OK`:** `Result<PagedResultDto<AdminUserRowDto>>`
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 250,
  "items": [
    {
      "id": "guid",
      "fullName": "Ahmed Ali",
      "email": "ahmed@mail.eg",
      "phoneNumber": "01012345678",
      "isActive": true,
      "points": 1500,
      "role": "Driver"
    }
  ]
}
```

> **ملاحظة:** أرسل `role=Driver` أو `role=driver` — يدعم أيضاً `role=user` و`role=client` كـ aliases.

---

### `GET /api/admin/users/{id}`
**الوصف:** تفاصيل مستخدم واحد مع إحصائياته.

**URL Params:** `id` — معرف المستخدم (GUID أو userId String).

**Response `200 OK`:** `Result<AdminUserDetailDto>`
```json
{
  "id": "guid",
  "fullName": "Ahmed Ali",
  "email": "ahmed@mail.eg",
  "phone": "01012345678",
  "isActive": true,
  "points": 1500,
  "totalOrders": 12,
  "totalSos": 3
}
```

**Response `404`:** المستخدم غير موجود.

---

### `PUT /api/admin/users/{id}`
**الوصف:** تحديث بيانات مستخدم (الاسم، الإيميل، الحالة).

**URL Params:** `id` — معرف المستخدم.

**Request Body:**
```json
{
  "name": "Ahmed Mohamed",
  "email": "ahmed.new@mail.eg",
  "isActive": true
}
```

**Response `200 OK`:** `Result<bool>`  
**Response `404`:** المستخدم غير موجود.

---

### `POST /api/admin/users`
**الوصف:** إنشاء مستخدم جديد بأي دور.

**Request Body:**
```json
{
  "firstName": "New",
  "lastName": "User",
  "email": "new@mail.eg",
  "phoneNumber": "01099999999",
  "password": "Pass@123",
  "role": "Driver"
}
```

> قيم `role` المقبولة: `Admin` | `Driver` | `Provider` | `Seller` | `CSAgent`  
> (يقبل أيضاً: `user`, `client`, `driver` كـ aliases)

**Response `201 Created`:** `Result<AdminUserRowDto>` — المستخدم بعد الإنشاء.  
**Response `400`:** دور غير صالح أو إيميل مكرر.

---

## 🎫 Support Tickets

### `GET /api/admin/tickets/recent`
**الوصف:** آخر N تذكرة دعم.

**Query Params:**
| Param | النوع | الوصف |
|-------|------|-------|
| `limit` | int | عدد التذاكر (default: 20) |

**Response `200 OK`:** `Result<IReadOnlyList<AdminSupportTicketRowDto>>`
```json
[
  {
    "ticketId": "guid",
    "userName": "Ahmed Ali",
    "subject": "مشكلة في الدفع",
    "status": "Open",
    "createdAt": "2025-04-01T12:00:00Z"
  }
]
```

---

### `GET /api/admin/tickets/stats`
**الوصف:** إحصائيات التذاكر (مفتوحة / مغلقة / معلقة).

**Response `200 OK`:** `Result<AdminTicketStatsDto>`
```json
{
  "open": 8,
  "closed": 45,
  "pending": 4,
  "avgResolutionHours": 6.3
}
```

---

### `GET /api/admin/tickets/{id}`
**الوصف:** تفاصيل تذكرة كاملة مع رسائل الدردشة.

**URL Params:** `id` — معرف التذكرة (GUID).

**Response `200 OK`:** `Result<AdminTicketDetailDto>`
```json
{
  "ticketId": "guid",
  "userName": "Ahmed Ali",
  "subject": "مشكلة في الدفع",
  "description": "لم يصلني الكود...",
  "status": "Open",
  "priority": "High",
  "createdAt": "2025-04-01T12:00:00Z",
  "messages": [
    {
      "id": "guid",
      "senderName": "Ahmed Ali",
      "message": "لم يصلني الكود",
      "sentAt": "2025-04-01T12:05:00Z"
    }
  ]
}
```

**Response `404`:** التذكرة غير موجودة.

---

## 🆘 Emergency / SOS

### `GET /api/admin/sos/recent`
**الوصف:** آخر طلبات الطوارئ لمتابعة الAdmins.

**Query Params:**
| Param | النوع | الوصف |
|-------|------|-------|
| `limit` | int | عدد الطلبات (default: 20) |
| `type` | string | تصفية: `Towing`, `Maintenance`, `Fuel`, `Medical` |

**Response `200 OK`:** `Result<IReadOnlyList<AdminSosRowDto>>`
```json
[
  {
    "requestId": "guid",
    "clientName": "Ahmed Ali",
    "providerName": "Quick Rescue",
    "serviceType": "Towing",
    "status": "Accepted",
    "requestedAtUtc": "2025-04-01T12:00:00Z"
  }
]
```

---

### `GET /api/admin/urgent`
**الوصف:** جميع حالات SOS النشطة غير المحسومة.

**Response `200 OK`:** `Result<IReadOnlyList<AdminSosRowDto>>`

---

### `POST /api/admin/urgent/{id}/assign`
**الوصف:** تعيين مزود خدمة يدويًا لطلب SOS.

**URL Params:** `id` — معرف الطلب (GUID).

**Request Body:**
```json
{
  "providerId": "guid"
}
```

**Response `200 OK`:** `Result<bool>`  
**Response `404`:** الطلب أو المزود غير موجود.

---

### `GET /api/admin/urgent/{id}/track`
**الوصف:** متابعة موقع الـ GPS الحي لحالة SOS نشطة.

**URL Params:** `id` — معرف الطلب (GUID).

**Response `200 OK`:** `Result<SosTrackDto>`
```json
{
  "requestId": "guid",
  "providerName": "Quick Rescue",
  "providerLatitude": 30.05,
  "providerLongitude": 31.24,
  "status": "OnTheWay",
  "lastUpdatedUtc": "2025-04-01T12:10:00Z"
}
```

---

## 👷 Providers Management

### `GET /api/admin/providers`
**الوصف:** قائمة جميع مزودي الخدمة مع pagination.

**Query Params:**
| Param | النوع | مطلوب |
|-------|------|--------|
| `pageNumber` | int | ✅ |
| `pageSize` | int | ✅ |

**Response `200 OK`:** `Result<PagedResultDto<AdminProviderRowDto>>`
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 32,
  "items": [
    {
      "id": "guid",
      "fullName": "Quick Rescue",
      "email": "provider@test.com",
      "phoneNumber": "01099999999",
      "isActive": true,
      "totalJobsCompleted": 45
    }
  ]
}
```

---

## ✅ Provider Approvals

### `GET /api/admin/approvals`
**الوصف:** قائمة طلبات الانضمام كمزود خدمة.

**Response `200 OK`:** `Result<IReadOnlyList<ProviderApprovalDto>>`
```json
[
  {
    "providerId": "guid",
    "name": "Mega Recovery",
    "email": "mega@recovery.eg",
    "status": "Pending",
    "documentsCount": 2,
    "appliedAt": "2025-04-01T10:00:00Z"
  }
]
```

---

### `GET /api/admin/approvals/stats`
**الوصف:** إحصائيات مسار الموافقات.

**Response `200 OK`:** `Result<ApprovalStatsDto>`
```json
{
  "pending": 3,
  "approved": 28,
  "rejected": 4
}
```

---

### `GET /api/admin/approvals/{id}/docs`
**الوصف:** جلب روابط المستندات المرفوعة من مزود معين للمراجعة.

**URL Params:** `id` — معرف المزود (GUID/userId).

**Response `200 OK`:** `Result<IReadOnlyList<string>>` — قائمة URLs للمستندات.
```json
[
  "https://docs.example.com/mr-id.pdf",
  "https://docs.example.com/mr-license.pdf"
]
```

---

### `POST /api/admin/approvals/{id}/approve`
**الوصف:** قبول طلب انضمام المزود.

**URL Params:** `id` — معرف المزود.

**Response `200 OK`:** `Result<bool>`  
**Response `404`:** المزود غير موجود.

---

### `POST /api/admin/approvals/{id}/reject`
**الوصف:** رفض طلب انضمام المزود مع ذكر السبب.

**URL Params:** `id` — معرف المزود.

**Request Body:**
```json
{
  "reason": "المستندات غير مكتملة"
}
```

**Response `200 OK`:** `Result<bool>`

---

## 🧑‍💼 CS Agents Management

### `GET /api/admin/cs-agents`
**الوصف:** قائمة وكلاء الدعم الفني.

**Query Params:**
| Param | النوع | مطلوب |
|-------|------|--------|
| `pageNumber` | int | ✅ |
| `pageSize` | int | ✅ |

**Response `200 OK`:** `Result<PagedResultDto<AdminCsAgentRowDto>>`
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 4,
  "items": [
    {
      "id": "guid",
      "name": "Sarah Kamal",
      "email": "cs@test.com",
      "isActive": true,
      "assignedTickets": 7
    }
  ]
}
```

---

### `POST /api/admin/cs-agents`
**الوصف:** إنشاء حساب وكيل دعم جديد.

**Request Body:**
```json
{
  "name": "Omar Fouad",
  "email": "omar@smarttraffic.io",
  "password": "CSAgent@123"
}
```

**Response `201 Created`:** `Result<AdminCsAgentRowDto>`  
**Response `400`:** إيميل مكرر أو بيانات ناقصة.

---

### `POST /api/admin/cs-agents/{id}/activate`
**الوصف:** تبديل حالة الوكيل (نشط / موقوف).

**URL Params:** `id` — معرف الوكيل.

**Response `200 OK`:** `Result<bool>` — القيمة الجديدة لـ `isActive`.  
**Response `404`:** الوكيل غير موجود.

---

## ⭐ Ratings & Sensors

### `GET /api/admin/ratings`
**الوصف:** جميع التقييمات المُقدَّمة في النظام مع pagination.

**Query Params:**
| Param | النوع | مطلوب |
|-------|------|--------|
| `pageNumber` | int | ✅ |
| `pageSize` | int | ✅ |

**Response `200 OK`:** `Result<PagedResultDto<AdminRatingDto>>`
```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 200,
  "items": [
    {
      "id": "guid",
      "customerName": "Ahmed Ali",
      "stars": 5,
      "comment": "خدمة ممتازة",
      "target": "Service",
      "createdAt": "2025-04-01T14:00:00Z"
    }
  ]
}
```

---

### `GET /api/admin/sensors`
**الوصف:** جميع بيانات حساسات المركبات.

**Response `200 OK`:** `Result<IReadOnlyList<AdminSensorDto>>`
```json
[
  {
    "id": "guid",
    "name": "Sensor-001",
    "latitude": 30.05,
    "longitude": 31.24,
    "status": "online",
    "currentValue": 42.5,
    "unit": "°C",
    "updatedAt": "2025-04-01T12:00:00Z"
  }
]
```

---

## 🛒 Seller Portal

> **الدور المطلوب:** `Seller`

### `GET /api/seller/products`
**الوصف:** قائمة منتجات الـ Seller الحالي.

**Response `200 OK`:** `Result<IReadOnlyList<ProductDto>>`
```json
[
  {
    "id": "guid",
    "name": "Car Battery",
    "description": "...",
    "price": 150.00,
    "stockQuantity": 25,
    "categoryId": "guid",
    "categoryName": "Auto Parts"
  }
]
```

---

### `POST /api/seller/products`
**الوصف:** إضافة منتج جديد.

**Request Body:**
```json
{
  "name": "Bosch S5 Battery",
  "description": "AGM battery 70Ah",
  "price": 115.00,
  "stockQuantity": 50,
  "categoryId": "guid"
}
```

**Response `201 Created`:** `Result<ProductDto>`

---

### `PUT /api/seller/products/{id}`
**الوصف:** تحديث بيانات منتج.

**URL Params:** `id` — معرف المنتج.

**Request Body:** نفس شكل الإضافة.

**Response `200 OK`:** `Result<ProductDto>`  
**Response `404`:** المنتج غير موجود.

---

### `DELETE /api/seller/products/{id}`
**الوصف:** حذف منتج.

**URL Params:** `id` — معرف المنتج.

**Response `200 OK`:** `Result<bool>`

---

### `GET /api/seller/orders`
**الوصف:** الطلبات التي تحتوي على منتجات الـ Seller الحالي.

**Response `200 OK`:** `Result<IReadOnlyList<OrderSummaryDto>>`
```json
[
  {
    "id": "guid",
    "totalAmount": 300.00,
    "status": "Delivered",
    "createdAt": "2025-04-01T12:00:00Z",
    "itemCount": 2
  }
]
```

---

## 👷 Provider Portal

> **الدور المطلوب:** `Provider`

### `GET /api/provider/dashboard`
**الوصف:** ملخص KPIs للمزود.

**Response `200 OK`:** `Result<ProviderDashboardDto>`
```json
{
  "totalJobs": 45,
  "completedJobs": 40,
  "pendingJobs": 2,
  "totalEarnings": 2500.00,
  "rating": 4.8,
  "isOnline": true
}
```

---

### `GET /api/provider/jobs/available`
**الوصف:** طلبات SOS المتاحة للقبول.

**Response `200 OK`:** `Result<IReadOnlyList<ProviderJobDto>>`
```json
[
  {
    "requestId": "guid",
    "clientName": "Ahmed Ali",
    "latitude": 30.05,
    "longitude": 31.24,
    "serviceType": "Towing",
    "notes": "...",
    "distanceKm": 3.5,
    "createdAt": "2025-04-01T12:00:00Z"
  }
]
```

---

### `PATCH /api/provider/jobs/accept/{requestId}`
**الوصف:** قبول طلب SOS.

**URL Params:** `requestId` — معرف الطلب (GUID).

**Response `200 OK`:** `Result<bool>`

---

### `PATCH /api/provider/jobs/status`
**الوصف:** تحديث حالة الطلب الحالي.

**Request Body:**
```json
{
  "requestId": "guid",
  "status": "OnTheWay"
}
```

> قيم `status`: `OnTheWay` | `Arrived` | `InProgress` | `Completed`

**Response `200 OK`:** `Result<bool>`

---

### `PATCH /api/provider/jobs/location`
**الوصف:** إرسال الموقع الحالي أثناء الطلب (يُبث للعميل عبر SignalR).

**Request Body:**
```json
{
  "requestId": "guid",
  "latitude": 30.06,
  "longitude": 31.25
}
```

**Response `200 OK`:** `Result<bool>`

---

### `GET /api/provider/jobs/history`
**الوصف:** سجل المهام المكتملة.

**Response `200 OK`:** `Result<IReadOnlyList<ProviderHistoryItemDto>>`
```json
[
  {
    "requestId": "guid",
    "clientName": "Ahmed",
    "serviceType": "Towing",
    "status": "Completed",
    "earnings": 120.00,
    "completedAt": "2025-04-01T14:00:00Z"
  }
]
```

---

## 💬 Support Agent (CSAgent)

> **الدور المطلوب:** `CSAgent` — التذاكر مرئية أيضاً لصاحب التذكرة (`Driver`)

### `GET /api/support/tickets/my`
**الوصف:** التذاكر المعينة للوكيل أو المُقدَّمة من الـ Driver.

**Response `200 OK`:** `Result<IReadOnlyList<MyTicketDto>>`
```json
[
  {
    "id": "guid",
    "subject": "مشكلة في الدفع",
    "status": "Open",
    "lastMessageAt": "2025-04-01T13:00:00Z"
  }
]
```

---

### `GET /api/support/tickets/stats`
**الوصف:** إحصائيات التذاكر للوكيل (CSAgent / Admin فقط).

**Response `200 OK`:** `Result<CsTicketStatsDto>`
```json
{
  "total": 57,
  "open": 8,
  "inProgress": 4,
  "closed": 45
}
```

---

### `GET /api/support/tickets/{id}`
**الوصف:** تفاصيل تذكرة كاملة مع سجل الدردشة (CSAgent / Admin فقط).

**URL Params:** `id` — معرف التذكرة (GUID).

**Response `200 OK`:** `Result<CsTicketFullDto>`
```json
{
  "id": "guid",
  "subject": "مشكلة في الدفع",
  "status": "Open",
  "clientName": "Ahmed Ali",
  "messages": [
    {
      "senderId": "guid",
      "message": "لم يصلني الكود",
      "sentAt": "2025-04-01T12:05:00Z"
    }
  ]
}
```

**Response `404`:** التذكرة غير موجودة.

---

### `GET /api/chat/history/{ticketId}`
**الوصف:** جلب سجل رسائل الدردشة.

**URL Params:** `ticketId` (GUID).

**Response `200 OK`:** `Result<List<MessageDto>>`
```json
[
  {
    "id": "guid",
    "ticketId": "guid",
    "senderId": "guid",
    "senderName": "Sarah Kamal",
    "message": "سنتابع موضوعك حالاً",
    "type": "Text",
    "sentOnUtc": "2025-04-01T12:10:00Z"
  }
]
```

---

### `POST /api/chat/send`
**الوصف:** إرسال رسالة في محادثة. تُبث تلقائيًا عبر SignalR.

**Request Body:**
```json
{
  "ticketId": "guid",
  "message": "تم حل مشكلتك بنجاح",
  "type": "Text"
}
```

**Response `200 OK`:** `Result<MessageDto>`  
**Response `403`:** لا تملك صلاحية المراسلة في هذه التذكرة.

> 📡 **SignalR Event:** يُبث `ReceiveMessage` على مجموعة التذكرة.

---

### `PATCH /api/support/close/{id}`
**الوصف:** إغلاق تذكرة الدعم.

**URL Params:** `id` — معرف التذكرة.

**Response `200 OK`:** `Result<SupportTicketDto>`  
**Response `403`:** لا تملك صلاحية إغلاق هذه التذكرة.

---

### `POST /api/support/tickets/{id}/escalate`
**الوصف:** رفع أولوية التذكرة (CSAgent فقط).

**URL Params:** `id` — معرف التذكرة.

**Response `200 OK`:** `Result<bool>`

---

## 🛒 Store / Cart / Orders (Backoffice)

> **Auth:** ✅ (Store browsing مسموح للزوار)

### `GET /api/store/products`
**Query Params:** `pageNumber`, `pageSize`, `search?`, `categoryId?`

**Response `200 OK`:** `Result<PagedResultDto<ProductDto>>` — نفس شكل Mobile.

---

### `GET /api/orders/my`
**Auth:** ✅ أي مستخدم  
**Response `200 OK`:** `Result<IReadOnlyList<OrderSummaryDto>>`

---

### `GET /api/orders/{orderId}`
**Auth:** ✅  
**URL Params:** `orderId` (GUID).  
**Response `200 OK`:** `Result<OrderDetailsDto>`

---

## 💳 Payments (Backoffice)

### `GET /api/payments/stripe/config`
**Auth:** ❌  
**الوصف:** جلب Stripe Publishable Key لتهيئة Stripe SDK.

**Response `200 OK`:** `Result<StripeConfigDto>`
```json
{ "publishableKey": "pk_test_xxx" }
```

---

### `GET /api/payments/cards`
**Auth:** ✅  
**Response `200 OK`:** `Result<IReadOnlyList<SavedCardDto>>`
```json
[
  {
    "paymentMethodId": "pm_xxx",
    "brand": "Visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2027,
    "isDefault": true
  }
]
```

---

### `POST /api/payments/cards`
**Auth:** ✅  
**Request Body:** `{ "paymentMethodId": "pm_xxx" }`  
**Response `200 OK`:** `Result<SavedCardDto>`

---

### `DELETE /api/payments/cards/{id}`
**Auth:** ✅  
**URL Params:** `id` — `paymentMethodId` من Stripe.  
**Response `200 OK`:** `Result<bool>`

---

### `GET /api/payments/history`
**Auth:** ✅  
**Response `200 OK`:** `Result<IReadOnlyList<PaymentHistoryItemDto>>`
```json
[
  {
    "id": "guid",
    "amount": 300.00,
    "status": "Succeeded",
    "paymentIntentId": "pi_xxx",
    "createdAt": "2025-04-01T12:00:00Z"
  }
]
```

---

### `GET /api/payments/{id}`
**Auth:** ✅  
**URL Params:** `id` (GUID).  
**Response `200 OK`:** `Result<PaymentHistoryItemDto>`

---

### `POST /api/payments/refund`
**Auth:** ✅  
**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 150.00
}
```

**Response `200 OK`:** `Result<RefundPaymentResponseDto>`
```json
{
  "refundId": "re_xxx",
  "status": "succeeded",
  "amount": 150.00,
  "currency": "usd"
}
```

---

### `POST /api/payments/stripe/webhook`
**Auth:** ❌ (Server-to-Server فقط — Stripe تستدعيه تلقائياً)

**Headers المطلوبة:**
```
Stripe-Signature: t=...,v1=...
```

**Response `200 OK`:** `Result<bool>`  
**Response `400`:** توقيع غير صالح.

---

## ⭐ Ratings (Analytics)

### `POST /api/ratings`
**Auth:** ✅  
**Request Body:**
```json
{
  "stars": 5,
  "comment": "خدمة ممتازة",
  "serviceRequestId": "guid",
  "orderId": null
}
```

> ⚠️ يجب توفير `serviceRequestId` أو `orderId`. تقييم واحد لكل خدمة/طلب (`409` عند التكرار).

**Response `201 Created`:** `Result<RatingResponseDto>`

---

### `GET /api/ratings/my`
**Auth:** ✅  
**Response `200 OK`:** `Result<IReadOnlyList<RatingResponseDto>>`

---

## ⛅ Weather

### `GET /api/weather`
**Auth:** ✅  
**Query Params:** `lat` (double), `lng` (double)

**Response `200 OK`:** `Result<WeatherDto>`
```json
{
  "city": "Cairo",
  "temperature": 32.5,
  "feelsLike": 35.0,
  "humidity": 40,
  "description": "Clear sky",
  "icon": "01d",
  "windSpeed": 5.2
}
```

---

### `GET /api/weather/city`
**Auth:** ✅  
**Query Params:** `name` (string) — مثال: `name=Cairo`  
**Response `200 OK`:** `Result<WeatherDto>` — نفس الشكل أعلاه.

---

## 🚦 Traffic Incidents

### `POST /api/traffic/report`
**Auth:** ✅ Driver فقط  
**الوصف:** الإبلاغ عن حادث أو خطر على الطريق.

**Request Body:**
```json
{
  "latitude": 30.0444,
  "longitude": 31.2357,
  "type": "Accident",
  "description": "حادث اصطدام على كوبري أكتوبر",
  "severity": "High"
}
```

**Response `201 Created`:** `Result<TrafficReportDto>`

---

### `GET /api/trafficincidents`
**Auth:** ✅  
**Response `200 OK`:** `Result<IReadOnlyList<TrafficIncidentDto>>`
```json
[
  {
    "id": "guid",
    "title": "Minor collision near Ring Road #1",
    "location": "Cairo Ring Road — Exit 7",
    "severity": "Medium",
    "isResolved": false
  }
]
```

---

### `GET /api/trafficincidents/by-location`
**Auth:** ✅  
**Query Params:** `location` (string) — اسم المنطقة.  
**Response `200 OK`:** `Result<IReadOnlyList<TrafficIncidentDto>>`

---

## 📡 Sensors

### `GET /api/sensors/vehicle-env`
**Auth:** ✅  
**Query Params:** `vehicleId` (GUID) — معرف المركبة.

**Response `200 OK`:** `Result<VehicleEnvSensorDto>`
```json
{
  "vehicleId": "guid",
  "temperature": 92.5,
  "oilPressure": 40.2,
  "fuelLevel": 65.0,
  "batteryVoltage": 12.6,
  "recordedAt": "2025-04-01T12:00:00Z"
}
```

---

## 🗺️ Map / Places

### `GET /api/map/search`
**Auth:** ✅  
**Query Params:** `query` (string) — اسم المكان.

**Response `200 OK`:** `Result<MapSearchResultDto>`
```json
{
  "name": "Cairo International Airport",
  "latitude": 30.1219,
  "longitude": 31.4056,
  "formattedAddress": "Cairo, Egypt"
}
```

---

## 🔔 Notifications

### `GET /api/notifications`
**Auth:** ✅  
**Response `200 OK`:** `Result<IReadOnlyList<NotificationDto>>`
```json
[
  {
    "id": "guid",
    "title": "تم قبول طلبك",
    "message": "المزود في الطريق إليك",
    "isRead": false,
    "createdAt": "2025-04-01T12:00:00Z"
  }
]
```

---

### `PUT /api/notifications/{id}/read`
**Auth:** ✅  
**URL Params:** `id` (GUID).  
**Response `200 OK`:** `Result<NotificationDto>` — الإشعار بعد التحديث (`isRead: true`).

---

### `DELETE /api/notifications/{id}`
**Auth:** ✅  
**URL Params:** `id` (GUID).  
**Response `200 OK`:** `Result<bool>`

---

## 📋 Web/Admin Notes

- **Admin** endpoints تتطلب `Authorization: Bearer <token>` بدور `Admin`.
- **Seller** endpoints تتطلب دور `Seller`.
- **Provider** endpoints تتطلب دور `Provider`.
- **CSAgent** endpoints مرئية لـ `CSAgent` و`Admin`، وسجل الدردشة مرئي أيضاً لصاحب التذكرة (`Driver`).
- لـ Google login على الـ Web: **لا ترسل** `X-Platform: Mobile` حتى لا تتقيد بدور `Driver`.
- التحديثات الفورية (SOS, chat) تصل عبر SignalR على `/hubs/traffic`.
- Stripe webhook يُستدعى من Stripe تلقائيًا — **لا تستدعيه من الـ Frontend**.
- `Admin` و`CSAgent` لا يمكن تسجيلهم ذاتيًا — يُنشؤون عبر Admin panel أو Seeder فقط.
- password reset flow: `forgot-password` → يستلم المستخدم التوكن → `reset-password`.

---

## ⚠️ Security Warning

> الـ controllers التالية لديها `[Authorize]` **معلَّق (commented out)** وهي **غير محمية حاليًا**:
> `GarageController`, `PaymentsController`, `StoreController`, `MapController`, `OrdersController`,
> `CartController`, `WeatherController`, `RatingsController`, `SensorsController`, `TrafficController`, `TrafficIncidentsController`, `ChatController`
>
> **يجب تفعيلها قبل الـ Production.**
