# JPTL Future Plans: Roadmap to a Successful Property SaaS

## Purpose

This roadmap identifies the product and platform work that can move JPTL from a working property-management system toward a dependable, sellable SaaS for landlords and residents. It is based on the modules visible in the current repository; each area still needs a production-readiness audit before launch commitments are made.

The requested “small language something” is most likely an **SLM (Small Language Model)**. This plan treats it as a focused, permission-aware AI assistant that uses JPTL records as its source of truth. It must not make legal decisions, approve payments, or change leases on its own.

## Current product foundation

The repository already contains landlord and tenant portals with modules for:

- Properties, units, tenant directory, leases, lease extensions, and lease-ending or eviction notices.
- Rent ledger and rent roll, landlord QR/bank/e-wallet payment instructions, tenant receipt or onsite submissions, and landlord approval.
- Maintenance requests, announcements, document verification, vehicles, notifications, and account settings.
- Compliance expiration reminders, including persisted lead-time settings and resident notifications.
- Superadmin tools, audit records, API integration tests, Newman collections, and Playwright coverage.

The current payment workflow records and reviews **off-platform** transfers or onsite payments. It does not itself move money or reconcile a bank settlement. The repository also needs a SaaS account, subscription, and entitlement layer before it can reliably support paid customer organizations. Code presence alone does not establish production readiness; security, data isolation, recovery, delivery, and real customer workflows still need verification.

## Product principles

1. **Make property operations reliable before adding automation.** Billing, permissions, audit history, notifications, backups, and support are core product work.
2. **Keep tenant data isolated.** Every API, file, notification, report, and AI retrieval must enforce landlord or organization ownership on the server.
3. **Keep consequential actions human-approved.** Payments, lease changes, legal notices, and eviction actions require an authorized user and an auditable confirmation.
4. **Separate payment instructions from payment processing.** QR or account details are instructions; a submitted receipt is evidence; an approved record is not proof of bank settlement unless a payment provider confirms it.
5. **Ship narrow, measurable modules.** Each phase should have an owner, acceptance criteria, and a customer outcome.

## Roadmap overview

| Priority | Module | Customer outcome |
|---|---|---|
| P0 | SaaS accounts, roles, plans, and billing | Landlords can sign up, pay, invite staff, and manage a subscription |
| P0 | Security, data isolation, and production operations | Customer records stay private and service can be monitored and recovered |
| P1 | Communication delivery center | Important notices reach residents and staff reliably across channels |
| P1 | Payment reconciliation and accounting exports | Landlords can verify collections and reconcile what was actually received |
| P1 | Maintenance work orders and vendor coordination | Requests move from report to completion with clear responsibility and cost |
| P1 | Lease and document workflow completion | Agreements, signatures, renewals, and compliance evidence have a complete history |
| P2 | JPTL AI Property Assistant (SLM + retrieval) | Users can find answers and prepare routine work from permitted JPTL records |
| P2 | Reporting, portfolio analytics, and integrations | Landlords can understand portfolio performance and move data into other tools |
| P2 | Mobile/PWA and customer support workspace | Residents can complete common tasks on mobile and get help when stuck |

P0/P1/P2 indicate suggested sequencing, not a promise that every feature must ship in that order. Validate priorities with pilot landlords and residents.

## 1. SaaS accounts, roles, plans, and billing (P0)

### Goal

Give each landlord business a clear account boundary and a paid subscription lifecycle. A single landlord login can work for an initial demo, but a SaaS needs organizations, staff membership, entitlements, billing state, and customer-level support tools.

### Plan

- Define an organization or landlord-account entity that owns properties, units, staff, billing, and plan settings.
- Add staff invitations and role-based permissions such as owner, property manager, finance, maintenance, and read-only auditor. Keep tenant access scoped to their own lease, unit, files, and payments.
- Define plan limits and entitlements: properties, units, staff seats, storage, reminder channels, reports, and AI usage. Enforce limits in backend services, not just in the UI.
- Add subscription lifecycle states: trial, active, past due, grace period, canceled, and suspended. Keep billing state separate from tenant rent-payment state.
- Integrate a subscription billing provider for JPTL fees. Support checkout, recurring invoices, payment failure handling, cancellation, plan changes, and webhook idempotency.
- Provide a customer-facing billing page and a superadmin view for plan changes, support actions, and billing history.
- Add tenant data export and account deletion workflows that honor retention and legal obligations.

### Acceptance criteria

- A landlord owner can subscribe, change plan, update billing details, and cancel without staff intervention.
- An invited staff member can access only the permissions granted by the organization owner.
- Subscription webhooks are authenticated, replay-safe, and cannot alter rental payments.
- Plan limits are consistently enforced by API and reflected in the user interface.

## 2. Security, data isolation, and production operations (P0)

### Goal

Make customer trust and recovery part of the product, not a later cleanup task.

### Plan

- Audit every query and file endpoint for organization, landlord, property, tenant, and role ownership checks. Add negative tests for cross-customer access.
- Require stronger account protection for landlord owners and staff: MFA, session management, login alerts, password recovery, and revocation of lost sessions.
- Review upload handling, signed/private file access, sensitive data encryption, API rate limits, secrets management, and log redaction.
- Create a data retention and deletion policy for leases, financial records, identity files, receipts, and audit events.
- Configure automated database backups, retention, restore drills, and documented recovery targets (RPO/RTO).
- Add centralized structured logs, error tracking, uptime checks, queue/job health, and alerts for failed reminder delivery or payment review workflows.
- Make migrations and scheduled jobs safe across clustered workers and deploys. Use idempotent jobs and a durable queue/lock where processing grows beyond simple daily workloads.
- Establish CI gates for formatting/lint, backend integration suites, client build, Playwright smoke flows, and dependency/security review.

### Acceptance criteria

- Cross-landlord and cross-tenant API/file access tests fail closed.
- A production restore drill succeeds and is documented.
- On-call staff can identify failed jobs and user-impacting errors without exposing sensitive records in logs.

## 3. Communication delivery center (P1)

### Goal

Deliver operational messages through durable, user-controlled channels. SSE is useful while a portal is open, but it does not reach a user who is offline.

### Plan

- Keep in-app notifications as the durable record and use SSE for live updates while users are signed in.
- Add a transactional outbox and retryable delivery jobs for email, web push, and SMS where appropriate.
- Add notification preferences by category, channel, quiet hours, and language. Preserve mandatory safety, payment, and legal notices according to policy.
- Track queued, sent, delivered, failed, and read states. Make retries idempotent and prevent duplicate messages.
- Standardize templates for rent due, receipt review, lease milestones, maintenance updates, compliance expiration, and emergency announcements.
- Add a delivery health view for landlords and support staff, with privacy-safe failure details.

### Acceptance criteria

- A reminder is stored once, delivered through configured channels, and remains visible in notification history.
- Retrying a failed delivery does not create duplicate notification records.
- Residents can control optional message channels without silently disabling required notices.

## 4. Payment reconciliation and accounting exports (P1)

### Goal

Help landlords understand what is due, what tenants reported paying, what the landlord approved, and what funds were actually received.

### Plan

- Keep QR/bank/e-wallet transfer and onsite confirmation as manual collection methods with explicit review and audit trails.
- Add a future payment-provider integration only after selecting a provider and defining supported countries, currencies, fees, refunds, chargebacks, and settlement responsibilities.
- If direct processing is introduced, use signed webhooks, idempotency keys, immutable provider transaction IDs, and reconciliation jobs. Never mark an invoice paid based only on a client redirect.
- Add a reconciliation workspace that compares approved tenant submissions with bank/provider settlement records and highlights unmatched or duplicate entries.
- Add CSV exports and accounting mappings for rent, deposits, fees, refunds, adjustments, and payment methods.
- Add partial payments, credits, refunds, and adjustments only with explicit ledger rules and tests; do not model them as arbitrary edits to a paid invoice.

### Acceptance criteria

- Each invoice has a clear timeline from due, tenant submission, landlord review, and final reconciliation.
- Reports distinguish tenant-reported payments, landlord-approved payments, and provider-settled payments.
- Exported totals match the underlying ledger and support a time-bounded audit trail.

## 5. Maintenance work orders and vendor coordination (P1)

### Goal

Move maintenance from a request list to a trackable service workflow.

### Plan

- Add priorities, safety/emergency classification, target response times, and service-level timers.
- Add assignment and acceptance by internal staff or vendors, appointment windows, resident access instructions, and status updates.
- Capture quotes, approvals, parts, labor, invoices, before/after photos, and completion confirmation.
- Give residents a clear timeline and a way to confirm that a repair is complete or reopen it with a reason.
- Add recurring inspections and preventative maintenance schedules for equipment and shared areas.
- Track vendor contact, insurance/license documents, service history, response time, and spend by property.

### Acceptance criteria

- A request has one accountable owner, a visible status history, and recorded completion evidence.
- Emergency requests follow a clear escalation path and generate an auditable notification.

## 6. Lease, signature, and compliance workflow (P1)

### Goal

Make the document lifecycle complete and traceable from preparation through renewal or move-out.

### Plan

- Add jurisdiction-aware lease templates with version history, merge fields, and review controls.
- Integrate electronic signatures with signer identity, timestamps, completion status, and downloadable signed copies.
- Add renewal offers, negotiation history, reminders, approval, and signed amendment workflows.
- Expand move-in/move-out inspections, photo inventories, deposit deductions, key return, and final statement tracking.
- Keep notice templates configurable by jurisdiction and require landlord review before service. Record the notice version, recipient, delivery method, and date.
- Extend compliance reminders to support renewal evidence, expiry updates, multiple documents, and notification delivery preferences.

### Acceptance criteria

- The system can show who created, reviewed, sent, signed, or changed each agreement and notice.
- A user cannot silently edit an already signed document; changes create a new version or amendment.
- Legal requirements are reviewed for the launch jurisdiction before templates are enabled for customers.

## 7. JPTL AI Property Assistant (SLM + retrieval) (P2)

### Goal

Offer a useful AI assistant without letting a model invent property facts or access another customer’s records.

### Suggested first release

- **Landlord assistant:** answer questions over the landlord’s own leases, policies, maintenance tickets, notices, and payment ledger; summarize a tenant’s open maintenance history; draft an announcement or a maintenance response for review.
- **Resident assistant:** answer questions from that resident’s lease, property rules, submitted notices, payment status, and maintenance requests; explain where to find a document or how to submit a request.
- **Staff helper:** classify a maintenance request, summarize a long message thread, or suggest a response. A person confirms the result before it is saved or sent.

### Architecture and safeguards

- Treat SLM as a replaceable model choice. Build a provider/model adapter so JPTL can compare a small hosted model, a self-hosted model, or a larger model without rewriting product logic.
- Use retrieval over permission-filtered JPTL records. Every retrieved item must be authorized for the current user before it reaches the model; do not rely on prompt instructions to enforce access.
- Return citations to the source record or document and say when the records do not contain an answer. Keep answers scoped to retrieved facts.
- Redact unnecessary personal and financial details before inference. Define where prompts and outputs are stored, for how long, and whether providers may use them for training.
- Treat uploaded documents and resident messages as untrusted content. Protect against prompt injection, data exfiltration, and instructions embedded in files.
- Require confirmation for all write actions. Initial release should be read-only answers and draft generation; no autonomous payment approval, lease changes, notice service, eviction, or account changes.
- Add audit records for AI access and user-approved actions, plus an opt-out setting and a clear “AI-generated” label for drafts.
- Build an evaluation set from synthetic or consented examples covering tenant isolation, citation accuracy, stale information, refusal behavior, and harmful/legal advice. Measure quality and latency before launch.

### Delivery phases

1. Prototype retrieval against a small synthetic dataset and test tenant/landlord authorization boundaries.
2. Pilot read-only document and policy Q&A with citations for a small group of landlords.
3. Add maintenance summaries and editable drafts after the Q&A evaluation meets agreed quality thresholds.
4. Add usage limits, plan entitlements, feedback reporting, and a cost dashboard before general availability.

### Acceptance criteria

- Every factual answer links to authorized source records, or clearly reports that no supported answer was found.
- Automated tests demonstrate that one landlord or tenant cannot retrieve another customer’s data through the assistant.
- AI output cannot perform a consequential action without an authorized user confirming it.
- The feature has measured answer quality, response time, cost per active account, and a documented data-retention policy.

## 8. Reporting, portfolio analytics, and integrations (P2)

### Goal

Give landlords dependable portfolio insight and reduce duplicate data entry.

### Plan

- Add reports for occupancy, rent collection, arrears aging, lease expirations, maintenance spend, vendor response, compliance status, and property-level trends.
- Define a canonical metric glossary so dashboard totals and exports use the same formulas.
- Add scheduled CSV/PDF reports and filtered exports with role checks and audit logs.
- Add import tools for properties, units, tenants, and leases with validation, preview, deduplication, and rollback.
- Evaluate integrations based on pilot demand: accounting platforms, calendar, email, identity providers, and payment providers.
- Add a documented, versioned API and webhook subscriptions for larger customers once access scopes and rate limits are defined.

### Acceptance criteria

- Dashboard cards, reports, and exports reconcile to the same source records.
- Imports report row-level errors and do not partially corrupt a customer’s portfolio.

## 9. Mobile access and customer support (P2)

### Goal

Make routine tenant actions easy on a phone and give customers a clear path to support.

### Plan

- Improve the responsive tenant experience for rent submission, receipt upload, maintenance photos, notices, and documents.
- Consider a Progressive Web App with install support, offline read-only access to selected records, and push notification support before committing to separate native apps.
- Add an in-product help center, searchable onboarding guides, support requests, and service status page.
- Give support staff scoped, audited support tooling. Avoid unrestricted access to tenant files and payment evidence.
- Add feedback collection after key workflows and a process for reviewing recurring support issues.

### Acceptance criteria

- Residents can complete the top mobile workflows without desktop-only controls.
- Support actions are attributable and visible in the audit history where they affect customer data.

## Suggested launch sequence

### Phase A: Trust and sellability

- Choose the initial launch geography and customer profile.
- Complete tenant-isolation and file-access audits.
- Define organization roles, plan limits, trial, and subscription billing.
- Add backup/restore verification, production monitoring, and a support path.

### Phase B: Pilot operations

- Pilot with a small number of landlords and real residents.
- Measure setup completion, time to first property/unit, first tenant invite, payment-review completion, maintenance response, and weekly active usage.
- Fix the most common workflow failures before adding broad feature scope.
- Improve email/push delivery and transaction history; confirm whether manual payment review is sufficient for the target market.

### Phase C: Operational depth

- Complete vendor work orders, reconciliation reports, lease signing, renewal, and move-out workflows based on pilot requests.
- Add imports and exports so customers can adopt JPTL without retyping their portfolio.
- Establish service-level objectives and incident response procedures.

### Phase D: AI pilot and expansion

- Run the SLM/retrieval prototype on synthetic data, then a limited opt-in pilot.
- Publish an AI data-use and retention explanation and add usage controls.
- Expand integrations, reporting, and mobile capabilities where customer evidence supports them.

## SaaS success measures

Set targets with pilot customers, then review monthly. Candidate measures include:

- **Activation:** time from account creation to first property, first unit, and first tenant invitation.
- **Adoption:** active landlord accounts, active resident accounts, and completed workflows per account.
- **Retention:** landlord account retention, property retention, and cohort usage after 30/90 days.
- **Operations:** payment submissions reviewed on time, maintenance requests resolved within target, reminder delivery success, and document renewal completion.
- **Reliability:** uptime, API error rate, job delay, notification failure rate, backup restore success, and incident recovery time.
- **Business health:** trial-to-paid conversion, plan mix, subscription churn, support load, and gross margin per account.
- **AI quality (when piloted):** citation coverage, supported-answer accuracy, unauthorized retrieval rate, latency, user correction rate, and cost per account.

## Decisions to make before implementation

1. Which country or jurisdiction is the first launch market, and what legal review is required for leases and notices?
2. Who is the first paying customer: an individual landlord, a property-management company, or both?
3. Which subscription billing provider and local payment methods are available for JPTL subscriptions?
4. Is off-platform QR/onsite rent collection enough for the first paid release, or is provider settlement required?
5. What are the initial plan limits and which features belong in each plan?
6. Should the SLM be hosted by a provider or self-hosted, and what data may leave JPTL infrastructure?
7. What backup retention, recovery objectives, support hours, and service targets can the team actually meet?

## Recommendation

Treat account billing, tenant isolation, recovery, notification delivery, and support as the first SaaS launch gate. Use a small landlord pilot to validate which operations modules are most valuable. Build the AI assistant after access controls and document data are dependable; start with cited read-only answers and drafts, then expand only when measured quality and customer demand support it.
