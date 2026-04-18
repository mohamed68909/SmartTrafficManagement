# SmartTraffic Mobile API Map

All responses are wrapped in `Result<T>`.
Base URL: `https://<host>/api`
Realtime Hub: `/hubs/traffic`

---

## Auth

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| POST | `/api/auth/register` | ❌ | — | Register new client |
| POST | `/api/auth/login` | ❌ | — | Email/password login |
| POST | `/api/auth/google-login` | ❌ | — | Google OAuth. Send `X-Platform: Mobile` header → locks role to Client |
| POST | `/api/auth/verify-otp` | ❌ | — | Email OTP verification |
| POST | `/api/auth/refresh-token` | ❌ | — | Renew access token |
| POST | `/api/auth/forgot-password` | ❌ | — | Request password-reset token (sent to email) |
| POST | `/api/auth/reset-password` | ❌ | — | Body: `email`, `token`, `newPassword` |
| POST | `/api/auth/logout` | ✅ | Any | Invalidate refresh token |
| GET | `/api/auth/me` | ✅ | Any | Alias: `GET /api/auth/profile` |
| PUT | `/api/auth/profile` | ✅ | Any | Alias: `PUT /api/auth/profile/update` |
| PATCH | `/api/auth/change-password` | ✅ | Any | — |

---

## Garage

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| GET | `/api/garage` | ✅ | Client | List user vehicles |
| GET | `/api/garage/{id}` | ✅ | Client | Single vehicle details |
| POST | `/api/garage` | ✅ | Client | Add vehicle. Alias: `POST /api/garage/add` |
| PUT | `/api/garage/{id}` | ✅ | Client | Update vehicle. Alias: `PUT /api/garage/update/{id}` |
| DELETE | `/api/garage/{id}` | ✅ | Client | Remove vehicle. Alias: `DELETE /api/garage/delete/{id}` |

---

## Store / Cart / Orders

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| GET | `/api/store/products` | ✅ | Any | Query: `pageNumber`, `pageSize`, `search` (optional), `categoryId` (optional) |
| POST | `/api/store/checkout` | ✅ | Client | Place an order |
| GET | `/api/cart` | ✅ | Client | View current cart |
| POST | `/api/cart/items` | ✅ | Client | Add item to cart |
| PATCH | `/api/cart/items/{cartItemId}` | ✅ | Client | Update item quantity. Body: `{ "quantity": N }` |
| DELETE | `/api/cart/items/{cartItemId}` | ✅ | Client | Remove item from cart |
| GET | `/api/orders/my` | ✅ | Client | My order history |
| GET | `/api/orders/{orderId}` | ✅ | Client | Single order details |

---

## Payments

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| GET | `/api/payments/cards` | ✅ | Any | List saved Stripe cards |
| POST | `/api/payments/cards` | ✅ | Any | Add a card (body: `paymentMethodId`) |
| DELETE | `/api/payments/cards/{id}` | ✅ | Any | Remove saved card |
| GET | `/api/payments/history` | ✅ | Any | Payment transaction history |
| GET | `/api/payments/{id}` | ✅ | Any | Single payment details |
| POST | `/api/payments/refund` | ✅ | Any | Request a refund |
| POST | `/api/payments/stripe/webhook` | ❌ | — | Stripe webhook (server-to-server only) |

---

## Emergency / SOS

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| POST | `/api/sos/request` | ✅ | Client | Create emergency request |
| GET | `/api/sos/status/{id}` | ✅ | Any | Request status |
| GET | `/api/sos/history` | ✅ | Client | My SOS history |
| PATCH | `/api/sos/cancel/{id}` | ✅ | Client | Cancel pending request |
| PATCH | `/api/sos/accept/{id}` | ✅ | Provider | Accept a job *(used by provider mobile)* |

---

## Traffic / Map

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| POST | `/api/traffic/report` | ✅ | Client | Report hazard / incident |
| GET | `/api/trafficincidents` | ✅ | Any | All active incidents |
| GET | `/api/trafficincidents/by-location` | ✅ | Any | Query: `location=...` |
| GET | `/api/sensors/vehicle-env` | ✅ | Any | Query: `vehicleId=<guid>` — latest vehicle sensor data |
| GET | `/api/map/search` | ✅ | Any | Google Geocoding search. Query: `query=...` |

---

## Weather

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| GET | `/api/weather` | ✅ | Any | By coordinates. Query: `lat`, `lng` |
| GET | `/api/weather/city` | ✅ | Any | By city name. Query: `name=Cairo` |

---

## Ratings

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| POST | `/api/ratings` | ✅ | Any | Submit rating (1–5 ⭐). Body: `stars`, `comment` (optional), and one of `serviceRequestId` or `orderId` |
| GET | `/api/ratings/my` | ✅ | Any | My submitted ratings |

---

## Support / Chat

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| POST | `/api/support/tickets/open` | ✅ | Client | Open a new ticket |
| GET | `/api/support/tickets/my` | ✅ | Client / CSAgent | My ticket list |
| PATCH | `/api/support/close/{id}` | ✅ | Client / CSAgent | Close ticket |
| GET | `/api/chat/history/{ticketId}` | ✅ | Client / CSAgent | Chat message history |
| POST | `/api/chat/send` | ✅ | Client / CSAgent | Send a message. Body: `ticketId`, `message`, `type` |

---

## Notifications

| Method | Endpoint | Auth | Role | Notes |
|--------|----------|------|------|-------|
| GET | `/api/notifications` | ✅ | Any | All notifications for current user |
| PUT | `/api/notifications/{id}/read` | ✅ | Any | Mark notification as read |
| DELETE | `/api/notifications/{id}` | ✅ | Any | Delete a notification |

---

## Mobile Notes

- All protected endpoints require `Authorization: Bearer <access_token>`.
- Keep refresh-token flow active in the app session manager (`POST /api/auth/refresh-token`).
- Prefer canonical routes (without `add/update/delete` aliases) for new mobile builds.
- For Google login on mobile, always include the header `X-Platform: Mobile` to lock the account role to `Client`.
- Realtime updates (SOS, chat) are pushed via SignalR on `/hubs/traffic`.
- Ratings: only one rating per `serviceRequestId` **or** `orderId` per user is allowed (409 on duplicate).
- Password reset flow: call `forgot-password` → user receives token by email → call `reset-password` with token.
