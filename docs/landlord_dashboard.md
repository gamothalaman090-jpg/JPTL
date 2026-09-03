# Landlord Dashboard & KPI Module Documentation

## 1. Module Overview
Provides a centralized operations center for landlords to monitor key portfolio performance indicators (KPIs), view occupancy distributions, track delinquent rent, and review recent maintenance and financial alerts.

---

## 2. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Page**: `pages/DashboardPage.jsx`
  - Dynamic navigation between overview, properties, tenants, payments, tickets, announcements, documents, and settings.
  - Command palette shortcut (`Ctrl+K` / `Cmd+K`) for fast property and tenant lookup.
  - Theme switching (Dark/Light mode).
- **Components**:
  - `components/dashboard/KpiMetricsSection.jsx`: Real-time KPI cards (Occupancy %, Monthly Revenue, Pending Tickets, Delinquent Units).
  - `components/dashboard/DashboardSidebar.jsx`: Collapsible navigation sidebar.
  - `components/dashboard/RightNotificationSidebar.jsx`: Actionable system notifications and alert feed.
  - `components/dashboard/GridFrame.jsx`: High-density responsive grid layout.
  - `components/dashboard/LandlordSettingsTab.jsx`: Profile, security preferences, and banking configuration.

### Backend (`apps/server/src`)
- **Module**: `modules/landlord/dash/`
  - `dash.routers.js`: Router for dashboard aggregate queries.
  - `dash.controller.js`: Exposes `getDashboard` and `getKpi`.
  - `dash.service.js`: High-performance aggregation pipeline calculating portfolio statistics, active ticket counts, and revenue numbers scoped strictly to the authenticated landlord.

---

## 3. API Endpoints Reference

### Dashboard (`/api/landlord/dash`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`  | `/api/landlord/dash` | Landlord | Complete dashboard payload (KPI metrics, property breakdown, recent tickets, recent payments, pinned announcements) |
| `GET`  | `/api/landlord/dash/kpi` | Landlord | Lightweight KPI numbers endpoint for header badge polling and quick refreshes |

### Properties & Units Management (`/api/landlord/properties`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`    | `/api/landlord/properties` | Landlord | List all landlord properties with unit counts, occupancy, and total rent values |
| `POST`   | `/api/landlord/properties` | Landlord | Create a new property in the landlord portfolio |
| `GET`    | `/api/landlord/properties/:id` | Landlord | Retrieve single property details along with all associated units |
| `PUT`    | `/api/landlord/properties/:id` | Landlord | Update property metadata (name, address, category, image) |
| `DELETE` | `/api/landlord/properties/:id` | Landlord | **Delete Property** (checks if units are occupied, cascades vacant units, writes to audit log) |
| `POST`   | `/api/landlord/properties/:id/units` | Landlord | Add a new unit to an existing property |
| `DELETE` | `/api/landlord/properties/:propertyId/units/:unitId` | Landlord | Delete a vacant unit |

---

## 4. Key Metrics Calculated

- **Occupancy Rate**: `(Occupied Units / Total Units) * 100`
- **Total Expected Rent**: Sum of all unit `monthlyRent` values across active leases.
- **Total Collected Rent**: Sum of all payments marked `paid` for the current month.
- **Pending & Open Tickets**: Count of non-resolved maintenance issues.
- **Delinquency Count**: Count of occupied units with overdue payment invoices.
