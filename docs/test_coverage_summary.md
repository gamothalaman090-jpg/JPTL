# JPTL Server Routes — Test Coverage Summary

> **Generated:** 2026-10-05 | Analyzed 19 test files across `apps/server/src/modules/` + `tests/` (Postman + Playwright)

---

## Test Infrastructure Overview

| Layer | Tool | Count | Location |
|---|---|---|---|
| **Integration / Unit (API)** | Jest + Supertest + MongoMemoryServer | 18 `.test.js` | `apps/server/src/modules/**/` |
| **Unit (Service, mocked)** | Bun:test + mocks | 1 `.test.js` | `tenant/vehicle/` |
| **Functional (API Contract)** | Postman / Newman | 12 collections | `tests/*.json` |
| **End-to-End (UI)** | Playwright (Chromium) | 1 `e2e.spec.js` | `tests/e2e.spec.js` |

---

## Postman Collection Stats

| Collection | Requests | `pm.test` Assertions |
|---|:---:|:---:|
| `auth.json` | 4 | **0** ⚠️ |
| `dashboard.json` | 9 | 13 |
| `onboarding.json` | 4 | 15 |
| `properties.json` | 9 | 14 |
| `tickets.json` | 11 | 18 |
| `lease.json` | 8 | 13 |
| `documents.json` | 14 | 21 |
| `rentroll.json` | 14 | 23 |
| `tenantdirectory.json` | 13 | 19 |
| `tenantpayments.json` | 12 | 19 |
| `announcements.json` | 10 | 16 |
| `notifications.json` | 4 | 6 |
| **leaseExtensions** | ❌ missing | ❌ missing |

> ⚠️ `auth.json` has 4 requests but **zero `pm.test()` assertions** — the collection makes calls but does not validate responses.

---

## Per-Module Coverage Matrix

| Module | Route Prefix | Jest Integration | Postman | Error Handling | E2E |
|---|---|:---:|:---:|:---:|:---:|
| **Auth** | `/api/auth` | ✅ 7 cases | ⚠️ 0 assertions | ✅ 409, 400, 401 | ✅ |
| **Superadmin** | `/api/superadmin` | ✅ 12 cases | ❌ missing | ✅ 403, 401, 503 | ❌ |
| **Landlord – Dashboard** | `/api/landlord/dash` | ✅ 4 cases | ✅ 13 | ⚠️ none | ❌ |
| **Landlord – Properties** | `/api/landlord/properties` | ✅ 4 cases | ✅ 14 | ⚠️ none | ❌ |
| **Landlord – Onboarding** | `/api/landlord/onboarding` | ✅ 5 cases | ✅ 15 | ⚠️ none | ❌ |
| **Landlord – Announcements** | `/api/landlord/announcements` | ✅ 5 cases | ✅ 16 | ✅ 403 | ✅ |
| **Landlord – Tickets** | `/api/landlord/tickets` | ✅ 5 cases | ✅ 18 | ⚠️ none | ✅ |
| **Landlord – Rent Roll** | `/api/landlord/rentroll` | ✅ 6 cases | ✅ 23 | ⚠️ none | ❌ |
| **Landlord – Lease** | `/api/landlord/lease` | ✅ 2 cases | ✅ 13 | ⚠️ none | ❌ |
| **Landlord – LeaseExtensions** | `/api/landlord/leaseExtensions` | ❌ MISSING | ❌ MISSING | ❌ MISSING | ❌ |
| **Landlord – Documents** | `/api/landlord/documents` | ✅ 3 cases | ✅ 21 | ⚠️ none | ❌ |
| **Landlord – Tenant Directory** | `/api/landlord/tenantdirectory` | ✅ 5 cases | ✅ 19 | ⚠️ none | ❌ |
| **Tenant – Dashboard** | `/api/tenant/dash` | ✅ 2 cases | ✅ 13 | ⚠️ none | ❌ |
| **Tenant – Announcements** | `/api/tenant/announcements` | ✅ 2 cases | ✅ 16 | ⚠️ none | ❌ |
| **Tenant – Tickets** | `/api/tenant/tickets` | ✅ 4 cases | ✅ 18 | ⚠️ none | ❌ |
| **Tenant – Payments** | `/api/tenant/payments` | ✅ 5 cases | ✅ 19 | ⚠️ none | ❌ |
| **Tenant – Lease** | `/api/tenant/lease` | ✅ 5 cases | ✅ 13 | ⚠️ none | ❌ |
| **Tenant – Documents** | `/api/tenant/documents` | ✅ 5 cases | ✅ 21 | ⚠️ none | ❌ |
| **Tenant – Vehicle** | `/api/tenant/vehicles` | ✅ 8 cases | ❌ missing | ✅ 400, 404 | ❌ |
| **Notifications** | `/api/notifications` | ✅ 5 cases | ✅ 6 | ✅ 401 | ❌ |

---

## Coverage Assessment by Category

### ✅ Functional Test Cases
All 19 modules have happy-path functional coverage via Jest integration tests. Postman covers 12 of 19 modules with `pm.test()` assertions validating response shape and status codes.

**Gaps:**
- `auth.json` — 4 requests, 0 test assertions
- `superadmin` — no Postman collection
- `tenant/vehicle` — no Postman collection
- `leaseExtensions` — no coverage at all

---

### ✅ Integration Test Cases
18/19 modules have integration test files using the real Express app against `MongoMemoryServer`:
- **`supertest`** — real HTTP layer
- **`MongoMemoryServer`** — isolated in-memory MongoDB per suite
- **`jwt.sign()`** — pre-minted tokens for role-based access
- **Seeded fixtures** — User, Property, Unit, Lease in `beforeAll`

**Gap:** `landlord/leaseExtensions` has controller + service + routes but **no `.test.js`**.

---

### ⚠️ Error Handling Test Cases
Only 5 of 19 modules explicitly test error paths:

| Module | Errors Covered |
|---|---|
| `auth.test.js` | 409 duplicate email, 400 weak password, 401 wrong password |
| `announcements.test.js` | 403 tenant blocked from landlord endpoint |
| `superadmin.test.js` | 403 RBAC, 401 unauthenticated, 503 maintenance mode |
| `notifications.test.js` | 401 missing token |
| `vehicle.test.js` | 400 missing required fields, 404 not found |

**Missing across 14 modules:**
- `401` — no/expired token on protected routes
- `403` — cross-role access (tenant using landlord routes, vice versa)
- `404` — invalid/non-existent resource IDs
- `400` — missing required body fields, invalid enums, malformed dates
- Business-rule conflicts — duplicate extension requests, re-paying paid invoices

---

### ✅ End-to-End Test Scenarios
9 Playwright scenarios in `tests/e2e.spec.js` (Chromium → `http://localhost:5173`):

| ID | Scenario |
|---|---|
| 1.1 | Login page renders with correct fields |
| 1.2 | Invalid credentials show error |
| 1.3 | Landlord login → `/dashboard` |
| 1.4 | Tenant login → `/tenant` |
| 2.1 | Landlord tab navigation |
| 2.2 | Create and delete announcement |
| 3.1 | Tenant maintenance tab + modal |
| 3.2 | Tenant payments tab + conditional fees |
| 3.3 | Tenant documents tab renders |

**Missing E2E:** Rent Roll, Lease flow, Notifications, Superadmin panel, Document upload

---

## Score Card

| Category | Coverage | Score |
|---|---|:---:|
| Functional Tests | All modules covered; 1 Postman file has 0 assertions | 18.5 / 19 |
| Integration Tests | Strong; 1 module fully unwritten | 18 / 19 |
| Error Handling | Sparse — only 5 modules | 5 / 19 |
| E2E Scenarios | Core flows covered | 9 scenarios |

---

## Critical Gaps (Priority Order)

| # | Gap | Severity |
|---|---|---|
| 1 | `leaseExtensions` — zero coverage (no Jest, no Postman, no E2E) | 🔴 Critical |
| 2 | `auth.json` Postman — 4 requests, 0 assertions | 🔴 Critical |
| 3 | Error handling — 14 modules missing negative-path tests | 🟠 High |
| 4 | `superadmin` — no Postman collection | 🟡 Medium |
| 5 | `vehicle` — no Postman collection | 🟡 Medium |
| 6 | E2E — Rent Roll, Lease, Documents, Notifications uncovered | 🟡 Medium |
