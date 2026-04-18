# SmartTraffic Web/Admin API Map

All responses are wrapped in `Result<T>`.
Base URL: `https://<host>/api`
Realtime Hub: `/hubs/traffic`

---

## Shared Auth (All Portals)

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/auth/login` | ❌ | Email/password login |
| POST | `/api/auth/google-login` | ❌ | Google OAuth (omit `X-Platform: Mobile` for web roles) |
| POST | `/api/auth/refresh-token` | ❌ | Renew access token |
| POST | `/api/auth/forgot-password` | ❌ | Request password-reset token |
| POST | `/api/auth/reset-password` | ❌ | Body: `email`, `token`, `newPassword` |
| POST | `/api/auth/logout` | ✅ | Invalidate session |
| GET | `/api/auth/me` | ✅ | Current user profile. Alias: `GET /api/auth/profile` |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PATCH | `/api/auth/change-password` | ✅ | Change password |

---

## Admin Dashboard

> **Required role:** `Admin`

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/admin/dashboard/summary` | KPI summary card data |
| GET | `/api/admin/analytics/orders/monthly` | Query: `months=12` — monthly order stats |
| GET | `/api/admin/users` | Query: `pageNumber`, `pageSize` — users table |
| GET | `/api/admin/tickets/recent` | Query: `limit=20` — recent support tickets |
| GET | `/api/admin/sos/recent` | Query: `limit=20` — recent SOS/emergency requests |
| GET | `/api/admin/providers` | Query: `pageNumber`, `pageSize` — providers table |

---

## Seller Portal

> **Required role:** `Seller`

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/seller/products` | My products list |
| POST | `/api/seller/products` | Add new product |
| PUT | `/api/seller/products/{id}` | Update product |
| DELETE | `/api/seller/products/{id}` | Delete product |
| GET | `/api/seller/orders` | Orders for my products |

---

## Provider Portal

> **Required role:** `Provider`

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/provider/dashboard` | Provider dashboard summary |
| GET | `/api/provider/jobs/available` | Open SOS jobs available to accept |
| PATCH | `/api/provider/jobs/accept/{requestId}` | Accept a job |
| PATCH | `/api/provider/jobs/status` | Update job status (body: `requestId`, `status`) |
| PATCH | `/api/provider/jobs/location` | Update provider GPS location (body: `requestId`, `latitude`, `longitude`) |
| GET | `/api/provider/jobs/history` | Completed jobs history |
| PATCH | `/api/sos/accept/{id}` | Accept SOS request (alternative route via SosController) |

---

## Support Agent View (CSAgent)

> **Required role:** `CSAgent` (tickets are also accessible to the ticket owner `Client`)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/support/tickets/my` | Assigned / accessible tickets |
| GET | `/api/chat/history/{ticketId}` | Chat message history for a ticket |
| POST | `/api/chat/send` | Send a message. Body: `ticketId`, `message`, `type` |
| PATCH | `/api/support/close/{id}` | Close a ticket |

---

## Store / Cart / Orders (Backoffice / Monitoring)

> **Required role:** Any authenticated user (Store browsing is anonymous)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/store/products` | Query: `pageNumber`, `pageSize`, `search`, `categoryId` — product catalog |
| GET | `/api/orders/my` | My order history |
| GET | `/api/orders/{orderId}` | Single order details |

---

## Payments (Backoffice)

> **Required role:** Any authenticated user (Stripe webhook is anonymous)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/payments/cards` | List saved cards |
| POST | `/api/payments/cards` | Add a Stripe card (body: `paymentMethodId`) |
| DELETE | `/api/payments/cards/{id}` | Remove a card |
| GET | `/api/payments/history` | Payment transaction history |
| GET | `/api/payments/{id}` | Single payment details |
| POST | `/api/payments/refund` | Initiate refund |
| POST | `/api/payments/stripe/webhook` | Stripe server-side webhook (anonymous, validated via `Stripe-Signature` header) |

---

## Ratings (Analytics)

> **Required role:** Any authenticated user

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/ratings` | Submit a rating (1–5 ⭐). Body: `stars`, `comment`, one of `serviceRequestId` or `orderId` |
| GET | `/api/ratings/my` | Ratings submitted by the current user |

---

## Weather (Backoffice Monitoring)

> **Required role:** Any authenticated user

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/weather` | By coordinates. Query: `lat`, `lng` |
| GET | `/api/weather/city` | By city name. Query: `name=Cairo` |

---

## Traffic Incidents (Monitoring)

> **Required role:** Any authenticated user

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/traffic/report` | Report a hazard / incident (role: `Client`) |
| GET | `/api/trafficincidents` | All active incidents |
| GET | `/api/trafficincidents/by-location` | Query: `location=...` |

---

## Sensors (Vehicle Telemetry)

> **Required role:** Any authenticated user

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/sensors/vehicle-env` | Latest sensor data for a vehicle. Query: `vehicleId=<guid>` |

---

## Map / Places

> **Required role:** Any authenticated user

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/map/search` | Google Geocoding search. Query: `query=...` |

---

## Notifications

> **Required role:** Any authenticated user

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/notifications` | All notifications |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| DELETE | `/api/notifications/{id}` | Delete notification |

---

## Web/Admin Notes

- **Admin** endpoints require role `Admin` (`[Authorize(Roles = "Admin")]`).
- **Seller** endpoints require role `Seller`.
- **Provider** endpoints require role `Provider`.
- **CSAgent** endpoints are accessible to both `CSAgent` and `Client` (ticket owner policy).
- Support chat/history is restricted to the ticket owner or an authorized `CSAgent`.
- Realtime updates (SOS, chat) are pushed via SignalR on `/hubs/traffic`.
- Stripe webhook (`POST /api/payments/stripe/webhook`) must be called without a bearer token — it is validated via the `Stripe-Signature` header.
- For Google login on web (non-mobile), omit the `X-Platform: Mobile` header to allow non-Client role assignment.
- Password reset flow: call `forgot-password` → user receives token by email → call `reset-password` with token.
