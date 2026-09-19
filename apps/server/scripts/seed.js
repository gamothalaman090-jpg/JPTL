/**
 * JPTL - Database Seeder
 * -----------------------
 * Usage (inside the container):
 *   bun run seed      - Seeds all collections with demo data
 *   bun run seed:fresh - Purges first, then seeds fresh
 *
 * Run outside container:
 *   docker exec server bun run seed
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Models
import User from '../src/shared/models/user.model.js';
import Property from '../src/shared/models/property.model.js';
import Unit from '../src/shared/models/unit.model.js';
import TenantProfile from '../src/shared/models/tenantProfile.model.js';
import Lease from '../src/shared/models/lease.model.js';
import Payment from '../src/shared/models/payment.model.js';
import Ticket from '../src/shared/models/ticket.model.js';
import Announcement from '../src/shared/models/announcements.model.js';
import AuditLog from '../src/shared/models/auditLog.model.js';
import Document from '../src/shared/models/document.model.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const log = {
  info:    (m) => console.log(`  \x1b[36mℹ\x1b[0m  ${m}`),
  success: (m) => console.log(`  \x1b[32m✔\x1b[0m  ${m}`),
  warn:    (m) => console.log(`  \x1b[33m⚠\x1b[0m  ${m}`),
  section: (m) => console.log(`\n\x1b[1m\x1b[35m▸ ${m}\x1b[0m`),
  done:    (m) => console.log(`\n\x1b[1m\x1b[32m✔ ${m}\x1b[0m\n`),
};

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// ─── Connect ─────────────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('\x1b[31m✘  MONGO_URI is not set in .env\x1b[0m');
  process.exit(1);
}

console.log('\n\x1b[1m\x1b[34m══════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[34m  JPTL Database Seeder\x1b[0m');
console.log('\x1b[1m\x1b[34m══════════════════════════════════════\x1b[0m');

log.info(`Connecting to MongoDB…`);
await mongoose.connect(MONGO_URI);
log.success('Connected.\n');

// ─── 1. Users ─────────────────────────────────────────────────────────────────

log.section('Seeding Users');

const passwordHash = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

// Landlord
let landlord = await User.findOne({ email: 'landlord@jptl.dev' });
if (!landlord) {
  landlord = await User.create({
    firstName: 'Alexander',
    middleName: '',
    lastName: 'Vance',
    email: 'landlord@jptl.dev',
    phone: '+1-555-100-2000',
    password: 'Password123!',
    role: 'landlord',
    plan: 'pro',
    onboardingCompleted: true,
    status: 'active',
  });
  log.success(`Landlord created → ${landlord.email} / Password123!`);
} else {
  log.warn(`Landlord already exists → ${landlord.email} (skipped)`);
}

// Tenants
const tenantData = [
  {
    firstName: 'Sophia', middleName: '', lastName: 'Lin',
    email: 'sophia@jptl.dev', phone: '+1-555-201-0001',
    hasParking: true, parkingSpot: 'Bay #14B (L2)', parkingFee: 150,
  },
  {
    firstName: 'Liam', middleName: '', lastName: 'Carter',
    email: 'liam@jptl.dev', phone: '+1-555-201-0002',
    hasParking: false, parkingSpot: null, parkingFee: 0,
  },
  {
    firstName: 'David', middleName: 'K.', lastName: 'Miller',
    email: 'david@jptl.dev', phone: '+1-555-201-0003',
    hasParking: true, parkingSpot: 'Driveway Bay #4', parkingFee: 200,
  },
  {
    firstName: 'Elena', middleName: '', lastName: 'Rostova',
    email: 'elena@jptl.dev', phone: '+1-555-201-0004',
    hasParking: false, parkingSpot: null, parkingFee: 0,
    pre_added: true,
  },
];

const tenants = [];
for (const td of tenantData) {
  let u = await User.findOne({ email: td.email });
  if (!u) {
    u = await User.create({
      firstName: td.firstName,
      middleName: td.middleName,
      lastName: td.lastName,
      email: td.email,
      phone: td.phone,
      password: 'Password123!',
      role: 'tenant',
      landlord: landlord._id,
      status: 'active',
    });
    log.success(`Tenant created → ${u.email} / Password123!`);
  } else {
    log.warn(`Tenant already exists → ${u.email} (skipped)`);
  }
  tenants.push({ ...u.toObject(), _meta: td });
}

const [sophiaMeta, liamMeta, davidMeta, elenaMeta] = tenants.map(t => t._meta);
const [sophiaUser, liamUser, davidUser, elenaUser] = tenants;

// ─── 2. Properties ────────────────────────────────────────────────────────────

log.section('Seeding Properties');

const propDefs = [
  { name: 'Aura Sky Towers & Residences', address: '88 Horizon Boulevard',     city: 'Downtown Metro',   category: 'Luxury',      unitsCount: 32, occupancyRate: 94 },
  { name: 'Vantro Executive Lofts',       address: '204 Vantro Commerce Park', city: 'Eastside Business', category: 'Studio',      unitsCount: 18, occupancyRate: 78 },
  { name: 'Solis Villa Estate & Spa',     address: '12 Solstice Ridge Drive',  city: 'Northgate Hills',  category: 'Residential', unitsCount: 8,  occupancyRate: 88 },
  { name: 'Lumina Green Park Apartments', address: '45 Greenway Boulevard',    city: 'Westpark District',category: 'Residential', unitsCount: 60, occupancyRate: 82 },
  { name: 'Nexus Commercial Center',      address: '150 Financial Plaza',      city: 'Financial District',category: 'Commercial',  unitsCount: 24, occupancyRate: 91 },
];

const properties = [];
for (const pd of propDefs) {
  let p = await Property.findOne({ name: pd.name, landlord: landlord._id });
  if (!p) {
    p = await Property.create({ ...pd, landlord: landlord._id });
    log.success(`Property created → ${p.name}`);
  } else {
    log.warn(`Property already exists → ${p.name} (skipped)`);
  }
  properties.push(p);
}

const [propAura, propVantro, propSolis, propLumina, propNexus] = properties;

// ─── 3. Units ─────────────────────────────────────────────────────────────────

log.section('Seeding Units');

const today = new Date();
const leaseStart1 = new Date('2026-01-15');
const leaseEnd1   = new Date('2027-01-14');
const leaseStart2 = new Date('2025-09-01');
const leaseEnd2   = new Date('2026-08-31');
const leaseStart3 = new Date('2026-03-01');
const leaseEnd3   = new Date('2027-02-28');

const unitDefs = [
  {
    label: 'Unit 14B', property: propAura._id, tenant: sophiaUser._id,
    monthlyRent: 2400, hasParking: true, parkingSpot: 'Bay #14B (L2)', parkingFee: 150,
    bedrooms: 2, bathrooms: 2, sqft: 1150, status: 'occupied',
    leaseStart: leaseStart1, leaseEnd: leaseEnd1,
  },
  {
    label: 'Unit 18A (Penthouse)', property: propAura._id, tenant: null,
    monthlyRent: 3800, hasParking: false, parkingSpot: null, parkingFee: 0,
    bedrooms: 3, bathrooms: 3, sqft: 1850, status: 'vacant',
  },
  {
    label: 'Loft 304', property: propVantro._id, tenant: liamUser._id,
    monthlyRent: 1950, hasParking: false, parkingSpot: null, parkingFee: 0,
    bedrooms: 1, bathrooms: 1, sqft: 820, status: 'occupied',
    leaseStart: leaseStart2, leaseEnd: leaseEnd2,
  },
  {
    label: 'Villa 04', property: propSolis._id, tenant: davidUser._id,
    monthlyRent: 4500, hasParking: true, parkingSpot: 'Driveway Bay #4', parkingFee: 200,
    bedrooms: 4, bathrooms: 3.5, sqft: 2600, status: 'occupied',
    leaseStart: leaseStart3, leaseEnd: leaseEnd3,
  },
  {
    label: 'Suite 202', property: propLumina._id, tenant: null,
    monthlyRent: 2100, hasParking: false, parkingSpot: null, parkingFee: 0,
    bedrooms: 2, bathrooms: 1, sqft: 950, status: 'vacant',
  },
  {
    label: 'Office Suite 501', property: propNexus._id, tenant: null,
    monthlyRent: 5200, hasParking: true, parkingSpot: 'Underground Slot C-12', parkingFee: 250,
    bedrooms: 0, bathrooms: 2, sqft: 2200, status: 'vacant',
  },
];

const units = [];
for (const ud of unitDefs) {
  let unit = await Unit.findOne({ label: ud.label, property: ud.property });
  if (!unit) {
    unit = await Unit.create(ud);
    log.success(`Unit created → ${ud.label}`);
  } else {
    log.warn(`Unit already exists → ${ud.label} (skipped)`);
  }
  units.push(unit);
}

const [unitSophia, , unitLiam, unitDavid] = units;

// ─── 4. Tenant Profiles ───────────────────────────────────────────────────────

log.section('Seeding Tenant Profiles');

const profileDefs = [
  {
    user: sophiaUser._id, property: propAura._id, unit: unitSophia._id,
    monthlyRent: 2400, hasParking: true, parkingSpot: 'Bay #14B (L2)', parkingFee: 150,
    leaseStart: leaseStart1, leaseEnd: leaseEnd1, status: 'active', securityDeposit: 3600,
    paymentMethods: [{ id: 'pm_visa_1', brand: 'Visa', last4: '4242', type: 'card', isDefault: true, expiry: '12/2028' }],
  },
  {
    user: liamUser._id, property: propVantro._id, unit: unitLiam._id,
    monthlyRent: 1950, hasParking: false, parkingSpot: null, parkingFee: 0,
    leaseStart: leaseStart2, leaseEnd: leaseEnd2, status: 'active', securityDeposit: 2925,
    paymentMethods: [{ id: 'pm_ach_1', brand: 'Chase Bank', last4: '9102', type: 'ach', isDefault: true, expiry: '' }],
  },
  {
    user: davidUser._id, property: propSolis._id, unit: unitDavid._id,
    monthlyRent: 4500, hasParking: true, parkingSpot: 'Driveway Bay #4', parkingFee: 200,
    leaseStart: leaseStart3, leaseEnd: leaseEnd3, status: 'active', securityDeposit: 6750,
    paymentMethods: [{ id: 'pm_mc_1', brand: 'Mastercard', last4: '5592', type: 'card', isDefault: true, expiry: '08/2027' }],
  },
  {
    user: elenaUser._id, property: null, unit: null,
    monthlyRent: 0, hasParking: false, parkingSpot: null, parkingFee: 0,
    leaseStart: null, leaseEnd: null, status: 'pre_added', securityDeposit: 0,
  },
];

for (const pd of profileDefs) {
  const existing = await TenantProfile.findOne({ user: pd.user });
  if (!existing) {
    await TenantProfile.create(pd);
    log.success(`TenantProfile created → user ${pd.user}`);
  } else {
    log.warn(`TenantProfile already exists → user ${pd.user} (skipped)`);
  }
}

// ─── 5. Leases ────────────────────────────────────────────────────────────────

log.section('Seeding Leases');

const leaseDefs = [
  {
    tenant: sophiaUser._id, landlord: landlord._id, property: propAura._id, unit: unitSophia._id,
    leaseStart: leaseStart1, leaseEnd: leaseEnd1, monthlyRent: 2400,
    hasParking: true, parkingSpot: 'Bay #14B (L2)', parkingFee: 150,
    securityDeposit: 3600, status: 'active',
  },
  {
    tenant: liamUser._id, landlord: landlord._id, property: propVantro._id, unit: unitLiam._id,
    leaseStart: leaseStart2, leaseEnd: leaseEnd2, monthlyRent: 1950,
    hasParking: false, parkingSpot: null, parkingFee: 0,
    securityDeposit: 2925, status: 'active',
  },
  {
    tenant: davidUser._id, landlord: landlord._id, property: propSolis._id, unit: unitDavid._id,
    leaseStart: leaseStart3, leaseEnd: leaseEnd3, monthlyRent: 4500,
    hasParking: true, parkingSpot: 'Driveway Bay #4', parkingFee: 200,
    securityDeposit: 6750, status: 'active',
  },
];

for (const ld of leaseDefs) {
  const existing = await Lease.findOne({ tenant: ld.tenant, unit: ld.unit });
  if (!existing) {
    await Lease.create(ld);
    log.success(`Lease created → tenant ${ld.tenant} / unit ${ld.unit}`);
  } else {
    log.warn(`Lease already exists → tenant ${ld.tenant} (skipped)`);
  }
}

// ─── 6. Payments ──────────────────────────────────────────────────────────────

log.section('Seeding Payments');

// Sophia — paid (Aug), pending (Sep)
const sophiaProfile = await TenantProfile.findOne({ user: sophiaUser._id });
const liamProfile   = await TenantProfile.findOne({ user: liamUser._id });
const davidProfile  = await TenantProfile.findOne({ user: davidUser._id });

const paymentDefs = [
  // Sophia — Aug paid
  {
    tenant: sophiaUser._id, unit: unitSophia._id, property: propAura._id,
    amount: 2595, baseRent: 2400, parkingFee: 150, utilityFee: 45, processingFee: 45,
    dueDate: new Date('2026-08-01'), paidAt: new Date('2026-07-29T16:22:10Z'),
    status: 'paid', period: 'August 2026 Rent Statement',
    paymentMethod: 'Visa ending in 4242',
    mockTransactionId: 'TXN_SEEDED_SOP_AUG',
  },
  // Sophia — Sep pending
  {
    tenant: sophiaUser._id, unit: unitSophia._id, property: propAura._id,
    amount: 2595, baseRent: 2400, parkingFee: 150, utilityFee: 45, processingFee: 0,
    dueDate: new Date('2026-09-01'),
    status: 'pending', period: 'September 2026 Rent Statement',
    mockTransactionId: null,
  },
  // Liam — Aug paid (no parking)
  {
    tenant: liamUser._id, unit: unitLiam._id, property: propVantro._id,
    amount: 1995, baseRent: 1950, parkingFee: 0, utilityFee: 45, processingFee: 0,
    dueDate: new Date('2026-08-01'), paidAt: new Date('2026-07-29T16:22:10Z'),
    status: 'paid', period: 'August 2026 Rent Statement',
    paymentMethod: 'Chase Bank ACH ending in 9102',
    mockTransactionId: 'TXN_SEEDED_LIA_AUG',
  },
  // Liam — Sep pending
  {
    tenant: liamUser._id, unit: unitLiam._id, property: propVantro._id,
    amount: 1995, baseRent: 1950, parkingFee: 0, utilityFee: 45, processingFee: 0,
    dueDate: new Date('2026-09-01'),
    status: 'pending', period: 'September 2026 Rent Statement',
    mockTransactionId: null,
  },
  // David — Aug overdue
  {
    tenant: davidUser._id, unit: unitDavid._id, property: propSolis._id,
    amount: 4745, baseRent: 4500, parkingFee: 200, utilityFee: 45, processingFee: 0,
    dueDate: new Date('2026-08-15'),
    status: 'overdue', period: 'August 2026 Rent Statement',
    mockTransactionId: null,
  },
];

let payDocs = {};
for (const pd of paymentDefs) {
  const existing = await Payment.findOne({
    tenant: pd.tenant,
    period: pd.period,
    status: pd.status,
  });
  if (!existing) {
    const p = await Payment.create(pd);
    log.success(`Payment created → ${pd.period} [${pd.status}] for tenant ${pd.tenant}`);
    // Store first seeded payment per tenant for document seeds
    const key = String(pd.tenant);
    if (!payDocs[key]) payDocs[key] = p;
  } else {
    log.warn(`Payment already exists → ${pd.period} [${pd.status}] (skipped)`);
  }
}

// ─── 7. Tickets ───────────────────────────────────────────────────────────────

log.section('Seeding Tickets');

const ticketDefs = [
  {
    title: 'HVAC Air Conditioning Pressure Drop',
    description: 'The primary AC unit in the master suite is making a humming sound and not cooling properly.',
    category: 'HVAC', priority: 'high', status: 'in_progress',
    unit: unitSophia._id, tenant: sophiaUser._id,
    photoUrls: [],
    statusHistory: [
      { status: 'submitted',    changedBy: sophiaUser._id, userRole: 'tenant',   timestamp: new Date('2026-08-22T10:15:00Z') },
      { status: 'acknowledged', changedBy: landlord._id,   userRole: 'landlord', timestamp: new Date('2026-08-22T11:00:00Z'), note: 'Technician dispatched for afternoon inspection.' },
      { status: 'in_progress',  changedBy: landlord._id,   userRole: 'landlord', timestamp: new Date('2026-08-23T09:30:00Z'), note: 'Replacing AC capacitor & freon recharge.' },
    ],
  },
  {
    title: 'Kitchen Island Sink Pipe Seep',
    description: 'Small water droplets under the garbage disposal outlet valve.',
    category: 'Plumbing', priority: 'medium', status: 'submitted',
    unit: unitLiam._id, tenant: liamUser._id,
    photoUrls: [],
    statusHistory: [
      { status: 'submitted', changedBy: liamUser._id, userRole: 'tenant', timestamp: new Date('2026-08-23T13:40:00Z') },
    ],
  },
  {
    title: 'Patio Smart Lock Battery Low Alert',
    description: 'Keypad lock beeped 3 times on lock sequence, indicates battery level at 12%.',
    category: 'Electrical', priority: 'low', status: 'resolved',
    unit: unitDavid._id, tenant: davidUser._id,
    photoUrls: [],
    statusHistory: [
      { status: 'submitted',    changedBy: davidUser._id, userRole: 'tenant',   timestamp: new Date('2026-08-20T14:20:00Z') },
      { status: 'acknowledged', changedBy: landlord._id,  userRole: 'landlord', timestamp: new Date('2026-08-20T15:00:00Z') },
      { status: 'in_progress',  changedBy: landlord._id,  userRole: 'landlord', timestamp: new Date('2026-08-21T09:00:00Z') },
      { status: 'resolved',     changedBy: landlord._id,  userRole: 'landlord', timestamp: new Date('2026-08-21T11:45:00Z'), note: 'Replaced VAPID V4 lithium cell.' },
    ],
  },
];

for (const td of ticketDefs) {
  const existing = await Ticket.findOne({ title: td.title, tenant: td.tenant });
  if (!existing) {
    await Ticket.create(td);
    log.success(`Ticket created → "${td.title}" [${td.status}]`);
  } else {
    log.warn(`Ticket already exists → "${td.title}" (skipped)`);
  }
}

// ─── 8. Announcements ─────────────────────────────────────────────────────────

log.section('Seeding Announcements');

const announcementDefs = [
  {
    title: 'Scheduled Water Supply Maintenance – Sep 15',
    content: 'Water supply to all floors will be interrupted from 8:00 AM to 12:00 PM on September 15, 2026 for routine pipeline maintenance. Please store sufficient water before this period.',
    category: 'Maintenance', isPinned: true, author: landlord._id,
  },
  {
    title: 'Updated Guest Visitor Policy – Effective Oct 1',
    content: 'All overnight guests staying more than 48 hours must now be registered at the front desk and will require a QR-coded visitor pass. This policy applies to all units as of October 1, 2026.',
    category: 'Policy', isPinned: false, author: landlord._id,
  },
  {
    title: 'Lobby Renovation Starting September 20',
    content: 'The main lobby is undergoing a complete renovation from September 20 to October 10, 2026. Please use the south entrance during this period. We apologize for any inconvenience.',
    category: 'General', isPinned: false, author: landlord._id,
  },
];

for (const ad of announcementDefs) {
  const existing = await Announcement.findOne({ title: ad.title });
  if (!existing) {
    await Announcement.create(ad);
    log.success(`Announcement created → "${ad.title}"`);
  } else {
    log.warn(`Announcement already exists → "${ad.title}" (skipped)`);
  }
}

// ─── 9. Documents ─────────────────────────────────────────────────────────────

log.section('Seeding Documents');

const documentDefs = [
  {
    tenant: sophiaUser._id, unit: unitSophia._id,
    name: 'Lease_Agreement_Unit_14B_2026.pdf', type: 'Lease Agreement', category: 'lease',
    size: '2.4 MB', fileUrl: '/docs/lease-14b.pdf', status: 'Verified',
    verifiedAt: new Date('2026-01-16T10:00:00Z'), reviewedBy: landlord._id,
  },
  {
    tenant: sophiaUser._id, unit: unitSophia._id,
    name: 'State_ID_Sophia_Lin.pdf', type: 'Government ID', category: 'upload',
    size: '1.8 MB', fileUrl: '/docs/state-id-sophia.pdf', status: 'Verified',
    verifiedAt: new Date('2026-08-11T14:30:00Z'), reviewedBy: landlord._id,
  },
  {
    tenant: sophiaUser._id, unit: unitSophia._id,
    name: 'Renters_Insurance_Policy_2026.pdf', type: 'Proof of Insurance', category: 'upload',
    size: '890 KB', fileUrl: '/docs/renters-insurance-sophia.pdf', status: 'Pending Review',
  },
  {
    tenant: liamUser._id, unit: unitLiam._id,
    name: 'Employment_Verification_2026.pdf', type: 'Income Verification', category: 'upload',
    size: '1.4 MB', fileUrl: '/docs/income-verification-liam.pdf', status: 'Pending Review',
  },
  {
    tenant: davidUser._id, unit: unitDavid._id,
    name: 'Pet_Vaccination_Certificate_2026.pdf', type: 'Pet Registration', category: 'upload',
    size: '620 KB', fileUrl: '/docs/pet-vaccine-david.pdf', status: 'Rejected',
    rejectionReason: 'Rabies vaccination record expired on May 2026. Please upload an up-to-date certificate from your vet.',
    reviewedBy: landlord._id, verifiedAt: new Date('2026-08-19T09:15:00Z'),
  },
];

for (const dd of documentDefs) {
  const existing = await Document.findOne({ tenant: dd.tenant, name: dd.name });
  if (!existing) {
    await Document.create(dd);
    log.success(`Document created → "${dd.name}"`);
  } else {
    log.warn(`Document already exists → "${dd.name}" (skipped)`);
  }
}

// ─── 10. Audit Logs ───────────────────────────────────────────────────────────

log.section('Seeding Audit Logs');

const auditDefs = [
  {
    actor: landlord._id, actorRole: 'landlord', action: 'TICKET_STATUS_UPDATE',
    entityKind: 'Ticket', ipAddress: '203.0.113.45',
  },
  {
    actor: liamUser._id, actorRole: 'tenant', action: 'PAYMENT_CONFIRMED_EVENT',
    entityKind: 'Payment', ipAddress: '203.0.113.12',
  },
  {
    actor: landlord._id, actorRole: 'landlord', action: 'TENANT_CREATED',
    entityKind: 'User', ipAddress: '203.0.113.45',
  },
];

const existingAudits = await AuditLog.countDocuments({ actor: { $in: [landlord._id, liamUser._id] } });
if (existingAudits === 0) {
  await AuditLog.insertMany(auditDefs);
  log.success(`Audit logs seeded (${auditDefs.length} entries)`);
} else {
  log.warn(`Audit logs already exist (skipped)`);
}

// ─── Done ─────────────────────────────────────────────────────────────────────

await mongoose.disconnect();

log.done('Seeding complete! 🎉');

console.log('\x1b[1m\x1b[33m  Quick-login credentials:\x1b[0m');
console.log('  ┌─────────────────────────────────────────────────────┐');
console.log('  │  Role      Email                  Password          │');
console.log('  ├─────────────────────────────────────────────────────┤');
console.log('  │  Landlord  landlord@jptl.dev      Password123!      │');
console.log('  │  Tenant 1  sophia@jptl.dev        Password123!      │');
console.log('  │  Tenant 2  liam@jptl.dev          Password123!      │');
console.log('  │  Tenant 3  david@jptl.dev         Password123!      │');
console.log('  │  Tenant 4  elena@jptl.dev         Password123!      │');
console.log('  └─────────────────────────────────────────────────────┘\n');
