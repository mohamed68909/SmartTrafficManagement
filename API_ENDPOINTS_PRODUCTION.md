# SmartTraffic — Production API Endpoints (Full Reference)

> **Base URL:** `https://smarttrafficmanagemet.runasp.net`  
> **Swagger UI:** `https://smarttrafficmanagemet.runasp.net/swagger/index.html`  
> **Realtime Hub:** `https://smarttrafficmanagemet.runasp.net/hubs/traffic` (SignalR)  
> **Response Envelope:** كل الـ responses مغلفة في `Result<T>`  
> **آخر تحديث:** مستخرج مباشرة من Swagger UI للبيئة الـ Production

---

## 🔐 Auth

| Method | Full URL |
|--------|----------|
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/register` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/login` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/refresh-token` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/logout` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/verify-otp` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/Auth/me` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/Auth/profile` |
| `PUT`  | `https://smarttrafficmanagemet.runasp.net/api/Auth/profile` |
| `PUT`  | `https://smarttrafficmanagemet.runasp.net/api/Auth/profile/update` |
| `PATCH`| `https://smarttrafficmanagemet.runasp.net/api/Auth/change-password` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/google-login` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/forgot-password` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/Auth/reset-password` |

---

## 🚗 Garage

> **Auth:** `[Authorize(Roles = "Client")]`

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/garage` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/garage` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/garage/{id}` |
| `PUT`    | `https://smarttrafficmanagemet.runasp.net/api/garage/{id}` |
| `DELETE` | `https://smarttrafficmanagemet.runasp.net/api/garage/{id}` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/garage/add` |
| `PUT`    | `https://smarttrafficmanagemet.runasp.net/api/garage/update/{id}` |
| `DELETE` | `https://smarttrafficmanagemet.runasp.net/api/garage/delete/{id}` |

---

## 🛒 Cart

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/cart` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/cart/items` |
| `PATCH`  | `https://smarttrafficmanagemet.runasp.net/api/cart/items/{cartItemId}` |
| `DELETE` | `https://smarttrafficmanagemet.runasp.net/api/cart/items/{cartItemId}` |

---

## 🏪 Store

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/store/products` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/store/checkout` |

---

## 📦 Orders

| Method | Full URL |
|--------|----------|
| `GET` | `https://smarttrafficmanagemet.runasp.net/api/orders/my` |
| `GET` | `https://smarttrafficmanagemet.runasp.net/api/orders/{orderId}` |

---

## 💳 Payments

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/payments/stripe/config` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/payments/stripe/webhook` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/payments/cards` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/payments/cards` |
| `DELETE` | `https://smarttrafficmanagemet.runasp.net/api/payments/cards/{id}` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/payments/history` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/payments/{id}` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/payments/refund` |

> ⚠️ `POST /api/payments/refund` موجود في الكود لكن قد لا يظهر في Swagger — راجع PaymentsController.

---

## 🆘 SOS / Emergency

| Method | Full URL |
|--------|----------|
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/sos/history` |
| `POST`  | `https://smarttrafficmanagemet.runasp.net/api/sos/request` |
| `PATCH` | `https://smarttrafficmanagemet.runasp.net/api/sos/cancel/{id}` |
| `PATCH` | `https://smarttrafficmanagemet.runasp.net/api/sos/accept/{id}` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/sos/status/{id}` |

> ⚠️ `PATCH /api/sos/cancel/{id}` موجود في الكود لكن تحقق من ظهوره في Swagger.

---

## 👷 Provider

> **Auth:** `[Authorize(Roles = "Provider")]`

| Method | Full URL |
|--------|----------|
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/dashboard` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/jobs/history` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/jobs/available` |
| `PATCH` | `https://smarttrafficmanagemet.runasp.net/api/provider/jobs/accept/{requestId}` |
| `POST`  | `https://smarttrafficmanagemet.runasp.net/api/provider/jobs/{requestId}/reject` |
| `PATCH` | `https://smarttrafficmanagemet.runasp.net/api/provider/jobs/status` |
| `PATCH` | `https://smarttrafficmanagemet.runasp.net/api/provider/jobs/location` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/earnings` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/earnings/weekly` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/active-mission` |
| `POST`  | `https://smarttrafficmanagemet.runasp.net/api/provider/active-mission/status` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/schedule` |
| `PUT`   | `https://smarttrafficmanagemet.runasp.net/api/provider/schedule` |
| `POST`  | `https://smarttrafficmanagemet.runasp.net/api/provider/status` |
| `PATCH` | `https://smarttrafficmanagemet.runasp.net/api/provider/status` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/provider/profile` |

---

## 🗺️ Traffic / Map / Sensors

| Method | Full URL |
|--------|----------|
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/traffic/report` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/TrafficIncidents` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/TrafficIncidents/by-location` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/map/search` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/sensors/vehicle-env` |

---

## ⛅ Weather

| Method | Full URL |
|--------|----------|
| `GET` | `https://smarttrafficmanagemet.runasp.net/api/weather` |
| `GET` | `https://smarttrafficmanagemet.runasp.net/api/weather/city` |

---

## ⭐ Ratings

| Method | Full URL |
|--------|----------|
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/ratings` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/ratings/my` |

---

## 💬 Support

| Method | Full URL |
|--------|----------|
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/support/tickets/my` |
| `POST`  | `https://smarttrafficmanagemet.runasp.net/api/support/tickets/open` |
| `PATCH` | `https://smarttrafficmanagemet.runasp.net/api/support/close/{id}` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/support/tickets/stats` |
| `GET`   | `https://smarttrafficmanagemet.runasp.net/api/support/tickets/{id}` |
| `POST`  | `https://smarttrafficmanagemet.runasp.net/api/support/tickets/{id}/escalate` |

---

## 💬 Chat

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/chat/history/{ticketId}` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/chat/send` |

---

## 🔔 Notifications

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/notifications` |
| `PUT`    | `https://smarttrafficmanagemet.runasp.net/api/notifications/{id}/read` |
| `DELETE` | `https://smarttrafficmanagemet.runasp.net/api/notifications/{id}` |

---

## 🛡️ Admin

> **Auth:** `[Authorize(Roles = "Admin")]`

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/dashboard/summary` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/analytics/orders/monthly` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/users` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/admin/users` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/users/{id}` |
| `PUT`  | `https://smarttrafficmanagemet.runasp.net/api/admin/users/{id}` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/tickets/recent` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/tickets/stats` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/tickets/{id}` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/sos/recent` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/providers` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/cs-agents` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/admin/cs-agents` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/admin/cs-agents/{id}/activate` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/ratings` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/system-status` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/activity` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/urgent` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/admin/urgent/{id}/assign` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/urgent/{id}/track` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/approvals` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/approvals/{id}/docs` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/admin/approvals/{id}/approve` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/admin/approvals/{id}/reject` |
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/admin/sensors` |

---

## 🏪 Seller

> **Auth:** `[Authorize(Roles = "Seller")]`

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/dashboard` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/products` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/seller/products` |
| `PUT`    | `https://smarttrafficmanagemet.runasp.net/api/seller/products/{id}` |
| `DELETE` | `https://smarttrafficmanagemet.runasp.net/api/seller/products/{id}` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/seller/products/{id}/restock` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/orders` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/orders/stats` |
| `POST`   | `https://smarttrafficmanagemet.runasp.net/api/seller/orders/{id}/prepare` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/analytics` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/store` |
| `PUT`    | `https://smarttrafficmanagemet.runasp.net/api/seller/store` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/reviews` |
| `GET`    | `https://smarttrafficmanagemet.runasp.net/api/seller/settings` |
| `PUT`    | `https://smarttrafficmanagemet.runasp.net/api/seller/settings` |

---

## 🤝 CS Agent

> **Auth:** `[Authorize(Roles = "CSAgent")]`

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagemet.runasp.net/api/cs/drivers/search` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/cs/drivers/{id}/block` |
| `POST` | `https://smarttrafficmanagemet.runasp.net/api/cs/agent/status` |

---

## 📊 ملخص إجمالي

| Controller | عدد الـ Endpoints |
|---|:---:|
| Auth | 13 |
| Garage | 8 |
| Cart | 4 |
| Store | 2 |
| Orders | 2 |
| Payments | 8 |
| SOS | 5 |
| Provider | 16 |
| Traffic / Map / Sensors | 5 |
| Weather | 2 |
| Ratings | 2 |
| Support | 6 |
| Chat | 2 |
| Notifications | 3 |
| Admin | 25 |
| Seller | 15 |
| CS Agent | 3 |
| **الإجمالي** | **121** |

---

## 📡 SignalR

| Hub | URL |
|-----|-----|
| Traffic & Chat Hub | `https://smarttrafficmanagemet.runasp.net/hubs/traffic` |

**Events المدعومة:**
- `ReceiveMessage` — رسالة جديدة في chat
- `SosStatusUpdated` — تحديث حالة طلب SOS
- `ProviderLocationUpdated` — تحديث موقع المزود (GPS)
