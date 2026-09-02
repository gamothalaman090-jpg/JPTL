# Rent Roll & Payments Module Documentation

## 1. Module Overview
Manages the end-to-end billing and financial reconciliation lifecycle. Landlords track tenant rent roll, generate invoices, mark payments as received, and export financial records. Tenants can view billing ledgers, pay rent online (mock card/ACH), manage saved payment methods, toggle auto-pay, and view official digital receipts.

---

## 2. Architecture & File Structure

### Frontend (`apps/client/src`)
- **Landlord Components**:
  - `components/dashboard/PaymentsTab.jsx`: Comprehensive rent roll table with status filters (Paid, Pending, Overdue), invoice generation trigger, and CSV export.
- **Tenant Components**:
  - `components/tenant/TenantPaymentsTab.jsx`: Ledger summary, upcoming invoice card, payment history table, payment method selector.
  - `components/tenant/PayRentModal.jsx`: Simulated multi-step payment checkout (Card, Bank ACH, Cash voucher).
  - `components/tenant/PaymentMethodsModal.jsx`: Add/delete saved debit cards and bank accounts.
  - `components/tenant/TenantReceiptModal.jsx`: Printable digital receipt with transaction hash, breakdown, and timestamp.

### Backend (`apps/server/src`)
- **Landlord Rent Roll**: `modules/landlord/rentroll/`
  - `rentroll.routes.js`: Full invoice management and query routes.
  - `rentroll.controller.js`: Handlers for listing rent roll, KPI metrics, creating invoices, marking as paid, updating, deleting, and CSV export.
  - `rentroll.service.js`: Database queries scoped to landlord properties with payment status aggregation.
- **Tenant Payments**: `modules/tenant/payments/`
  - `payments.routes.js`: Ledger and payment processing routes.
  - `payments.controller.js`: Handles payment submission (`payRent`), payment methods, auto-pay toggle, and receipt generation.
  - `payments.service.js`: Simulated transaction processor firing internal events and updating payment status to `paid`.

---

## 3. API Endpoints Reference

### Landlord Rent Roll (`/api/landlord/rentroll`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`    | `/api/landlord/rentroll` | Landlord | List all invoices & transactions with status filtering |
| `GET`    | `/api/landlord/rentroll/kpi` | Landlord | Financial overview (Total Collected, Outstanding, Overdue count) |
| `GET`    | `/api/landlord/rentroll/export` | Landlord | Stream CSV export of all rent roll transactions |
| `POST`   | `/api/landlord/rentroll` | Landlord | Generate a new rent invoice for a tenant unit |
| `GET`    | `/api/landlord/rentroll/:id` | Landlord | Get single invoice details |
| `PATCH`  | `/api/landlord/rentroll/:id/mark-paid` | Landlord | Manually mark invoice as paid (e.g. offline cash payment) |
| `PUT`    | `/api/landlord/rentroll/:id` | Landlord | Update invoice amount or due date |
| `DELETE` | `/api/landlord/rentroll/:id` | Landlord | Void / delete an unpaid payment record |

### Tenant Payments (`/api/tenant/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET`    | `/api/tenant/payments` | Tenant | Retrieve full tenant payment ledger and current outstanding balance |
| `POST`   | `/api/tenant/payments/pay` | Tenant | Submit payment for an invoice (generates mock transaction ID) |
| `GET`    | `/api/tenant/payments/methods` | Tenant | List saved payment methods |
| `POST`   | `/api/tenant/payments/methods` | Tenant | Save a new debit card or bank account |
| `DELETE` | `/api/tenant/payments/methods/:methodId` | Tenant | Remove a saved payment method |
| `PATCH`  | `/api/tenant/payments/autopay` | Tenant | Enable or disable automated recurring rent billing |
| `GET`    | `/api/tenant/payments/:id/receipt` | Tenant | Fetch official digital receipt for a completed transaction |

---

## 4. Data Model

- **`Payment`** (`payment.model.js`):
  - `_id`: ObjectId
  - `unit`: Ref Unit
  - `tenant`: Ref User
  - `property`: Ref Property
  - `amount`: Number (Required)
  - `dueDate`: Date (Required)
  - `status`: Enum (`pending`, `paid`, `overdue`, `cancelled`)
  - `mockTransactionId`: String (e.g., `TXN-839201948`)
  - `paymentMethod`: String (`Credit Card`, `Bank ACH`, `Cash`)
  - `paidAt`: Date
