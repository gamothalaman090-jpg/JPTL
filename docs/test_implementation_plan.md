# JPTL Test Suite — Implementation Plan

> Based on gap analysis from `test_coverage_summary.md`
> Priority-ordered roadmap to achieve full test coverage across all 4 test categories.

---

## Phase Overview

| Phase | Focus | Est. Files | Priority |
|---|---|:---:|---|
| **Phase 1** | Fill critical missing coverage | 3 files | 🔴 Critical |
| **Phase 2** | Error handling — all modules | 14 `.test.js` additions | 🟠 High |
| **Phase 3** | Postman — missing + broken collections | 3 collections | 🟡 Medium |
| **Phase 4** | E2E — expand Playwright scenarios | 1 `e2e.spec.js` | 🟡 Medium |

---

## Phase 1 — Critical Gaps (Do First)

### 1.1 Create `leaseExtensions.test.js`

**File:** `apps/server/src/modules/landlord/leaseExtensions/leaseExtensions.test.js`

**Why:** The module has a full implementation (controller + service + routes) but zero tests. Any regression here is completely invisible.

**Test cases to write:**

```
GET  /api/landlord/leaseExtensions           → 200, returns list of extension requests
GET  /api/landlord/leaseExtensions/:id       → 200, returns single request detail
PATCH /api/landlord/leaseExtensions/:id      → 200, updates extension status
DELETE /api/landlord/leaseExtensions/:id     → 200, removes request

Error cases:
  GET  /api/landlord/leaseExtensions/:id   with bad ID  → 404
  PATCH /api/landlord/leaseExtensions/:id  as tenant    → 403
  GET  /api/landlord/leaseExtensions       no token     → 401
```

**Setup pattern** (match existing conventions):
```js
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../../../app.js';
import User from '../../../shared/models/user.model.js';
import Lease from '../../../shared/models/lease.model.js';
// ... seed landlord, tenant, unit, lease with extensionRequests in beforeAll
```

---

### 1.2 Fix `auth.json` Postman Assertions

**File:** `tests/auth.json`

**Why:** 4 requests exist (signup, login, change-password, logout) but there are **0 `pm.test()` calls** — Newman runs them but never validates.

**Assertions to add per request:**

| Request | Assertions |
|---|---|
| `POST /api/auth/signup` | `pm.response.to.have.status(201)`, `pm.expect(json.success).to.be.true`, `pm.expect(json.user.role).to.eql('landlord')` |
| `POST /api/auth/login` | `pm.response.to.have.status(200)`, `pm.expect(json.token).to.be.a('string')`, `pm.expect(pm.cookies.has('token')).to.be.true` |
| `PATCH /api/auth/change-password` | `pm.response.to.have.status(200)`, `pm.expect(json.success).to.be.true` |
| `POST /api/auth/logout` | `pm.response.to.have.status(200)`, verify `set-cookie` clears token |

---

## Phase 2 — Error Handling Tests

Add a dedicated `describe('Error Handling', ...)` block to each of the 14 modules below. Each block follows the same 3-case pattern:

```js
describe('Error Handling', () => {
  it('returns 401 when no auth token is provided', async () => { ... });
  it('returns 403 when wrong role accesses route', async () => { ... });
  it('returns 404 when resource ID does not exist', async () => { ... });
  // Module-specific cases below
});
```

### Error cases per module

#### 2.1 Landlord — Dashboard (`dash.test.js`)
```
401 → GET /api/landlord/dash    (no cookie)
403 → GET /api/landlord/dash    (tenant token)
```

#### 2.2 Landlord — Properties (`properties.test.js`)
```
401 → GET /api/landlord/properties         (no token)
403 → GET /api/landlord/properties         (tenant token)
404 → DELETE /api/landlord/properties/:id  (non-existent ID)
400 → POST /api/landlord/properties        (missing name/address)
```

#### 2.3 Landlord — Onboarding (`onboarding.test.js`)
```
401 → GET /api/landlord/onboarding/status  (no token)
400 → POST /api/landlord/onboarding/plan   (invalid plan value)
400 → POST /api/landlord/onboarding/units  (missing propertyId)
```

#### 2.4 Landlord — Rent Roll (`rentroll.test.js`)
```
401 → GET /api/landlord/rentroll           (no token)
403 → GET /api/landlord/rentroll           (tenant token)
404 → PATCH /api/landlord/rentroll/:id/mark-paid  (invalid ID)
400 → POST /api/landlord/rentroll          (missing unitId / amount)
```

#### 2.5 Landlord — Lease (`lease.test.js`)
```
401 → GET /api/landlord/lease/extensions   (no token)
404 → PATCH /api/landlord/lease/:id/extensions/:reqId/review  (bad IDs)
400 → PATCH review    (invalid status value, e.g. "maybe")
409 → PATCH approve   (already approved request)
```

#### 2.6 Landlord — Documents (`documents.test.js`)
```
401 → GET /api/landlord/documents          (no token)
403 → GET /api/landlord/documents          (tenant token)
404 → PATCH /api/landlord/documents/:id/verify  (invalid doc ID)
400 → PATCH verify    (invalid status value)
```

#### 2.7 Landlord — Tenant Directory (`tenantdirectory.test.js`)
```
401 → GET /api/landlord/tenantdirectory    (no token)
409 → POST /api/landlord/tenantdirectory   (duplicate email)
404 → GET /api/landlord/tenantdirectory/:id  (non-existent tenant)
400 → POST    (missing required fields: email, unitId, leaseStart)
```

#### 2.8 Tenant — Dashboard (`tenant/dash/dash.test.js`)
```
401 → GET /api/tenant/dash    (no token)
403 → GET /api/tenant/dash    (landlord token)
```

#### 2.9 Tenant — Announcements (`tenant/announcements/announcements.test.js`)
```
401 → GET /api/tenant/announcements        (no token)
404 → GET /api/tenant/announcements/:id    (invalid ID)
```

#### 2.10 Tenant — Tickets (`tenant/tickets/tickets.test.js`)
```
401 → POST /api/tenant/tickets             (no token)
400 → POST /api/tenant/tickets             (missing title / unitId)
404 → PATCH /api/tenant/tickets/:id/cancel (invalid ticket ID)
409 → PATCH cancel   (already resolved ticket)
```

#### 2.11 Tenant — Payments (`tenant/payments/payments.test.js`)
```
401 → GET /api/tenant/payments             (no token)
400 → POST /api/tenant/payments/pay        (amount ≤ 0 or missing paymentMethod)
409 → POST pay    (no pending payment exists)
400 → POST /api/tenant/payments/methods   (missing card brand/last4)
```

#### 2.12 Tenant — Lease (`tenant/lease/lease.test.js`)
```
401 → GET /api/tenant/lease                (no token)
403 → GET /api/tenant/lease                (landlord token)
409 → POST /api/tenant/lease/extension     (duplicate pending request)
400 → POST extension    (termMonths < 1 or missing proposedStartDate)
```

#### 2.13 Tenant — Documents (`tenant/documents/documents.test.js`)
```
401 → POST /api/tenant/documents           (no token)
400 → POST documents    (missing name / type)
404 → DELETE /api/landlord/documents/:id   (already deleted doc)
```

#### 2.14 Tenant — Dash (already combined with Landlord dash above)

---

## Phase 3 — Postman: Missing & Broken Collections

### 3.1 Fix `auth.json` — Add `pm.test()` Assertions
See Phase 1.2 above. Edit the `event[].script.exec` arrays for each item in the collection.

### 3.2 Create `superadmin.json` Postman Collection
New file: `tests/superadmin.json`

Map to the existing `superadmin.test.js` test structure:

```
POST /api/auth/superadmin/login     → 200, token returned
GET  /api/superadmin/users          → 200, array
POST /api/superadmin/users          → 201, user created
GET  /api/superadmin/properties     → 200, array
POST /api/superadmin/properties     → 201, property created
GET  /api/superadmin/units          → 200, array
POST /api/superadmin/units          → 201, unit created
GET  /api/superadmin/sessions       → 200, sessions + activeCount
DELETE /api/superadmin/units/:id    → 200
DELETE /api/superadmin/properties/:id → 200
POST /api/superadmin/system/maintenance  → 200, toggle
```

Add to `test:postman` script in root `package.json`:
```json
"test:postman": "... && newman run tests/superadmin.json"
```

### 3.3 Create `vehicle.json` Postman Collection
New file: `tests/vehicle.json`

```
POST /api/tenant/vehicles           → 201, vehicle created
GET  /api/tenant/vehicles           → 200, array (if GET exists)
DELETE /api/tenant/vehicles/:id     → 200, vehicle deleted
```

Add to `test:postman` in root `package.json`.

---

## Phase 4 — Expand E2E Playwright Scenarios

**File:** `tests/e2e.spec.js` — add new `describe` blocks:

### 4.1 Rent Roll Flow (Landlord)
```
test('4.1 Rent Roll tab lists payment records')
test('4.2 Generate invoice and mark as paid')
```

### 4.2 Lease Extension Flow
```
test('5.1 Tenant submits lease extension from portal')
test('5.2 Landlord reviews and approves extension')
```

### 4.3 Notifications Bell
```
test('6.1 Notification badge increments and clears on mark-all-read')
```

### 4.4 Superadmin Panel
```
test('7.1 Superadmin login and platform dashboard renders')
test('7.2 Enable and disable maintenance mode')
```

---

## Implementation Order (Recommended)

```
Week 1:
  [ ] Phase 1.1 — leaseExtensions.test.js
  [ ] Phase 1.2 — Fix auth.json assertions

Week 2:
  [ ] Phase 2 — Error handling blocks (14 modules)
      Start with: properties, tickets, rentroll, payments (highest business risk)
      Then: dash, announcements, documents, lease, tenantdirectory, onboarding
      Last: tenant-side duplicates of above

Week 3:
  [ ] Phase 3.2 — superadmin.json Postman collection
  [ ] Phase 3.3 — vehicle.json Postman collection
  [ ] Update test:postman script in package.json

Week 4:
  [ ] Phase 4 — Playwright E2E expansion
      Requires: seeded test data in running environment
```

---

## Run Commands Reference

```bash
# Integration tests (Jest)
npm run test:integration                     # from root
npm run test:integration --prefix apps/server  # from server

# Postman / Newman (server must be running on :8000)
npm run test:postman

# E2E (client must be running on :5173)
npm run test:e2e

# Run all
npm run test:all
```

---

## Acceptance Criteria

| Milestone | Definition of Done |
|---|---|
| Phase 1 complete | `leaseExtensions.test.js` passes; `auth.json` Newman shows 0 failures |
| Phase 2 complete | Every module has ≥ 1 error-handling `it()` case; CI passes |
| Phase 3 complete | `test:postman` runs 14+ collections with 0 assertion failures |
| Phase 4 complete | Playwright suite covers 15+ scenarios including rent roll and lease flow |
