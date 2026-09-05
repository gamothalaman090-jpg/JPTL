# Maintenance Ticketing Module Documentation

## 1. Module Overview
Handles the maintenance request lifecycle between tenants, landlords, and field technicians. Includes ticket submission with category and photo attachments, status workflow progression, technician dispatching, and audit logging of state transitions.

---

## 2. Maintenance Ticket Workflow State Machine

```
[ submitted ] ──▶ [ acknowledged ] ──▶ [ in_progress ] ──▶ [ resolved ] ──▶ [ closed ]
                       │
                       └──▶ [ rejected ]
```

On every status transition:
1. Update `Ticket.status` and append an entry to `statusHistory` with timestamp and actor.
2. Record an entry in `AuditLog`.
3. Dispatch a real-time Notification to the resident or landlord.

---

## 3. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Landlord Components**:
  - `components/dashboard/TicketsTab.jsx`: Board view and list view of tickets filtered by status (`submitted`, `in_progress`, `resolved`), urgency level (Low, Medium, High, Emergency), and unit.
  - `components/dashboard/NewTicketModal.jsx`: Landlord-initiated maintenance ticket modal.
- **Tenant Components**:
  - `components/tenant/TenantMaintenanceTab.jsx`: Resident issue tracker with live status badge and assigned technician details.
  - `components/tenant/ReportIssueModal.jsx`: Interactive issue submission form (Issue title, category: Plumbing/Electrical/HVAC/Appliance, urgency, description, photo upload).
  - `components/tenant/TechnicianDetailModal.jsx`: Displays assigned technician profile, direct phone contact, and dispatch ETA.

### Backend (`apps/server/src`)
- **Shared Model**: `shared/models/ticket.model.js`
- **Landlord Module**: `modules/landlord/tickets/` (`tickets.routes.js`, `tickets.controller.js`, `tickets.service.js`)
- **Tenant Module**: `modules/tenant/tickets/` (`tickets.routes.js`, `tickets.controller.js`, `tickets.service.js`)

---

## 4. API Endpoints Reference

### Landlord Maintenance API (`/api/landlord/tickets`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`    | `/api/landlord/tickets` | Landlord | List all tickets for landlord's properties with metrics & filters |
| `POST`   | `/api/landlord/tickets` | Landlord | Create a maintenance ticket for any managed unit |
| `GET`    | `/api/landlord/tickets/:id` | Landlord | Get ticket details, photos, and status history |
| `PATCH`  | `/api/landlord/tickets/:id/status` | Landlord | Transition ticket status (`acknowledged`, `in_progress`, `resolved`, `rejected`) |
| `PATCH`  | `/api/landlord/tickets/:id/assign` | Landlord | Assign external technician and transition status to `in_progress` |
| `DELETE` | `/api/landlord/tickets/:id` | Landlord | Delete / remove a ticket |

### Tenant Maintenance API (`/api/tenant/tickets`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`    | `/api/tenant/tickets` | Tenant | List all tickets submitted for the tenant's unit |
| `POST`   | `/api/tenant/tickets` | Tenant | Submit a new maintenance ticket with category and photo attachments |
| `GET`    | `/api/tenant/tickets/:id` | Tenant | View specific ticket details |
| `PATCH`  | `/api/tenant/tickets/:id/cancel` | Tenant | Cancel a submitted ticket |
| `POST`   | `/api/tenant/tickets/:id/comments` | Tenant | Post comment / update note on a ticket |

---

## 5. Data Model

- **`Ticket`** (`ticket.model.js`):
  - `_id`: ObjectId
  - `unit`: Ref Unit
  - `tenant`: Ref User
  - `property`: Ref Property
  - `title`: String (Required)
  - `description`: String (Required)
  - `category`: Enum (`plumbing`, `electrical`, `hvac`, `appliance`, `structural`, `pest`, `other`)
  - `priority`: Enum (`low`, `medium`, `high`, `emergency`)
  - `status`: Enum (`submitted`, `acknowledged`, `in_progress`, `resolved`, `rejected`, `closed`)
  - `photoUrls`: [String]
  - `statusHistory`: `[{ status: String, changedBy: Ref User, timestamp: Date, note: String }]`
  - `assignedTechnician`: `{ name: String, phone: String, company: String, eta: Date }`
