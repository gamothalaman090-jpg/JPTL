# JPTL System Modules Status & Checklist

This document tracks the implementation status of all platform modules across **Landlord**, **Tenant**, and **Superadmin** roles for both the Frontend (React Client) and Backend (Express REST API).

---

## 🏷️ Status Legend

- **`[x] COMPLETED`** — Feature is fully designed in Frontend and supported by Backend API.
- **`[!] NEEDS REDO / REVISION`** — Feature is partially built, uses mock data only in the UI, or requires code revisions / missing actions (e.g. Delete Property).
- **`[ ] MISSING`** — Module has not been implemented in the UI and/or Backend.

---

## 🏢 1. Landlord Portal

| Status | Module / Feature | Frontend (UI) | Backend (API) | Details / Action Items |
| :---: | :--- | :---: | :---: | :--- |
| **`[x]`** | **Dashboard with KPI** | `Created` | `Created` | KPI cards, occupancy rates, financial summaries (`/api/landlord/dash`). |
| **`[x]`** | **Announcements Page** | `Created` | `Created` | Create, pin, and broadcast announcements to tenants (`/api/landlord/announcements`). |
| **`[x]`** | **Rent Transactions (Rent Roll)** | `Created` | `Created` | Invoice creation, payment records, CSV export, mark-as-paid (`/api/landlord/rentroll`). |
| **`[!]`** | **Maintenance Ticketing** | `Created (UI)` | `Missing (API)` | **Needs Redo / Backend**: UI has ticket filtering and technician assignment, but lacks dedicated server endpoints (`/api/landlord/tickets`) for status transitions. |
| **`[!]`** | **Properties & Units Management** | `Partial` | `Partial` | **Needs Revision**: <br>1. **Add Delete Property action** in UI and server (`DELETE /api/landlord/properties/:id`).<br>2. Add full CRUD endpoints outside onboarding. |
| **`[x]`** | **Tenants Directory** | `Created` | `Created` | Create tenant account (auto-hash password, assign unit, invite) via `/api/landlord/tenantdirectory`. |
| **`[!]`** | **Resident Compliance Vault** | `Created (UI)` | `Missing (API)` | **Needs Backend Integration**: UI has document inspection & verification modal (`LandlordDocumentsTab`), but lacks backend endpoints (`/api/landlord/documents`). |

---

## 👤 2. Tenant Portal

| Status | Module / Feature | Frontend (UI) | Backend (API) | Details / Action Items |
| :---: | :--- | :---: | :---: | :--- |
| **`[x]`** | **Tenant Dashboard** | `Created` | `Created` | Overview cards, upcoming dues, quick action shortcuts (`/api/tenant/dash`). |
| **`[x]`** | **Rent & Payments** | `Created` | `Created` | Full ledger, checkout modal, auto-pay toggle, saved payment methods (`/api/tenant/payments`). |
| **`[!]`** | **Maintenance (Ticketing)** | `Created (UI)` | `Missing (API)` | **Needs Backend Integration**: Ticket creation (`ReportIssueModal`) and history currently run on mock state. Needs `POST /api/tenant/tickets`. |
| **`[!]`** | **Lease Management** | `Created (UI)` | `Missing (API)` | **Needs Backend Integration**: Digital lease agreement view & extension request modal (`TenantLeaseTab`) need backend API endpoints (`/api/tenant/lease`). |
| **`[!]`** | **Documents & Verification** | `Created (UI)` | `Missing (API)` | **Needs Backend Integration**: Document submission modal (`SubmitDocumentModal`) needs Cloudinary upload & `/api/tenant/documents` API. |

---

## 🛡️ 3. Superadmin Portal

| Status | Module / Feature | Frontend (UI) | Backend (API) | Details / Action Items |
| :---: | :--- | :---: | :---: | :--- |
| **`[ ]`** | **System & Audit Logs** | `Missing` | `Missing` | View system error logs and platform-wide audit trail (`/api/superadmin/audit-logs`). |
| **`[ ]`** | **User Management** | `Missing` | `Missing` | Cross-platform user list, account suspension, and reactivation (`/api/superadmin/users`). |
| **`[ ]`** | **Landlord Management** | `Missing` | `Missing` | Platform-wide landlord directory, property count metrics, and oversight (`/api/superadmin/landlords`). |

---

## 📋 Summary of Next Tasks

### High Priority (Needs Redo / Revisions)
1. **Property Deletion**: Add Delete Property button in UI modal/cards and create `DELETE /api/landlord/properties/:id` with cascade handling (or unassigning units).
2. **Maintenance Ticket Workflow API**: Create `/api/landlord/tickets` and `/api/tenant/tickets` with status transition lifecycle (`submitted` → `acknowledged` → `in_progress` → `resolved` / `rejected`).
3. **Documents / Compliance Vault API**: Create `/api/tenant/documents` (upload/submit) and `/api/landlord/documents` (approve/reject compliance items).
4. **Lease Extension API**: Wire `/api/tenant/lease` extension requests to Landlord notification/approval flow.

### Medium Priority (Missing Modules)
1. **Superadmin Portal Dashboard & Navigation**: Build `/admin` route or superadmin layout in client.
2. **Superadmin API**: Build `/api/superadmin/users`, `/api/superadmin/audit-logs`, and `/api/superadmin/landlords`.
