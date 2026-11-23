# TransitOps — Smart Fleet & Transport Operations Platform

> **Odoo Hackathon Project** — A resilient, production-ready, full-stack Fleet and Transportation Management System built with React, Node.js, Express, Prisma ORM, and MySQL.

TransitOps delivers an enterprise-grade platform for fleet managers, dispatchers, safety officers, and financial analysts to manage vehicle registries, driver lifecycles, end-to-end trip dispatching, preventative and corrective maintenance, fuel logs, operational expenses, and executive analytics — backed by role-based access control (RBAC), robust database transactions, and live REST API integrations.

---

## Table of Contents

1. [Executive Summary & Features](#executive-summary--features)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Prerequisites & System Requirements](#prerequisites--system-requirements)
4. [Project Directory Structure](#project-directory-structure)
5. [Quick Start & Setup Guide](#quick-start--setup-guide)
   - [Automated Full Installation](#1-clone-and-install-dependencies)
   - [Environment Configuration](#2-configure-environment-variables)
   - [Database Setup with Docker Compose or Native MySQL](#3-database-setup)
   - [Prisma Migration & Database Seeding](#4-prisma-setup--lifecycle)
   - [Running Development Servers](#5-running-the-development-servers)
6. [Available npm Scripts](#available-npm-scripts)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Database Schema & Data Model](#database-schema--data-model)
9. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
10. [Development Demo Accounts](#development-demo-accounts)
11. [REST API Reference & Health Check Probes](#rest-api-reference--health-check-probes)
12. [Testing & Quality Assurance](#testing--quality-assurance)
13. [Frontend Production Build](#frontend-production-build)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [Team & Contributing](#team--contributing)

---

## Executive Summary & Features

### Core Capabilities
- **Fleet Registry:** Vehicle asset tracking with registration numbers, load capacities, fuel types, mileage tracking, and operational statuses (`AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `OUT_OF_SERVICE`).
- **Driver Lifecycle & Safety:** Driver licensing registry, license expiration alerts, contact details, and dynamic safety scores (0–100 scale).
- **End-to-End Trip Dispatching:** Multi-state trip lifecycle (`DRAFT` → `DISPATCHED` → `COMPLETED` / `CANCELLED`). Dispatches enforce capacity limits, vehicle availability, and driver readiness within atomic Prisma database transactions.
- **Maintenance Records:** Scheduled and unscheduled service tracking (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), priority levels, odometer logs, and financial repair costing.
- **Fuel Tracking & Efficiency:** Fuel refill logs recording quantities, cost per liter, pump locations, odometer readings, and auto-computed km/L efficiency.
- **Operational Expense Management:** Multi-category cost tracking (`FUEL`, `TOLL`, `MAINTENANCE`, `PARKING`, `REPAIR`, `OTHER`) linked to specific vehicles or trips.
- **Executive Analytics & CSV Export:** Real-time KPI summaries, fleet status distributions, cost trends, and streaming CSV export (`json2csv`) for business auditing.
- **Authentication & Security:** JWT-based stateless authentication, bcrypt password hashing (12 salt rounds), role-protected endpoints, HTTP-only cookies / bearer token authentication, rate limiting, and Helmet security headers.

---

## Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 18 + Vite 5 + Tailwind CSS 3 + Recharts + Lucide    │
│  (Port 5173 with Vite Dev Proxy to /api)                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                          │
│  Express 4 + Node.js 18+ (ES Modules)                       │
│  - Morgan Logging & Centralized Error Middleware            │
│  - JWT Auth Guard & RBAC Role Protection Middleware         │
│  - Zod Request Schema Validation                            │
│  (Port 5001)                                                │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma 5.22.0
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│  MySQL 8.0+ (InnoDB, UTF8mb4)                               │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 | Fast HMR, responsive layout, slate design system |
| **State & Forms** | Context API, React Hook Form 7, Zod 3 | Client-side schema validation, accessible inputs |
| **Visualizations** | Recharts 2, Lucide React | Responsive SVG charts and unified icon library |
| **Backend Runtime** | Node.js 18+ (LTS), Express 4 (ESM) | Native ES modules, modular controller-service-repo |
| **ORM & Database** | Prisma 5.22.0, MySQL 8.0+ | Strict type generation, foreign keys, transactions |
| **Security** | JWT, bcryptjs, Helmet, CORS, Rate Limit | 100 req/15min rate limit, secure CORS origins |
| **Testing** | Node.js Test Runner (`node --test`), Supertest | 69 unit and integration tests |

---

## Prerequisites & System Requirements

- **Node.js:** `v18.0.0` or higher (`v20.x` LTS recommended)
- **npm:** `v9.0.0` or higher
- **MySQL:** `v8.0` or higher (running locally or via Docker)
- **Operating Systems Supported:** Windows 10/11, macOS (Apple Silicon / Intel), Linux (Ubuntu, Debian, Fedora)

---

## Project Directory Structure

```
TransitOps-Odoo-Hackathon/
├── client/                               # Frontend React application (Vite)
│   ├── public/                           # Static public assets
│   ├── src/
│   │   ├── api/                          # Axios API clients (auth, vehicles, drivers, trips, etc.)
│   │   ├── components/
│   │   │   ├── common/                   # Reusable UI primitives (Button, Card, Input, Table, Modal)
│   │   │   ├── dashboard/                # Metric cards, status distribution, expense charts
│   │   │   ├── feedback/                 # Toast notifications and alerts
│   │   │   └── layout/                   # Navbar, Sidebar, PageShell, Mobile drawer
│   │   ├── context/                      # AuthContext and ThemeContext
│   │   ├── hooks/                        # Custom React hooks (useAuth, usePagination, useDebounce)
│   │   ├── pages/                        # View components mapped to application routes
│   │   │   ├── auth/                     # LoginPage, UnauthorizedPage
│   │   │   ├── dashboard/                # Main KPI Dashboard
│   │   │   ├── vehicles/                 # VehiclesPage, AddVehiclePage, EditVehiclePage
│   │   │   ├── drivers/                  # DriversPage, AddDriverPage, EditDriverPage
│   │   │   ├── trips/                    # TripsPage, CreateTripPage, TripDetailsPage
│   │   │   ├── maintenance/              # MaintenancePage with log modal
│   │   │   ├── Fuel/                     # FuelPage with refill modal
│   │   │   ├── Expenses/                 # ExpensesPage with expense modal
│   │   │   ├── reports/                  # ReportsPage with CSV export
│   │   │   └── profile/                  # User profile and security overview
│   │   ├── routes/                       # ProtectedRoute, RoleProtectedRoute, PublicRoute
│   │   ├── schemas/                      # Client-side Zod validation schemas
│   │   ├── styles/                       # Global styles and design tokens
│   │   └── utils/                        # Currency, date, and formatting utilities
│   ├── .env.example                      # Frontend environment template
│   ├── package.json                      # Frontend dependencies and Vite scripts
│   ├── tailwind.config.js                # Design system tokens and semantic color definitions
│   └── vite.config.js                    # Vite server config and API proxy setup
├── server/                               # Backend Express API
│   ├── prisma/
│   │   ├── migrations/                   # SQL migration history
│   │   ├── schema.prisma                 # Prisma schema definition
│   │   └── seed.js                       # Database seeder (roles, users, sample records)
│   ├── src/
│   │   ├── config/                       # Prisma client, CORS options, environment loader
│   │   ├── constants/                    # Shared enums and HTTP status codes
│   │   ├── controllers/                  # Route request handlers
│   │   ├── middleware/                   # JWT auth, RBAC permissions, error handlers
│   │   ├── repositories/                 # Prisma data access layer
│   │   ├── routes/                       # Express route modules
│   │   ├── services/                     # Business domain logic and validation
│   │   ├── utils/                        # Token generation, calculations, CSV export
│   │   ├── validators/                   # Server-side Zod schema validators
│   │   ├── app.js                        # Express app initialization
│   │   └── server.js                     # HTTP listener and graceful shutdown handling
│   ├── tests/                            # Automated integration test suites
│   │   ├── auth.test.js                  # Authentication and session tests
│   │   ├── vehicles.test.js              # Vehicle CRUD and validation tests
│   │   ├── drivers.test.js               # Driver registry tests
│   │   ├── trips.test.js                 # Trip dispatch state machine tests
│   │   └── maintenance.test.js           # Maintenance logging tests
│   ├── .env.example                      # Backend environment template
│   └── package.json                      # Backend dependencies and test scripts
├── docs/                                 # Technical documentation
│   ├── API.md                            # Comprehensive REST API endpoint contract
│   ├── DATABASE.md                       # Database schema and setup documentation
│   └── REPAIR_AUDIT.md                   # Detailed 13-section audit and repair report
├── package.json                          # Root orchestration package.json
└── README.md                             # This documentation file
```

---

## Quick Start & Setup Guide

### 1. Clone and Install Dependencies

Clone the repository and install all dependencies (root, client, and server) using the unified setup script:

```bash
git clone https://github.com/JagdeepMohanty/TransitOps-Odoo-Hackathon.git
cd TransitOps-Odoo-Hackathon

# Install root, client, and server dependencies in one command
npm run install:all
```

---

### 2. Configure Environment Variables

Create `.env` files for both server and client:

#### Backend Configuration (`server/.env`)
```bash
# Windows PowerShell
Copy-Item server/.env.example server/.env

# macOS / Linux
cp server/.env.example server/.env
```

Ensure `server/.env` contains valid credentials:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=mysql://root:yourpassword@localhost:3306/transitops
JWT_SECRET=transitops_super_secret_jwt_key_32_characters_minimum
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
```

> **Important Port Notice:** Port `5001` is used intentionally to prevent port collisions with Windows background services such as Intel Graphics Command Center (`OneApp.IGCC.WinService`) which occupies port `5000`.

#### Frontend Configuration (`client/.env`)
```bash
# Windows PowerShell
Copy-Item client/.env.example client/.env

# macOS / Linux
cp client/.env.example client/.env
```

Ensure `client/.env` contains:
```env
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=TransitOps
VITE_APP_VERSION=1.0.0
```

---

### 3. Database Setup

You can run MySQL natively or with Docker:

#### Option A: Docker Compose (Recommended for clean isolation)
If Docker is installed on your machine, create a quick container:
```bash
docker run --name transitops-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=transitops -p 3306:3306 -d mysql:8.0
```

#### Option B: Native MySQL Server
Log into your MySQL CLI:
```sql
CREATE DATABASE transitops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 4. Prisma Setup & Lifecycle

Run the Prisma workflow from the project root:

```bash
# Step 1: Generate the Prisma Client
npm run prisma:generate

# Step 2: Apply Database Migrations
npm run prisma:migrate

# Step 3: Seed Demo Roles, Users, and Sample Data
npm run prisma:seed
```

> **Windows File Lock Precaution:** Before running `npm run prisma:generate`, ensure any active backend server process is stopped. On Windows, Node.js holds a file lock on `query_engine-windows.dll.node`, which causes an `EPERM` rename error if regenerated while the server is running.

---

### 5. Running the Development Servers

Start both the backend API and frontend Vite development server concurrently:

```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check Probe:** [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## Available npm Scripts

All scripts can be run directly from the **project root**:

| Command | Action |
|---|---|
| `npm run dev` | Starts backend (port 5001) and frontend (port 5173) concurrently |
| `npm run server` | Starts backend server only with Nodemon auto-reload |
| `npm run client` | Starts Vite frontend development server only |
| `npm run install:all` | Concurrently installs dependencies for root, server, and client |
| `npm test` | Executes the complete backend test suite (69 integration tests) |
| `npm run build` | Builds the frontend for production into `client/dist` |
| `npm run prisma:generate` | Generates `@prisma/client` from `server/prisma/schema.prisma` |
| `npm run prisma:migrate` | Runs Prisma schema migrations against the configured database |
| `npm run prisma:seed` | Populates database with seed users and test records |

---

## Environment Variables Reference

### Backend (`server/.env`)
| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | No | Port on which Express listens | `5001` |
| `NODE_ENV` | No | Execution environment (`development`, `production`, `test`) | `development` |
| `DATABASE_URL` | **Yes** | MySQL connection URL (`mysql://USER:PWD@HOST:PORT/DB`) | `mysql://root:password@localhost:3306/transitops` |
| `JWT_SECRET` | **Yes** | Secret signing key for JWT tokens (min 16 chars) | `your_secure_random_key_here` |
| `JWT_EXPIRES_IN` | No | Token lifetime string | `8h` |
| `CLIENT_URL` | No | Allowed CORS origin for browser requests | `http://localhost:5173` |

### Frontend (`client/.env`)
| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | Base URL for REST API endpoints | `http://localhost:5001/api` |
| `VITE_APP_NAME` | No | Application branding name displayed in title bar | `TransitOps` |
| `VITE_APP_VERSION` | No | Current release version | `1.0.0` |

---

## Database Schema & Data Model

TransitOps uses a normalized relational schema managed by Prisma:

```mermaid
erDiagram
    Role ||--o{ User : "assigned to"
    User ||--o{ Trip : "created by"
    Vehicle ||--o{ Trip : "assigned to"
    Vehicle ||--o{ Maintenance : "has"
    Vehicle ||--o{ FuelLog : "logs"
    Vehicle ||--o{ Expense : " incurs"
    Driver ||--o{ Trip : "operates"
    Trip ||--o{ FuelLog : "associated with"
    Trip ||--o{ Expense : "generates"
```

### Core Models
- **`User` / `Role`**: Multi-role user accounts with hashed passwords and role identifiers (`FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`).
- **`Vehicle`**: Fleet vehicles with registration numbers, model, type, fuel type, maximum load capacity, current odometer, and status (`AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `OUT_OF_SERVICE`).
- **`Driver`**: Driver records with license number, license category, expiry date, contact info, availability, and safety score (0–100).
- **`Trip`**: Trips with cargo details, origin, destination, planned/actual start/end times, odometer logs, and lifecycle status (`DRAFT`, `DISPATCHED`, `COMPLETED`, `CANCELLED`).
- **`Maintenance`**: Maintenance records with service type, priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), cost, odometer, and status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **`FuelLog`**: Fuel logs with quantity (liters), cost per liter, total cost, fuel station name, and odometer reading.
- **`Expense`**: General expense entries with category (`FUEL`, `TOLL`, `MAINTENANCE`, `PARKING`, `REPAIR`, `OTHER`), amount, and optional vehicle/trip links.

---

## Role-Based Access Control (RBAC)

The application enforces fine-grained permissions at both the Express API middleware layer and the React route boundary:

| Feature / Resource | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| **Dashboard KPIs** | Read | Read | Read | Read |
| **Vehicles Registry** | Full CRUD | Read | Read | Read |
| **Driver Profiles** | Full CRUD | Read | Read + Edit Score | Read |
| **Trip Dispatcher** | Full CRUD | Create, Dispatch, Complete | Read | Read |
| **Maintenance Logs** | Full CRUD | Read | Full CRUD | Read |
| **Fuel Refill Logs** | Full CRUD | Read | Read | Full CRUD |
| **Operational Expenses** | Full CRUD | Read | Read | Full CRUD |
| **Reports & CSV Export** | Read + Export | Read | Read | Full CRUD + Export |

---

## Development Demo Accounts

When you run `npm run prisma:seed`, the database is populated with ready-to-use demo accounts for all operational roles:

| Role | Email | Password | Primary Scope |
|---|---|---|---|
| **Fleet Manager** | `admin@transitops.com` | `Admin@123` | Full access across all modules |
| **Dispatcher** | `dispatcher@transitops.com` | `Dispatcher@123` | Trip scheduling, dispatching, and completion |
| **Safety Officer** | `safety@transitops.com` | `Safety@123` | Driver compliance, safety scores, and maintenance |
| **Financial Analyst** | `finance@transitops.com` | `Finance@123` | Fuel logs, operational expenses, analytics & CSV |

> **Quick Fill on Login:** The `/login` page includes one-click role demo buttons that automatically pre-fill credentials for rapid testing and demonstrations.

---

## REST API Reference & Health Check Probes

All API routes are served under `/api` and return standardized JSON envelopes.

### Health Check Endpoint
- **URL:** `GET /api/health`
- **Behavior:**
  - When MySQL is connected: Returns HTTP `200 OK`
    ```json
    {
      "status": "ok",
      "timestamp": "2026-11-07T08:00:00.000Z",
      "uptime": 124.5,
      "environment": "development",
      "database": "connected"
    }
    ```
  - When MySQL is unreachable: Returns HTTP `503 Service Unavailable` with `database: "disconnected"` (Graceful Degradation).

### Summary of REST Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `POST` | `/api/auth/logout` | Invalidate user session | Authenticated |
| `GET` | `/api/dashboard` | Aggregated fleet KPIs and summary statistics | Authenticated |
| `GET` | `/api/vehicles` | List vehicles with search, status filters, and pagination | Authenticated |
| `POST` | `/api/vehicles` | Register a new fleet vehicle | Fleet Manager |
| `GET` | `/api/vehicles/:id` | Fetch vehicle details by ID | Authenticated |
| `PUT` | `/api/vehicles/:id` | Update vehicle details | Fleet Manager |
| `DELETE` | `/api/vehicles/:id` | Remove vehicle from registry | Fleet Manager |
| `GET` | `/api/drivers` | List drivers with search and status filters | Authenticated |
| `POST` | `/api/drivers` | Add a new driver | Fleet Manager |
| `GET` | `/api/drivers/:id` | Fetch driver details by ID | Authenticated |
| `PUT` | `/api/drivers/:id` | Update driver details or safety score | Manager / Safety |
| `DELETE` | `/api/drivers/:id` | Remove driver from registry | Fleet Manager |
| `GET` | `/api/trips` | List trips with pagination, status, and search filters | Authenticated |
| `POST` | `/api/trips` | Create a new DRAFT trip | Manager / Dispatcher |
| `GET` | `/api/trips/:id` | Fetch trip details by ID | Authenticated |
| `PUT` | `/api/trips/:id` | Update trip details (DRAFT status only) | Manager / Dispatcher |
| `POST` | `/api/trips/:id/dispatch` | Atomically dispatch trip (vehicle/driver -> ON_TRIP) | Manager / Dispatcher |
| `POST` | `/api/trips/:id/complete` | Complete trip, record odometer, restore availability | Manager / Dispatcher |
| `POST` | `/api/trips/:id/cancel` | Cancel trip and restore availability | Manager / Dispatcher |
| `DELETE` | `/api/trips/:id` | Delete trip (DRAFT status only) | Manager / Dispatcher |
| `GET` | `/api/maintenance` | List maintenance records | Authenticated |
| `POST` | `/api/maintenance` | Log a new maintenance schedule | Manager / Safety |
| `GET` | `/api/fuel-logs` | List fuel refill records | Authenticated |
| `POST` | `/api/fuel-logs` | Create fuel log entry | Manager / Finance |
| `GET` | `/api/expenses` | List expense records | Authenticated |
| `POST` | `/api/expenses` | Record operational expense | Manager / Finance |
| `GET` | `/api/reports` | Fleet analytics and financial summaries | Authenticated |
| `GET` | `/api/reports/export` | Download operational dataset as CSV | Authenticated |

---

## Testing & Quality Assurance

The backend includes a comprehensive automated test suite powered by the native Node.js test runner (`node --test`) and Supertest:

```bash
# Run all 69 integration tests across all modules
npm test
```

### Verified Test Matrix (69 of 69 passing):
- **Authentication (`tests/auth.test.js`):** 9 tests covering valid credentials, invalid password rejection, non-existent user handling, missing field rejection, malformed JWTs, profile extraction, and logout.
- **Vehicles (`tests/vehicles.test.js`):** 12 tests covering vehicle creation, duplicate registration rejection, pagination, availability filtering, single-record retrieval, odometer updates, and deletion.
- **Drivers (`tests/drivers.test.js`):** 10 tests covering driver creation, duplicate license rejection, invalid expiration date rejection, availability queries, safety score updates, and deletion.
- **Trips (`tests/trips.test.js`):** 29 tests validating the complete trip state machine: DRAFT creation, duplicate vehicle assignment checks, capacity validations, dispatch transitions, completion odometer validation, cancellation, and deletion constraints.
- **Maintenance (`tests/maintenance.test.js`):** 9 tests covering maintenance logging, priority assignment, status transitions, vehicle service history, and cost aggregations.

---

## Frontend Production Build

The frontend is optimized for production deployment via Vite:

```bash
# Build the production assets
npm run build
```

- **Output Directory:** `client/dist/`
- **Modules Transformed:** 2,562 modules compiled with zero errors.
- **Assets:** Minified JS bundle and purged Tailwind CSS.

---

## Troubleshooting Guide

### 1. Windows Port 5000 Conflict (`EADDRINUSE`)
- **Symptoms:** The backend crashes immediately on startup with `Error: listen EADDRINUSE: address already in use :::5000`.
- **Cause:** Windows systems frequently run the Intel Graphics Command Center (`OneApp.IGCC.WinService`) or Apple Bonjour on port `5000`.
- **Resolution:** TransitOps defaults to port `5001`. Always verify `PORT=5001` in `server/.env` and `VITE_API_URL=http://localhost:5001/api` in `client/.env`.

### 2. Prisma Engine DLL Lock on Windows (`EPERM`)
- **Symptoms:** Running `npm run prisma:generate` fails with `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`.
- **Cause:** An active Node.js server process holds a persistent file lock on the Prisma binary.
- **Resolution:** Terminate all running dev server processes (`Ctrl + C`) before executing `npm run prisma:generate`.

### 3. Graceful Degradation / Database Offline
- **Symptoms:** Health check `/api/health` returns status `503 Service Unavailable` with `database: "disconnected"`.
- **Cause:** MySQL server is stopped or `DATABASE_URL` credentials are misconfigured.
- **Resolution:** Start your MySQL instance (`net start MySQL80` or `docker start transitops-mysql`), verify user credentials, and check that the `transitops` database exists.

### 4. CORS Errors in Browser Console
- **Symptoms:** Browser console displays `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource`.
- **Resolution:** Verify `CLIENT_URL=http://localhost:5173` in `server/.env`. The backend CORS middleware explicitly permits requests originating from this URL.

---

## Team & Contributing

Developed for the **Odoo Hackathon**:
- **Jagdeep Mohanty** — Team Lead & Full-Stack Lead
- **Lacki** — Backend Developer
- **Tanya** — Frontend Developer
- **Niharika** — Frontend Developer

Refer to [`docs/REPAIR_AUDIT.md`](docs/REPAIR_AUDIT.md) for the complete engineering audit log across all phases of development.

---

## License

This project is licensed under the [MIT License](LICENSE).
