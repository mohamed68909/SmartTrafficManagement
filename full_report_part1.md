# تقرير SmartTrafficManagement — الجزء 1: Backend

## الهيكل العام
```
Backend (ASP.NET Core 8) — Clean Architecture
├── Core          ← Entities + Interfaces + Enums
├── Application   ← CQRS Handlers (15 Feature)
├── Infrastructure← DB + 8 Services + SignalR
└── API           ← 23 Controllers + Program.cs
```

## الكيانات (20+ جدول)
| الكيان | الوظيفة | علاقات رئيسية |
|--------|---------|--------------|
| ApplicationUser | المستخدم (Identity) | Vehicles, Orders, CartItems, SupportTickets |
| Vehicle | مركبة المستخدم | Owner→User, ServiceRequests, SensorData |
| ServiceRequest | طلب SOS/صيانة | Client→User, Provider→User, Vehicle |
| Order | طلب شراء | User, OrderItems, Transactions |
| Product | منتج في المتجر | Seller→User, Category |
| Category | تصنيف منتجات | Products |
| CartItem | عنصر السلة | User, Product |
| OrderItem | عنصر الطلب | Order, Product |
| Transaction | عملية مالية | User, Order?, ServiceRequest? |
| UserCard | بطاقة Stripe محفوظة | User |
| TrafficIncident | حادث مروري | مستقل |
| TrafficReport | بلاغ مروري | Reporter→User |
| SensorData | بيانات IoT | Vehicle |
| SupportTicket | تذكرة دعم | User, ChatMessages |
| ChatMessage | رسالة محادثة | Sender→User, SupportTicket |
| Notification | إشعار | User |
| Rating | تقييم | User |
| RefreshToken | توكن تجديد | User |
| DiagnosticQuestion | سؤال تشخيص | Answers |
| DiagnosticAnswer | إجابة تشخيص | Question, NextQuestion?, Result? |
| DiagnosticResult | نتيجة تشخيص نهائية | مستقل |

**BaseEntity:** Id(Guid), CreatedOnUtc, UpdatedOnUtc, IsDeleted (Soft Delete تلقائي)

## الـ Enums
- **ServiceType:** Maintenance=1, Inspection=2, Emergency=3, Towing=4, FuelDelivery=5, VideoSupport=6
- **OrderStatus:** Pending, Processing, Shipped, Delivered, Cancelled
- **PaymentStatus:** Pending, Paid, Failed, Refunded
- **TicketStatus:** Open, InProgress, Resolved, Closed
- **TicketPriority:** Low=0, Medium=1, High=2, Urgent
- **TransactionType:** ServicePayment, ProductPurchase, WalletTopUp, Refund

**الأدوار:** Admin · Seller · Provider · Driver · CSAgent

## الـ API Endpoints الكاملة

### Auth `/api/auth`
| Endpoint | Method | Auth | الوظيفة |
|----------|--------|------|---------|
| /register | POST | ❌ | تسجيل (X-Platform:Mobile يتجاوز الوثائق) |
| /login | POST | ❌ | دخول → JWT + RefreshToken |
| /refresh-token | POST | ❌ | تجديد التوكن |
| /logout | POST | ✅ | إلغاء Refresh Token |
| /send-otp | POST | ❌ | ⚠️ مش شغال — Console.WriteLine فقط |
| /verify-otp | POST | ❌ | التحقق من OTP |
| /google-login | POST | ❌ | دخول بـ Google ID Token |
| /forgot-password | POST | ❌ | طلب إعادة تعيين |
| /reset-password | POST | ❌ | إعادة تعيين بـ token |
| /me أو /profile | GET | ✅ | الملف الشخصي |
| /profile/update | PUT | ✅ | تحديث الملف |
| /change-password | PATCH | ✅ | تغيير كلمة المرور |
| /verify-documents | POST | ✅ | رفع مستندات + بيانات مركبة |

### SOS `/api/sos`
| Endpoint | Method | الدور | الوظيفة |
|----------|--------|-------|---------|
| /request | POST | Client | طلب SOS (serviceType, lat, lng, notes) |
| /accept/{id} | PATCH | Provider | قبول SOS |
| /cancel/{id} | PATCH | Client | إلغاء SOS |
| /status/{id} | GET | Any | حالة الطلب |
| /history | GET | Client | سجل الطلبات |

### Provider `/api/provider`
| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| /dashboard | GET | إجمالي مهام + أرباح |
| /jobs/available | GET | المهام المتاحة |
| /jobs/history | GET | سجل المهام |
| /jobs/accept/{id} | PATCH | قبول مهمة |
| /jobs/{id}/reject | POST | رفض مهمة |
| /jobs/status | PATCH | تحديث حالة المهمة |
| /earnings | GET | إجمالي الأرباح |
| /earnings/weekly | GET | أرباح أسبوعية |
| /active-mission | GET | المهمة النشطة |
| /schedule | GET/PUT | الجدول الزمني |
| /status | POST | Online/Offline |
| /profile | GET | ملف مقدم الخدمة |

### Admin `/api/admin`
| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| /dashboard/summary | GET | 8 بطاقات إحصائية |
| /analytics/orders/monthly | GET | إحصائيات شهرية |
| /activity | GET | آخر الأحداث |
| /users | GET | كل المستخدمين (Paged) |
| /users/{id} | GET/PUT | تفاصيل/تعديل مستخدم |
| /users | POST | إنشاء مستخدم |
| /providers | GET | مقدمو الخدمات (Paged) |
| /cs-agents | GET/POST | وكلاء CS |
| /cs-agents/{id}/activate | POST | تفعيل وكيل |
| /approvals | GET | طلبات موافقة |
| /approvals/stats | GET | إحصائيات الموافقات |
| /approvals/{id}/approve | POST | موافقة |
| /approvals/{id}/reject | POST | رفض |
| /tickets/recent | GET | آخر التذاكر |
| /tickets/stats | GET | إحصائيات التذاكر |
| /urgent | GET | SOS العاجلة |
| /urgent/{id}/assign | POST | تعيين SOS لمقدم |
| /urgent/{id}/track | GET | تتبع SOS |
| /ratings | GET | كل التقييمات |
| /sensors | GET | بيانات IoT |
| /system-status | GET | Version, DB, Uptime |
| /sos/recent | GET | آخر عمليات SOS |

### Seller `/api/seller`
| Endpoint | Method | الوظيفة |
|----------|--------|---------|
| /dashboard | GET | Revenue, Orders, Products, Rating |
| /products | GET/POST | قائمة/إضافة منتج (multipart) |
| /products/{id} | GET/PUT/DELETE | تفاصيل/تعديل/حذف |
| /products/{id}/restock | POST | إعادة تخزين |
| /categories | GET/POST | التصنيفات |
| /categories/{id} | PUT/DELETE | تعديل/حذف |
| /orders | GET | الطلبات |
| /orders/stats | GET | إحصائيات |
| /orders/{id}/prepare | POST | تجهيز طلب |
| /analytics | GET | تحليلات مبيعات |
| /store | GET/PUT | ملف المتجر |
| /reviews | GET | تقييمات |
| /settings | GET/PUT | إعدادات |

### باقي Controllers
| Controller | الـ Endpoints |
|-----------|--------------|
| Store | GET /store/products, /categories; POST /store/checkout |
| Cart | GET/POST /cart/items; PUT/DELETE /cart/items/{id} |
| Orders | GET /orders/my, /orders/{id} |
| Payments | GET /payments/stripe/config; POST /stripe/webhook; CRUD /payments/cards; GET /payments/history; POST /payments/refund |
| Diagnostics | GET /diagnostics/start; POST /diagnostics/answer |
| Garage | CRUD /garage |
| Chat | GET /chat/history/{id}; POST /chat/send |
| Support | GET /support/tickets/my; POST /support/open; PATCH /support/close/{id} |
| Cs | GET /cs/drivers/search; POST /cs/drivers/{id}/block; GET /support/tickets/stats; POST /tickets/{id}/escalate |
| TrafficIncidents | GET /trafficincidents, /by-location; POST /trafficincidents/report |
| Map | GET /map/search |
| Weather | GET /weather/current, /forecast |
| Sensors | POST /sensors/vehicle-env |
| Notifications | GET /notifications; PATCH /notifications/{id}/read |
| Ratings | GET /ratings/my; POST /ratings |
| Upload | POST /upload, /upload/multiple |

## Infrastructure Services
| Service | الوظيفة |
|---------|---------|
| JwtTokenService | JWT (HMAC-SHA256) + Refresh Token |
| GoogleTokenVerifier | التحقق من Google ID Token |
| PaymentService | Stripe: PaymentIntent + Customer |
| PaymentManagementService | Cards CRUD + History + Refund |
| MapSearchService | Google Maps: Search + Geocoding |
| WeatherService | OpenWeather: Current + Forecast |
| LocalFileStorageService | رفع/حذف ملفات في wwwroot |
| NotificationService | إشعارات داخلية |

## Expert System Flow
```
GET /diagnostics/start → سؤال جذري (IsRoot=true)
   ↓ اختيار إجابة
POST /diagnostics/answer {answerId}
   → isComplete:false + nextQuestion (سؤال تالٍ)
   → isComplete:true + result { title, description, urgency, recommendedServiceType, tip }
```

## Startup Pipeline
```
Services: AddApplication → AddInfrastructure → AddCors → AddSignalR → AddSwagger
Pipeline: UseSwagger → UseCors → UseAuthentication → UseAuthorization → MapControllers
Startup: RoleSeeder → AdminSeeder → CategorySeeder → DiagnosticsSeeder
SignalR: MapHub<TrafficHub>("/hubs/traffic")
```
