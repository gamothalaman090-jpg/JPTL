# Authentication & Landlord Onboarding Module Documentation

## 1. Module Overview
This module handles multi-role authentication (Landlord, Tenant, Superadmin) and the multi-step Landlord onboarding setup flow to initialize properties, units, tenant allocations, and building announcements.

---

## 2. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Pages**:
  - `pages/LoginPage.jsx`: Role-aware login with credentials validation, JWT cookie handling, and portal redirection.
  - `pages/RegisterPage.jsx`: Landlord self-service registration with validation and auto-login.
  - `pages/OnboardingPage.jsx`: 5-step interactive onboarding wizard (Plan Selection → Property Setup → Unit Breakdown → Tenant Invites → Initial Announcement).
- **Components**:
  - `components/common/LoginModal.jsx`: Quick role switcher modal.

### Backend (`apps/server/src`)
- **Authentication**: `modules/auth/`
  - `auth.routes.js`: Public & authenticated auth endpoints.
  - `auth.controller.js`: Request parsing & response structuring.
  - `auth.service.js`: User credential verification, bcrypt password hashing, JWT generation.
- **Onboarding**: `modules/landlord/onboarding/`
  - `onboarding.routes.js`: Landlord onboarding state and entity creation.
  - `onboarding.controller.js`: Step completion handlers.
  - `onboarding.service.js`: Relational setup connecting landlord, properties, units, and initial tenant profiles.

---

## 3. API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new landlord account with business details |
| `POST` | `/api/auth/login` | Public | Authenticate user, issue JWT cookie, return user profile |
| `POST` | `/api/auth/logout` | Authenticated | Clear session cookie and invalidate token |
| `PATCH`| `/api/auth/change-password` | Authenticated | Update user password with current password verification |

### Onboarding (`/api/landlord/onboarding`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`  | `/api/landlord/onboarding/status` | Landlord | Check current onboarding progress and completion status |
| `POST` | `/api/landlord/onboarding/plan` | Landlord | Save selected subscription / portfolio plan tier |
| `POST` | `/api/landlord/onboarding/properties` | Landlord | Batch or single property creation during setup |
| `POST` | `/api/landlord/onboarding/units` | Landlord | Setup unit matrices and rental rates for properties |
| `POST` | `/api/landlord/onboarding/tenants` | Landlord | Add initial tenants and assign them to units |
| `POST` | `/api/landlord/onboarding/announcement` | Landlord | Post the initial welcome announcement |
| `POST` | `/api/landlord/onboarding/complete` | Landlord | Finalize onboarding and unlock full dashboard access |

---

## 4. Data Models

- **`User`** (`user.model.js`): `_id`, `name`, `email`, `passwordHash`, `role` (`landlord` \| `tenant` \| `superadmin`), `status` (`active` \| `suspended`), `landlordId`.
- **`Property`** (`property.model.js`): `_id`, `landlord` (ref User), `name`, `address`, `createdAt`.
- **`Unit`** (`unit.model.js`): `_id`, `property` (ref Property), `label`, `monthlyRent`, `tenant` (ref User), `status` (`vacant` \| `occupied`).
