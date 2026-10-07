# Payment UI and Advance Payment Fix Plan

## Goal

Fix the tenant advance-payment flow so an accidental click does not create an outstanding item visible to the landlord. Repair the landlord payment screens in both light and dark themes, including the QR image upload control. Add an **Indefinite lease** option to the landlord's assign-unit workflow, based on the supplied assignment dialog.

## Findings from the current implementation

- The tenant's **Pay in Advance** action opens `AdvancePaymentModal.jsx`. Submitting **Continue to payment** immediately calls `POST /api/tenant/payments/advance-invoice`.
- That endpoint creates a regular `Payment` record with `status: pending`. The landlord Rent Roll loads pending `Payment` records, so an advance invoice appears as an outstanding landlord row before the tenant has uploaded a receipt or reported an onsite payment.
- The modal says it creates an invoice before the tenant submits payment evidence. It has a Cancel button, but no separate advance request or draft state.
- `PaymentsTab.jsx` renders status chips from state classes. The screenshot shows a pale, apparently blank status chip in dark mode; its foreground/background contrast needs correction and the displayed status should remain readable.
- `PaymentOptionsTab.jsx` uses the browser's default file input with minimal styling. In the light-theme screenshot, the QR upload control appears detached from the rest of the form and has no clear selected-file state or preview.
- Both screens use Tailwind utility classes and support light and dark modes. The fix should stay scoped to payment components and preserve the existing app theme behavior.
- The landlord assignment dialog currently requires a lease duration and expiration date. `Lease.leaseEnd` is required in the schema, and downstream lease, tenant, unit, payment, and notice flows commonly expect a date.
- The assignment flow already copies lease dates into the lease, tenant profile, and unit. An indefinite lease therefore needs an explicit lease type and consistent no-expiration handling across those records and the screens that read them.

## Intended behavior

1. Opening **Pay in Advance**, changing the month count, or closing the dialog creates no landlord-visible invoice and sends no landlord notification.
2. The tenant sees a clear review step with the selected months, total amount, and payment method path before submitting.
3. An advance item becomes visible to the landlord only after the tenant submits a transfer receipt or reports an onsite payment. It then appears as **Awaiting review** and remains unpaid until landlord approval.
4. A tenant can close or cancel an unsubmitted advance flow without creating an outstanding Rent Roll row.
5. The landlord Rent Roll status chips, filters, totals, and action controls remain legible and usable in light and dark themes.
6. The QR upload field reads as part of the payment-option form, shows the selected filename and image preview, and communicates validation errors in both themes.
7. During unit assignment, the landlord can choose either a fixed-term lease or an indefinite lease. An indefinite lease has a start date and no fixed expiration date; it remains active until ended through the applicable lease-ending workflow.

## Implementation plan

### 1. Change advance payments to a draft/submission lifecycle

- Review `AdvancePaymentModal.jsx`, `TenantPortalPage.jsx`, `payments.service.js`, the `Payment` schema, and the landlord Rent Roll query/summary in `rentroll.service.js`.
- Add a tenant-owned draft state for an advance payment. Prefer a `draft` payment state or a dedicated advance request record, with server-side ownership and lease-period validation. Draft records must be excluded from landlord Rent Roll rows, outstanding totals, review queues, and notifications.
- Change `POST /advance-invoice` so it creates or updates a tenant-only draft, rather than a landlord-visible pending invoice.
- Keep the draft ID available to the tenant so transfer evidence or onsite intent can be submitted against it.
- On receipt or onsite submission, transition the draft to `pending` plus `pending_review`, record the submission metadata, and notify the landlord. The landlord sees the item from this point onward.
- On tenant cancellation, remove or mark the draft canceled, and ensure it never contributes to landlord totals. Reopening the flow should resume a valid draft or create a new one without duplicates.
- Keep landlord approval as the only transition to `paid`; keep rejection resubmittable and visible for landlord review.
- Ensure current-rent invoices continue to use their existing due and review behavior.

### 2. Make the advance flow harder to trigger accidentally

- Keep **Pay in Advance** as an entry point only; opening the modal must not create an invoice.
- Make the first modal step a selection/review step with an explicit **Continue to payment** action and an equally visible **Cancel** action.
- Show the number of months, the date range, and the computed total before the tenant confirms.
- Create a draft only when the tenant confirms the review step. Do not show a landlord notification or Rent Roll item at draft creation.
- Provide an explicit tenant action to discard a draft if they leave the flow before receipt/onsite submission.

### 3. Repair landlord payment styling

- Update `PaymentsTab.jsx` status chips to use explicit foreground, background, and border colors for pending, overdue, paid, rejected, and awaiting-review states.
- Correct the blank chip shown in the supplied Rent Roll screenshot and ensure each chip includes readable status text.
- Check row alignment, wrapping, action buttons, filters, and summary cards at desktop and narrow widths.
- Check light and dark theme variants without changing global theme tokens or unrelated dashboard screens.

### 4. Repair QR upload styling and feedback

- Update the QR file input in `PaymentOptionsTab.jsx` with a bordered drop/select area, consistent spacing, accessible label, and visible focus state.
- Show filename and image preview after selection; allow replacement before saving and removal/reset while editing.
- Keep accepted formats and size limits consistent with the backend. Show a useful inline validation message for unsupported or oversized images.
- Style the file input, preview, helper text, and validation state for both light and dark themes. Keep regular inputs and the add-option button visually aligned with the upload area.
- Confirm that selecting and submitting a file still sends the `qrImage` multipart field expected by the server.

### 5. Update verification coverage

- Backend integration cases: opening/creating an advance draft does not appear in landlord Rent Roll or outstanding totals; receipt and onsite submission promote it into the landlord review queue; canceling a draft leaves no landlord-visible item; approval/rejection retain current safeguards.
- Newman flow: tenant creates an advance draft, confirms transfer receipt or onsite payment, landlord sees it only after submission, and landlord approval marks it paid.
- Playwright flow: canceling the advance modal creates no landlord row; confirming and submitting creates an awaiting-review row; light/dark Rent Roll chips remain readable; QR upload displays the selected filename/preview and saves successfully.
- Build the client and run focused backend, Playwright, and Newman checks after implementation.

### 6. Add indefinite leases to unit assignment

- Update `AssignTenantModal.jsx` with a clear lease-type choice: **Fixed term** or **Indefinite**. Keep the existing duration presets and expiration date controls for fixed-term leases.
- For an indefinite lease, retain the required start date and hide/disable duration presets, expiration-date input, and days-remaining preview. Show a clear **No fixed expiration date** summary instead.
- Submit `leaseType: 'indefinite'` with `leaseEnd: null` (or omit `leaseEnd`) for indefinite leases. Keep `leaseType: 'fixed_term'` and a required end date for fixed-term leases.
- Update the lease schema and assignment service validation to allow a missing/null `leaseEnd` only for an indefinite lease. Preserve validation that fixed-term end dates occur after start dates.
- Propagate lease type and nullable end date consistently to `TenantProfile` and `Unit`, and make tenant directory and lease APIs return the lease type.
- Audit all end-date consumers: lease display, lease extension eligibility, tenant dashboard countdown, advance-payment period validation, early lease end requests, rent/invoice creation, rent roll, and eviction workflows. A missing end date must not be converted to an invalid date or accidentally treated as an expired lease.
- Treat indefinite leases as active without a date-based expiry. Keep advance rent bounded by the existing 12-month selection limit when there is no lease end date.
- For indefinite leases, present the tenant's existing early-end action as a request to end the lease (rather than implying it ends an existing fixed term). Keep landlord approval and requested move-out date behavior; do not change it into immediate eviction.
- Keep existing lease records compatible: infer fixed-term behavior for records that already have a `leaseEnd`, and migrate or default their `leaseType` safely. Do not clear existing dates.
- Define lease-extension behavior for indefinite leases explicitly in the implementation: hide the extension action or explain that no extension is needed while the lease has no fixed end date. Only offer extension if a landlord first changes the lease to a fixed term.

## Files likely to change

- `apps/client/src/components/tenant/AdvancePaymentModal.jsx`
- `apps/client/src/pages/TenantPortalPage.jsx`
- `apps/client/src/components/dashboard/PaymentsTab.jsx`
- `apps/client/src/components/dashboard/PaymentOptionsTab.jsx`
- `apps/client/src/services/api.js`
- `apps/server/src/shared/models/payment.model.js` or a new advance-request model
- `apps/server/src/modules/tenant/payments/payments.controller.js`
- `apps/server/src/modules/tenant/payments/payments.routes.js`
- `apps/server/src/modules/tenant/payments/payments.service.js`
- `apps/server/src/modules/landlord/rentroll/rentroll.service.js`
- Relevant server integration tests, `tests/payment-workflow.json`, and Playwright coverage
- `apps/client/src/components/dashboard/AssignTenantModal.jsx`
- `apps/server/src/shared/models/lease.model.js`
- `apps/server/src/modules/landlord/tenantdirectory/tenantdirectory.service.js`
- Tenant lease and dashboard views that display lease expiration or remaining days
- Lease extension and early termination services that validate or update lease end dates

## Acceptance criteria

- A tenant can open and cancel the advance flow without creating a landlord-visible Rent Roll entry or changing landlord outstanding totals.
- A tenant-confirmed advance payment appears to the landlord only after receipt or onsite submission and is clearly marked **Awaiting review**.
- No advance payment is marked paid until the landlord approves it.
- Rent Roll payment status labels are readable in light and dark themes, including the status shown in the supplied screenshot.
- QR upload has a clear styled control, filename, preview, focus state, and validation feedback in light and dark themes.
- Existing bank, QR, e-wallet, receipt, onsite, and landlord review paths remain functional.
- A landlord can assign either a fixed-term or indefinite lease. Fixed-term leases still require a valid expiration date; indefinite leases save and display with no expiration date.
- Indefinite leases remain active without an end date, display no countdown or false expiration, and support the tenant request and landlord review path for ending the lease.
- Existing fixed-term leases and their end dates continue to work unchanged.
