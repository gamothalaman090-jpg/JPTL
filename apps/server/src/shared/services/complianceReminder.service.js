import Document from '../models/document.model.js';
import Notification from '../models/notification.model.js';
import Property from '../models/property.model.js';
import Unit from '../models/unit.model.js';
import User from '../models/user.model.js';

const DAY_MS = 24 * 60 * 60 * 1000;
let reminderInterval = null;

const isReminderDocument = (type = '') => /renter insurance|proof of insurance|occupancy permit/i.test(type);

export async function getComplianceReminderSettings(landlordId) {
  const user = await User.findById(landlordId).select('documentExpirationReminderDays').lean();
  return { noticeLeadTimeDays: user?.documentExpirationReminderDays || 30 };
}

export async function updateComplianceReminderSettings(landlordId, noticeLeadTimeDays) {
  const days = Number(noticeLeadTimeDays);
  if (![15, 30, 60].includes(days)) {
    const error = new Error('Notice lead time must be 15, 30, or 60 days.');
    error.statusCode = 400;
    throw error;
  }
  await User.findByIdAndUpdate(landlordId, { documentExpirationReminderDays: days });
  return { noticeLeadTimeDays: days };
}

/** Create one persisted notification for each resident document at its configured lead time. */
export async function runComplianceExpirationReminders(now = new Date()) {
  const landlords = await User.find({ role: 'landlord' }).select('_id documentExpirationReminderDays').lean();
  let createdCount = 0;

  for (const landlord of landlords) {
    const leadDays = landlord.documentExpirationReminderDays || 30;
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);
    const leadWindowEnd = new Date(today.getTime() + (leadDays + 1) * DAY_MS);
    const properties = await Property.find({ landlord: landlord._id }).select('_id').lean();
    if (!properties.length) continue;
    const units = await Unit.find({ property: { $in: properties.map((property) => property._id) } }).select('_id').lean();
    if (!units.length) continue;

    const documents = await Document.find({
      unit: { $in: units.map((unit) => unit._id) },
      expirationDate: { $gte: today, $lt: leadWindowEnd },
      status: 'Verified',
      type: { $regex: /renter insurance|proof of insurance|occupancy permit/i },
    }).populate('unit', 'label').lean();

    for (const document of documents) {
      if (!document.tenant || !isReminderDocument(document.type)) continue;
      const expirationDay = new Date(document.expirationDate);
      expirationDay.setUTCHours(0, 0, 0, 0);
      const daysRemaining = Math.max(0, Math.ceil((expirationDay.getTime() - today.getTime()) / DAY_MS));
      const dedupeKey = `compliance-expiry:${document._id}:${expirationDay.toISOString()}`;
      const title = `${document.type} expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`;
      const body = `${document.name} for ${document.unit?.label || 'your unit'} expires on ${expirationDay.toLocaleDateString('en-US')}. Upload a renewed document before it expires.`;
      try {
        const result = await Notification.updateOne(
          { dedupeKey },
          { $setOnInsert: { user: document.tenant, title, body, type: 'compliance', refModel: 'Document', refId: document._id, read: false, dedupeKey } },
          { upsert: true }
        );
        if (result.upsertedCount > 0) {
          createdCount += 1;
        }
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }
  }
  return { createdCount };
}

export function startComplianceExpirationReminderScheduler() {
  if (reminderInterval) return;
  const run = () => runComplianceExpirationReminders().catch((error) => console.error('Compliance expiration reminder job failed:', error));
  run();
  reminderInterval = setInterval(run, DAY_MS);
  reminderInterval.unref?.();
}
