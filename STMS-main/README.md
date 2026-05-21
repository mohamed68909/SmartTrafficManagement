<<<<<<< HEAD
# AutoCare — Smart Automotive Service & E-Commerce App
### Graduation Project · Flutter · Riverpod · Stripe

---

## 📱 App Overview

AutoCare is a full-featured automotive service platform built with Flutter. It covers:

- **Dashboard** — wallet balance, eco score, upcoming appointments, recent activity
- **Traffic Monitor** — live incident map, congestion alerts, delay estimates
- **Auto Parts Store** — product catalog, tire shop, cart, and full checkout flow
- **Scheduled Maintenance** — service booking with date/time picker
- **Emergency Services** — live fuel delivery with dynamic price calculator
- **Order History** — filterable order list with status badges
- **Mechanic Support** — video call UI with AI diagnostics overlay
- **Checkout Flow** — Address → Payment (Stripe / Wallet / Cash) → Success
- **Profile** — vehicle info, saved cards, order stats

---

## 🗂️ Project Structure

```
lib/
├── main.dart                          # Entry point, Stripe init
├── shell.dart                         # Bottom nav shell (5 tabs)
├── core/
│   ├── theme/app_theme.dart           # Dark theme, AppColors, component themes
│   ├── models/models.dart             # Product, Order, Tire, PaymentMethod, etc.
│   ├── providers/app_providers.dart   # All Riverpod StateNotifiers & providers
│   ├── services/stripe_service.dart   # Stripe PaymentSheet integration
│   └── widgets/shared_widgets.dart    # AppCard, AccentButton, StatusBadge, etc.
└── features/
    ├── dashboard/                     # Screen A: Home dashboard
    ├── traffic/                       # Screen: Live traffic monitor
    ├── store/                         # Screen B: Store + Tire Shop + Cart + Checkout
    │   └── screens/
    │       ├── store_screen.dart
    │       ├── cart_screen.dart
    │       ├── checkout_address_screen.dart   # /store/checkout/address
    │       ├── checkout_payment_screen.dart   # /store/checkout/payment
    │       └── payment_success_screen.dart    # /store/payment-success
    ├── maintenance/                   # Screen C: Scheduled maintenance booking
    ├── checkout/                      # Shared delivery + manage cards screens
    ├── emergency/                     # Screen E: Fuel delivery with slider
    ├── history/                       # Screen F: Order & activity history
    ├── mechanic/                      # Screen G: Video call UI mockup
    └── profile/                       # Screen H: Profile + vehicle info
```

---

## 🚀 Setup Instructions

### Prerequisites
- Flutter SDK ≥ 3.0.0
- Dart ≥ 3.0.0
- Android Studio / Xcode

### 1. Clone and install dependencies

```bash
flutter pub get
```

### 2. Add SpaceGrotesk Font (optional but recommended)

1. Download from: https://fonts.google.com/specimen/Space+Grotesk
2. Place the `.ttf` files in `assets/fonts/`:
   - `SpaceGrotesk-Regular.ttf`
   - `SpaceGrotesk-Medium.ttf`
   - `SpaceGrotesk-SemiBold.ttf`
   - `SpaceGrotesk-Bold.ttf`
3. In `pubspec.yaml`, uncomment the `fonts:` section
4. In `lib/core/theme/app_theme.dart`, uncomment `// fontFamily: 'SpaceGrotesk'`

### 3. Run the app

```bash
flutter run
```

---

## 💳 Stripe Integration

### Keys Used (Test Mode)
| Key | Value |
|-----|-------|
| Publishable Key | `pk_test_51TMnqB...` |
| Secret Key | `sk_test_51TMnqB...` ⚠️ |

### Flow
1. User selects "Credit / Debit Card" and taps **Pay**
2. App calls `StripeService.processPayment()`:
   - **Step 1:** Creates a `PaymentIntent` via direct Stripe REST API call (using Secret Key)
   - **Step 2:** Initializes Flutter Stripe `PaymentSheet` with the `client_secret`
   - **Step 3:** Presents the `PaymentSheet` to user
3. On success → navigates to `/store/payment-success` with confetti animation

### ⚠️ IMPORTANT: Production Security

> **The Secret Key must NEVER be in client-side code in production.**
>
> For a real deployment:
> 1. Create a backend endpoint (Node.js, Python, etc.)
> 2. Move the PaymentIntent creation to your backend
> 3. The client calls YOUR endpoint (with auth), which returns only the `client_secret`
> 4. Use `flutter_stripe` on the client only for presenting the PaymentSheet
>
> See comments in `lib/core/services/stripe_service.dart` for details.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#080808` |
| Surface / Card | `#161616` |
| Accent (Neon Green) | `#D4FF00` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#A0A0A0` |
| Destructive | `#FF4444` |
| Success | `#00C853` |
| Border | `#2A2A2A` |

---

## 🔌 State Management

All state is managed with **flutter_riverpod**:

| Provider | Type | Purpose |
|----------|------|---------|
| `cartProvider` | `StateNotifierProvider<CartNotifier>` | Shopping cart items |
| `ordersProvider` | `StateNotifierProvider<OrdersNotifier>` | Order history |
| `paymentMethodProvider` | `StateNotifierProvider<PaymentMethodNotifier>` | Saved cards |
| `fuelDeliveryProvider` | `StateNotifierProvider<FuelDeliveryNotifier>` | Fuel amount/type/cost |
| `maintenanceSelectionProvider` | `StateNotifierProvider<MaintenanceSelectionNotifier>` | Selected services |
| `selectedPaymentProvider` | `StateProvider<String>` | Active payment method |
| `selectedDateProvider` | `StateProvider<DateTime>` | Booking date |
| `selectedTimeProvider` | `StateProvider<String>` | Booking time |
| `navIndexProvider` | `StateProvider<int>` | Bottom nav active tab |
| `historyFilterProvider` | `StateProvider<String>` | Orders list filter |
| `micEnabledProvider` | `StateProvider<bool>` | Mechanic call mic toggle |
| `videoEnabledProvider` | `StateProvider<bool>` | Mechanic call video toggle |

---

## 📋 Screen Routes (Figma)

| Route | Screen |
|-------|--------|
| `/` | Dashboard |
| `/traffic` | Traffic Monitor |
| `/store` | Auto Parts Store |
| `/store/cart` | Cart |
| `/store/checkout/address` | Delivery Address |
| `/store/checkout/payment` | Payment Method |
| `/store/payment-success` | Payment Success |
| `/service` | Scheduled Maintenance |
| `/emergency` | Emergency Fuel Delivery |
| `/history` | Order History |
| `/mechanic` | Mechanic Video Call |
| `/profile` | Profile |
| `/profile/cards` | Manage Cards |

---

## 👨‍💻 Built By

Youssef Ahmed — Computer Science Graduation Project, 2025  
AutoCare Egypt · Flutter × Riverpod × Stripe
=======
# STMS
STMS
>>>>>>> 4663bac69e0d28d3677cd121bdd61d7d1ddf19fc
