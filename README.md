<div align="center">

# 🚦 🚑 Smart Traffic & Emergency Management System (STMS) — REST API

**An Enterprise-Grade, Clean-Architecture .NET 8 REST API for Real-Time Traffic Monitoring, Road Incident Management, and Automated Emergency Roadside Assistance.**

![DotNet](https://img.shields.io/badge/.NET_8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![SignalR](https://img.shields.io/badge/SignalR-Real--Time-orange?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

</div>

---

## 📌 Project Overview

**STMS** (Smart Traffic & Emergency Management System) is a backend engine designed to manage urban traffic issues and automate emergency roadside services. The platform coordinates communication and transactions between drivers, rescue service providers, customer service agents, administrative coordinators, and automotive store sellers.

The system features real-time WebSocket communication for support chat and GPS tracking, secure credit card payment processing via Stripe, an expert-system vehicle diagnostics engine, and database indexing optimized for concurrent traffic monitoring.

---

## 🏗️ Architecture & Clean Design Patterns

STMS is built using **Clean Architecture** and the **CQRS (Command Query Responsibility Segregation)** design pattern to enforce decoupling, maintainability, and testability.

```text
       ┌──────────────────────────────┐
       │  SmartTrafficManagement.API  │  (Presentation Layer / Web API)
       └──────────────┬───────────────┘
                      │ references
                      ▼
       ┌──────────────────────────────┐
       │  SmartTrafficManagement.App  │  (Application Layer / CQRS Handlers / DTOs)
       └──────────────┬───────────────┘
                      │ references
                      ▼
       ┌──────────────────────────────┐
       │  SmartTrafficManagement.Core │  (Core Domain Layer / Entities / Interfaces)
       └──────────────┬───────────────┘
                      ▲
                      │ implemented by
       ┌──────────────┴───────────────┐
       │ SmartTrafficManagement.Infra │  (Infrastructure / Database / SignalR)
       └──────────────────────────────┘
```

The codebase is organized into four decoupled layers:
*   **Core Domain (`SmartTrafficManagement.Core`)**: Defines core entities (e.g., `User`, `Vehicle`, `SupportTicket`, `ChatMessage`, `TrafficReport`, `Order`, `OrderItem`, `Product`, `DiagnosticQuestion`, `DiagnosticResult`), exceptions, result monads, and repository interfaces. Contains no external dependencies.
*   **Application (`SmartTrafficManagement.Application`)**: Coordinates use cases through MediatR Command and Query handlers, validation rules, DTO mapping profiles, and services declarations.
*   **Infrastructure (`SmartTrafficManagement.Infrastructure`)**: Integrates EF Core configurations, SQL Server database migrations, SignalR hubs, Stripe gateway services, and JWT authentication token generation.
*   **API Presentation (`SmartTrafficManagement.API`)**: Exposes REST controllers, registers dependency injection scopes, configures CORS, and maps WebSocket routes.

---

## 🛠️ Technology Stack

*   **Runtime Framework:** .NET 8 (C#)
*   **Database Engine:** Microsoft SQL Server
*   **ORM Framework:** Entity Framework Core 8.0
*   **Real-time Communication:** ASP.NET Core SignalR (WebSockets)
*   **Payment Services:** Stripe.net SDK
*   **Image Processing:** SixLabors.ImageSharp (WebP compression & EXIF stripping)
*   **Object Mapping:** AutoMapper
*   **Input Validation:** FluentValidation
*   **Documentation:** Swagger / OpenAPI (Swashbuckle)

---

## 📁 Repository Structure

```text
SmartTrafficManagement/
├── src/
│   ├── SmartTrafficManagement.API/             # Controllers, Middlewares, DI Registration
│   │   ├── Controllers/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── SmartTrafficManagement.Application/     # CQRS Commands/Queries, Handlers, DTOs, Validators
│   │   ├── DTOs/
│   │   ├── Features/
│   │   └── DependencyInjection.cs
│   ├── SmartTrafficManagement.Core/            # Domain Entities, Domain Errors, Common Interfaces
│   │   ├── Common/
│   │   ├── Entities/
│   │   └── Interfaces/
│   └── SmartTrafficManagement.Infrastructure/  # EF Core DbContext, Migrations, Hubs, Stripe Service
│       ├── Persistence/
│       ├── Realtime/
│       ├── Seeding/
│       └── DependencyInjection.cs
├── vehicle-system.clp                          # CLIPS Diagnostics Expert System Knowledge Base
├── SmartTrafficManagement.slnx                 # Visual Studio Solution XML file
├── .gitignore                                  # Git ignore definitions
└── README.md                                   # Backend documentation
```

---

## 🔑 Authentication & Authorization

Authentication is stateless and managed via JWT (JSON Web Tokens).
*   **Role-Based Access Control (RBAC):** Endpoints are restricted using standard `[Authorize(Roles = ...)]` attributes. Valid system roles are `Admin`, `CsAgent` (Customer Service), `Provider` (Rescue Truck Service), `Seller` (Store Seller), and `Client` (Drivers).
*   **Refresh Token Rotation:** Access tokens are kept short-lived. To extend sessions, clients submit an active `RefreshToken` to generate a new token pair. Refresh tokens are tracked in the database and invalidated upon rotation to prevent replay hijacking.

---

## 💳 Stripe Payment Integration & Webhook Security

The API handles payment processing via the Stripe.net SDK.
*   **Payment Intents:** Secure transaction sessions are generated on the backend to allow client integrations to capture credit card checkouts.
*   **HMAC Webhook Verification:** The endpoint `POST /api/payments/stripe/webhook` processes events from Stripe. To prevent payment spoofing, the controller enforces HMAC-SHA256 signature verification in production environments using the `Stripe:WebhookSecret` signing key. If the signing key is missing in production, the server rejects the request with a `400 Bad Request`.

---

## 📡 SignalR Real-Time Communication

WebSockets are enabled using ASP.NET Core SignalR at the endpoint `/hubs/traffic` (via `TrafficHub`):
*   **Live Support Chat:** Creates isolated conversation groups (`JoinTicketRoom`) allowing Drivers and CS Agents to exchange messages in real-time. Message history is committed to the database asynchronously.
*   **Dispatches Tracking:** Broadcasts live GPS coordinates of active rescue vehicles to clients awaiting assistance.

---

## 🧠 Diagnostics Expert System

The backend hosts a rule-based diagnostics engine modeled after the CLIPS expert system knowledge base defined in [vehicle-system.clp](file:///d:/Projects/project%20v/dddd/SmartTrafficManagement/vehicle-system.clp).
*   **Database Seeding:** On startup, `DiagnosticsSeeder.cs` parses the 14 troubleshooting questions and 13 potential outcomes (like *Weak Battery*, *Alternator Failure*, or *Radiator Leak*), caching them in a queryable database decision tree.
*   **Interactive Diagnostics:** The endpoint `GET /api/diagnostics/start` starts the session and returns the root question. Drivers post their answers to `POST /api/diagnostics/answer`, progressing through the nodes until the engine returns a final diagnosis and recommended action.

---

## 💾 Database & EF Core Performance

Data persistence is managed via EF Core Code-First Migrations on SQL Server.

### Query Indexing Optimizations

To handle high volumes of concurrent requests during peak hours, non-clustered indexes are configured on foreign key columns:
*   **Traffic Incidents:** Indexing on `ReporterId` and `VehicleId` in `TrafficReports` for rapid spatial and user lookups.
*   **Store Orders:** Indexing on `OrderId` and `ProductId` in `OrderItems` to speed up invoice aggregation.
*   **SOS Requests:** Indexing on `ClientId`, `ProviderId`, and `VehicleId` in `ServiceRequests` to optimize queue searches for active jobs.

---

## 🌐 API Overview & Endpoints

| Domain / Controller | Route Prefix | Auth Requirement | Major Endpoints & Purpose |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth` | Anonymous | • `POST /register`: Registers new users<br>• `POST /login`: Generates JWT and Refresh tokens<br>• `POST /refresh-token`: Rotates access tokens<br>• `POST /google-login`: Initiates OAuth federation |
| **Diagnostics** | `/api/diagnostics` | `[Authorize]` | • `GET /start`: Retrieves root expert system question<br>• `POST /answer`: Submits answer and returns next node or result |
| **SOS / Emergency** | `/api/sos` | `[Authorize]` | • `POST /request`: Creates a roadside emergency ticket<br>• `PATCH /accept/{id}`: Assigned provider accepts the ticket<br>• `GET /status/{id}`: Retrieves live status of rescue requests |
| **Traffic Reports** | `/api/trafficincidents`| `[Authorize]` | • `POST /`: Submits a traffic incident (accident, hazard, congestion)<br>• `GET /`: Retrieves active incident markers |
| **Store & Catalog** | `/api/store` | `[Authorize]` | • `GET /products`: Fetches product catalog<br>• `GET /categories`: Fetches product categories |
| **Orders** | `/api/orders` | `[Authorize]` | • `POST /`: Creates an order<br>• `GET /my-orders`: Lists user order history |
| **Payments** | `/api/payments` | Anonymous/Webhook| • `POST /stripe/webhook`: Stripe webhook signature verification endpoint |
| **Seller** | `/api/seller` | `[Authorize(Roles = "Seller")]` | • `GET /dashboard`: Fetches seller sales analytics<br>• `POST /products`: Registers new store items |
| **Provider** | `/api/provider` | `[Authorize(Roles = "Provider")]` | • `GET /active-mission`: Tracks assigned SOS details<br>• `GET /earnings`: Weekly financial dashboards |
| **Admin** | `/api/admin` | `[Authorize(Roles = "Admin")]` | • `GET /users/pending`: Approvals queue for providers/sellers<br>• `PATCH /users/{id}/approve`: Approves user requests |

---

## 🔧 Configuration & Environment Variables

All settings are managed via JSON files and environment variables. **Do not commit actual secrets to Git.**

```env
# Database Connection String
ConnectionStrings__DefaultConnection=Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASSWORD;

# JWT Authentication Config
Jwt__Secret=YOUR_JWT_HS256_SECRET_KEY_MIN_32_CHARS
Jwt__ExpiryMinutes=15
Jwt__RefreshTokenExpiryDays=7

# Stripe Keys
Stripe__SecretKey=sk_test_YOUR_STRIPE_SECRET_KEY
Stripe__PublishableKey=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
Stripe__WebhookSecret=whsec_YOUR_STRIPE_WEBHOOK_SIGNING_SECRET
```

---

## 🚀 Getting Started

### Prerequisites
*   [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
*   [SQL Server](https://www.microsoft.com/sql-server/) (Express, LocalDB, or Docker Container)
*   [EF Core CLI tool](https://learn.microsoft.com/ef/core/cli/dotnet) (`dotnet tool install -g dotnet-ef`)

### 1. Clone the Repository
```bash
git clone https://github.com/mohamed68909/SmartTrafficManagement.git
cd SmartTrafficManagement
```

### 2. Restore NuGet Packages
```bash
dotnet restore SmartTrafficManagement.slnx
```

### 3. Update the Database
Verify that SQL Server is running and the connection string is correctly configured.
```bash
dotnet ef database update --project src/SmartTrafficManagement.Infrastructure --startup-project src/SmartTrafficManagement.API
```

### 4. Run the API
```bash
dotnet run --project src/SmartTrafficManagement.API
```
*The web API will be available at `http://localhost:5066`.*

### 5. Access Swagger API Documentation
Open your browser and navigate to `http://localhost:5066/swagger` to inspect endpoints and test request schemas dynamically.

---

## 🛡️ Security Considerations

*   **Production Signing Keys:** Verify that the Stripe webhook signature key (`Stripe:WebhookSecret`) is populated in your production environment variables. Leaving it empty halts webhook request processing to avoid forged transactions.
*   **Secrets Storage:** Avoid committing local secrets to the repository. Employ environment variables, Azure Key Vault, or User Secrets in developmental environments.

---

## 📈 Future Improvements

*   **Rate Limiting:** Implement API rate limiting middleware to prevent brute-force attacks on auth endpoints.
*   **Docker Deployment:** Containerize the API with Docker Compose configuration to simplify multi-environment testing.
*   **Caching Layer:** Integrate Redis memory caches on high-frequency endpoints (`GET /products` and `GET /trafficincidents`).
*   **Unit Tests:** Introduce an xUnit test library project targeting the application layer command handlers.

---

## 🚦 Project Status
*   **Backend API (.NET 8):** Active / Production-Ready / Graduation Project Engine.
*   **Frontend Client Applications (React/Flutter):** Removed from this repository.

---

## 👤 Author

*   **Mohamed Ashraf** — [GitHub Profile](https://github.com/mohamed68909)