# Tenant Portal & Lease Management Module Documentation

## 1. Module Overview
Provides a mobile-first, responsive resident experience (designed as an installable PWA). Tenants can view their active unit status, review digital lease agreements, submit lease extension requests, view landlord contacts, and configure personal notification settings.

---

## 2. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Main Page**: `pages/TenantPortalPage.jsx`
  - Resident navigation tabs: Overview, Rent & Payments, Maintenance, Lease, Documents, Announcements, Settings.
  - Multi-tenant switcher for testing and demonstration.
  - Dark/Light mode theme persistence.
- **Components**:
  - `components/tenant/TenantSidebar.jsx`: Mobile and desktop collapsible navigation bar.
  - `components/tenant/TenantOverviewTab.jsx`: Resident dashboard with next payment due, open maintenance ticket alert, and quick action cards.
  - `components/tenant/TenantLeaseTab.jsx`: Digital lease terms, monthly rent, deposit amount, lease start/end dates, downloadable agreement PDF viewer.
  - `components/tenant/LeaseRenewalModal.jsx`: Interactive modal to request a lease extension (6 months, 12 months, custom term) with proposed start date.
  - `components/tenant/TenantSettingsTab.jsx`: Resident profile management, password updates, push notifications toggle, and emergency contacts.

### Backend (`apps/server/src`)
- **Tenant Dashboard**: `modules/tenant/dash/`
  - `dash.routers.js`: Exposes `/api/tenant/dash` and `/api/tenant/dash/kpi`.
  - `dash.controller.js`: Returns tenant's active unit, property address, landlord contact, upcoming payments, open tickets, and pinned announcements.
  - `dash.service.js`: Gathers unified tenant context in a single optimized DB roundtrip.

---

## 3. API Endpoints Reference

### Tenant Dashboard (`/api/tenant/dash`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tenant/dash` | Tenant | Complete resident dashboard payload |
| `GET` | `/api/tenant/dash/kpi` | Tenant | Quick counts (open tickets, overdue payments, days until next rent) |

### Tenant Lease API (`/api/tenant/lease`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`  | `/api/tenant/lease` | Tenant | Fetch active lease details, covenants, financial terms, and days remaining |
| `POST` | `/api/tenant/lease/extension` | Tenant | Submit formal lease renewal / extension request (`termMonths`, `proposedStartDate`, `notes`) |
| `GET`  | `/api/tenant/lease/document` | Tenant | Retrieve signed digital lease contract metadata & download URL |

### Landlord Lease Extension Review API (`/api/landlord/lease`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`   | `/api/landlord/lease/extensions` | Landlord | List all pending/historical extension requests across managed properties |
| `PATCH` | `/api/landlord/lease/:leaseId/extensions/:requestId/review` | Landlord | Approve or reject extension request (updates `Unit.leaseEnd` automatically on approval) |

---

## 4. Mobile & PWA Specifications
- **Manifest**: `manifest.json` configured for standalone installation on mobile home screens.
- **Offline Shell**: Service worker caching of portal assets for offline resiliency.
- **Push Subscriptions**: Web Push notification receiver for rent reminders and ticket progress updates.
