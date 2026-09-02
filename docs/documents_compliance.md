# Resident Compliance Vault & Documents Module Documentation

## 1. Module Overview
Manages tenant compliance documents (renter's insurance, government photo ID, proof of income/employment, move-in checklists) and digital lease contracts. Provides an inspection interface for landlords to approve, reject, or request revisions.

---

## 2. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Landlord Components**:
  - `components/dashboard/LandlordDocumentsTab.jsx`: Compliance matrix showing all tenant documents, verification status tags (Verified, Under Review, Expired, Missing), expiration warnings, and bulk download.
  - `components/dashboard/DocumentInspectionModal.jsx`: Full-screen document previewer with metadata panel, approval action, and rejection with reason notes.
- **Tenant Components**:
  - `components/tenant/TenantDocumentsTab.jsx`: Document compliance status cards, uploaded file list, and verification badge.
  - `components/tenant/SubmitDocumentModal.jsx`: Document submission modal supporting file drag-and-drop, category selector (Insurance, Gov ID, Income), policy number, and expiry date.

### Backend (`apps/server/src`)
- **Shared Model**: `shared/models/document.model.js`
- **Planned Controller & Service**: `modules/landlord/documents/` and `modules/tenant/documents/`
  - Integrated with Cloudinary for file storage persistence.

---

## 3. Planned API Endpoints Reference

### Landlord Compliance Vault (`/api/landlord/documents`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`   | `/api/landlord/documents` | Landlord | List all compliance records for all managed tenants |
| `GET`   | `/api/landlord/documents/:id` | Landlord | View document details and secure Cloudinary URL |
| `PATCH` | `/api/landlord/documents/:id/verify` | Landlord | Approve document or reject with required feedback note |

### Tenant Documents API (`/api/tenant/documents`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`  | `/api/tenant/documents` | Tenant | List tenant's own uploaded documents and compliance status |
| `POST` | `/api/tenant/documents` | Tenant | Upload new compliance document to Cloudinary and register in database |
| `DELETE` | `/api/tenant/documents/:id` | Tenant | Delete pending / unverified document |

---

## 4. Data Model

- **`Document`** (`document.model.js`):
  - `_id`: ObjectId
  - `owner`: Ref User (Tenant or Landlord)
  - `property`: Ref Property
  - `unit`: Ref Unit
  - `type`: Enum (`lease_agreement`, `renters_insurance`, `id_proof`, `income_proof`, `receipt`, `maintenance_photo`)
  - `fileName`: String
  - `fileUrl`: String (Cloudinary secure URL)
  - `status`: Enum (`pending`, `verified`, `rejected`, `expired`)
  - `expiresAt`: Date
  - `verifiedAt`: Date
  - `reviewedBy`: Ref User
  - `rejectionReason`: String
