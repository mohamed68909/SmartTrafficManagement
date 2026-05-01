# SmartTraffic — Production API Endpoints (Full Reference)

> **Base URL:** `https://smarttrafficmanagement.runasp.net`  
> **Swagger UI:** `https://smarttrafficmanagement.runasp.net/swagger/index.html`  
> **Realtime Hub:** `https://smarttrafficmanagement.runasp.net/hubs/traffic` (SignalR)  
> **Response Envelope:** كل الـ responses مغلفة في `Result<T>`  
> **آخر تحديث:** مستخرج مباشرة من Swagger UI للبيئة الـ Production

---

## 🔐 Auth

| Method | Full URL |
|--------|----------|
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/register` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/login` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/refresh-token` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/logout` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/verify-otp` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/Auth/me` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/Auth/profile` |
| `PUT`  | `https://smarttrafficmanagement.runasp.net/api/Auth/profile` |
| `PUT`  | `https://smarttrafficmanagement.runasp.net/api/Auth/profile/update` |
| `PATCH`| `https://smarttrafficmanagement.runasp.net/api/Auth/change-password` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/google-login` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/forgot-password` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/Auth/reset-password` |

---

## 🚗 Garage

> **Auth:** `[Authorize(Roles = "Client")]`

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/garage` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/garage` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/garage/{id}` |
| `PUT`    | `https://smarttrafficmanagement.runasp.net/api/garage/{id}` |
| `DELETE` | `https://smarttrafficmanagement.runasp.net/api/garage/{id}` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/garage/add` |
| `PUT`    | `https://smarttrafficmanagement.runasp.net/api/garage/update/{id}` |
| `DELETE` | `https://smarttrafficmanagement.runasp.net/api/garage/delete/{id}` |

---

## 🛒 Cart

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/cart` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/cart/items` |
| `PATCH`  | `https://smarttrafficmanagement.runasp.net/api/cart/items/{cartItemId}` |
| `DELETE` | `https://smarttrafficmanagement.runasp.net/api/cart/items/{cartItemId}` |

---

## 🏪 Store

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/store/products` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/store/checkout` |

---

## 📦 Orders

| Method | Full URL |
|--------|----------|
| `GET` | `https://smarttrafficmanagement.runasp.net/api/orders/my` |
| `GET` | `https://smarttrafficmanagement.runasp.net/api/orders/{orderId}` |

---

## 💳 Payments

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/payments/stripe/config` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/payments/stripe/webhook` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/payments/cards` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/payments/cards` |
| `DELETE` | `https://smarttrafficmanagement.runasp.net/api/payments/cards/{id}` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/payments/history` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/payments/{id}` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/payments/refund` |

> ⚠️ `POST /api/payments/refund` موجود في الكود لكن قد لا يظهر في Swagger — راجع PaymentsController.

---

## 🆘 SOS / Emergency

| Method | Full URL |
|--------|----------|
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/sos/history` |
| `POST`  | `https://smarttrafficmanagement.runasp.net/api/sos/request` |
| `PATCH` | `https://smarttrafficmanagement.runasp.net/api/sos/cancel/{id}` |
| `PATCH` | `https://smarttrafficmanagement.runasp.net/api/sos/accept/{id}` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/sos/status/{id}` |

> ⚠️ `PATCH /api/sos/cancel/{id}` موجود في الكود لكن تحقق من ظهوره في Swagger.

---

## 👷 Provider

> **Auth:** `[Authorize(Roles = "Provider")]`

| Method | Full URL |
|--------|----------|
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/dashboard` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/jobs/history` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/jobs/available` |
| `PATCH` | `https://smarttrafficmanagement.runasp.net/api/provider/jobs/accept/{requestId}` |
| `POST`  | `https://smarttrafficmanagement.runasp.net/api/provider/jobs/{requestId}/reject` |
| `PATCH` | `https://smarttrafficmanagement.runasp.net/api/provider/jobs/status` |
| `PATCH` | `https://smarttrafficmanagement.runasp.net/api/provider/jobs/location` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/earnings` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/earnings/weekly` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/active-mission` |
| `POST`  | `https://smarttrafficmanagement.runasp.net/api/provider/active-mission/status` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/schedule` |
| `PUT`   | `https://smarttrafficmanagement.runasp.net/api/provider/schedule` |
| `POST`  | `https://smarttrafficmanagement.runasp.net/api/provider/status` |
| `PATCH` | `https://smarttrafficmanagement.runasp.net/api/provider/status` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/provider/profile` |

---

## 🗺️ Traffic / Map / Sensors

| Method | Full URL |
|--------|----------|
| `POST` | `https://smarttrafficmanagement.runasp.net/api/traffic/report` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/TrafficIncidents` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/TrafficIncidents/by-location` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/map/search` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/sensors/vehicle-env` |

---

## ⛅ Weather

| Method | Full URL |
|--------|----------|
| `GET` | `https://smarttrafficmanagement.runasp.net/api/weather` |
| `GET` | `https://smarttrafficmanagement.runasp.net/api/weather/city` |

---

## ⭐ Ratings

| Method | Full URL |
|--------|----------|
| `POST` | `https://smarttrafficmanagement.runasp.net/api/ratings` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/ratings/my` |

---

## 💬 Support

| Method | Full URL |
|--------|----------|
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/support/tickets/my` |
| `POST`  | `https://smarttrafficmanagement.runasp.net/api/support/tickets/open` |
| `PATCH` | `https://smarttrafficmanagement.runasp.net/api/support/close/{id}` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/support/tickets/stats` |
| `GET`   | `https://smarttrafficmanagement.runasp.net/api/support/tickets/{id}` |
| `POST`  | `https://smarttrafficmanagement.runasp.net/api/support/tickets/{id}/escalate` |

---

## 💬 Chat

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/chat/history/{ticketId}` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/chat/send` |

---

## 🔔 Notifications

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/notifications` |
| `PUT`    | `https://smarttrafficmanagement.runasp.net/api/notifications/{id}/read` |
| `DELETE` | `https://smarttrafficmanagement.runasp.net/api/notifications/{id}` |

---

## 🛡️ Admin

> **Auth:** `[Authorize(Roles = "Admin")]`

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/dashboard/summary` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/analytics/orders/monthly` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/users` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/admin/users` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/users/{id}` |
| `PUT`  | `https://smarttrafficmanagement.runasp.net/api/admin/users/{id}` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/tickets/recent` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/tickets/stats` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/tickets/{id}` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/sos/recent` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/providers` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/cs-agents` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/admin/cs-agents` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/admin/cs-agents/{id}/activate` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/ratings` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/system-status` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/activity` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/urgent` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/admin/urgent/{id}/assign` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/urgent/{id}/track` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/approvals` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/approvals/{id}/docs` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/admin/approvals/{id}/approve` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/admin/approvals/{id}/reject` |
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/admin/sensors` |

---

## 🏪 Seller

> **Auth:** `[Authorize(Roles = "Seller")]`

| Method | Full URL |
|--------|----------|
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/dashboard` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/products` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/seller/products` |
| `PUT`    | `https://smarttrafficmanagement.runasp.net/api/seller/products/{id}` |
| `DELETE` | `https://smarttrafficmanagement.runasp.net/api/seller/products/{id}` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/seller/products/{id}/restock` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/orders` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/orders/stats` |
| `POST`   | `https://smarttrafficmanagement.runasp.net/api/seller/orders/{id}/prepare` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/analytics` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/store` |
| `PUT`    | `https://smarttrafficmanagement.runasp.net/api/seller/store` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/reviews` |
| `GET`    | `https://smarttrafficmanagement.runasp.net/api/seller/settings` |
| `PUT`    | `https://smarttrafficmanagement.runasp.net/api/seller/settings` |

---

## 🤝 CS Agent

> **Auth:** `[Authorize(Roles = "CSAgent")]`

| Method | Full URL |
|--------|----------|
| `GET`  | `https://smarttrafficmanagement.runasp.net/api/cs/drivers/search` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/cs/drivers/{id}/block` |
| `POST` | `https://smarttrafficmanagement.runasp.net/api/cs/agent/status` |

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
| Traffic & Chat Hub | `https://smarttrafficmanagement.runasp.net/hubs/traffic` |

**Events المدعومة:**
- `ReceiveMessage` — رسالة جديدة في chat
- `SosStatusUpdated` — تحديث حالة طلب SOS
- `ProviderLocationUpdated` — تحديث موقع المزود (GPS)
