/**
 * Remove only the local demo account and records directly linked to it.
 *
 * Default: dry-run, no MongoDB connection.
 * Execution is denied for production targets, and additionally requires an
 * explicit dev database name, --confirm-database <name>, and
 * ALLOW_DEMO_PURGE=1. This is not a general-purpose production data purge.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
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
import EvictionNotice from '../src/shared/models/evictionNotice.model.js';
import PaymentOption from '../src/shared/models/paymentOption.model.js';
import Notification from '../src/shared/models/notification.model.js';
import PushSubscription from '../src/shared/models/pushSubscription.model.js';
import SessionLog from '../src/shared/models/sessionLog.model.js';

const MONGO_URI = process.env.MONGO_URI;
const DEMO_EMAIL = 'landlord@jptl.dev';
const execute = process.argv.includes('--execute');
const confirmIndex = process.argv.indexOf('--confirm-database');
const confirmedDatabase = confirmIndex >= 0 ? process.argv[confirmIndex + 1] : '';
let databaseName = '';
let databaseHost = '';
try {
  const parsed = new URL(MONGO_URI);
  databaseName = parsed.pathname.replace(/^\//, '').split('/')[0];
  databaseHost = parsed.hostname;
} catch {}

const isProduction = process.env.NODE_ENV === 'production' || /prod/i.test(databaseName) || /prod/i.test(databaseHost);
const isDemoDatabase = /(dev|test|demo|local)/i.test(databaseName);

if (!execute) {
  console.log('Purge dry-run only. No database connection was opened and no data was deleted.');
  console.log(`Planned scope: demo landlord ${DEMO_EMAIL} and records linked to that account.`);
  console.log('To execute against a non-production demo database, pass --execute --confirm-database <database-name> and set ALLOW_DEMO_PURGE=1.');
  process.exit(0);
}

if (!MONGO_URI) throw new Error('MONGO_URI is required when --execute is specified.');
if (isProduction || !isDemoDatabase || confirmedDatabase !== databaseName || process.env.ALLOW_DEMO_PURGE !== '1') {
  throw new Error('Purge execution blocked. It requires ALLOW_DEMO_PURGE=1, a matching --confirm-database value, and a dev/test/demo/local database. Production targets are never allowed.');
}

await mongoose.connect(MONGO_URI);
try {
  const landlord = await User.findOne({ email: DEMO_EMAIL, role: 'landlord' }).select('_id').lean();
  if (!landlord) {
    console.log(`No ${DEMO_EMAIL} demo account found; nothing was deleted.`);
    process.exitCode = 0;
  } else {
    const linkedUsers = await User.find({ landlord: landlord._id, role: { $in: ['tenant', 'staff'] } }).select('_id').lean();
    const userIds = [landlord._id, ...linkedUsers.map(({ _id }) => _id)];
    const properties = await Property.find({ landlord: landlord._id }).select('_id').lean();
    const propertyIds = properties.map(({ _id }) => _id);
    const units = await Unit.find({ property: { $in: propertyIds } }).select('_id').lean();
    const unitIds = units.map(({ _id }) => _id);
    const leases = await Lease.find({ $or: [{ landlord: landlord._id }, { tenant: { $in: userIds } }, { property: { $in: propertyIds } }, { unit: { $in: unitIds } }] }).select('_id').lean();
    const leaseIds = leases.map(({ _id }) => _id);

    const operations = [
      ['Eviction notices', EvictionNotice.deleteMany({ $or: [{ landlord: landlord._id }, { tenant: { $in: userIds } }, { property: { $in: propertyIds } }, { unit: { $in: unitIds } }, { lease: { $in: leaseIds } }] })],
      ['Payments', Payment.deleteMany({ $or: [{ tenant: { $in: userIds } }, { property: { $in: propertyIds } }, { unit: { $in: unitIds } }] })],
      ['Tickets', Ticket.deleteMany({ $or: [{ tenant: { $in: userIds } }, { unit: { $in: unitIds } }] })],
      ['Documents', Document.deleteMany({ $or: [{ tenant: { $in: userIds } }, { unit: { $in: unitIds } }] })],
      ['Notifications', Notification.deleteMany({ user: { $in: userIds } })],
      ['Push subscriptions', PushSubscription.deleteMany({ user: { $in: userIds } })],
      ['Session logs', SessionLog.deleteMany({ userId: { $in: userIds } })],
      ['Audit logs', AuditLog.deleteMany({ actor: { $in: userIds } })],
      ['Announcements', Announcement.deleteMany({ author: landlord._id })],
      ['Payment options', PaymentOption.deleteMany({ landlord: landlord._id })],
      ['Leases', Lease.deleteMany({ _id: { $in: leaseIds } })],
      ['Tenant profiles', TenantProfile.deleteMany({ user: { $in: userIds } })],
      ['Units', Unit.deleteMany({ _id: { $in: unitIds } })],
      ['Properties', Property.deleteMany({ _id: { $in: propertyIds } })],
      ['Demo users', User.deleteMany({ _id: { $in: userIds } })],
    ];
    for (const [label, operation] of operations) {
      const result = await operation;
      console.log(`${label}: ${result.deletedCount} deleted`);
    }
  }
} finally {
  await mongoose.disconnect();
}
