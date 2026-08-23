# Integrated Home Rental and Property Maintenance Management System
### Requirements Specification — for Antigravity build agent
**Course:** Systems Integration and Architecture — Mobile and Web Application Track
**Theme:** #2 — Integrated Home Rental and Property Maintenance Management System
**Team:** Solo

---

## 1. Project Summary

A three-role platform connecting property landlords, their tenants, and a platform-level superadmin. Landlords manage multiple properties and tenants; tenants submit maintenance requests and pay rent; superadmin oversees the whole platform (users, system health, audit trail). The system is one React codebase serving two experiences — a mobile-first installable PWA for tenants, and a web dashboard for landlord/superadmin — backed by a shared Express REST API on MongoDB, deployed entirely on Vercel.

The integration requirement is satisfied by **two** components (spec requires at least one; having two strengthens the defense):
1. **Workflow automation** — maintenance ticket status transitions trigger cascading side effects (notification creation, audit log entry, push dispatch) synchronously within the same request.
2. **Internal webhook/event simulation** — the mock payment confirmation endpoint fires an internal event (`EventEmitter`, same-request, same-process) that is handled synchronously to update payment status, write an audit entry, and enqueue a notification+push.

---

## 2. Roles & Scope

| Role | Scope | Key Capabilities |
|---|---|---|
| **Superadmin** | Platform-wide | View all landlords, properties, tenants, and leases. Suspend/reactivate any user account. View system-wide audit log and error/system log. Cannot create properties/leases/tickets (not their job) but can view everything for support/oversight. |
| **Landlord** | Own properties only | Create/manage properties and units. Create tenant accounts and assign them to a unit. Create payment records. Review/act on maintenance tickets. View own audit trail. Manage own profile/documents. |
| **Tenant** | Own lease only | View their unit/lease details. Submit maintenance tickets, track status, comment. View payment history, pay outstanding charges (simulated). Upload documents (ID, receipts). Receive notifications/push. |

**RBAC principle:** every data-fetching query is scoped server-side by role — landlords never see another landlord's data; tenants never see another tenant's data; only superadmin queries are unscoped (read-only on business data).

---

## 3. Data Model (MongoDB / Mongoose)

### User
```
_id, name, email (unique), passwordHash, role: enum[superadmin, landlord, tenant],
status: enum[active, suspended], landlordId (ref User, null unless role=tenant),
createdAt, updatedAt
```

### Property
```
_id, landlordId (ref User), name, address, createdAt, updatedAt
```

### Unit
```
_id, propertyId (ref Property), label (e.g. "Unit 2B"), monthlyRent,
tenantId (ref User, nullable — unassigned unit), leaseStart, leaseEnd (nullable),
status: enum[vacant, occupied], createdAt, updatedAt
```

### MaintenanceTicket
```
_id, unitId (ref Unit), tenantId (ref User), landlordId (ref User),
title, description, category, photoUrls: [String] (Cloudinary),
status: enum[submitted, acknowledged, in_progress, resolved, closed, rejected],
statusHistory: [{ status, changedBy, timestamp, note }],
createdAt, updatedAt
```

### Payment
```
_id, unitId (ref Unit), tenantId (ref User), landlordId (ref User),
amount, dueDate, status: enum[pending, paid, overdue],
mockTransactionId (nullable, set on payment), paidAt (nullable),
createdAt, updatedAt
```

### Document
```
_id, ownerId (ref User), unitId (ref Unit, nullable), type: enum[lease_agreement, id_upload, receipt, maintenance_photo],
cloudinaryUrl, uploadedAt
```

### Notification
```
_id, userId (ref User), type, message, relatedEntity: { kind, id },
read: Boolean, pushSent: Boolean, createdAt
```

### PushSubscription
```
_id, userId (ref User), subscriptionObject (VAPID endpoint/keys), createdAt
```

### AuditLog
```
_id, actorId (ref User), actorRole, action, entity: { kind, id },
beforeState (nullable), afterState (nullable), ipAddress, timestamp
```

---

## 4. Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | The system must allow all three roles to log in via JWT-based authentication. |
| FR-002 | The system must let a landlord create, edit, and view their own properties. |
| FR-003 | The system must let a landlord create units within a property and assign a monthly rent. |
| FR-004 | The system must let a landlord create a tenant account and assign that tenant to a specific unit. |
| FR-005 | The system must let a tenant submit a maintenance ticket with description, category, and optional photos. |
| FR-006 | The system must let a landlord transition a maintenance ticket through its defined status workflow. |
| FR-007 | The system must automatically write a status-history entry and audit log entry on every ticket status change. |
| FR-008 | The system must let a landlord create a payment record (amount + due date) against a tenant's unit. |
| FR-009 | The system must let a tenant simulate paying an outstanding payment record, generating a mock transaction ID and flipping status to paid. |
| FR-010 | The system must fire an internal event on payment confirmation that creates a notification and dispatches a browser push to the landlord. |
| FR-011 | The system must let tenants and landlords upload documents (lease agreements, ID, receipts, maintenance photos) to Cloudinary. |
| FR-012 | The system must let superadmin view a list of all users across all landlords and suspend or reactivate any account. |
| FR-013 | The system must let superadmin view a platform-wide audit log and system/error log. |
| FR-014 | The system must record every create/update/status-change/suspend action to the AuditLog collection. |
| FR-015 | The system must let users register a browser push subscription and receive push notifications for ticket updates and payment events. |
| FR-016 | The system must display a role-appropriate dashboard summarizing pending tickets, upcoming/overdue payments, and recent notifications. |
| FR-017 | The tenant-facing app must be installable as a PWA (manifest + service worker). |

*(17 FRs — exceeds the spec's 10-minimum.)*

---

## 5. Nonfunctional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR-001 | Passwords must be hashed with bcrypt; plaintext passwords are never stored or logged. | Security |
| NFR-002 | Every API route must verify JWT and enforce role-based + ownership-based authorization (landlord A cannot access landlord B's data). | Authorization |
| NFR-003 | All create/update/status-change/suspend actions must be recorded in the audit log with actor, timestamp, and before/after state. | Auditability |
| NFR-004 | All API inputs must be server-side validated (required fields, types, enum values) before persistence. | Reliability |
| NFR-005 | Dashboards must load key summary data (tickets, payments, notifications) in a single request per screen. | Usability |
| NFR-006 | Failed requests must return structured error responses with a human-readable message and HTTP status code. | Error Handling |
| NFR-007 | Uploaded documents must persist independently of server/function lifecycle (Cloudinary, not local disk — required given Vercel's ephemeral filesystem). | Availability |
| NFR-008 | API behavior must be documented in a hand-written Markdown reference covering every route, payload, and response shape. | Maintainability |
| NFR-009 | The tenant PWA must remain usable (cached shell, offline fallback page) if network connectivity drops mid-session. | Reliability |

*(9 NFRs — exceeds the spec's 8-minimum.)*

---

## 6. Integration Components (Required by Spec)

### 6.1 Workflow Automation — Maintenance Ticket Lifecycle
```
submitted → acknowledged → in_progress → resolved → closed
                 ↘ rejected
```
On every transition (single Express handler, synchronous):
1. Update `MaintenanceTicket.status` + append to `statusHistory`.
2. Write `AuditLog` entry.
3. Create `Notification` for the tenant (or landlord, if tenant-initiated action).
4. If the recipient has a `PushSubscription`, dispatch a real browser push via `web-push`.

### 6.2 Internal Webhook/Event Simulation — Payment Confirmation
```
POST /api/payments/:id/pay
  → flips Payment.status to "paid", sets mockTransactionId + paidAt
  → emits "payment.confirmed" on an in-request EventEmitter
  → listener (same process, same request lifecycle) handles the event:
      - writes AuditLog entry
      - creates Notification for landlord
      - dispatches push to landlord if subscribed
  → returns response only after the synchronous chain completes
```
**Architectural note for the write-up:** this EventEmitter pattern is intentionally scoped to a single request/response cycle, not a persistent cross-invocation listener — Vercel serverless functions are stateless between invocations, so a "fire and forget, handle later" pattern would silently drop events. Document this constraint explicitly in the Architecture Decision Record (§5.5 of the final paper) — it's a legitimate, defensible integration-pattern choice, not a shortcut.

---

## 7. Required Prototype Screens (mapped to roles)

| # | Screen | Roles |
|---|---|---|
| 1 | Login Page | All |
| 2 | Dashboard | All (role-specific content) |
| 3 | Property List | Landlord, Superadmin (read-only) |
| 4 | Property/Unit Details | Landlord, Superadmin (read-only) |
| 5 | Maintenance Ticket Submission Form | Tenant |
| 6 | Ticket Status/History View | Tenant, Landlord |
| 7 | Ticket Review & Status Update Page | Landlord |
| 8 | Comment/Feedback on Ticket | Tenant, Landlord |
| 9 | Notification Log Page | All |
| 10 | Audit Log Page | Landlord (own scope), Superadmin (platform-wide) |
| 11 | Payments/Reports Page | Tenant (pay + history), Landlord (create + view) |
| 12 | User & Tenant Management Page | Landlord (own tenants), Superadmin (all users, suspend) |

---

## 8. Out of Scope (document explicitly in §1.4 of final paper)

- Real payment gateway integration (Stripe/PayPal, etc.) — simulated only.
- Multi-currency support.
- SMS notifications (push + in-app only).
- Lease e-signature workflow.
- Automated recurring monthly invoice generation (payments are landlord-created on demand — documented decision, see §6 rationale above).

---

## 9. Build Phasing (solo-developer sequencing)

1. **Core data + auth:** User/Property/Unit models, JWT auth, RBAC middleware, seed script for demo accounts.
2. **Landlord + tenant core flows:** property/unit CRUD, tenant creation, ticket submission + status workflow (satisfies workflow-automation integration component).
3. **Payments + event simulation:** payment CRUD, pay endpoint, EventEmitter chain, audit logging (satisfies webhook-simulation integration component).
4. **Documents:** Cloudinary upload wiring for leases, IDs, receipts, ticket photos.
5. **Notifications + real push:** in-app notification center first (de-risked, always works), then VAPID + service worker push on top — treat push as an additive layer, not a blocking dependency for the rest of the app.
6. **Superadmin panel + audit/log views + PWA polish (manifest, offline fallback).**
7. **Testing evidence, diagrams, documentation, risk register, demo script.**

---

## 10. Testing Minimums (per spec §16 — track against this table)

| Test Type | Minimum |
|---|---|
| Functional Test Cases | 8 |
| Integration Test Cases | 5 |
| Error-Handling Test Cases | 5 |
| Security/Access-Control Test Cases | 3 |
| End-to-End Test Scenario | 1 |
