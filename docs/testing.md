# Smart Traffic & Emergency Management System (STMS) — Testing Strategy

This document provides a comprehensive overview of the testing strategy, test suite architecture, categories of tests implemented, and instructions on executing tests and measuring code coverage for the backend STMS .NET 8 REST API.

---

## 1. Testing Objectives
The primary objective of the STMS test suite is to guarantee the correctness, security, performance, and reliability of the standalone REST API backend. The test suite aims to:
- Protect core business logic from regression.
- Validate critical security boundaries (Authentication, Role-based Authorization, and BOLA/IDOR).
- Ensure safe third-party integrations (Stripe HMAC signature validation).
- Verify the vehicle diagnostics decision tree correctness.

---

## 2. Testing Pyramid
We adopt a structured testing pyramid to ensure fast execution and high confidence:
- **Unit Tests (80% of tests):** Isolated, fast tests validating individual services, CQRS command/query handlers, results wrapping, and FluentValidation validators.
- **Integration Tests:** Verifying relational database constraints in SQLite, CLIPS decision tree progression, and Stripe signature verification.
- **API Tests:** Request pipeline verification through `WebApplicationFactory` simulating actual HTTP request flows.

---

## 3. Test Project Structure
All tests reside in `tests/SmartTrafficManagement.Tests` with the following organization:

```text
tests/SmartTrafficManagement.Tests/
├── Helpers/
│   ├── CustomWebApplicationFactory.cs # Replaces SQL Server with SQLite in-memory
│   └── TestDbContextFactory.cs        # Context factory for database tests
├── Integration/
│   ├── Controllers/
│   │   └── SecurityTests.cs           # Authentication bypass, role check, IDOR
│   ├── Database/
│   │   └── DatabaseTests.cs           # Relational schema & indexing constraints
│   ├── Diagnostics/
│   │   └── DiagnosticsTests.cs        # Decision tree question-by-question flow
│   └── Payments/
│       └── StripeWebhookTests.cs      # Stripe HMAC signature check
└── Unit/
    ├── Application/
    │   ├── Auth/
    │   │   └── RefreshTokenCommandHandlerTests.cs
    │   ├── Orders/
    │   │   └── CheckoutCommandHandlerTests.cs
    │   ├── SOS/
    │   │   ├── AcceptSosCommandHandlerTests.cs
    │   │   └── RequestSosCommandHandlerTests.cs
    │   └── Validators/
    │       ├── CheckoutCommandValidatorTests.cs
    │       └── RequestSosCommandValidatorTests.cs
    └── Core/
        └── ResultTests.cs             # Result monad validation
```

---

## 4. Unit Testing
Unit tests isolate class behaviors under test from external dependencies using **Moq** to substitute database repositories, token services, and user managers. They verify logic branching, input validations, and correct results formatting.

---

## 5. Integration Testing
Integration tests execute multiple software layers acting together. They use a real, transient SQLite database context configured in-memory to execute SQL queries, verify foreign key enforcement, and perform actual model index lookups.

---

## 6. API Testing
We use `Microsoft.AspNetCore.Mvc.Testing` and `WebApplicationFactory` to spin up a test host of the API. This runs the complete ASP.NET Core request pipeline including authentication middleware, routing, serialization, and global exception handlers.

---

## 7. Authentication Testing
We verify that endpoints decorated with `[Authorize]` correctly reject request payloads without headers with `401 Unauthorized` and reject invalid or expired JWTs. Tests verify token rotation and replay prevention in the `RefreshToken` handler.

---

## 8. Authorization Testing
We verify that the API enforces correct user roles (e.g., `Client` or `Provider`). If a user authenticated as a `Provider` attempts to access a `Client` endpoint (like `/api/garage`), the system returns `403 Forbidden`.

---

## 9. BOLA / IDOR Testing
Broken Object Level Authorization (BOLA/IDOR) is prevented server-side by checking object ownership:
- **Test User A** requesting their own vehicle ID: **200 OK**
- **Test User A** requesting a vehicle ID belonging to **User B**: **404 Not Found** (replaces 403 to hide resource existence).

---

## 10. Stripe Security Testing
The `PaymentsController` Stripe webhook signatures are validated against:
- **Valid Signature & Payload:** Accepted and processed.
- **Modified Payload / Bad Signature:** Rejected with `400 BadRequest`.
- **Missing Signature:** Rejected with `400 BadRequest`.
- **Missing Webhook Secret (Production):** Safety check rejects immediately.

---

## 11. Diagnostics Testing
The CLIPS diagnostics decision tree integration is fully tested:
1. Root question retrieval retrieves `"Does the engine start?"`.
2. Progressing through the answers advances step-by-step.
3. Providing a sequence of answers reaches a correct terminal diagnosis (e.g., `"Weak Battery"`).

---

## 12. SOS Testing
SOS emergency ticket creation and provider accept/reject flows are tested:
- Standard SOS request creation.
- Rejecting unauthorized users from accepting tickets.
- Valid status transitions (e.g., `Pending` -> `Accepted`).

---

## 13. Orders & Products Testing
We test shopping cart checkouts and point calculations for wallet payments:
- Total price calculation from actual database entries (never trusting client-supplied values).
- Point balance deduction (100 points = 1 EGP).
- Rejecting checkouts if the wallet balance is insufficient.

---

## 14. Database Testing
We verify EF Core entity configurations using SQLite:
- Uniqueness constraints on indices (e.g., unique `PlateNumber` on `Vehicles`).
- Saving and retrieving complex relationships (User -> Vehicle -> ServiceRequest).

---

## 15. Validation Testing
We test FluentValidation validators with valid/invalid edge-case inputs (e.g. latitudes outside `[-90, 90]` or overlength notes).

---

## 16. Error Handling Testing
We test that validation failures are caught and returned as `Common.Validation` errors with `400 BadRequest` and `401 Unauthorized` for unauthorized requests, using standard exception-handling middleware.

---

## 17. SignalR Testing
SignalR hub registration and routes mappings are tested via pipeline configuration, but live web socket connections are verified manually due to client dependency limitations.

---

## 18. Test Data Strategy
Each test is fully independent and creates its own database schema dynamically in an isolated SQLite in-memory connection or generates fresh mocks to avoid flaky, inter-dependent tests.

---

## 19. Mocking Strategy
Moq is used to isolate application handlers from database persistence. Sealed handlers are instantiated directly with mocked interface dependencies (`IStoreRepository`, `UserManager<ApplicationUser>`).

---

## 20. Running Tests
To run the automated test suite, execute the following command at the root workspace:

```bash
dotnet test SmartTrafficManagement.slnx
```

---

## 21. Coverage
To collect test coverage using Cobertura format:

```bash
dotnet test --collect:"XPlat Code Coverage" SmartTrafficManagement.slnx
```

---

## 22. CI Testing
The test runner is configured to automatically run on pull requests and commits. If any test fails, the build exits with code `1` and halts progression.

---

## 23. Known Limitations
- **SignalR Live Streaming:** Live coordinates streaming and real-time sockets are verified manually.
- **Third-Party Payment Gateway:** Mocks Stripe API payloads to avoid invoking live Stripe servers.

---

## 24. Future Testing Improvements
- Adding end-to-end integration tests using dockerized SQL Server Testcontainers.
- Implementing load and performance tests for concurrent Traffic Incident reports.
