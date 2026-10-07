import crypto from 'node:crypto';
import User from '../../../shared/models/user.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { sendStaffInviteEmail } from '../../../shared/utils/mailer.js';

export class StaffError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function audit(actorId, action, entityId, afterState = null) {
  await AuditLog.create({ actor: actorId, actorRole: 'landlord', action, entityKind: 'User', entityId, afterState });
}

export async function listStaff(landlordId) {
  return User.find({ landlord: landlordId, role: 'staff' })
    .select('firstName lastName email phone status createdAt lastLoginAt')
    .sort({ createdAt: -1 })
    .lean();
}

export async function inviteStaff(landlordId, payload) {
  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const email = payload.email?.trim().toLowerCase();
  if (!firstName || !lastName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new StaffError('First name, last name, and a valid email are required.', 400);
  }

  const landlord = await User.findOne({ _id: landlordId, role: 'landlord', status: 'active' }).select('firstName lastName');
  if (!landlord) throw new StaffError('Landlord account not found or suspended.', 404);
  if (await User.exists({ email })) throw new StaffError('That email address is already registered.', 409);

  const temporaryPassword = `JPTL-${crypto.randomBytes(6).toString('hex')}7`;
  const staff = await User.create({ firstName, lastName, email, password: temporaryPassword, role: 'staff', landlord: landlordId, status: 'active' });
  const landlordName = [landlord.firstName, landlord.lastName].filter(Boolean).join(' ');
  const delivery = await sendStaffInviteEmail({ email, name: `${firstName} ${lastName}`, landlordName, password: temporaryPassword });
  if (!delivery.success) {
    await User.findByIdAndDelete(staff._id);
    throw new StaffError(`Staff account was not created because the invitation email failed: ${delivery.error}`, 502);
  }

  await audit(landlordId, 'STAFF_INVITED', staff._id, { email, firstName, lastName, status: staff.status });
  return { id: staff._id, firstName, lastName, email, status: staff.status, createdAt: staff.createdAt, invitationSent: true };
}

export async function deactivateStaff(landlordId, staffId) {
  const staff = await User.findOneAndUpdate(
    { _id: staffId, landlord: landlordId, role: 'staff', status: 'active' },
    { $set: { status: 'suspended' } },
    { new: true }
  ).select('firstName lastName email status');
  if (!staff) throw new StaffError('Active staff member not found.', 404);
  await audit(landlordId, 'STAFF_DEACTIVATED', staff._id, { email: staff.email, status: staff.status });
  return staff;
}
