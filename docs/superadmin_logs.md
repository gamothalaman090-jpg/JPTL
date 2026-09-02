# Superadmin Portal & System Audit Logs Module Documentation

## 1. Module Overview
Enables platform-level administration by superadmins. Provides oversight across all landlords, properties, and tenants. Allows emergency suspension/reactivation of accounts and inspection of platform-wide system and security audit logs.

---

## 2. Superadmin Role & RBAC Boundaries

| Role | Scope | Permissions |
|---|---|---|
| **Superadmin** | Platform-wide | • View all landlords, tenants, properties, and leases.<br>• Suspend or reactivate any user account.<br>• View platform audit log & error logs.<br>• *Read-only on private tenant financial documents; cannot create properties or tickets directly.* |
| **Landlord** | Own properties only | Scoped strictly to properties and tenants they own. |
| **Tenant** | Own lease only | Scoped strictly to their assigned unit and tickets. |

---

## 3. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Planned Views**:
  - `pages/SuperadminPage.jsx` or `/admin` route:
    - **Tab 1: System Health & Audit Logs**: Real-time stream of audit events (actor, role, action, target entity, timestamp, IP).
    - **Tab 2: User Management**: Platform user directory with search, filter by role (Landlord / Tenant), and Suspend/Activate toggles.
    - **Tab 3: Landlord Directory**: List of registered landlords, active property counts, and subscription status.

### Backend (`apps/server/src`)
- **Shared Model**: `shared/models/auditLog.model.js`
- **Planned Module**: `modules/superadmin/`
  - `superadmin.routes.js`: Guarded by `requireAuth` and `requireRole('superadmin')`.
  - `superadmin.controller.js`: System logs, account toggles, cross-landlord queries.
  - `superadmin.service.js`: Unscoped platform queries with pagination.

---

## 4. API Endpoints Reference (Planned)

### Superadmin Operations (`/api/superadmin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`   | `/api/superadmin/audit-logs` | Superadmin | Paginated platform audit logs with actor and entity filters |
| `GET`   | `/api/superadmin/users` | Superadmin | List all users across all roles with status and landlord affiliation |
| `PATCH` | `/api/superadmin/users/:id/status` | Superadmin | Suspend or reactivate a user account (`active` \| `suspended`) |
| `GET`   | `/api/superadmin/landlords` | Superadmin | List all landlord organizations with aggregated unit and tenant statistics |
| `GET`   | `/api/superadmin/health` | Superadmin | Database connection, memory usage, and API latency metrics |

---

## 5. Audit Log Data Model

- **`AuditLog`** (`auditLog.model.js`):
  - `_id`: ObjectId
  - `actor`: Ref User
  - `actorRole`: Enum (`landlord`, `tenant`, `superadmin`, `system`)
  - `action`: String (e.g., `TICKET_STATUS_UPDATE`, `PAYMENT_CONFIRMED`, `USER_SUSPENDED`, `PROPERTY_CREATED`)
  - `entity`: `{ kind: String, id: ObjectId }`
  - `beforeState`: Mixed (JSON snapshot prior to mutation)
  - `afterState`: Mixed (JSON snapshot after mutation)
  - `ipAddress`: String
  - `timestamp`: Date
