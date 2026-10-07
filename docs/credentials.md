# Demo User Credentials & Accounts

This document contains all default and seeded login credentials for local testing, staging, and demo environments.

---

## 1. Quick Reference

| Role | Name | Email | Password | Assigned Property / Unit | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Superadmin** | System Superadmin | `superadmin@jptl.sys` | `admin123` | *Global System Admin* | Active |
| **Landlord** | Alexander Vance | `landlord@jptl.dev` | `Password123!` | *Owner / Manager of all seeded properties* | Active |
| **Tenant 1** | Sophia Lin | `sophia@jptl.dev` | `Password123!` | Unit 14B · Aura Sky Towers & Residences | Active |
| **Tenant 2** | Liam Carter | `liam@jptl.dev` | `Password123!` | Loft 304 · Vantro Executive Lofts | Active |
| **Tenant 3** | David K. Miller | `david@jptl.dev` | `Password123!` | Villa 04 · Solis Villa Estate & Spa | Active |
| **Tenant 4** | Elena Rostova | `elena@jptl.dev` | `Password123!` | *(Pre-added / Unassigned)* | Pre-added |

---

## 2. Account Details & Scenarios

### Superadmin
- **Email:** `superadmin@jptl.sys`
- **Password:** `admin123`
- **Script:** Generated via `apps/server/scripts/create-superadmin.js`
- **Permissions:** Full system access, audit logs, tenant/landlord directory management, platform-level operations.

### Landlord: Alexander Vance
- **Email:** `landlord@jptl.dev`
- **Password:** `Password123!`
- **Plan:** Pro (active)
- **Properties Owned:**
  - Aura Sky Towers & Residences
  - Vantro Executive Lofts
  - Solis Villa Estate & Spa
  - Lumina Green Park Apartments
  - Nexus Commercial Center
- **Use Case:** Managing leases, properties, units, maintenance tickets, announcements, and rent collection.

### Tenant 1: Sophia Lin (Active / With Parking)
- **Email:** `sophia@jptl.dev`
- **Password:** `Password123!`
- **Unit:** Unit 14B (Aura Sky Towers & Residences)
- **Monthly Rent:** $2,400 + $150 Parking (Bay #14B L2)
- **Payments:**
  - August 2026: **Paid** (Visa ending in 4242)
  - September 2026: **Pending**
- **Tickets:** Active HVAC repair ticket (`in_progress`).
- **Documents:** Signed lease, government ID, renters insurance pending review.

### Tenant 2: Liam Carter (Active / No Parking)
- **Email:** `liam@jptl.dev`
- **Password:** `Password123!`
- **Unit:** Loft 304 (Vantro Executive Lofts)
- **Monthly Rent:** $1,950
- **Payments:**
  - August 2026: **Paid** (Chase ACH ending in 9102)
  - September 2026: **Pending**
- **Tickets:** Plumbing maintenance ticket (`submitted`).
- **Documents:** Employment verification document.

### Tenant 3: David K. Miller (Active / Overdue Rent)
- **Email:** `david@jptl.dev`
- **Password:** `Password123!`
- **Unit:** Villa 04 (Solis Villa Estate & Spa)
- **Monthly Rent:** $4,500 + $200 Parking (Driveway Bay #4)
- **Payments:**
  - August 2026: **Overdue**
- **Tickets:** Smart lock battery replacement (`resolved`).
- **Documents:** Pet vaccination certificate (`rejected`).

### Tenant 4: Elena Rostova (Pre-added / Applicant)
- **Email:** `elena@jptl.dev`
- **Password:** `Password123!`
- **Unit:** None assigned (`pre_added` status)
- **Use Case:** Testing tenant onboarding, invitation acceptance, and unit assignment workflows.

---

## 3. Database Seeding Commands

The seeder defaults to a dry-run and does not connect to MongoDB. It is restricted
to explicitly named non-production databases (`dev`, `test`, `demo`, or `local`).
Do not run it against production.

Dry-run:
```bash
npm run seed --prefix apps/server
```

Execution is only for a non-production demo database:
```bash
ALLOW_DEMO_SEED=1 npm run seed --prefix apps/server -- --execute
```

There is no combined seed-and-purge command.

To create/update the Superadmin user:
```bash
bun run scripts/create-superadmin.js
```
