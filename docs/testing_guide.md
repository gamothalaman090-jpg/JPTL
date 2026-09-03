# 🧪 Comprehensive Testing Guide — JPTL Property Management Platform

This document outlines the testing architecture, environment configuration, command-line instructions, and validation procedures across all 6 test categories:
1. **Functional Test Cases** (Playwright)
2. **Integration Test Cases** (Jest + Supertest + MongoDB Memory Server)
3. **Error-Handling Test Cases** (Postman / Newman CLI)
4. **Security / Access-Control Test Cases** (OWASP ZAP & Role-Based Middleware Guards)
5. **End-to-End (E2E) Test Scenarios** (Playwright Cross-Portal Workflows)
6. **Load Testing** (ApacheBench / `ab`)

---

## 🛠️ 1. Prerequisites & Environment Setup

### 1.1 Install Project Dependencies
Run from the repository root:
```bash
# Install root orchestration & testing packages (Playwright, Newman, ZAP client)
npm install

# Install server dependencies (Express, Mongoose, Jest, Supertest)
npm --prefix apps/server install

# Install client dependencies (React, Vite, Tailwind CSS)
npm --prefix apps/client install
```

### 1.2 Install Playwright Browser Engines
```bash
npx playwright install chromium
```

### 1.3 Install ApacheBench (`ab`) for Load Testing
- **Ubuntu / Debian**:
  ```bash
  sudo apt update && sudo apt install -y apache2-utils
  ```
- **macOS**:
  ```bash
  brew install httpd
  ```

---

## 🧩 2. Functional Test Cases (Playwright)

Functional testing verifies individual client UI components, responsive layout rendering, theme toggles, modal dialog interactions, form submissions, and input validation without side effects.

### How to Run:
```bash
# Run all functional UI tests
npm run test:functional

# Run with interactive Playwright UI mode
npx playwright test --ui

# Run in headed mode (watches Chromium browser window)
npx playwright test --headed
```

### Key Functional Test Scenarios:
- **Authentication**: Email format validation, password strength indicators, role redirect.
- **Landlord Dashboard**: Real-time KPI counter rendering, search filters, and theme switcher (`light` / `dark`).
- **Properties & Units**: Property card rendering, unit filter segmentation, delete property modal confirmation.
- **Maintenance Board**: Status badge rendering (`submitted`, `in_progress`, `resolved`), technician profile cards.
- **Tenant Portal**: Digital lease agreement viewer, rent payment checkout flow, maintenance submission form.

---

## 🔗 3. Integration Test Cases (Jest & Supertest)

Integration tests validate backend controller-service pipelines, database transactions, role-based middleware guards, and cascading deletions using an in-memory database (`mongodb-memory-server`) with zero external DB dependencies.

### How to Run:
```bash
# Run all server integration tests
npm run test:integration

# Or run from inside apps/server
cd apps/server
npm run test:integration

# Run a specific test suite
npm run test:integration src/modules/landlord/properties/properties.test.js
npm run test:integration src/modules/landlord/tickets/tickets.test.js
npm run test:integration src/modules/tenant/lease/lease.test.js
```

### Available Test Suites:
| Test Suite File | Tested Endpoints / Features |
| :--- | :--- |
| [`properties.test.js`](file:///home/ian/Desktop/Work/JPTL/apps/server/src/modules/landlord/properties/properties.test.js) | Property CRUD, unit additions, and cascade deletion of vacant units (`DELETE /api/landlord/properties/:id`). |
| [`tickets.test.js`](file:///home/ian/Desktop/Work/JPTL/apps/server/src/modules/landlord/tickets/tickets.test.js) | Tenant ticket submission, landlord queue listing, technician assignment, status transitions, and audit logging. |
| [`lease.test.js`](file:///home/ian/Desktop/Work/JPTL/apps/server/src/modules/tenant/lease/lease.test.js) | Digital lease contract query, renewal request submission (`POST /api/tenant/lease/extension`), and landlord approval workflow. |

---

## ⚠️ 4. Error-Handling Test Cases (Postman / Newman)

Error-handling tests verify that invalid payloads, malformed JSON, missing required fields, non-existent entity IDs, and duplicate unique keys return appropriate HTTP status codes (`400 Bad Request`, `404 Not Found`, `409 Conflict`) with clear structured error responses (`{ success: false, message: "..." }`).

### How to Run:
```bash
# Start the local development server first
npm --prefix apps/server run dev

# In another terminal, run all Postman collections via Newman:
npm run test:postman
```

### Individual Collection Execution:
```bash
# Test Auth Error-Handling (Invalid credentials, duplicate email)
npx newman run tests/auth.json

# Test Properties Error-Handling (Missing name/address, deleting occupied property)
npx newman run tests/properties.json

# Test Maintenance Error-Handling (Invalid status enum, unassigned tenant)
npx newman run tests/tickets.json

# Test Lease Error-Handling (Invalid term parameter <= 0)
npx newman run tests/lease.json

# Test Rent Roll & Payment Invoicing Error-Handling
npx newman run tests/rentroll.json
```

---

## 🔒 5. Security & Access-Control Test Cases (OWASP ZAP & RBAC)

Security tests verify Role-Based Access Control (RBAC), JWT authentication verification, cookie tampering protection, cross-tenant isolation, and common web application security vulnerabilities.

### 5.1 Automated RBAC Middleware Verification
- **Tenant accessing Landlord route** (`GET /api/landlord/dash` with `tenant` token) ➔ **`403 Forbidden`**.
- **Landlord accessing Tenant routes** (`POST /api/tenant/tickets` with `landlord` token) ➔ **`403 Forbidden`**.
- **Unauthenticated requests** (No JWT cookie) ➔ **`401 Unauthorized`**.
- **Cross-Landlord Data Isolation**: A landlord cannot query or delete properties belonging to another landlord ID ➔ **`403 Forbidden` / `404 Not Found`**.

### 5.2 Dynamic Security Scan via OWASP ZAP CLI / Docker
Run a baseline security scan against the running API:
```bash
# Pull official OWASP ZAP Docker image
docker pull zaproxy/zap-stable

# Run ZAP Baseline API Scan against running backend
docker run -t --net=host zaproxy/zap-stable zap-baseline.py \
  -t http://localhost:3000/api/health \
  -r zap_report.html
```

---

## 🌐 6. End-to-End (E2E) Test Scenario (Playwright)

End-to-end tests simulate real-world user journeys across multiple roles:
1. **Landlord Journey**: Log in ➔ Create Property "Aura Sky Towers" ➔ Add Unit 14B ➔ Invite Tenant "Sophia Lin".
2. **Tenant Journey**: Log in with credentials ➔ Review Digital Lease Agreement ➔ Submit Plumbing Repair Ticket ➔ Request 12-Month Lease Extension.
3. **Landlord Resolution Journey**: View incoming ticket ➔ Dispatch technician ➔ Approve 12-month lease renewal ➔ Mark ticket resolved.

### How to Run:
```bash
# Ensure both server and client dev servers are running:
# Terminal 1: npm --prefix apps/server run dev
# Terminal 2: npm --prefix apps/client run dev

# In Terminal 3, execute E2E test suite:
npm run test:e2e
```

---

## ⚡ 7. Load Testing via ApacheBench (`ab`)

Load tests benchmark server throughput (Requests Per Second - RPS), latency distributions, and socket concurrency under high traffic volumes.

### How to Run:

#### Option A: Using the built-in automated load script
```bash
# Run default benchmark (1,000 requests, concurrency = 50)
npm run test:load

# Custom parameters: ./scripts/load-test.sh <HOST> <REQUESTS> <CONCURRENCY>
./scripts/load-test.sh http://localhost:3000 5000 100
```

#### Option B: Direct ApacheBench CLI Commands
```bash
# 1. Health check baseline benchmark (1,000 requests, 50 concurrency)
ab -n 1000 -c 50 http://localhost:3000/api/health

# 2. Heavy concurrency test (5,000 requests, 100 concurrency)
ab -n 5000 -c 100 http://localhost:3000/api/health

# 3. Authenticated endpoint load test (using cookie session)
ab -n 500 -c 25 -C "token=YOUR_JWT_TOKEN_HERE" http://localhost:3000/api/landlord/properties
```

### Expected Benchmark Thresholds:
- **Requests per second (RPS)**: `> 800 req/sec` for health/cached endpoints.
- **Time per request (mean)**: `< 60 ms` at 50 concurrency.
- **Failed requests**: `0`.

---

## 📋 8. Quick Command Cheat Sheet

| Test Category | Command | Target Component |
| :--- | :--- | :--- |
| **All Integration Tests** | `npm run test:integration` | Jest + Supertest (In-Memory DB) |
| **All Postman Suites** | `npm run test:postman` | Newman CLI (API Error Handling) |
| **Functional Tests** | `npm run test:functional` | Playwright UI Engine |
| **End-to-End Tests** | `npm run test:e2e` | Playwright Multi-Role Workflows |
| **ApacheBench Load Test** | `npm run test:load` | ApacheBench (`ab`) Throughput Benchmark |
| **Run Everything (CI Pipeline)** | `npm run test:all` | Integration + Postman Suites |
