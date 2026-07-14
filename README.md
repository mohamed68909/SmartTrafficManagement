# Smart Traffic & Emergency Management System (STMS) 🚦🚑

STMS is an end-to-end smart city platform designed to monitor urban traffic conditions, manage road incidents, and dispatch emergency roadside assistance (SOS jumps, towing, fuel delivery, flat tires) in real-time. Built as a comprehensive graduation project, the system features a robust micro-service architecture, a real-time React dashboard, and a feature-rich Flutter mobile app.

---

## 🏗️ System Architecture & Tech Stack

The system is split into three main modules:

### 1. Backend API (`/src`)
- **Framework**: .NET 8 (C#)
- **Database**: Entity Framework Core with SQL Server (highly indexed for performance)
- **Real-Time Communication**: SignalR Hubs for instant messaging & tracking
- **Third-Party Integrations**: Stripe API (for secure card processing and product orders)

### 2. Web Admin & Operations Panel (`/my-project`)
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS with premium dark theme aesthetics
- **Role-Based Interfaces**:
  - **Admin**: System-wide user approvals, statistics charts, and system tickets.
  - **Customer Service Agent**: Interactive workstation with real-time chat with clients.
  - **Rescue Service Provider**: Active mission dispatch, location tracking, and status update panel.
  - **Store Seller**: Manage automotive product inventories and process incoming shop orders.

### 3. Client Mobile App (`/STMS-main`)
- **Framework**: Flutter (Dart)
- **Maps & Location**: Google Maps API for real-time tracking of tow trucks and fuel delivery vehicles.
- **State Management**: Riverpod
- **Features**: Live support chat, emergency SOS request triggers, store product checkout with Stripe.

---

## 🚀 Getting Started

### 📋 Prerequisites
- [.NET SDK 8.0+](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18.0+](https://nodejs.org/)
- [Flutter SDK 3.19.0+](https://docs.flutter.dev/get-started/install)
- SQL Server LocalDB or Docker SQL Server container.

---

### 1. Running the Backend API
1. Open a terminal and navigate to the API project:
   ```bash
   cd src/SmartTrafficManagement.API
   ```
2. Restore dependencies and build the solution:
   ```bash
   dotnet restore
   dotnet build
   ```
3. Update connection strings in `appsettings.json` if necessary, then run the database migrations:
   ```bash
   dotnet ef database update --project ../SmartTrafficManagement.Infrastructure --startup-project .
   ```
4. Start the server:
   ```bash
   dotnet run
   ```
   *The API will be available at `http://localhost:5066` or `https://localhost:7066`.*

---

### 2. Running the React Web Portal
1. Navigate to the web application directory:
   ```bash
   cd my-project
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

### 3. Running the Flutter Mobile App
1. Open a terminal and navigate to the mobile app directory:
   ```bash
   cd STMS-main
   ```
2. Get packages:
   ```bash
   flutter pub get
   ```
3. Ensure your emulator or physical device is connected, then run:
   ```bash
   flutter run
   ```

---

## 🔒 Security & Strict Verification
- **JWT Authorization**: Automatic token refresh interceptors on both React and Flutter clients to maintain seamless sessions securely.
- **Stripe Webhook Validation**: Strict HMAC signature verification enforced in production to prevent payload forgery.
- **Data Indexing**: High-performance indexes configured for database foreign keys (`Vehicles`, `TrafficReports`, `Orders`, `OrderItems`) ensuring quick queries during traffic spikes.