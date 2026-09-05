# Tenant Directory & Account Management Module Documentation

## 1. Module Overview
Enables landlords to manage tenant profiles, create tenant login accounts with auto-generated temporary credentials, assign tenants to vacant units, manage active leases, and remove departing tenants.

---

## 2. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Components**:
  - `components/dashboard/AddTenantModal.jsx`: Modal to register a new tenant account, assign property and unit, set lease start/end dates, monthly rent, and send invitation credentials.
  - `components/dashboard/UnitDetailModal.jsx`: Unit details modal showing assigned tenant info, lease terms, and occupancy history.
  - `pages/DashboardPage.jsx`: Renders the tenant directory card grid with search, filter by property, and status badges (Active, Notice, Expiring).

### Backend (`apps/server/src`)
- **Module**: `modules/landlord/tenantdirectory/`
  - `tenantdirectory.routes.js`: Directory listing and tenant profile management routes.
  - `tenantdirectory.controller.js`: Controllers for `getTenantDirectory`, `getTenantDetails`, `createTenant`, `updateTenant`, `deleteTenant`.
  - `tenantdirectory.service.js`:
    - Handles transactional user creation (`role: 'tenant'`) with bcrypt hashed password.
    - Updates Unit status to `occupied` and links `tenantId`.
    - Creates or updates `TenantProfile` with emergency contacts, lease dates, and employment notes.

---

## 3. API Endpoints Reference

### Tenant Directory (`/api/landlord/tenantdirectory`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`    | `/api/landlord/tenantdirectory` | Landlord | List all tenants across landlord's properties with unit labels and lease info |
| `GET`    | `/api/landlord/tenantdirectory/:id` | Landlord | Get comprehensive tenant dossier (tickets, payment history, uploaded docs) |
| `POST`   | `/api/landlord/tenantdirectory` | Landlord | Create a new tenant user account and bind them to a designated unit |
| `PUT`    | `/api/landlord/tenantdirectory/:id` | Landlord | Update tenant profile details, unit reassignments, or lease dates |
| `DELETE` | `/api/landlord/tenantdirectory/:id` | Landlord | Remove tenant from unit (reverts unit to `vacant`) and deactivate account |

---

## 4. Data Models

- **`User`** (`user.model.js`): Tenant user record with hashed password and role `tenant`.
- **`TenantProfile`** (`tenantProfile.model.js`):
  - `user`: Ref User
  - `landlord`: Ref User
  - `property`: Ref Property
  - `unit`: Ref Unit
  - `phone`: String
  - `emergencyContact`: { name: String, phone: String, relationship: String }
  - `leaseStart`: Date
  - `leaseEnd`: Date
  - `status`: Enum (`active`, `pending`, `ended`)
