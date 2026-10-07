# Payment Workflow Overhaul — Implementation Plan

## Objective

Replace simulated payment completion with a real-world, manually reconciled workflow. Landlords configure the payment instructions they accept. Tenants select a QR or bank-account option, complete the transfer outside the portal, and upload the transfer receipt, or choose **Pay Onsite**. A payment remains unpaid until the landlord reviews and approves it.

This phase records evidence and landlord confirmation; it does not move money or claim to verify transfers with a bank or payment provider.

## Current system findings

- Tenant checkout in `apps/client/src/components/tenant/PayRentModal.jsx` simulates card/ACH payment in the browser and displays a success receipt.
- `apps/server/src/modules/tenant/payments/payments.service.js` changes an invoice to `paid` as part of tenant submission and generates mock transaction IDs.
- Landlords already have a `Mark Paid` action in `apps/client/src/components/dashboard/PaymentsTab.jsx`, backed by `PATCH /api/landlord/rentroll/:id/mark-paid`.
- `Payment` currently supports `pending`, `paid`, `overdue`, and `failed`; landlord payment methods and uploaded receipts are not represented.
- The server already uses Multer and Cloudinary for document and photo uploads, which can inform secure upload handling for QR images and tenant evidence.

## Product decisions for this version

- Supported channels: landlord-uploaded QR codes, bank transfer to landlord-provided account details, Maya/GCash e-wallets, and payment onsite.
- There is no in-app card/ACH processing in this phase. The tenant pays using their own banking app or in person.
- Uploading a transfer receipt or choosing **I paid onsite** creates a **Pending Review** submission. It never marks the invoice paid by itself.
- Only a landlord authorized for the invoice’s property can approve or reject a submission.
- Approval marks the invoice paid and creates the portal receipt. Rejection requires a reason and leaves the invoice unpaid so the tenant can submit again.
- Phase one supports payment of the full invoice amount. Partial payments and split tenders are out of scope unless requested separately.
- Payment options are landlord-wide and apply to the landlord’s tenants across all of their properties; there is no property selector.

## Tenant experience

1. The tenant opens an outstanding invoice from **Rent & Payments**.
2. The portal shows the amount due, due date, and the landlord’s active options:
   - **QR payment:** show the uploaded QR image, provider/bank label, and transfer instructions.
   - **Bank transfer:** show bank name, account name, account number, and optional branch/reference instructions.
   - **E-wallet:** show Maya or GCash account details and an optional uploaded wallet QR.
   - **I paid onsite:** let the tenant report an onsite payment for landlord confirmation.
3. After completing a QR, bank, or e-wallet transfer, the tenant must upload a receipt image or PDF before submitting; they may also enter the transfer reference and a note.
4. For onsite, the tenant indicates that payment was made without uploading a transfer receipt. The invoice remains unpaid until the landlord confirms receiving the money.
5. The invoice changes to **Pending Review**. The tenant can see the chosen channel, submission time, and review status. A rejected submission shows the landlord’s reason and allows another submission.
6. After approval, the invoice shows **Paid** and the tenant can open/download its official portal receipt. No receipt is issued for a pending or rejected submission.

## Landlord experience

- Add a **Payment Methods** management view in landlord settings or the Rent Roll area.
- Let landlords create, edit, activate/deactivate, and remove multiple options:
  - QR option: display name, bank/provider, uploaded QR image, and instructions.
  - Bank option: display name, bank name, account holder, account number, optional branch, and instructions.
  - E-wallet option: Maya or GCash, account name and mobile/account number, optional QR image, and instructions.
- Options apply across all properties managed by the landlord. Tenants only see active options belonging to their landlord.
- Add a **Pending Review** queue to the landlord Rent Roll with tenant, unit/property, invoice period and amount, submitted channel, submitted time, reference, notes, and receipt preview/download.
- Provide **Approve Payment** and **Reject Payment** actions. Reject requires an explanation. The confirmation dialog must show the invoice amount and tenant/property before approval.
- Keep manual review distinct from **I paid onsite**: the tenant’s onsite report is not an approval. The landlord confirms it after collecting the payment.
- Keep any legacy manual mark-paid route behind the same audit and state-transition rules, or replace its button with the review/onsite confirmation actions so there is only one reconciliation path.

## Backend design

### Data model

1. Add a landlord payment-option model with:
   - landlord and optional property references;
   - channel type (`qr`, `bank_account`, or `ewallet`), display name, provider, and instructions;
   - QR image URL for QR and optional e-wallet QR options;
   - account holder, account number, and optional branch for bank/e-wallet options;
   - active state and timestamps.
2. Extend `Payment` with a review workflow while preserving existing invoice records:
   - status values for `pending_review` and `rejected`, while retaining current legacy values during migration;
   - payment channel and selected option snapshot, so future edits to landlord instructions do not rewrite a submitted payment’s record;
   - receipt/evidence URL, original filename, upload time, bank reference, tenant note, and submission time;
   - reviewer, review time, rejection reason, and final paid time.
3. Store each submitted option’s display name and bank/provider metadata as a snapshot on the payment. Do not expose editable bank details through public endpoints.

### Tenant API proposal (`/api/tenant/payments`)

- `GET /options` — return all active payment options configured by the tenant’s landlord, with no property filtering.
- `POST /:paymentId/submit` — multipart request for QR/bank/e-wallet submission: option ID, required evidence file, optional transfer reference and note. Verify invoice ownership, unpaid status, allowed file type/size, and option availability.
- `POST /:paymentId/pay-onsite` — record that the tenant reports an onsite payment for their own unpaid invoice and set it to pending review.
- `GET /:paymentId/submission` — return the current tenant-visible review status and rejection feedback.
- Update tenant ledger and receipt endpoints so status/evidence are displayed safely and receipts require approved/paid status.

### Landlord API proposal

- `/api/landlord/payment-options`: list, create, update, and activate/deactivate landlord-wide QR, bank, and e-wallet options.
- `GET /api/landlord/rentroll?status=pending_review` — return review items and invoice context.
- `GET /api/landlord/rentroll/:id/evidence` — stream or issue a short-lived authorized link to the uploaded receipt after verifying property ownership.
- `PATCH /api/landlord/rentroll/:id/review` — approve or reject. Approval requires `pending_review`; rejection requires a reason. Repeated decisions must be rejected or safely idempotent.
- Notify the tenant on submission, approval, or rejection. Record each state transition and reviewer in `AuditLog`.

### Upload, access, and reliability requirements

- Accept only supported image formats and PDF receipts with a configured size limit; verify the file signature. QR and e-wallet QR images are optional only where specified.
- Upload QR images and receipts through authenticated endpoints using the existing Multer/Cloudinary patterns. Keep tenant receipts private: use authenticated streaming or short-lived signed access rather than exposing a permanent public receipt URL.
- Do not store banking credentials for the tenant or request bank login details. Landlord account numbers are display-only payment instructions.
- Use a single guarded state transition for approval/rejection and audit the result. Prevent approving the same invoice twice or submitting evidence to an invoice that belongs to another tenant.
- Keep invoice amount and due-date ownership authoritative on the server; never trust amount values from the client during evidence submission.

## Frontend implementation areas

- Tenant: replace the simulated checkout flow in `PayRentModal.jsx`; add QR/account instructions, evidence upload, onsite action, pending-review state, rejection/resubmission UI, and approved receipt availability.
- Tenant API: add option lookup, receipt submission, and onsite submission methods in `apps/client/src/services/api.js`.
- Landlord: extend `PaymentsTab.jsx` or add a review queue component for evidence inspection, approve/reject controls, and payment-option management.
- Landlord API: add payment-option CRUD, review queue, evidence access, and review methods to `landlordApi`.
- Remove simulated success receipts, mock transaction IDs, and fake card/ACH options from user-facing flows. Disable auto-pay unless an actual payment processor is introduced in a later phase.
- Adapt advance-payment behavior so it cannot create paid records without review. Either create separate invoices that use the same evidence/review workflow or disable advance payment in this phase.

## Migration and compatibility

- Existing `paid` records remain paid and retain their historic mock transaction metadata for reporting; do not rewrite historical transactions as if they were verified bank transfers.
- Existing `pending` and `overdue` records remain payable through the new workflow.
- Existing tenant payment methods and auto-pay flags should no longer drive a simulated transaction. Preserve legacy data initially, but stop showing or invoking mock card/ACH checkout.
- Recalculate Rent Roll KPIs so `pending_review` remains outstanding and is counted separately from collected funds. Rejected payments remain unpaid; the invoice can return to a resubmittable state.

## Test plan

- Backend integration tests:
  - landlord can create/update/disable QR, bank, and Maya/GCash e-wallet options;
  - tenant sees only active options owned by their landlord across managed properties;
  - tenant can submit a valid receipt for their own unpaid invoice and it becomes pending review, not paid;
  - onsite submission becomes pending review without evidence;
  - wrong tenant, wrong landlord, unsupported file, oversized file, invalid amount, paid invoice, and inactive option are rejected;
  - landlord approval marks paid, records reviewer/time, notifies tenant, and enables receipt retrieval;
  - landlord rejection requires a reason, keeps the invoice unpaid, and lets the tenant resubmit;
  - another landlord cannot view evidence or approve/reject;
  - duplicate review attempts cannot double-count the payment.
- Newman collection: landlord and tenant login, payment-option setup/read, tenant QR/bank/e-wallet and onsite submissions, landlord review/approve/reject, receipt access, validation, and role/ownership denial.
- Playwright coverage: landlord configures a payment option and reviews a submission; tenant selects a channel, uploads evidence or selects onsite, sees pending review, and sees the final approval/rejection outcome.
- Verify Rent Roll KPIs, tenant payment history, and receipts reflect only landlord-approved paid records.

## Delivery phases

1. **Schema and backend rules:** payment option model, submission fields/statuses, upload validation, ownership checks, notifications, and audited review transitions.
2. **Landlord tools:** payment-option management and pending-review queue with evidence preview, approve, reject, and onsite confirmation.
3. **Tenant flow:** real QR/account instructions, receipt upload, onsite payment intent, status tracking, retry after rejection, and paid receipt view.
4. **Remove simulation and migrate safely:** retire mock card/ACH checkout and auto-pay behavior, adapt advance payments, and update KPIs/exports/docs.
5. **End-to-end verification:** backend integration, Newman, and Playwright cases covering success, rejection, authorization, and invalid uploads.

## Acceptance criteria

- Tenant submission never changes an invoice to paid.
- The landlord can add several QR, bank, and Maya/GCash options shared across their properties, with no property selector.
- The tenant must upload transfer proof before submitting a QR, bank, or e-wallet payment, or can indicate an onsite payment for landlord confirmation.
- Only the property’s landlord can inspect evidence and approve or reject a submission.
- Approval is the only step that marks the invoice paid and enables an official portal receipt.
- Rejection includes a reason, keeps the invoice outstanding, and permits a corrected resubmission.
- Rent Roll totals and tenant ledgers count pending-review and rejected records as unpaid.
