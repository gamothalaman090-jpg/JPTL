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
| **`[x]`** | **Maintenance Ticketing** | `Created` | `Created` | Dedicated backend API (`/api/landlord/tickets`) for status transitions (`submitted` ➔ `acknowledged` ➔ `in_progress` ➔ `resolved`), technician dispatch, and queue filters. |
| **`[x]`** | **Properties & Units Management** | `Created` | `Created` | Full CRUD for properties and units + **Delete Property** (`DELETE /api/landlord/properties/:id`) with safety & vacancy checks. |
| **`[x]`** | **Tenants Directory** | `Created` | `Created` | Create tenant account (auto-hash password, assign unit, invite) via `/api/landlord/tenantdirectory`. |
| **`[!]`** | **Resident Compliance Vault** | `Created (UI)` | `Missing (API)` | **Needs Backend Integration**: UI has document inspection & verification modal (`LandlordDocumentsTab`), but lacks backend endpoints (`/api/landlord/documents`). |

---

## 👤 2. Tenant Portal

| Status | Module / Feature | Frontend (UI) | Backend (API) | Details / Action Items |
| :---: | :--- | :---: | :---: | :--- |
| **`[x]`** | **Tenant Dashboard** | `Created` | `Created` | Overview cards, upcoming dues, quick action shortcuts (`/api/tenant/dash`). |
| **`[x]`** | **Rent & Payments** | `Created` | `Created` | Full ledger, checkout modal, auto-pay toggle, saved payment methods (`/api/tenant/payments`). |
| **`[x]`** | **Maintenance (Ticketing)** | `Created` | `Created` | Issue submission (`POST /api/tenant/tickets`), live status timeline, cancellation, and technician details. |
| **`[x]`** | **Lease Management** | `Created` | `Created` | Digital contract inspection (`GET /api/tenant/lease`), renewal request submission (`POST /api/tenant/lease/extension`), and landlord approval workflow (`PATCH /api/landlord/lease/:id/extensions/:reqId/review`). |
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

### High Priority
1. **Documents / Compliance Vault API**: Create `/api/tenant/documents` (upload/submit) and `/api/landlord/documents` (approve/reject compliance items with Cloudinary storage).
2. **Superadmin Portal Dashboard & API**:
   - Build `/api/superadmin/audit-logs` (platform-wide logs)
   - Build `/api/superadmin/users` (suspend/reactivate users)
   - Build `/api/superadmin/landlords` (platform landlord oversight)
   - Build `SuperadminPage.jsx` in client

---

## 🧪 Testing Documentation
Full instructions for running all 6 testing categories (Functional, Integration, Postman Error-Handling, Security RBAC, End-to-End, and ApacheBench Load Testing) are documented in [docs/testing_guide.md](file:///home/ian/Desktop/Work/JPTL/docs/testing_guide.md).
