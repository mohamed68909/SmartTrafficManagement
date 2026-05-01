# SmartTraffic Mobile API — Detailed Reference

> **Base URL:** `https://<host>/api`
> **Realtime Hub:** `/hubs/traffic` (SignalR)
> **Response Envelope:** كل الـ responses مغلفة في `Result<T>`:
> ```json
> { "isSuccess": true, "value": { ... }, "statusCode": 200, "error": null }
> ```

---

## 🔐 Auth

### `POST /api/auth/register`
**Auth:** ❌ لا يحتاج token  
**الوصف:** تسجيل مستخدم جديد. عند إضافة header `X-Platform: Mobile` يتم تحديد الدور تلقائيًا كـ `Driver`.

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "password": "Pass@123",
  "phoneNumber": "01012345678",
  "role": "Driver"
}
```

**Headers (Mobile فقط):**
```
X-Platform: Mobile
```

**Response `200 OK`:** `Result<AuthResponseDto>`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "abc...",
  "expiresIn": 1800,
  "userId": "guid",
  "email": "ahmed@example.com",
  "role": "Driver"
}
```

**Response `400 Bad Request`:** إذا الإيميل مسجل قبل كده أو بيانات غلط.

---

### `POST /api/auth/login`
**Auth:** ❌  
**الوصف:** تسجيل دخول بالإيميل والباسورد.

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "Pass@123"
}
```

**Response `200 OK`:** `Result<AuthResponseDto>`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "abc...",
  "expiresIn": 1800,
  "userId": "guid",
  "email": "ahmed@example.com",
  "role": "Driver"
}
```

**Response `401 Unauthorized`:** باسورد غلط.  
**Response `400 Bad Request`:** بيانات ناقصة.

---

### `POST /api/auth/google-login`
**Auth:** ❌  
**الوصف:** تسجيل دخول (أو إنشاء حساب) باستخدام Google ID Token من Google Sign-In SDK.

**Headers (Mobile فقط):**
```
X-Platform: Mobile
```

**Request Body:**
```json
{
  "idToken": "eyJ..."
}
```

**Response `200 OK`:** `Result<AuthResponseDto>` — نفس شكل الـ login العادي.

**Response `400`:** Token غير صالح.  
**Response `401`:** فشل التحقق من Google.

---

### `POST /api/auth/send-otp`
**Auth:** ❌  
**الوصف:** إرسال أو إعادة إرسال كود OTP لتأكيد الحساب إلى البريد الإلكتروني.

**Request Body:**
```json
{
  "email": "ahmed@example.com"
}
```

**Response `200 OK`:** `Result<bool>`
```json
{ "isSuccess": true, "value": true, "statusCode": 200 }
```

---

### `POST /api/auth/verify-otp`
**Auth:** ❌  
**الوصف:** تأكيد البريد الإلكتروني عبر OTP. في بيئة MVP الكود الافتراضي هو `123456`.

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "otpCode": "123456"
}
```

**Response `200 OK`:** `Result<bool>`
```json
{ "isSuccess": true, "value": true, "statusCode": 200 }
```

---

### `POST /api/auth/refresh-token`
**Auth:** ❌  
**الوصف:** تجديد الـ access token باستخدام refresh token لم تنتهِ صلاحيته.

**Request Body:**
```json
{
  "refreshToken": "abc123..."
}
```

**Response `200 OK`:** `Result<AuthResponseDto>` — access token جديد.  
**Response `401`:** refresh token منتهي أو غير صالح.

---

### `POST /api/auth/forgot-password`
**Auth:** ❌  
**الوصف:** إرسال token لإعادة تعيين كلمة المرور إلى البريد الإلكتروني.

**Request Body:**
```json
{
  "email": "ahmed@example.com"
}
```

**Response `200 OK`:** `Result<bool>` — يرجع `true` دائمًا (لأسباب أمنية حتى لو الإيميل غير موجود).

---

### `POST /api/auth/reset-password`
**Auth:** ❌  
**الوصف:** إعادة تعيين كلمة المرور باستخدام التوكن المُرسل على الإيميل.

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "token": "ABC123...",
  "newPassword": "NewPass@456"
}
```

**Response `200 OK`:** `Result<bool>`  
**Response `400`:** توكن غير صالح أو منتهي.

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
**Auth:** ✅ Bearer Token  
**الوصف:** جلب بيانات الملف الشخصي للمستخدم الحالي (يُستخرج من JWT).

**Request:** لا يوجد body أو query params — الهوية من الـ token.

**Response `200 OK`:** `Result<ProfileResponseDto>`
```json
{
  "id": "guid",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "phoneNumber": "01012345678",
  "role": "Driver",
  "avatarUrl": "https://..."
}
```

---

### `PUT /api/auth/profile` أو `PUT /api/auth/profile/update`
**Auth:** ✅ Bearer Token  
**الوصف:** تعديل بيانات الملف الشخصي.

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Mohamed",
  "phoneNumber": "01098765432",
  "avatarUrl": "https://..."
}
```

**Response `200 OK`:** `Result<ProfileResponseDto>` — البيانات بعد التعديل.

---

### `PATCH /api/auth/change-password`
**Auth:** ✅ Bearer Token  
**الوصف:** تغيير كلمة المرور مع التحقق من الكلمة القديمة.

**Request Body:**
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

**Response `200 OK`:** `Result<bool>`  
**Response `400`:** كلمة المرور الحالية غلط.

---

## 🚗 Garage (مركباتي)

> **الدور المطلوب:** `Client` — مقيّد بـ `[Authorize(Roles = "Client")]` على مستوى الـ controller

### `GET /api/garage`
**الوصف:** جلب قائمة مركبات المستخدم الحالي.

**Request:** لا يوجد — الهوية من الـ token.

**Response `200 OK`:** `Result<IReadOnlyList<VehicleResponseDto>>`
```json
[
  {
    "id": "guid",
    "make": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "color": "White",
    "licensePlate": "ABC 123",
    "vin": "1HGCM82633A123456"
  }
]
```

---

### `GET /api/garage/{id}`
**الوصف:** جلب تفاصيل مركبة واحدة بـ `id` (GUID).

**URL Params:** `id` — معرف المركبة (GUID).

**Response `200 OK`:** `Result<VehicleResponseDto>`  
**Response `404`:** المركبة غير موجودة أو لا تخص المستخدم.

---

### `POST /api/garage` أو `POST /api/garage/add`
**الوصف:** إضافة مركبة جديدة للغراج.

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "White",
  "licensePlate": "ABC 123",
  "vin": "1HGCM82633A123456"
}
```

**Response `201 Created`:** `Result<VehicleResponseDto>` — المركبة المضافة.

---

### `PUT /api/garage/{id}` أو `PUT /api/garage/update/{id}`
**الوصف:** تحديث بيانات مركبة موجودة.

**URL Params:** `id` — معرف المركبة.

**Request Body:** نفس شكل الإضافة — كل الحقول أو الحقول المطلوب تغييرها.

**Response `200 OK`:** `Result<VehicleResponseDto>` — البيانات بعد التحديث.

---

### `DELETE /api/garage/{id}` أو `DELETE /api/garage/delete/{id}`
**الوصف:** حذف مركبة من الغراج.

**URL Params:** `id` — معرف المركبة.

**Response `200 OK`:** `Result<bool>` — `true` إذا حُذفت بنجاح.

---

## 🛒 Store / Cart / Orders

### `GET /api/store/products`
**Auth:** ✅ (أو ❌ — مسموح للزوار)  
**الوصف:** جلب قائمة المنتجات مع دعم Pagination والبحث والتصفية.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `pageNumber` | int | ✅ | رقم الصفحة (min: 1) |
| `pageSize` | int | ✅ | عدد العناصر في الصفحة (default: 10) |
| `search` | string | ❌ | بحث في اسم المنتج |
| `categoryId` | GUID | ❌ | تصفية حسب التصنيف |

**Response `200 OK`:** `Result<PagedResultDto<ProductDto>>`
```json
{
  "items": [
    {
      "id": "guid",
      "name": "Car Battery",
      "description": "...",
      "price": 150.00,
      "imageUrl": "https://...",
      "categoryId": "guid",
      "categoryName": "Auto Parts",
      "stock": 25
    }
  ],
  "totalCount": 100,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

---

### `POST /api/store/checkout`
**Auth:** ✅ Client  
**الوصف:** إتمام عملية الشراء — يُنشئ Stripe PaymentIntent ويحوّل محتوى الكارت إلى Order.

**Request Body:**
```json
{
  "paymentMethodId": "pm_stripe_xxx",
  "shippingAddress": "123 Main St, Cairo"
}
```

**Response `200 OK`:** `Result<CheckoutDto>`
```json
{
  "orderId": "guid",
  "paymentIntentId": "pi_stripe_xxx",
  "clientSecret": "pi_xxx_secret_yyy",
  "amount": 300.00,
  "currency": "usd"
}
```

> ⚠️ بعد الحصول على `clientSecret`، استخدم Stripe SDK على الموبايل لإتمام الدفع.

---

### `GET /api/cart`
**Auth:** ✅ Client  
**الوصف:** جلب محتوى الكارت الحالي.

**Response `200 OK`:** `Result<CartDto>`
```json
{
  "id": "guid",
  "items": [
    {
      "id": "guid",
      "productId": "guid",
      "productName": "Car Battery",
      "quantity": 2,
      "unitPrice": 150.00,
      "totalPrice": 300.00
    }
  ],
  "totalAmount": 300.00
}
```

---

### `POST /api/cart/items`
**Auth:** ✅ Client  
**الوصف:** إضافة منتج إلى الكارت. إذا المنتج موجود، الكمية تتجمع.

**Request Body:**
```json
{
  "productId": "guid",
  "quantity": 2
}
```

**Response `200 OK`:** `Result<CartDto>` — الكارت بعد الإضافة.

---

### `PATCH /api/cart/items/{cartItemId}`
**Auth:** ✅ Client  
**الوصف:** تعديل كمية عنصر موجود في الكارت.

**URL Params:** `cartItemId` — معرف عنصر الكارت (GUID).

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response `200 OK`:** `Result<CartDto>` — الكارت بعد التعديل.

---

### `DELETE /api/cart/items/{cartItemId}`
**Auth:** ✅ Client  
**الوصف:** إزالة عنصر من الكارت.

**URL Params:** `cartItemId` — معرف عنصر الكارت (GUID).

**Response `200 OK`:** `Result<bool>`

---

### `GET /api/orders/my`
**Auth:** ✅ Client  
**الوصف:** جلب قائمة الطلبات السابقة للمستخدم الحالي.

**Response `200 OK`:** `Result<IReadOnlyList<OrderSummaryDto>>`
```json
[
  {
    "id": "guid",
    "totalAmount": 300.00,
    "status": "Paid",
    "createdAt": "2025-04-01T12:00:00Z",
    "itemCount": 2
  }
]
```

---

### `GET /api/orders/{orderId}`
**Auth:** ✅ Client  
**الوصف:** جلب تفاصيل طلب معين.

**URL Params:** `orderId` — معرف الطلب (GUID).

**Response `200 OK`:** `Result<OrderDetailsDto>`
```json
{
  "id": "guid",
  "status": "Paid",
  "totalAmount": 300.00,
  "shippingAddress": "...",
  "items": [
    { "productName": "Car Battery", "quantity": 2, "unitPrice": 150.00 }
  ],
  "createdAt": "2025-04-01T12:00:00Z"
}
```

---

## 💳 Payments

### `GET /api/payments/stripe/config`
**Auth:** ❌  
**الوصف:** جلب Stripe Publishable Key لتهيئة Stripe SDK على الموبايل.

**Response `200 OK`:** `Result<StripeConfigDto>`
```json
{
  "publishableKey": "pk_test_xxx"
}
```

---

### `GET /api/payments/cards`
**Auth:** ✅  
**الوصف:** جلب قائمة البطاقات المحفوظة للمستخدم في Stripe.

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
**الوصف:** ربط بطاقة جديدة بالحساب عبر Stripe Payment Method ID (يُولَّد من Stripe SDK).

**Request Body:**
```json
{
  "paymentMethodId": "pm_xxx"
}
```

**Response `200 OK`:** `Result<SavedCardDto>` — تفاصيل البطاقة المضافة.  
**Response `400`:** خطأ من Stripe (بطاقة غير صالحة).

---

### `DELETE /api/payments/cards/{id}`
**Auth:** ✅  
**الوصف:** حذف بطاقة محفوظة.

**URL Params:** `id` — `paymentMethodId` من Stripe (مثل `pm_xxx`).

**Response `200 OK`:** `Result<bool>`  
**Response `404`:** البطاقة غير موجودة.

---

### `GET /api/payments/history`
**Auth:** ✅  
**الوصف:** جلب سجل المعاملات المالية للمستخدم.

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
**الوصف:** جلب تفاصيل معاملة مالية واحدة.

**URL Params:** `id` — معرف الدفع (GUID).

**Response `200 OK`:** `Result<PaymentHistoryItemDto>`  
**Response `404`:** الدفع غير موجود أو لا يخص المستخدم.

---

### `POST /api/payments/refund`
**Auth:** ✅  
**الوصف:** طلب استرداد مبلغ لمعاملة مكتملة.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 150.00
}
```

> إذا `amount` = null يتم استرداد المبلغ كاملًا.

**Response `200 OK`:** `Result<RefundPaymentResponseDto>`
```json
{
  "refundId": "re_xxx",
  "status": "succeeded",
  "amount": 150.00,
  "currency": "usd"
}
```

**Response `400`:** فشل الاسترداد من Stripe.

---

### `POST /api/payments/stripe/webhook`
**Auth:** ❌ (Server-to-Server فقط)  
**الوصف:** Stripe webhook — **لا تستدعيه من التطبيق.** Stripe تستدعيه تلقائيًا عند اكتمال الدفع.

**Headers المطلوبة (من Stripe):**
```
Stripe-Signature: t=...,v1=...
```

**الحدث المدعوم:** `payment_intent.succeeded` — يحدّث حالة الطلب إلى `Paid`.

**Response `200 OK`:** `Result<bool>`  
**Response `400`:** توقيع غير صالح.

---

## 🆘 Emergency / SOS

### `POST /api/sos/request`
**Auth:** ✅ Client  
**الوصف:** إنشاء طلب طوارئ جديد. إذا كان هناك طلب نشط مسبقًا يُرجع `409`.

**Request Body:**
```json
{
  "latitude": 30.0444,
  "longitude": 31.2357,
  "vehicleId": "guid", // (Optional) يمكن أن يكون null
  "notes": "حادث بسيط على الطريق السريع",
  "serviceType": "Towing"
}
```

**Response `201 Created`:** `Result<RequestDetailsDto>`
```json
{
  "id": "guid",
  "status": "Pending",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "vehicleId": "guid", // (Optional)
  "serviceType": "Towing",
  "createdAt": "2025-04-01T12:00:00Z",
  "providerId": null,
  "providerLocation": null
}
```

**Response `409 Conflict`:** يوجد طلب نشط مسبقًا.

---

### `GET /api/sos/status/{id}`
**Auth:** ✅ (أي دور)  
**الوصف:** جلب حالة طلب SOS للـ polling أو بعد تحديث SignalR.

**URL Params:** `id` — معرف الطلب (GUID).

**Response `200 OK`:** `Result<SosStatusDto>`
```json
{
  "requestId": "guid",
  "status": "Accepted",
  "providerName": "Khaled Ahmed",
  "providerPhone": "01099999999",
  "providerLatitude": 30.05,
  "providerLongitude": 31.24,
  "estimatedArrivalMinutes": 10
}
```

**Response `404`:** الطلب غير موجود.

---

### `GET /api/sos/history`
**Auth:** ✅ Client  
**الوصف:** جلب سجل طلبات الطوارئ السابقة.

**Response `200 OK`:** `Result<IReadOnlyList<RequestDetailsDto>>`

---

### `PATCH /api/sos/cancel/{id}`
**Auth:** ✅ Client  
**الوصف:** إلغاء طلب طوارئ معلق (قبل قبوله من Provider).

**URL Params:** `id` — معرف الطلب (GUID).

**Response `200 OK`:** `Result<bool>`  
**Response `404`:** الطلب غير موجود.

---

### `PATCH /api/sos/accept/{id}`
**Auth:** ✅ Provider  
**الوصف:** قبول طلب SOS من قِبل مزود الخدمة. *(Provider Mobile Only)*

**URL Params:** `id` — معرف الطلب (GUID).

**Response `200 OK`:** `Result<RequestDetailsDto>` — تفاصيل الطلب بعد القبول.  
**Response `403`:** ليس Provider.  
**Response `404`:** الطلب غير موجود.  
**Response `409`:** الطلب مقبول مسبقًا.

---

## 👷 Provider Portal *(Provider Mobile Only)*

> **الدور المطلوب:** `Provider` على جميع الـ endpoints

### `GET /api/provider/dashboard`
**الوصف:** ملخص KPIs للوحة تحكم المزود.

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
**الوصف:** قائمة طلبات SOS المتاحة للقبول.

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
**الوصف:** قبول طلب متاح.

**URL Params:** `requestId` (GUID).

**Response `200 OK`:** `Result<bool>`

---

### `POST /api/provider/jobs/{requestId}/reject`
**الوصف:** رفض طلب متاح.

**URL Params:** `requestId` (GUID).

**Response `200 OK`:** `Result<bool>`

---

### `PATCH /api/provider/jobs/status`
**الوصف:** تحديث حالة الطلب الحالي (مثل: في الطريق، وصلت، انتهيت).

**Request Body:**
```json
{
  "requestId": "guid",
  "status": "OnTheWay"
}
```

> القيم المتاحة لـ `status`: `OnTheWay` | `Arrived` | `InProgress` | `Completed`

**Response `200 OK`:** `Result<bool>`

---

### `PATCH /api/provider/jobs/location`
**الوصف:** إرسال موقع الـ GPS الحالي أثناء تنفيذ الطلب (يُبث عبر SignalR للعميل).

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

### `GET /api/provider/active-mission`
**الوصف:** تفاصيل المهمة النشطة حاليًا (إن وجدت).

**Response `200 OK`:** `Result<ProviderActiveMissionDto?>` — `null` إذا لا توجد مهمة نشطة.
```json
{
  "requestId": "guid",
  "clientName": "Ahmed Ali",
  "clientPhone": "01012345678",
  "latitude": 30.05,
  "longitude": 31.24,
  "status": "OnTheWay",
  "serviceType": "Towing"
}
```

---

### `POST /api/provider/active-mission/status`
**الوصف:** تحديث حالة المهمة النشطة (بديل POST).

**Request Body:**
```json
{
  "requestId": "guid",
  "status": "Completed"
}
```

**Response `200 OK`:** `Result<bool>`

---

### `GET /api/provider/earnings`
**الوصف:** ملخص الأرباح الإجمالية.

**Response `200 OK`:** `Result<ProviderEarningsDto>`
```json
{
  "total": 2500.00,
  "thisMonth": 800.00,
  "thisWeek": 200.00,
  "pendingPayout": 150.00
}
```

---

### `GET /api/provider/earnings/weekly`
**الوصف:** توزيع الأرباح على أيام الأسبوع الحالي.

**Response `200 OK`:** `Result<IReadOnlyList<ProviderEarningsDayDto>>`
```json
[
  { "day": "Monday", "earnings": 120.00, "jobs": 3 },
  { "day": "Tuesday", "earnings": 80.00, "jobs": 2 }
]
```

---

### `GET /api/provider/schedule`
**الوصف:** جلب جدول العمل الأسبوعي.

**Response `200 OK`:** `Result<ProviderScheduleDto>`
```json
{
  "workingDays": ["Monday", "Tuesday", "Wednesday"],
  "startHour": 8,
  "endHour": 20
}
```

---

### `PUT /api/provider/schedule`
**الوصف:** تحديث جدول العمل.

**Request Body:**
```json
{
  "workingDays": ["Monday", "Wednesday", "Friday"],
  "startHour": 9,
  "endHour": 18
}
```

**Response `200 OK`:** `Result<bool>`

---

### `POST /api/provider/status`
**الوصف:** تبديل حالة الاتصال (online/offline).

**Request Body:**
```json
{
  "online": true
}
```

**Response `200 OK`:** `Result<bool>`

---

### `PATCH /api/provider/status`
**الوصف:** تحديث حالة الاتصال (نفس الغرض — بديل PATCH).

**Request Body:**
```json
{
  "isOnline": false
}
```

**Response `200 OK`:** `Result<bool>`

---

### `GET /api/provider/profile`
**الوصف:** جلب الملف الشخصي للمزود.

**Response `200 OK`:** `Result<ProviderProfileDto>`
```json
{
  "id": "guid",
  "firstName": "Khaled",
  "lastName": "Ahmed",
  "email": "khaled@example.com",
  "phone": "01099999999",
  "rating": 4.8,
  "totalJobs": 45,
  "isVerified": true,
  "isOnline": true
}
```

---

## 🗺️ Traffic / Map

## 🚦 Traffic & Map

### `GET /api/map/search`
**Auth:** ✅ Client (اختياري)
**الوصف:** البحث عن أماكن باستخدام Google Places API.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `query` | string | ✅ | كلمة البحث |

**Response `200 OK`:** `Result<MapSearchResultDto>`
*(ملاحظة: قد يرجع 503 إذا كان Google API Key مفقوداً في بيئة التطوير)*

---

### `GET /api/map/route`
**Auth:** ✅ Client (اختياري)
**الوصف:** حساب مسار الرحلة باستخدام Google Directions API.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `originLat` | decimal | ✅ | |
| `originLng` | decimal | ✅ | |
| `destLat` | decimal | ✅ | |
| `destLng` | decimal | ✅ | |

**Response `200 OK`:** `Result<MapRouteDto>`
*(ملاحظة: قد يرجع 503 إذا كان Google API Key مفقوداً)*

---

### `POST /api/traffic/report`
**Auth:** ✅ Client  
**الوصف:** الإبلاغ عن حادث أو خطر على الطريق.

**Request Body:**
```json
{
  "latitude": 30.0444,
  "longitude": 31.2357,
  "vehicleId": "guid", // (Optional) يمكن أن يكون null
  "type": "Accident",
  "description": "حادث اصطدام على كوبري أكتوبر",
  "severity": "High"
}
```

> أنواع `type` الشائعة: `Accident` | `Congestion` | `RoadBlock` | `Hazard`

**Response `201 Created`:** `Result<TrafficReportDto>`
```json
{
  "id": "guid",
  "type": "Accident",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "status": "Active",
  "reportedAt": "2025-04-01T12:00:00Z"
}
```

---

### `GET /api/trafficincidents`
**Auth:** ✅  
**الوصف:** جلب كل الحوادث النشطة على الخريطة.

**Response `200 OK`:** `Result<IReadOnlyList<TrafficIncidentDto>>`
```json
[
  {
    "id": "guid",
    "type": "Congestion",
    "latitude": 30.05,
    "longitude": 31.24,
    "description": "...",
    "severity": "Medium",
    "reportedAt": "2025-04-01T11:00:00Z"
  }
]
```

---

### `GET /api/trafficincidents/by-location`
**Auth:** ✅  
**الوصف:** تصفية الحوادث حسب الموقع.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `location` | string | ✅ | اسم الموقع أو المنطقة |

**Response `200 OK`:** `Result<IReadOnlyList<TrafficIncidentDto>>`

---

### `GET /api/sensors/vehicle-env`
**Auth:** ✅  
**الوصف:** جلب آخر بيانات حساسات المركبة (درجة حرارة، ضغط زيت، إلخ).

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `vehicleId` | GUID | ✅ | معرف المركبة |

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

### `GET /api/map/search`
**Auth:** ✅  
**الوصف:** بحث عن مكان بالاسم عبر Google Geocoding API.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `query` | string | ✅ | نص البحث (مثل: "Cairo Airport") |

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

## ⛅ Weather

### `GET /api/weather`
**Auth:** ✅  
**الوصف:** جلب حالة الطقس بالإحداثيات.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `lat` | double | ✅ | خط العرض (−90 إلى 90) |
| `lng` | double | ✅ | خط الطول (−180 إلى 180) |

**Response `200 OK`:** `Result<WeatherResponseDto>`
```json
{
  "city": "Cairo",
  "country": "EG",
  "temperature": 32.5,
  "feelsLike": 35.0,
  "tempMin": 28.0,
  "tempMax": 36.0,
  "humidity": 40,
  "description": "Clear sky",
  "icon": "01d",
  "iconUrl": "https://openweathermap.org/img/wn/01d@2x.png",
  "windSpeed": 5.2
}
```

**Response `400`:** قيم `lat` أو `lng` خارج النطاق المسموح.  
**Response `503 Service Unavailable`:** فشل الاتصال بـ OpenWeatherMap API.

---

### `GET /api/weather/city`
**Auth:** ✅  
**الوصف:** جلب حالة الطقس باسم المدينة.

**Query Params:**
| Param | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| `name` | string | ✅ | اسم المدينة (مثل: "Cairo") |

**Response `200 OK`:** `Result<WeatherResponseDto>` — نفس الشكل أعلاه.  
**Response `400`:** اسم المدينة فارغ.  
**Response `503`:** فشل الاتصال بـ OpenWeatherMap API.

---

## ⭐ Ratings

### `POST /api/ratings`
**Auth:** ✅  
**الوصف:** تقديم تقييم لخدمة SOS أو طلب شراء. يُسمح بتقييم واحد فقط لكل خدمة/طلب.

**Request Body:**
```json
{
  "stars": 5,
  "comment": "خدمة ممتازة وسريعة",
  "serviceRequestId": "guid",
  "orderId": null
}
```

> ⚠️ يجب توفير `serviceRequestId` أو `orderId` (واحد على الأقل).  
> القيم المتاحة لـ `stars`: 1 إلى 5.

**Response `201 Created`:** `Result<RatingResponseDto>`
```json
{
  "id": "guid",
  "stars": 5,
  "comment": "خدمة ممتازة وسريعة",
  "serviceRequestId": "guid",
  "orderId": null,
  "createdAtUtc": "2025-04-01T14:00:00Z"
}
```

**Response `400`:** `stars` خارج النطاق 1-5، أو لا يوجد target.  
**Response `409 Conflict`:** تم تقييم هذه الخدمة/الطلب مسبقًا.

---

### `GET /api/ratings/my`
**Auth:** ✅  
**الوصف:** جلب جميع التقييمات التي قدّمها المستخدم.

**Response `200 OK`:** `Result<IReadOnlyList<RatingResponseDto>>` — مرتبة من الأحدث للأقدم.

---

## 💬 Support / Chat

### `POST /api/support/tickets/open`
**Auth:** ✅ Client فقط (`[Authorize(Roles = "Client")]`)  
**الوصف:** فتح تذكرة دعم فني جديدة.

**Request Body:**
```json
{
  "subject": "مشكلة في الدفع",
  "message": "لم يصلني الكود..."
}
```

**Response `201 Created`:** `Result<SupportTicketDto>`
```json
{
  "id": "guid",
  "subject": "مشكلة في الدفع",
  "status": "Open",
  "createdAt": "2025-04-01T12:00:00Z"
}
```

**Response `400`:** بيانات ناقصة.

---

### `GET /api/support/tickets/my`
**Auth:** ✅ Client / Admin (`[Authorize(Roles = "Client,Admin")]`)  
**الوصف:** جلب تذاكر الدعم الخاصة بالمستخدم الحالي.

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

### `GET /api/support/tickets/{id}`
**Auth:** ✅ CSAgent / Admin فقط (`[Authorize(Roles = "CSAgent,Admin")]`)  
**الوصف:** جلب تفاصيل تذكرة كاملة مع رسائل الدردشة.

**URL Params:** `id` — معرف التذكرة (GUID).

**Response `200 OK`:** `Result<CsTicketFullDto>`
```json
{
  "id": "guid",
  "subject": "...",
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

### `PATCH /api/support/close/{id}`
**Auth:** ✅ Client / Admin / CSAgent (`[Authorize(Roles = "Client,Admin,CSAgent")]`)  
**الوصف:** إغلاق تذكرة الدعم. العميل يمكنه فقط إغلاق تذاكره الخاصة، بينما CSAgent/Admin يمكنهم إغلاق أي تذكرة.

**URL Params:** `id` — معرف التذكرة (GUID).

**Response `200 OK`:** `Result<SupportTicketDto>` — التذكرة بعد الإغلاق.  
**Response `403`:** المستخدم لا يملك صلاحية إغلاق هذه التذكرة.  
**Response `404`:** التذكرة غير موجودة.

---

### `POST /api/support/tickets/{id}/escalate`
**Auth:** ✅ CSAgent  
**الوصف:** رفع أولوية التذكرة للمستوى الأعلى.

**URL Params:** `id` — معرف التذكرة (GUID).

**Response `200 OK`:** `Result<bool>`  
**Response `404`:** التذكرة غير موجودة.

---

### `GET /api/chat/history/{ticketId}`
**Auth:** ✅ Driver / CSAgent  
**الوصف:** جلب سجل رسائل الدردشة لتذكرة معينة.

**URL Params:** `ticketId` (GUID).

**Response `200 OK`:** `Result<List<MessageDto>>`
```json
[
  {
    "id": "guid",
    "ticketId": "guid",
    "senderId": "guid",
    "senderName": "Ahmed",
    "message": "متى سيتم الحل؟",
    "type": "Text",
    "sentOnUtc": "2025-04-01T12:05:00Z"
  }
]
```

**Response `403`:** المستخدم لا يملك صلاحية عرض هذه التذكرة.  
**Response `404`:** التذكرة غير موجودة.

---

### `POST /api/chat/send`
**Auth:** ✅ Driver / CSAgent  
**الوصف:** إرسال رسالة في محادثة. تُبث تلقائيًا عبر SignalR إلى جميع المشتركين في المجموعة.

**Request Body:**
```json
{
  "ticketId": "guid",
  "message": "شكرًا على تواصلك",
  "type": "Text"
}
```

> قيم `type`: `Text` | `Image` | `File`

**Response `200 OK`:** `Result<MessageDto>` — الرسالة المُرسلة.  
**Response `403`:** المستخدم لا يملك صلاحية المراسلة في هذه التذكرة.  
**Response `404`:** التذكرة غير موجودة.

> 📡 **SignalR Event:** بعد الإرسال، يُبث حدث `ReceiveMessage` على المجموعة:
> ```json
> {
>   "ticketId": "guid",
>   "senderId": "guid",
>   "senderName": "Ahmed",
>   "message": "شكرًا",
>   "type": "Text",
>   "sentOnUtc": "2025-04-01T14:00:00Z"
> }
> ```

---

## 🔔 Notifications

### `GET /api/notifications`
**Auth:** ✅  
**الوصف:** جلب كل إشعارات المستخدم الحالي.

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
**الوصف:** تحديد إشعار واحد كمقروء.

**URL Params:** `id` — معرف الإشعار (GUID).

**Response `200 OK`:** `Result<NotificationDto>` — الإشعار بعد التحديث (`isRead: true`).  
**Response `404`:** الإشعار غير موجود أو لا يخص المستخدم.

---

### `DELETE /api/notifications/{id}`
**Auth:** ✅  
**الوصف:** حذف إشعار.

**URL Params:** `id` — معرف الإشعار (GUID).

**Response `200 OK`:** `Result<bool>`  
**Response `404`:** الإشعار غير موجود أو لا يخص المستخدم.

---

## 📋 Mobile Notes

- جميع الـ protected endpoints تتطلب `Authorization: Bearer <access_token>`.
- نظّم الـ session manager في التطبيق لاستدعاء `POST /api/auth/refresh-token` تلقائيًا قبل انتهاء الـ token.
- استخدم الـ routes الأساسية (بدون `/add`, `/update`, `/delete`) في الـ builds الجديدة.
- لـ Google Login على الموبايل: أضف دائمًا header `X-Platform: Mobile` لضمان تحديد الدور كـ `Client`.
- التحديثات الفورية (موقع المزود، الدردشة) تصل عبر SignalR على `/hubs/traffic`.
- تقييم واحد فقط لكل `serviceRequestId` أو `orderId`.
- flow استعادة الباسورد: `forgot-password` → يستلم المستخدم التوكن بالإيميل → `reset-password` بالتوكن.
- `Admin` و`CSAgent` لا يمكن تسجيلهم من تطبيق الموبايل.
- الكود الافتراضي للـ OTP في MVP: `123456`.

---

## ⚠️ Security Warning

> الـ controllers التالية لديها `[Authorize]` **معلَّق (commented out)** في الكود وهي **غير محمية حاليًا**:
> `PaymentsController`, `StoreController`, `MapController`, `OrdersController`,
> `CartController`, `RatingsController`, `SensorsController`, `TrafficController`, `ChatController`
>
> **يجب تفعيلها قبل الـ Production.**

---

## ✅ Controllers المحمية فعلاً

| Controller | الحماية |
|---|---|
| `AuthController` | Endpoints محمية بـ `[Authorize]` بشكل انتقائي |
| `GarageController` | `[Authorize(Roles = "Client")]` على مستوى الـ class |
| `SosController` | `[Authorize]` على الـ class + role-based على كل action |
| `ProviderController` | `[Authorize(Roles = "Provider")]` على الـ class |
| `SupportController` | `[Authorize]` على الـ class + role-based على كل action |
| `TrafficIncidentsController` | `[Authorize]` على الـ class |
| `WeatherController` | `[Authorize]` على الـ class |
| `NotificationsController` | `[Authorize]` على الـ class |
