# Announcements Module Documentation

## 1. Module Overview
Enables landlords to broadcast building-wide or property-specific notices (maintenance notices, amenity rules, emergencies) to tenants. Tenants view an interactive announcement feed with priority badges and pinned alerts.

---

## 2. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Landlord Components**:
  - `components/dashboard/AnnouncementsTab.jsx`: Landlord management console to view, filter, pin, and manage posted announcements.
  - `components/dashboard/NewAnnouncementModal.jsx`: Modal to compose announcements with target audience (All Properties vs Specific Property), categories (Emergency, Maintenance, General), and pinned toggle.
- **Tenant Components**:
  - `components/tenant/TenantAnnouncementsTab.jsx`: Resident feed displaying active announcements formatted with priority tags, timestamp, and author metadata.

### Backend (`apps/server/src`)
- **Landlord Backend**: `modules/landlord/announcements/`
  - `announcements.routes.js`: Landlord routes (`GET /`, `POST /`).
  - `announcements.controller.js`: Request controllers for fetching and creating announcements.
  - `announcements.service.js`: Persists notices in MongoDB and associates them with the landlord's properties.
- **Tenant Backend**: `modules/tenant/announcements/`
  - `announcements.routes.js`: Tenant routes (`GET /`, `GET /:id`).
  - `announcements.controller.js`: Fetches announcements relevant to the tenant's assigned property.
  - `announcements.service.js`: Filters active notices based on tenant's property ID.

---

## 3. API Endpoints Reference

### Landlord Announcements (`/api/landlord/announcements`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`  | `/api/landlord/announcements` | Landlord | List all announcements created by the authenticated landlord |
| `POST` | `/api/landlord/announcements` | Landlord | Create and broadcast a new announcement |

### Tenant Announcements (`/api/tenant/announcements`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`  | `/api/tenant/announcements` | Tenant | Get announcement feed for the tenant's current property |
| `GET`  | `/api/tenant/announcements/:id` | Tenant | Retrieve specific announcement details |

---

## 4. Data Model

- **`Announcement`** (`announcements.model.js`):
  - `_id`: ObjectId
  - `landlord`: Ref User (Creator)
  - `property`: Ref Property (Nullable; null means all properties)
  - `title`: String (Required)
  - `body`: String (Required)
  - `category`: Enum (`General`, `Maintenance`, `Emergency`, `Event`, `Policy`)
  - `isPinned`: Boolean
  - `createdAt`: Date
