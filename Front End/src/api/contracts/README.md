# Smart Traffic Management System — API Contracts

> **Reference for ASP.NET Core backend developers.**
> Every endpoint listed below is consumed by the React frontend.
> The mock JSON shapes in `src/api/mock/` are the **source of truth** for response formats.
> All field names use **camelCase**. Dates use **ISO 8601** (`"2024-01-15T10:00:00Z"`). IDs are **strings**.

---

## Auth — `src/api/services/authService.js`

### `POST /auth/login`
**Request:**
```json
{ "email": "string", "password": "string" }
```
**Response:**
```json
{ "token": "string", "role": "provider|seller|admin|cs", "name": "string", "email": "string" }
```

### `POST /auth/register`
**Request:**
```json
{
  "role": "seller|provider",
  "firstName": "string", "lastName": "string",
  "email": "string", "phone": "string", "password": "string",
  "storeName": "string?", "storeArea": "string?",
  "providerName": "string?", "providerCategory": "string?"
}
```
**Response:** `{ "success": true }`

### `POST /auth/logout`
**Request:** _(empty, Bearer token in header)_
**Response:** `{ "success": true }`

### `POST /auth/forgot-password`
**Request:** `{ "email": "string" }`
**Response:** `{ "success": true }`

### `GET /auth/me`
**Response:**
```json
{ "id": "string", "name": "string", "email": "string", "role": "string", "avatar": "string" }
```

---

## Provider — `src/api/services/providerService.js`

### `GET /provider/dashboard`
```json
{
  "stats": [
    { "icon": "string", "label": "string", "val": "string", "color": "string", "delta": "string" }
  ]
}
```

### `GET /provider/earnings/weekly`
```json
[
  { "day": "string", "val": "number|string", "pct": "number" }
]
```

### `GET /provider/location`
```json
{ "label": "string", "lat": "number", "lng": "number", "trackingActive": "boolean" }
```

### `GET /provider/schedule`
```json
[
  { "name": "string", "date": "number", "status": "string", "off": "boolean?", "today": "boolean?" }
]
```

### `GET /provider/notifications`
```json
[
  { "icon": "string", "text": "string", "sub": "string", "time": "string", "color": "string" }
]
```

### `GET /provider/ratings`
```json
{
  "average": "number",
  "total": "number",
  "breakdown": [
    { "star": "string", "pct": "number", "count": "number" }
  ]
}
```

### `GET /provider/requests/incoming`
```json
{ "type": "string", "location": "string", "driver": "string", "price": "string", "distance": "string" }
```

### `GET /provider/requests/pending`
```json
[
  { "icon": "string", "type": "string", "price": "string", "loc": "string", "driver": "string", "dist": "string", "color": "string" }
]
```

### `GET /provider/requests/stats`
```json
[
  { "icon": "string", "label": "string", "val": "number|string", "color": "string" }
]
```

### `GET /provider/active-mission`
```json
{
  "reqId": "string", "type": "string", "driver": "string", "phone": "string",
  "distance": "string", "eta": "string", "fare": "string", "driverRating": "string",
  "currentStep": "number",
  "steps": ["string"]
}
```

### `GET /provider/earnings`
```json
{
  "total": "string", "currency": "string", "period": "string",
  "totalJobs": "string", "avgPerJob": "string",
  "nextTransfer": { "amount": "string", "date": "string" }
}
```

### `GET /provider/history`
```json
[
  { "id": "number", "type": "string", "driver": "string", "fare": "string", "rating": "string", "status": "string" }
]
```

### `GET /provider/profile`
```json
{}
```

### `GET /provider/vehicle`
```json
{ "model": "string", "plate": "string", "type": "string", "fuel": "string", "capacity": "string" }
```

### `POST /provider/requests/{id}/accept`
**Response:** `{ "success": true }`

### `POST /provider/requests/{id}/reject`
**Response:** `{ "success": true }`

### `POST /provider/active-mission/status`
**Request:** `{ "status": "string" }`
**Response:** `{ "success": true }`

### `POST /provider/active-mission/call`
**Response:** `{ "success": true }`

### `POST /provider/active-mission/sos`
**Response:** `{ "success": true }`

### `POST /provider/status`
**Request:** `{ "online": "boolean" }`
**Response:** `{ "success": true }`

### `PUT /provider/schedule`
**Request:** _(schedule array)_
**Response:** `{ "success": true }`

---

## Seller — `src/api/services/sellerService.js`

### `GET /seller/dashboard`
```json
{
  "stats": [
    { "icon": "string", "label": "string", "val": "string", "unit": "string?", "color": "string", "delta": "string" }
  ]
}
```

### `GET /seller/products`
```json
[
  { "name": "string", "cat": "string", "price": "string", "stock": "number", "sold": "number", "rating": "number", "img": "string" }
]
```

### `GET /seller/orders`
```json
[
  { "id": "string", "customer": "string", "items": "number", "total": "string", "status": "string", "time": "string", "color": "string" }
]
```

### `GET /seller/orders/stats`
```json
[
  { "icon": "string", "label": "string", "val": "number", "color": "string" }
]
```

### `GET /seller/analytics`
```json
{
  "stats": [
    { "icon": "string", "label": "string", "val": "string", "unit": "string?", "color": "string", "pct": "string" }
  ],
  "monthlyChart": [
    { "m": "string", "v": "number", "p": "number" }
  ]
}
```

### `GET /seller/store`
```json
{
  "name": "string", "initials": "string", "desc": "string", "fullDesc": "string",
  "location": "string", "products": "number", "rating": "number", "reviews": "number",
  "since": "string", "phone": "string", "email": "string", "verified": "boolean"
}
```

### `GET /seller/reviews`
```json
[
  { "name": "string", "stars": "number", "text": "string", "time": "string", "product": "string" }
]
```

### `GET /seller/settings`
```json
[
  { "label": "string", "desc": "string", "on": "boolean" }
]
```

### `GET /seller/orders/{id}`
```json
{ "id": "string", "customer": "string", "items": "number", "total": "string", "status": "string", "time": "string", "color": "string" }
```

### `POST /seller/products`
**Request:** _(product object)_
**Response:** `{ "success": true }`

### `POST /seller/orders/{id}/prepare`
**Response:** `{ "success": true }`

### `POST /seller/products/{id}/restock`
**Response:** `{ "success": true }`

### `PUT /seller/store`
**Request:** _(store object)_
**Response:** `{ "success": true }`

### `PUT /seller/settings`
**Request:** _(settings object)_
**Response:** `{ "success": true }`

---

## CS Agent — `src/api/services/csService.js`

### `GET /cs/tickets`
```json
[
  { "id": "number", "name": "string", "initials": "string", "subject": "string", "priority": "string", "status": "string", "time": "string", "pClass": "string", "unread": "boolean?" }
]
```

### `GET /cs/tickets/stats`
```json
{ "urgent": "number", "inProgress": "number", "resolved": "number" }
```

### `GET /cs/tickets/{id}/messages`
```json
[
  { "from": "driver|agent?", "initials": "string?", "text": "string", "time": "string?", "type": "note|system?" }
]
```

### `GET /cs/tickets/assigned`
```json
[
  _(same shape as GET /cs/tickets)_
]
```

### `GET /cs/drivers/search?q={query}`
```json
{
  "initials": "string", "name": "string", "email": "string", "phone": "string",
  "vehicle": "string", "plate": "string", "rating": "string", "status": "string", "subscription": "string"
}
```

### `GET /cs/drivers/{id}`
```json
{
  "initials": "string", "name": "string", "plate": "string", "rating": "string",
  "ticketCount": "string", "phone": "string", "email": "string", "subscription": "string", "since": "string"
}
```

### `GET /cs/reports`
```json
{
  "stats": [
    { "icon": "string", "label": "string", "val": "string", "color": "string", "delta": "string" }
  ],
  "weeklyChart": [
    { "label": "string", "val": "number", "pct": "number" }
  ]
}
```

### `POST /cs/tickets/{id}/reply`
**Request:** `{ "text": "string" }`
**Response:** `{ "success": true }`

### `POST /cs/tickets/{id}/note`
**Request:** `{ "text": "string" }`
**Response:** `{ "success": true }`

### `POST /cs/tickets`
**Request:** _(ticket data)_
**Response:** `{ "success": true }`

### `POST /cs/tickets/{id}/resolve`
**Response:** `{ "success": true }`

### `PUT /cs/tickets/{id}/status`
**Request:** `{ "status": "string" }`
**Response:** `{ "success": true }`

### `POST /cs/tickets/{id}/escalate`
**Response:** `{ "success": true }`

### `POST /cs/tickets/{id}/reassign`
**Response:** `{ "success": true }`

### `POST /cs/drivers/{id}/block`
**Response:** `{ "success": true }`

### `POST /cs/agent/status`
**Request:** `{ "online": "boolean" }`
**Response:** `{ "success": true }`

---

## Admin — `src/api/services/adminService.js`

### `GET /admin/dashboard`
```json
{
  "stats": [ { "icon": "string", "label": "string", "val": "string", "color": "string", "delta": "string" } ],
  "trafficMap": [ { "top": "string", "left": "string", "color": "string", "label": "string", "density": "number" } ],
  "systemStatus": [ { "name": "string", "status": "string", "uptime": "string", "color": "string" } ],
  "recentActivity": [ { "icon": "string", "text": "string", "time": "string", "color": "string" } ]
}
```

### `GET /admin/analytics`
```json
{
  "stats": [ { "label": "string", "val": "string", "color": "string", "delta": "string" } ],
  "monthlyChart": [ { "m": "string", "v": "number" } ],
  "userActivity": [ "number" ]
}
```

### `GET /admin/approvals`
```json
[ { "id": "string", "name": "string", "type": "string", "service": "string", "docs": "number", "date": "string", "img": "string" } ]
```

### `GET /admin/approvals/stats`
```json
[ { "icon": "string", "label": "string", "val": "number", "color": "string" } ]
```

### `GET /admin/sensors`
```json
[ { "id": "string", "name": "string", "status": "string", "density": "number", "speed": "number", "temp": "number", "alerts": "number" } ]
```

### `GET /admin/traffic`
```json
{
  "legend": { "smooth": "number", "medium": "number", "heavy": "number" },
  "markers": [ { "top": "string", "left": "string", "color": "string", "label": "string", "size": "number" } ]
}
```

### `GET /admin/system-info`
```json
{
  "cards": [ { "icon": "string", "title": "string", "val": "string", "sub": "string", "valColor": "string" } ],
  "eventLog": [ { "icon": "string", "iconBg": "string", "title": "string", "sub": "string", "time": "string" } ],
  "techInfo": [ { "label": "string", "val": "string", "color": "string" } ]
}
```

### `GET /admin/event-log`
```json
[ { "icon": "string", "iconBg": "string", "title": "string", "sub": "string", "time": "string" } ]
```

### `GET /admin/urgent`
```json
[ { "id": "string", "name": "string", "phone": "string", "initials": "string", "type": "string", "location": "string", "wait": "string", "waitColor": "string", "status": "string", "statusColor": "string", "action": "assign|track|view" } ]
```

### `GET /admin/users?type=user|seller|provider`
```json
[ { "id": "string", "initials": "string", "name": "string", "email": "string", "phone": "string", "status": "string", "date": "string", "orders": "number?", "rating": "string?" } ]
```

### `GET /admin/users/{id}`
```json
{ }
```

### `GET /admin/tickets`
```json
[ { "id": "string", "subject": "string", "user": "string", "initials": "string", "agent": "string", "status": "string", "date": "string" } ]
```

### `GET /admin/tickets/stats`
```json
[ { "label": "string", "val": "number", "color": "string" } ]
```

### `GET /admin/tickets/{id}`
```json
{ }
```

### `GET /admin/cs-agents`
```json
[ { "id": "string", "initials": "string", "name": "string", "email": "string", "code": "string", "open": "number", "done": "number", "status": "string", "avatarGrad": "string", "avatarColor": "string" } ]
```

### `GET /admin/cs-agents/{id}`
```json
{ }
```

### `GET /admin/ratings`
```json
{
  "stats": [ { "label": "string", "val": "string", "color": "string", "delta": "string" } ],
  "starDistribution": [ { "stars": "string", "pct": "number", "color": "string" } ],
  "topProviders": [ { "initials": "string", "name": "string", "sub": "string", "rating": "string", "color": "string" } ],
  "list": [ { "id": "string", "userInitials": "string", "userName": "string", "provider": "string", "stars": "number", "comment": "string", "order": "string", "date": "string" } ]
}
```

### `GET /admin/operations/{tab}`
```json
{
  "stats": [ { "label": "string", "val": "string", "color": "string", "delta": "string" } ],
  "rescue": [ { "id": "string", "user": "string", "initials": "string", "type": "string", "provider": "string", "location": "string", "status": "string", "time": "string" } ],
  "fuel": [ { "id": "string", "user": "string", "initials": "string", "liters": "string", "provider": "string", "location": "string", "status": "string", "time": "string" } ],
  "products": [ { "id": "string", "seller": "string", "item": "string", "qty": "number", "buyer": "string", "status": "string", "eta": "string" } ],
  "returns": [ { "id": "string", "user": "string", "initials": "string", "item": "string", "amount": "string", "status": "string", "date": "string" } ]
}
```

### `GET /admin/notifications`
```json
[ { "icon": "string", "iconBg": "string", "title": "string", "sub": "string", "time": "string" } ]
```

### `GET /admin/system-status`
```json
[ { "name": "string", "status": "string", "uptime": "string", "color": "string" } ]
```

### `GET /admin/activity`
```json
[ { "icon": "string", "text": "string", "time": "string", "color": "string" } ]
```

### `POST /admin/approvals/{id}/approve`
**Response:** `{ "success": true }`

### `POST /admin/approvals/{id}/reject`
**Response:** `{ "success": true }`

### `GET /admin/approvals/{id}/docs`
**Response:** `{ "success": true }`

### `POST /admin/users`
**Request:** _(user data)_
**Response:** `{ "success": true }`

### `PUT /admin/users/{id}`
**Request:** _(user data)_
**Response:** `{ "success": true }`

### `POST /admin/urgent/{id}/assign`
**Request:** `{ "providerId": "string", "note": "string" }`
**Response:** `{ "success": true }`

### `GET /admin/urgent/{id}/track`
**Response:** `{ "success": true }`

### `POST /admin/cs-agents`
**Request:** _(agent data)_
**Response:** `{ "success": true }`

### `POST /admin/cs-agents/{id}/activate`
**Response:** `{ "success": true }`

---

## Public — `src/api/services/publicService.js`

### `GET /public/stats`
```json
{ "drivers": "string", "providers": "string", "orders": "string", "satisfaction": "string" }
```
